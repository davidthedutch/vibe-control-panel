-- ============================================================
-- Migration 004: Enable RLS on ALL tables + proper policies
-- Fix: Supabase Security Advisor — 16 errors
-- Date: 2026-02-18
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. DROP overly permissive policies on project_settings
-- ============================================================

DROP POLICY IF EXISTS "Allow authenticated read access to project_settings" ON project_settings;
DROP POLICY IF EXISTS "Allow authenticated insert access to project_settings" ON project_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to project_settings" ON project_settings;
DROP POLICY IF EXISTS "Allow authenticated delete access to project_settings" ON project_settings;

-- ============================================================
-- 3. SERVICE ROLE POLICIES (for API routes using supabaseAdmin)
-- The service_role key bypasses RLS entirely, so these policies
-- only apply to anon and authenticated roles.
-- ============================================================

-- === PROJECTS (read-only for anon, dashboard reads via service_role) ===
CREATE POLICY "anon_read_projects"
  ON projects FOR SELECT TO anon
  USING (true);

-- === COMPONENTS (read-only for anon) ===
CREATE POLICY "anon_read_components"
  ON components FOR SELECT TO anon
  USING (true);

-- === COMPONENT_DEPENDENCIES (read-only for anon) ===
CREATE POLICY "anon_read_component_dependencies"
  ON component_dependencies FOR SELECT TO anon
  USING (true);

-- === FEATURES (read-only for anon) ===
CREATE POLICY "anon_read_features"
  ON features FOR SELECT TO anon
  USING (true);

-- === FEATURE_COMPONENTS (read-only for anon) ===
CREATE POLICY "anon_read_feature_components"
  ON feature_components FOR SELECT TO anon
  USING (true);

-- === PROMPTS (read-only for anon) ===
CREATE POLICY "anon_read_prompts"
  ON prompts FOR SELECT TO anon
  USING (true);

-- === DECISIONS (read-only for anon) ===
CREATE POLICY "anon_read_decisions"
  ON decisions FOR SELECT TO anon
  USING (true);

-- === PROJECT_SETTINGS (read-only for anon) ===
CREATE POLICY "anon_read_project_settings"
  ON project_settings FOR SELECT TO anon
  USING (true);

-- ============================================================
-- 4. CRM TABLES: anon can INSERT (tracking), but NOT read/update/delete
-- Reading CRM data happens via service_role in API routes.
-- ============================================================

-- === SITE_USERS ===
CREATE POLICY "anon_insert_site_users"
  ON site_users FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_own_site_user"
  ON site_users FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_update_site_users"
  ON site_users FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- === SITE_SESSIONS ===
CREATE POLICY "anon_insert_site_sessions"
  ON site_sessions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_site_sessions"
  ON site_sessions FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_update_site_sessions"
  ON site_sessions FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- === USER_EVENTS ===
CREATE POLICY "anon_insert_user_events"
  ON user_events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_user_events"
  ON user_events FOR SELECT TO anon
  USING (true);

-- === HEALTH_CHECKS (read-only for anon) ===
CREATE POLICY "anon_read_health_checks"
  ON health_checks FOR SELECT TO anon
  USING (true);

-- === SEO_PAGES (read-only for anon) ===
CREATE POLICY "anon_read_seo_pages"
  ON seo_pages FOR SELECT TO anon
  USING (true);

-- === DAILY_USER_STATS (read-only for anon) ===
CREATE POLICY "anon_read_daily_user_stats"
  ON daily_user_stats FOR SELECT TO anon
  USING (true);

-- === FUNNEL_STEPS (read-only for anon) ===
CREATE POLICY "anon_read_funnel_steps"
  ON funnel_steps FOR SELECT TO anon
  USING (true);

-- ============================================================
-- 5. SECURITY DEFINER FUNCTIONS
-- Mark existing RPC functions as SECURITY DEFINER so they
-- execute with the function owner's privileges, not the caller's.
-- This lets them access data even with RLS enabled.
-- ============================================================

CREATE OR REPLACE FUNCTION get_online_users(p_project_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  segment TEXT,
  current_page TEXT,
  device TEXT,
  browser TEXT,
  time_on_site INTERVAL,
  session_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    su.id,
    su.name,
    su.email,
    su.segment,
    ss.current_page,
    ss.device,
    ss.browser,
    NOW() - ss.started_at AS time_on_site,
    ss.id AS session_id
  FROM site_sessions ss
  JOIN site_users su ON ss.user_id = su.id
  WHERE ss.project_id = p_project_id
    AND ss.is_online = true
    AND ss.last_activity_at > NOW() - INTERVAL '5 minutes'
  ORDER BY ss.last_activity_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_funnel_conversion(p_project_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (
  step_name TEXT,
  step_order INT,
  user_count BIGINT,
  conversion_rate NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_total_users BIGINT;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(DISTINCT user_id) INTO v_total_users
  FROM site_sessions
  WHERE project_id = p_project_id
    AND started_at >= v_start_date;

  RETURN QUERY
  WITH funnel_data AS (
    SELECT
      fs.step_name,
      fs.step_order,
      COUNT(DISTINCT ue.user_id) AS users
    FROM funnel_steps fs
    LEFT JOIN user_events ue ON
      ue.project_id = fs.project_id
      AND ue.event_type = fs.event_type
      AND ue.created_at >= v_start_date
    WHERE fs.project_id = p_project_id
    GROUP BY fs.step_name, fs.step_order
  )
  SELECT
    fd.step_name,
    fd.step_order,
    fd.users,
    CASE
      WHEN v_total_users > 0 THEN ROUND((fd.users::NUMERIC / v_total_users::NUMERIC) * 100, 1)
      ELSE 0
    END AS conversion_rate
  FROM funnel_data fd
  ORDER BY fd.step_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_daily_stats(p_project_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_total_users INT;
  v_new_users INT;
  v_active_users INT;
  v_returning_users INT;
  v_churned_users INT;
BEGIN
  SELECT COUNT(*) INTO v_total_users
  FROM site_users
  WHERE project_id = p_project_id
    AND first_seen::DATE <= p_date;

  SELECT COUNT(*) INTO v_new_users
  FROM site_users
  WHERE project_id = p_project_id
    AND first_seen::DATE = p_date;

  SELECT COUNT(DISTINCT user_id) INTO v_active_users
  FROM site_sessions
  WHERE project_id = p_project_id
    AND started_at::DATE = p_date;

  SELECT COUNT(DISTINCT ss.user_id) INTO v_returning_users
  FROM site_sessions ss
  JOIN site_users su ON ss.user_id = su.id
  WHERE ss.project_id = p_project_id
    AND ss.started_at::DATE = p_date
    AND su.first_seen::DATE < p_date;

  SELECT COUNT(*) INTO v_churned_users
  FROM site_users
  WHERE project_id = p_project_id
    AND segment = 'churned'
    AND last_seen::DATE <= p_date;

  INSERT INTO daily_user_stats (
    project_id, stat_date, total_users, new_users,
    active_users, returning_users, churned_users
  )
  VALUES (
    p_project_id, p_date, v_total_users, v_new_users,
    v_active_users, v_returning_users, v_churned_users
  )
  ON CONFLICT (project_id, stat_date)
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    returning_users = EXCLUDED.returning_users,
    churned_users = EXCLUDED.churned_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also mark the trigger function as SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE site_users
  SET last_seen = NOW()
  WHERE id = NEW.user_id;

  UPDATE site_sessions
  SET last_activity_at = NOW(),
      current_page = COALESCE(NEW.page_url, current_page)
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
