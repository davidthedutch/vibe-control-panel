// ============================================================
// VIBE CONTROL PANEL — Database Row Types
// ============================================================
// These types represent the raw rows from the Supabase database
// (snake_case column names). The API layer maps these to the
// application-level types in ../types/index.ts (camelCase).
// ============================================================

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  tech_stack: Record<string, unknown>;
  urls: Record<string, string>;
  design_tokens: Record<string, unknown>;
  policies: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbComponent {
  id: string;
  project_id: string;
  name: string;
  type: string;
  category: string | null;
  file_path: string | null;
  status: string;
  description: string | null;
  props: unknown[];
  tokens_used: unknown[];
  metadata: Record<string, unknown>;
  created_by_prompt: string | null;
  last_modified_by_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbComponentDependency {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
}

export interface DbFeature {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  actions: unknown[];
  user_flows: unknown[];
  created_by_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPrompt {
  id: string;
  project_id: string;
  prompt_text: string;
  prompt_type: string | null;
  ai_model: string | null;
  session_tool: string | null;
  components_affected: string[];
  files_changed: string[];
  tokens_used: string[];
  result: string | null;
  status: string;
  impact_notes: string | null;
  created_at: string;
}

export interface DbDecision {
  id: string;
  project_id: string;
  title: string;
  context: string | null;
  decision: string;
  alternatives: string | null;
  consequences: string | null;
  prompt_id: string | null;
  created_at: string;
}

export interface DbSiteUser {
  id: string;
  project_id: string;
  external_id: string | null;
  email: string | null;
  name: string | null;
  segment: string;
  first_seen: string;
  last_seen: string;
  total_sessions: number;
  metadata: Record<string, unknown>;
}

export interface DbSiteSession {
  id: string;
  user_id: string;
  project_id: string;
  started_at: string;
  ended_at: string | null;
  pages_visited: string[];
  events: unknown[];
  device: string | null;
  is_online: boolean;
}

export interface DbHealthCheck {
  id: string;
  project_id: string;
  check_type: string;
  status: string;
  details: Record<string, unknown>;
  score: number | null;
  created_at: string;
}

export interface DbSeoPage {
  id: string;
  project_id: string;
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  canonical: string | null;
  og_image: string | null;
  structured_data: unknown | null;
  issues: unknown[];
  last_crawled: string;
}

export interface DbProjectStats {
  project_id: string;
  name: string;
  total_components: number;
  working_components: number;
  broken_components: number;
  total_features: number;
  working_features: number;
  total_users: number;
  online_users: number;
}

// --- API response wrapper ---

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
