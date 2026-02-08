// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_development' | 'live' | 'maintenance';
  techStack: Record<string, string>;
  urls: { production?: string; staging?: string; development: string };
  createdAt: string;
  updatedAt: string;
}

// Component types
export interface Component {
  id: string;
  projectId: string;
  name: string;
  type: 'ui' | 'layout' | 'feature' | 'page';
  category: string;
  filePath: string;
  status: 'planned' | 'in_progress' | 'working' | 'broken' | 'deprecated' | 'needs_review';
  description: string;
  props: ComponentProp[];
  tokensUsed: string[];
  dependencies: string[];
  dependents: string[];
  createdByPrompt: string | null;
  lastModifiedByPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// Feature types
export interface Feature {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'working' | 'broken' | 'deprecated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  components: string[];
  actions: FeatureAction[];
  userFlows: UserFlow[];
  createdByPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureAction {
  id: string;
  trigger: string;
  behavior: string;
  inputData: string;
  outputResult: string;
  errorHandling: string;
  status: 'planned' | 'working' | 'broken';
  testedOn: string | null;
}

export interface UserFlow {
  name: string;
  steps: string[];
  happyPath: boolean;
  edgeCases: string[];
}

// Prompt types
export interface PromptEntry {
  id: string;
  projectId: string;
  promptText: string;
  promptType: 'new-component' | 'modification' | 'bugfix' | 'design' | 'refactor' | 'feature';
  aiModel: string;
  sessionTool: string;
  componentsAffected: string[];
  filesChanged: string[];
  tokensUsed: string[];
  result: string;
  status: 'success' | 'partial' | 'failed';
  impactNotes: string;
  createdAt: string;
}

// Health check types
export interface HealthCheck {
  id: string;
  projectId: string;
  checkType: string;
  status: 'pass' | 'warn' | 'fail';
  details: Record<string, unknown>;
  score: number | null;
  createdAt: string;
}

// CRM types
export interface SiteUser {
  id: string;
  projectId: string;
  externalId: string | null;
  email: string | null;
  name: string | null;
  segment: 'visitor' | 'user' | 'premium' | 'churned';
  firstSeen: string;
  lastSeen: string;
  totalSessions: number;
}

export interface SiteSession {
  id: string;
  userId: string;
  projectId: string;
  startedAt: string;
  endedAt: string | null;
  pagesVisited: string[];
  events: SessionEvent[];
  device: string;
  isOnline: boolean;
}

export interface SessionEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// SEO types
export interface SeoPage {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  canonical: string | null;
  ogImage: string | null;
  structuredData: Record<string, unknown> | null;
  issues: SeoIssue[];
  lastCrawled: string;
}

export interface SeoIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// Design token types
export interface DesignTokens {
  colors: Record<string, unknown>;
  typography: Record<string, unknown>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
  animation: Record<string, unknown>;
  layout: Record<string, string>;
  zIndex: Record<string, number>;
}

// Vibe SDK Protocol types
export type VibeMessageType =
  | 'VIBE_SDK_READY'
  | 'VIBE_SET_MODE'
  | 'VIBE_ELEMENT_SELECTED'
  | 'VIBE_UPDATE_TOKEN'
  | 'VIBE_UPDATE_TOKENS_BATCH'
  | 'VIBE_UPDATE_TEXT'
  | 'VIBE_HIGHLIGHT_COMPONENT'
  | 'VIBE_GET_HEALTH'
  | 'VIBE_HEALTH_REPORT'
  | 'VIBE_PING'
  | 'VIBE_PONG';

export interface VibeMessage {
  type: VibeMessageType;
  payload: Record<string, unknown>;
  source: 'vibe-sdk' | 'vibe-panel';
}

// Decision log types
export interface Decision {
  id: string;
  projectId: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  consequences: string;
  promptId: string | null;
  createdAt: string;
}
