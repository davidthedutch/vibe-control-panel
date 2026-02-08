-- ============================================================
-- VIBE CONTROL PANEL — Database Schema
-- ============================================================

-- Projecten
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'in_development' CHECK (status IN ('planning', 'in_development', 'live', 'maintenance')),
  tech_stack JSONB DEFAULT '{}',
  urls JSONB DEFAULT '{}',
  design_tokens JSONB DEFAULT '{}',
  policies JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Componenten
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ui', 'layout', 'feature', 'page')),
  category TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'working', 'broken', 'deprecated', 'needs_review')),
  description TEXT,
  props JSONB DEFAULT '[]',
  tokens_used JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by_prompt UUID,
  last_modified_by_prompt UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_components_project ON components(project_id);
CREATE INDEX idx_components_status ON components(status);

-- Component afhankelijkheden
CREATE TABLE component_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'imports' CHECK (type IN ('imports', 'renders', 'uses_token', 'calls_api')),
  UNIQUE(source_id, target_id, type)
);

-- Features
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'working', 'broken', 'deprecated')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  actions JSONB DEFAULT '[]',
  user_flows JSONB DEFAULT '[]',
  created_by_prompt UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_features_project ON features(project_id);

-- Feature <-> Component koppeling
CREATE TABLE feature_components (
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_id, component_id)
);

-- Prompt Log
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT CHECK (prompt_type IN ('new-component', 'modification', 'bugfix', 'design', 'refactor', 'feature')),
  ai_model TEXT,
  session_tool TEXT,
  components_affected UUID[] DEFAULT '{}',
  files_changed TEXT[] DEFAULT '{}',
  tokens_used TEXT[] DEFAULT '{}',
  result TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  impact_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_project ON prompts(project_id);
CREATE INDEX idx_prompts_created ON prompts(created_at DESC);

-- Add foreign keys for created_by_prompt after prompts table exists
ALTER TABLE components ADD CONSTRAINT fk_components_created_prompt FOREIGN KEY (created_by_prompt) REFERENCES prompts(id);
ALTER TABLE components ADD CONSTRAINT fk_components_modified_prompt FOREIGN KEY (last_modified_by_prompt) REFERENCES prompts(id);
ALTER TABLE features ADD CONSTRAINT fk_features_created_prompt FOREIGN KEY (created_by_prompt) REFERENCES prompts(id);

-- Decisions (ADR - Architecture Decision Records)
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  context TEXT,
  decision TEXT NOT NULL,
  alternatives TEXT,
  consequences TEXT,
  prompt_id UUID REFERENCES prompts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM: Site gebruikers
CREATE TABLE site_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  email TEXT,
  name TEXT,
  segment TEXT DEFAULT 'visitor' CHECK (segment IN ('visitor', 'user', 'premium', 'churned')),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  total_sessions INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_site_users_project ON site_users(project_id);
CREATE INDEX idx_site_users_segment ON site_users(segment);
CREATE INDEX idx_site_users_last_seen ON site_users(last_seen DESC);

-- CRM: Sessies
CREATE TABLE site_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES site_users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  pages_visited TEXT[] DEFAULT '{}',
  events JSONB DEFAULT '[]',
  device TEXT,
  is_online BOOLEAN DEFAULT true
);

CREATE INDEX idx_sessions_project ON site_sessions(project_id);
CREATE INDEX idx_sessions_online ON site_sessions(is_online) WHERE is_online = true;

-- Health Check resultaten
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'warn', 'fail')),
  details JSONB DEFAULT '{}',
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_project ON health_checks(project_id);
CREATE INDEX idx_health_created ON health_checks(created_at DESC);

-- SEO pagina data
CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  h1 TEXT,
  canonical TEXT,
  og_image TEXT,
  structured_data JSONB,
  issues JSONB DEFAULT '[]',
  last_crawled TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_project ON seo_pages(project_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Views voor dashboard stats
CREATE VIEW project_stats AS
SELECT
  p.id AS project_id,
  p.name,
  COUNT(DISTINCT c.id) AS total_components,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'working') AS working_components,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'broken') AS broken_components,
  COUNT(DISTINCT f.id) AS total_features,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'working') AS working_features,
  COUNT(DISTINCT su.id) AS total_users,
  COUNT(DISTINCT ss.id) FILTER (WHERE ss.is_online = true) AS online_users
FROM projects p
LEFT JOIN components c ON c.project_id = p.id
LEFT JOIN features f ON f.project_id = p.id
LEFT JOIN site_users su ON su.project_id = p.id
LEFT JOIN site_sessions ss ON ss.project_id = p.id
GROUP BY p.id, p.name;
