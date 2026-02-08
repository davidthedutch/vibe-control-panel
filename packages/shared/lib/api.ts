import { supabase } from './supabase';
import type {
  Project,
  Component,
  ComponentProp,
  Feature,
  FeatureAction,
  UserFlow,
  PromptEntry,
  Decision,
  SiteUser,
  SiteSession,
  HealthCheck,
  SeoPage,
  SeoIssue,
} from '../types';
import type {
  DbProject,
  DbComponent,
  DbComponentDependency,
  DbFeature,
  DbPrompt,
  DbDecision,
  DbSiteUser,
  DbSiteSession,
  DbHealthCheck,
  DbSeoPage,
  DbProjectStats,
  ApiResponse,
} from './database.types';

// Re-export ApiResponse for consumers
export type { ApiResponse } from './database.types';

// ============================================================
// Helper: wrap Supabase calls in a consistent ApiResponse
// ============================================================

function toApiResponse<T>(data: T | null, error: unknown): ApiResponse<T> {
  if (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unknown error';
    return { data: null, error: message };
  }
  return { data, error: null };
}

// ============================================================
// Mappers: Database rows (snake_case) -> App types (camelCase)
// ============================================================

function mapProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: row.status as Project['status'],
    techStack: row.tech_stack as Record<string, string>,
    urls: row.urls as Project['urls'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapComponent(row: DbComponent): Component {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type as Component['type'],
    category: row.category ?? '',
    filePath: row.file_path ?? '',
    status: row.status as Component['status'],
    description: row.description ?? '',
    props: (row.props ?? []) as ComponentProp[],
    tokensUsed: (row.tokens_used ?? []) as string[],
    dependencies: [],
    dependents: [],
    createdByPrompt: row.created_by_prompt,
    lastModifiedByPrompt: row.last_modified_by_prompt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFeature(row: DbFeature): Feature {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description ?? '',
    status: row.status as Feature['status'],
    priority: row.priority as Feature['priority'],
    components: [],
    actions: (row.actions ?? []) as FeatureAction[],
    userFlows: (row.user_flows ?? []) as UserFlow[],
    createdByPrompt: row.created_by_prompt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPrompt(row: DbPrompt): PromptEntry {
  return {
    id: row.id,
    projectId: row.project_id,
    promptText: row.prompt_text,
    promptType: row.prompt_type as PromptEntry['promptType'],
    aiModel: row.ai_model ?? '',
    sessionTool: row.session_tool ?? '',
    componentsAffected: row.components_affected ?? [],
    filesChanged: row.files_changed ?? [],
    tokensUsed: row.tokens_used ?? [],
    result: row.result ?? '',
    status: row.status as PromptEntry['status'],
    impactNotes: row.impact_notes ?? '',
    createdAt: row.created_at,
  };
}

function mapDecision(row: DbDecision): Decision {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    context: row.context ?? '',
    decision: row.decision,
    alternatives: row.alternatives ?? '',
    consequences: row.consequences ?? '',
    promptId: row.prompt_id,
    createdAt: row.created_at,
  };
}

function mapSiteUser(row: DbSiteUser): SiteUser {
  return {
    id: row.id,
    projectId: row.project_id,
    externalId: row.external_id,
    email: row.email,
    name: row.name,
    segment: row.segment as SiteUser['segment'],
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    totalSessions: row.total_sessions,
  };
}

function mapSiteSession(row: DbSiteSession): SiteSession {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    pagesVisited: row.pages_visited ?? [],
    events: (row.events ?? []) as SiteSession['events'],
    device: row.device ?? '',
    isOnline: row.is_online,
  };
}

function mapHealthCheck(row: DbHealthCheck): HealthCheck {
  return {
    id: row.id,
    projectId: row.project_id,
    checkType: row.check_type,
    status: row.status as HealthCheck['status'],
    details: row.details,
    score: row.score,
    createdAt: row.created_at,
  };
}

function mapSeoPage(row: DbSeoPage): SeoPage {
  return {
    id: row.id,
    projectId: row.project_id,
    url: row.url,
    title: row.title,
    description: row.description,
    h1: row.h1,
    canonical: row.canonical,
    ogImage: row.og_image,
    structuredData: (row.structured_data ?? null) as Record<string, unknown> | null,
    issues: (row.issues ?? []) as SeoIssue[],
    lastCrawled: row.last_crawled,
  };
}

// ============================================================
// Reverse mappers: App types (camelCase) -> Database inserts (snake_case)
// ============================================================

function toDbComponent(c: Partial<Component>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (c.projectId !== undefined) row.project_id = c.projectId;
  if (c.name !== undefined) row.name = c.name;
  if (c.type !== undefined) row.type = c.type;
  if (c.category !== undefined) row.category = c.category;
  if (c.filePath !== undefined) row.file_path = c.filePath;
  if (c.status !== undefined) row.status = c.status;
  if (c.description !== undefined) row.description = c.description;
  if (c.props !== undefined) row.props = c.props;
  if (c.tokensUsed !== undefined) row.tokens_used = c.tokensUsed;
  if (c.createdByPrompt !== undefined) row.created_by_prompt = c.createdByPrompt;
  if (c.lastModifiedByPrompt !== undefined) row.last_modified_by_prompt = c.lastModifiedByPrompt;
  return row;
}

function toDbFeature(f: Partial<Feature>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (f.projectId !== undefined) row.project_id = f.projectId;
  if (f.name !== undefined) row.name = f.name;
  if (f.description !== undefined) row.description = f.description;
  if (f.status !== undefined) row.status = f.status;
  if (f.priority !== undefined) row.priority = f.priority;
  if (f.actions !== undefined) row.actions = f.actions;
  if (f.userFlows !== undefined) row.user_flows = f.userFlows;
  if (f.createdByPrompt !== undefined) row.created_by_prompt = f.createdByPrompt;
  return row;
}

function toDbPrompt(p: Partial<PromptEntry>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.projectId !== undefined) row.project_id = p.projectId;
  if (p.promptText !== undefined) row.prompt_text = p.promptText;
  if (p.promptType !== undefined) row.prompt_type = p.promptType;
  if (p.aiModel !== undefined) row.ai_model = p.aiModel;
  if (p.sessionTool !== undefined) row.session_tool = p.sessionTool;
  if (p.componentsAffected !== undefined) row.components_affected = p.componentsAffected;
  if (p.filesChanged !== undefined) row.files_changed = p.filesChanged;
  if (p.tokensUsed !== undefined) row.tokens_used = p.tokensUsed;
  if (p.result !== undefined) row.result = p.result;
  if (p.status !== undefined) row.status = p.status;
  if (p.impactNotes !== undefined) row.impact_notes = p.impactNotes;
  return row;
}

