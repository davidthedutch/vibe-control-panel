-- ============================================================
-- CRM Real-time Features Migration
-- ============================================================

-- Add additional fields to site_sessions for better tracking
ALTER TABLE site_sessions
ADD COLUMN IF NOT EXISTS current_page TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for real-time queries
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON site_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_project ON site_sessions(user_id, project_id);

-- Add trial segment to site_users
ALTER TABLE site_users DROP CONSTRAINT IF EXISTS site_users_segment_check;
ALTER TABLE site_users ADD CONSTRAINT site_users_segment_check
CHECK (segment IN ('visitor', 'user', 'premium', 'trial', 'churned'));

-- Create table for user events tracking
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES site_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES site_users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_session ON user_events(session_id);
CREATE INDEX idx_events_user ON user_events(user_id);
CREATE INDEX idx_events_project ON user_events(project_id);
CREATE INDEX idx_events_created ON user_events(created_at DESC);

-- Create table for conversion funnel steps
CREATE TABLE IF NOT EXISTS funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  step_order INT NOT NULL,
  event_type TEXT NOT NULL,
  event_condition JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, step_order)
);

-- Create table for daily user stats (for chart data)
CREATE TABLE IF NOT EXISTS daily_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  stat_date DATE NOT NULL,
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  returning_users INT DEFAULT 0,
  churned_users INT DEFAULT 0,
  UNIQUE(project_id, stat_date)
);

CREATE INDEX idx_daily_stats_project_date ON daily_user_stats(project_id, stat_date DESC);

-- Function to update last_seen and session activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's last_seen
  UPDATE site_users
  SET last_seen = NOW()
  WHERE id = NEW.user_id;

  -- Update session's last_activity_at
  UPDATE site_sessions
  SET last_activity_at = NOW(),
      current_page = COALESCE(NEW.page_url, current_page)
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_event_activity_trigger
AFTER INSERT ON user_events
FOR EACH ROW
EXECUTE FUNCTION update_user_activity();

-- Function to calculate daily stats (run via cron or manually)
CREATE OR REPLACE FUNCTION calculate_daily_stats(p_project_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_total_users INT;
  v_new_users INT;
  v_active_users INT;
  v_returning_users INT;
  v_churned_users INT;
BEGIN
  -- Total users up to this date
  SELECT COUNT(*) INTO v_total_users
  FROM site_users
  WHERE project_id = p_project_id
    AND first_seen::DATE <= p_date;

  -- New users on this date
  SELECT COUNT(*) INTO v_new_users
  FROM site_users
  WHERE project_id = p_project_id
    AND first_seen::DATE = p_date;

  -- Active users on this date (had session)
  SELECT COUNT(DISTINCT user_id) INTO v_active_users
  FROM site_sessions
  WHERE project_id = p_project_id
    AND started_at::DATE = p_date;

  -- Returning users (not new, but active)
  SELECT COUNT(DISTINCT ss.user_id) INTO v_returning_users
  FROM site_sessions ss
  JOIN site_users su ON ss.user_id = su.id
  WHERE ss.project_id = p_project_id
    AND ss.started_at::DATE = p_date
    AND su.first_seen::DATE < p_date;

  -- Churned users (segment = churned)
  SELECT COUNT(*) INTO v_churned_users
  FROM site_users
  WHERE project_id = p_project_id
    AND segment = 'churned'
    AND last_seen::DATE <= p_date;

  -- Insert or update stats
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
$$ LANGUAGE plpgsql;

-- Function to get currently online users (active in last 5 minutes)
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
$$ LANGUAGE plpgsql;

-- Function to calculate funnel conversion
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

  -- Get total visitors (first step)
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
$$ LANGUAGE plpgsql;

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE site_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE site_users;
ALTER PUBLICATION supabase_realtime ADD TABLE user_events;

-- Insert default funnel steps for demo project
INSERT INTO funnel_steps (project_id, step_name, step_order, event_type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bezoekers', 1, 'page_view'),
  ('00000000-0000-0000-0000-000000000001', 'Signup', 2, 'signup'),
  ('00000000-0000-0000-0000-000000000001', 'Actief', 3, 'active_usage'),
  ('00000000-0000-0000-0000-000000000001', 'Betaald', 4, 'payment_success')
ON CONFLICT (project_id, step_order) DO NOTHING;

-- Generate daily stats for the last 30 days for demo project
DO $$
DECLARE
  v_date DATE;
BEGIN
  FOR v_date IN
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE
  LOOP
    PERFORM calculate_daily_stats('00000000-0000-0000-0000-000000000001', v_date);
  END LOOP;
END $$;
