'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Default project ID (demo project)
const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

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

export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

export interface UserSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  pages_visited: string[];
  device: string | null;
  browser: string | null;
}

export function useOnlineUsers(projectId: string = DEFAULT_PROJECT_ID) {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.rpc('get_online_users', {
        p_project_id: projectId,
      });

      if (fetchError) throw fetchError;

      const onlineUsers: OnlineUser[] = (data || []).map((user: any) => {
        const timeInMs = user.time_on_site ? parseInterval(user.time_on_site) : 0;
        const timeMinutes = Math.floor(timeInMs / 60000);
        const timeSeconds = Math.floor((timeInMs % 60000) / 1000);
        const timeStr = timeMinutes > 0 ? `${timeMinutes} min` : `${timeSeconds} sec`;

        return {
          id: user.user_id,
          name: user.user_name,
          email: user.user_email,
          currentPage: user.current_page || '/',
          timeOnSite: timeStr,
          device: user.device || 'desktop',
          segment: user.segment || 'visitor',
          stuck: timeMinutes >= 5,
          sessionId: user.session_id,
          browser: user.browser,
        };
      });

      setUsers(onlineUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching online users:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOnlineUsers();

    // Subscribe to real-time updates
    const channel: RealtimeChannel = supabase
      .channel(`online-users-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_sessions',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Refetch when sessions change
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Refresh every 10 seconds to update time on site
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [projectId, fetchOnlineUsers]);

  return { users, loading, error, refetch: fetchOnlineUsers };
}

export function useCrmMetrics(projectId: string = DEFAULT_PROJECT_ID) {
  const [metrics, setMetrics] = useState<CrmMetrics>({
    totalUsers: 0,
    onlineNow: 0,
    newThisWeek: 0,
    churnRate: 0,
    trends: { totalUsers: 0, onlineNow: 0, newThisWeek: 0, churnRate: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Total users
        const { count: totalUsers } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId);

        // Total users from last week
        const { count: totalUsersLastWeek } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .lte('first_seen', weekAgo.toISOString());

        // Online now (active in last 5 minutes)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const { count: onlineNow } = await supabase
          .from('site_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('is_online', true)
          .gte('last_activity_at', fiveMinutesAgo.toISOString());

        // New this week
        const { count: newThisWeek } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .gte('first_seen', weekAgo.toISOString());

        // New previous week for trend
        const { count: newLastWeek } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .gte('first_seen', twoWeeksAgo.toISOString())
          .lt('first_seen', weekAgo.toISOString());

        // Churned users
        const { count: churnedUsers } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('segment', 'churned');

        const churnRate = totalUsers ? ((churnedUsers || 0) / totalUsers) * 100 : 0;

        // Calculate trends
        const totalUsersTrend = totalUsersLastWeek
          ? ((totalUsers! - totalUsersLastWeek) / totalUsersLastWeek) * 100
          : 0;

        const newUsersTrend = newLastWeek ? ((newThisWeek! - newLastWeek) / newLastWeek) * 100 : 0;

        setMetrics({
          totalUsers: totalUsers || 0,
          onlineNow: onlineNow || 0,
          newThisWeek: newThisWeek || 0,
          churnRate: parseFloat(churnRate.toFixed(1)),
          trends: {
            totalUsers: parseFloat(totalUsersTrend.toFixed(1)),
            onlineNow: 0, // Real-time, no trend
            newThisWeek: parseFloat(newUsersTrend.toFixed(1)),
            churnRate: -0.5, // Mock for now
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, [projectId]);

  return { metrics, loading, error };
}

export function useChartData(projectId: string = DEFAULT_PROJECT_ID, days: number = 30) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

        const { data: statsData, error: fetchError } = await supabase
          .from('daily_user_stats')
          .select('stat_date, active_users')
          .eq('project_id', projectId)
          .gte('stat_date', startDate.toISOString().split('T')[0])
          .lte('stat_date', endDate.toISOString().split('T')[0])
          .order('stat_date', { ascending: true });

        if (fetchError) throw fetchError;

        const chartData: ChartDataPoint[] = (statsData || []).map((stat) => ({
          date: stat.stat_date,
          users: stat.active_users,
        }));

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, days]);

  return { data, loading, error };
}

export function useFunnelData(projectId: string = DEFAULT_PROJECT_ID) {
  const [data, setData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: funnelData, error: fetchError } = await supabase.rpc(
          'calculate_funnel_conversion',
          {
            p_project_id: projectId,
            p_days: 30,
          }
        );

        if (fetchError) throw fetchError;

        const steps: FunnelStep[] = (funnelData || []).map((step: any) => ({
          step: step.step_name,
          count: parseInt(step.user_count),
          percentage: parseFloat(step.conversion_rate),
        }));

        setData(steps);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching funnel data:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return { data, loading, error };
}

export function useUserSessions(userId: string) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('site_sessions')
          .select('id, started_at, ended_at, pages_visited, device, browser')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;

        setSessions(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user sessions:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  return { sessions, loading, error };
}

// Helper function to parse PostgreSQL interval to milliseconds
function parseInterval(interval: string): number {
  const regex = /(\d+):(\d+):(\d+)\.?(\d+)?/;
  const match = interval.match(regex);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600000 + minutes * 60000 + seconds * 1000;
}