function toDbDecision(d: Partial<Decision>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (d.projectId !== undefined) row.project_id = d.projectId;
  if (d.title !== undefined) row.title = d.title;
  if (d.context !== undefined) row.context = d.context;
  if (d.decision !== undefined) row.decision = d.decision;
  if (d.alternatives !== undefined) row.alternatives = d.alternatives;
  if (d.consequences !== undefined) row.consequences = d.consequences;
  if (d.promptId !== undefined) row.prompt_id = d.promptId;
  return row;
}

function toDbSession(s: Partial<SiteSession>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (s.userId !== undefined) row.user_id = s.userId;
  if (s.projectId !== undefined) row.project_id = s.projectId;
  if (s.pagesVisited !== undefined) row.pages_visited = s.pagesVisited;
  if (s.events !== undefined) row.events = s.events;
  if (s.device !== undefined) row.device = s.device;
  if (s.isOnline !== undefined) row.is_online = s.isOnline;
  return row;
}

function toDbHealthCheck(h: Partial<HealthCheck>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (h.projectId !== undefined) row.project_id = h.projectId;
  if (h.checkType !== undefined) row.check_type = h.checkType;
  if (h.status !== undefined) row.status = h.status;
  if (h.details !== undefined) row.details = h.details;
  if (h.score !== undefined) row.score = h.score;
  return row;
}

function toDbSeoPage(s: Partial<SeoPage>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (s.projectId !== undefined) row.project_id = s.projectId;
  if (s.url !== undefined) row.url = s.url;
  if (s.title !== undefined) row.title = s.title;
  if (s.description !== undefined) row.description = s.description;
  if (s.h1 !== undefined) row.h1 = s.h1;
  if (s.canonical !== undefined) row.canonical = s.canonical;
  if (s.ogImage !== undefined) row.og_image = s.ogImage;
  if (s.structuredData !== undefined) row.structured_data = s.structuredData;
  if (s.issues !== undefined) row.issues = s.issues;
  return row;
}

// ============================================================
// PROJECTS
// ============================================================

export async function getProject(projectId: string): Promise<ApiResponse<Project>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) return toApiResponse<Project>(null, error);
  return toApiResponse(mapProject(data as DbProject), null);
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'status' | 'techStack' | 'urls'>>
): Promise<ApiResponse<Project>> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.techStack !== undefined) dbUpdates.tech_stack = updates.techStack;
  if (updates.urls !== undefined) dbUpdates.urls = updates.urls;

  const { data, error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) return toApiResponse<Project>(null, error);
  return toApiResponse(mapProject(data as DbProject), null);
}

