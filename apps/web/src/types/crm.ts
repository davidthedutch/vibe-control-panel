// CRM Type Definitions

export type UserSegment = 'visitor' | 'user' | 'premium' | 'trial' | 'churned';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface SiteUser {
  id: string;
  project_id: string;
  external_id: string | null;
  email: string | null;
  name: string | null;
  segment: UserSegment;
  first_seen: string;
  last_seen: string;
  total_sessions: number;
  metadata: Record<string, any>;
}

export interface SiteSession {
  id: string;
  user_id: string;
  project_id: string;
  started_at: string;
  ended_at: string | null;
  pages_visited: string[];
  events: Record<string, any>[];
  device: string | null;
  is_online: boolean;
  current_page: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  country: string | null;
  last_activity_at: string;
}

export interface UserEvent {
  id: string;
  session_id: string;
  user_id: string;
  project_id: string;
  event_type: string;
  event_data: Record<string, any>;
  page_url: string | null;
  created_at: string;
}

export interface DailyUserStats {
  id: string;
  project_id: string;
  stat_date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  returning_users: number;
  churned_users: number;
}

export interface FunnelStep {
  id: string;
  project_id: string;
  step_name: string;
  step_order: number;
  event_type: string;
  event_condition: Record<string, any>;
  created_at: string;
}

export interface OnlineUser {
  id: string;
  name: string | null;
  email: string | null;
  currentPage: string | null;
  timeOnSite: string;
  device: string | null;
  segment: string;
  stuck?: boolean;
  sessionId: string;
  browser: string | null;
}

export interface CrmMetrics {
  totalUsers: number;
  onlineNow: number;
  newThisWeek: number;
  churnRate: number;
  trends: {
    totalUsers: number;
    onlineNow: number;
    newThisWeek: number;
    churnRate: number;
  };
}

export interface ChartDataPoint {
  date: string;
  users: number;
}

export interface FunnelChartStep {
  step: string;
  count: number;
  percentage: number;
}

export interface UserSessionHistory {
  id: string;
  started_at: string;
  ended_at: string | null;
  pages_visited: string[];
  device: string | null;
  browser: string | null;
  duration?: number; // in minutes
}

export type Segment = 'alle' | 'actief' | 'inactief' | 'premium' | 'trial' | 'churned';
