import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using demo data mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      site_users: {
        Row: {
          id: string;
          project_id: string;
          external_id: string | null;
          email: string | null;
          name: string | null;
          segment: 'visitor' | 'user' | 'premium' | 'trial' | 'churned';
          first_seen: string;
          last_seen: string;
          total_sessions: number;
          metadata: Record<string, any>;
        };
      };
      site_sessions: {
        Row: {
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
        };
      };
      user_events: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          project_id: string;
          event_type: string;
          event_data: Record<string, any>;
          page_url: string | null;
          created_at: string;
        };
      };
      daily_user_stats: {
        Row: {
          id: string;
          project_id: string;
          stat_date: string;
          total_users: number;
          new_users: number;
          active_users: number;
          returning_users: number;
          churned_users: number;
        };
      };
      funnel_steps: {
        Row: {
          id: string;
          project_id: string;
          step_name: string;
          step_order: number;
          event_type: string;
          event_condition: Record<string, any>;
          created_at: string;
        };
      };
      project_settings: {
        Row: {
          id: string;
          project_id: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          settings: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