export interface ProjectStats {
  projectId: string;
  name: string;
  totalComponents: number;
  workingComponents: number;
  brokenComponents: number;
  totalFeatures: number;
  workingFeatures: number;
  totalUsers: number;
  onlineUsers: number;
}

export async function getProjectStats(projectId: string): Promise<ApiResponse<ProjectStats>> {
  const { data, error } = await supabase
    .from('project_stats')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) return toApiResponse<ProjectStats>(null, error);

  const row = data as DbProjectStats;
  return toApiResponse<ProjectStats>(
    {
      projectId: row.project_id,
      name: row.name,
      totalComponents: row.total_components,
      workingComponents: row.working_components,
      brokenComponents: row.broken_components,
      totalFeatures: row.total_features,
      workingFeatures: row.working_features,
      totalUsers: row.total_users,
      onlineUsers: row.online_users,
    },
    null
  );
}

// ============================================================
// COMPONENTS
// ============================================================

export async function getComponents(
  projectId: string,
  filters?: { status?: string; type?: string; category?: string }
): Promise<ApiResponse<Component[]>> {
  let query = supabase
    .from('components')
    .select('*')
    .eq('project_id', projectId)
    .order('name');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<Component[]>(null, error);
  return toApiResponse(((data ?? []) as DbComponent[]).map(mapComponent), null);
}

export async function getComponent(componentId: string): Promise<ApiResponse<Component>> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', componentId)
    .single();

  if (error) return toApiResponse<Component>(null, error);
  return toApiResponse(mapComponent(data as DbComponent), null);
}

export async function createComponent(
  component: Omit<Component, 'id' | 'createdAt' | 'updatedAt' | 'dependencies' | 'dependents'>
): Promise<ApiResponse<Component>> {
  const { data, error } = await supabase
    .from('components')
    .insert(toDbComponent(component))
    .select()
    .single();

  if (error) return toApiResponse<Component>(null, error);
  return toApiResponse(mapComponent(data as DbComponent), null);
}

export async function updateComponent(
  componentId: string,
  updates: Partial<Pick<Component, 'name' | 'type' | 'category' | 'filePath' | 'status' | 'description' | 'props' | 'tokensUsed' | 'lastModifiedByPrompt'>>
): Promise<ApiResponse<Component>> {
  const { data, error } = await supabase
    .from('components')
    .update(toDbComponent(updates))
    .eq('id', componentId)
    .select()
    .single();

  if (error) return toApiResponse<Component>(null, error);
  return toApiResponse(mapComponent(data as DbComponent), null);
}

export async function deleteComponent(componentId: string): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', componentId);

  return toApiResponse(null, error);
}

export interface ComponentDependencyInfo {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
}

export async function getComponentDependencies(
  componentId: string,
  direction: 'outgoing' | 'incoming' = 'outgoing'
): Promise<ApiResponse<ComponentDependencyInfo[]>> {
  const column = direction === 'outgoing' ? 'source_id' : 'target_id';

  const { data, error } = await supabase
    .from('component_dependencies')
    .select('*')
    .eq(column, componentId);

  if (error) return toApiResponse<ComponentDependencyInfo[]>(null, error);

  const mapped = ((data ?? []) as DbComponentDependency[]).map((row) => ({
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    type: row.type,
  }));

  return toApiResponse(mapped, null);
}

// ============================================================
// FEATURES
// ============================================================

export async function getFeatures(
  projectId: string,
  filters?: { status?: string; priority?: string }
): Promise<ApiResponse<Feature[]>> {
  let query = supabase
    .from('features')
    .select('*')
    .eq('project_id', projectId)
    .order('priority')
    .order('name');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<Feature[]>(null, error);
  return toApiResponse(((data ?? []) as DbFeature[]).map(mapFeature), null);
}

export async function getFeature(featureId: string): Promise<ApiResponse<Feature>> {
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .eq('id', featureId)
    .single();

  if (error) return toApiResponse<Feature>(null, error);
  return toApiResponse(mapFeature(data as DbFeature), null);
}

export async function createFeature(
  feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt' | 'components'>
): Promise<ApiResponse<Feature>> {
  const { data, error } = await supabase
    .from('features')
    .insert(toDbFeature(feature))
    .select()
    .single();

  if (error) return toApiResponse<Feature>(null, error);
  return toApiResponse(mapFeature(data as DbFeature), null);
}

export async function updateFeature(
  featureId: string,
  updates: Partial<Pick<Feature, 'name' | 'description' | 'status' | 'priority' | 'actions' | 'userFlows'>>
): Promise<ApiResponse<Feature>> {
  const { data, error } = await supabase
    .from('features')
    .update(toDbFeature(updates))
    .eq('id', featureId)
    .select()
    .single();

  if (error) return toApiResponse<Feature>(null, error);
  return toApiResponse(mapFeature(data as DbFeature), null);
}

// Feature-Component relationships
export async function linkFeatureComponent(
  featureId: string,
  componentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('feature_components')
    .insert({
      feature_id: featureId,
      component_id: componentId,
    });

  return toApiResponse(null, error);
}

export async function unlinkFeatureComponent(
  featureId: string,
  componentId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('feature_components')
    .delete()
    .eq('feature_id', featureId)
    .eq('component_id', componentId);

  return toApiResponse(null, error);
}

export async function getFeatureComponents(
  featureId: string
): Promise<ApiResponse<string[]>> {
  const { data, error } = await supabase
    .from('feature_components')
    .select('component_id')
    .eq('feature_id', featureId);

  if (error) return toApiResponse<string[]>(null, error);
  return toApiResponse(((data ?? []) as { component_id: string }[]).map((row) => row.component_id), null);
}

export async function setFeatureComponents(
  featureId: string,
  componentIds: string[]
): Promise<ApiResponse<null>> {
  // First, delete existing relationships
  const { error: deleteError } = await supabase
    .from('feature_components')
    .delete()
    .eq('feature_id', featureId);

  if (deleteError) return toApiResponse(null, deleteError);

  // Then, insert new relationships
  if (componentIds.length > 0) {
    const { error: insertError } = await supabase
      .from('feature_components')
      .insert(
        componentIds.map((componentId) => ({
          feature_id: featureId,
          component_id: componentId,
        }))
      );

    if (insertError) return toApiResponse(null, insertError);
  }

  return toApiResponse(null, null);
}

// ============================================================
// PROMPTS
// ============================================================

export async function getPrompts(
  projectId: string,
  options?: { limit?: number; offset?: number; type?: string }
): Promise<ApiResponse<PromptEntry[]>> {
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (options?.type) {
    query = query.eq('prompt_type', options.type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<PromptEntry[]>(null, error);
  return toApiResponse(((data ?? []) as DbPrompt[]).map(mapPrompt), null);
}

export async function logPrompt(
  prompt: Omit<PromptEntry, 'id' | 'createdAt'>
): Promise<ApiResponse<PromptEntry>> {
  const { data, error } = await supabase
    .from('prompts')
    .insert(toDbPrompt(prompt))
    .select()
    .single();

  if (error) return toApiResponse<PromptEntry>(null, error);
  return toApiResponse(mapPrompt(data as DbPrompt), null);
}

// ============================================================
// DECISIONS
// ============================================================

export async function getDecisions(projectId: string): Promise<ApiResponse<Decision[]>> {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) return toApiResponse<Decision[]>(null, error);
  return toApiResponse(((data ?? []) as DbDecision[]).map(mapDecision), null);
}

export async function createDecision(
  decision: Omit<Decision, 'id' | 'createdAt'>
): Promise<ApiResponse<Decision>> {
  const { data, error } = await supabase
    .from('decisions')
    .insert(toDbDecision(decision))
    .select()
    .single();

  if (error) return toApiResponse<Decision>(null, error);
  return toApiResponse(mapDecision(data as DbDecision), null);
}

// ============================================================
// SITE USERS (CRM)
// ============================================================

export async function getSiteUsers(
  projectId: string,
  filters?: { segment?: string; limit?: number }
): Promise<ApiResponse<SiteUser[]>> {
  let query = supabase
    .from('site_users')
    .select('*')
    .eq('project_id', projectId)
    .order('last_seen', { ascending: false });

  if (filters?.segment) {
    query = query.eq('segment', filters.segment);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<SiteUser[]>(null, error);
  return toApiResponse(((data ?? []) as DbSiteUser[]).map(mapSiteUser), null);
}

export async function getOnlineUsers(projectId: string): Promise<ApiResponse<SiteUser[]>> {
  // Get users who have at least one active (online) session
  const { data: sessions, error: sessionsError } = await supabase
    .from('site_sessions')
    .select('user_id')
    .eq('project_id', projectId)
    .eq('is_online', true);

  if (sessionsError) {
    return toApiResponse<SiteUser[]>(null, sessionsError);
  }

  const onlineUserIds = [...new Set((sessions ?? []).map((s: { user_id: string }) => s.user_id))];

  if (onlineUserIds.length === 0) {
    return toApiResponse<SiteUser[]>([], null);
  }

  const { data, error } = await supabase
    .from('site_users')
    .select('*')
    .in('id', onlineUserIds);

  if (error) return toApiResponse<SiteUser[]>(null, error);
  return toApiResponse(((data ?? []) as DbSiteUser[]).map(mapSiteUser), null);
}

export async function getUserSessions(
  userId: string,
  options?: { limit?: number }
): Promise<ApiResponse<SiteSession[]>> {
  let query = supabase
    .from('site_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<SiteSession[]>(null, error);
  return toApiResponse(((data ?? []) as DbSiteSession[]).map(mapSiteSession), null);
}

// ============================================================
// SITE SESSIONS
// ============================================================

export async function getActiveSessions(
  projectId: string
): Promise<ApiResponse<SiteSession[]>> {
  const { data, error } = await supabase
    .from('site_sessions')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_online', true)
    .order('started_at', { ascending: false });

  if (error) return toApiResponse<SiteSession[]>(null, error);
  return toApiResponse(((data ?? []) as DbSiteSession[]).map(mapSiteSession), null);
}

export async function createSession(
  session: Omit<SiteSession, 'id' | 'startedAt' | 'endedAt'>
): Promise<ApiResponse<SiteSession>> {
  const { data, error } = await supabase
    .from('site_sessions')
    .insert(toDbSession(session))
    .select()
    .single();

  if (error) return toApiResponse<SiteSession>(null, error);
  return toApiResponse(mapSiteSession(data as DbSiteSession), null);
}

export async function endSession(sessionId: string): Promise<ApiResponse<SiteSession>> {
  const { data, error } = await supabase
    .from('site_sessions')
    .update({
      is_online: false,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) return toApiResponse<SiteSession>(null, error);
  return toApiResponse(mapSiteSession(data as DbSiteSession), null);
}

// ============================================================
// HEALTH CHECKS
// ============================================================

export async function getHealthChecks(
  projectId: string,
  options?: { limit?: number; checkType?: string }
): Promise<ApiResponse<HealthCheck[]>> {
  let query = supabase
    .from('health_checks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (options?.checkType) {
    query = query.eq('check_type', options.checkType);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) return toApiResponse<HealthCheck[]>(null, error);
  return toApiResponse(((data ?? []) as DbHealthCheck[]).map(mapHealthCheck), null);
}

export async function getLatestHealthCheck(
  projectId: string,
  checkType: string
): Promise<ApiResponse<HealthCheck>> {
  const { data, error } = await supabase
    .from('health_checks')
    .select('*')
    .eq('project_id', projectId)
    .eq('check_type', checkType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return toApiResponse<HealthCheck>(null, error);
  return toApiResponse(mapHealthCheck(data as DbHealthCheck), null);
}

export async function saveHealthCheck(
  healthCheck: Omit<HealthCheck, 'id' | 'createdAt'>
): Promise<ApiResponse<HealthCheck>> {
  const { data, error } = await supabase
    .from('health_checks')
    .insert(toDbHealthCheck(healthCheck))
    .select()
    .single();

  if (error) return toApiResponse<HealthCheck>(null, error);
  return toApiResponse(mapHealthCheck(data as DbHealthCheck), null);
}

// ============================================================
// SEO PAGES
// ============================================================

export async function getSeoPages(projectId: string): Promise<ApiResponse<SeoPage[]>> {
  const { data, error } = await supabase
    .from('seo_pages')
    .select('*')
    .eq('project_id', projectId)
    .order('url');

  if (error) return toApiResponse<SeoPage[]>(null, error);
  return toApiResponse(((data ?? []) as DbSeoPage[]).map(mapSeoPage), null);
}

export async function updateSeoPage(
  pageId: string,
  updates: Partial<Pick<SeoPage, 'title' | 'description' | 'h1' | 'canonical' | 'ogImage' | 'structuredData' | 'issues'>>
): Promise<ApiResponse<SeoPage>> {
  const dbUpdates = {
    ...toDbSeoPage(updates),
    last_crawled: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('seo_pages')
    .update(dbUpdates)
    .eq('id', pageId)
    .select()
    .single();

  if (error) return toApiResponse<SeoPage>(null, error);
  return toApiResponse(mapSeoPage(data as DbSeoPage), null);
}
