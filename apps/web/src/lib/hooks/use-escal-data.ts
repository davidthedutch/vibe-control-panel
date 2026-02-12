'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { fetchEscalEvents, fetchEscalMetrics } from '../actions/escal-actions';

// ============================================================================
// Types
// ============================================================================

export interface EscalEvent {
  id: string;
  title: string;
  description: string | null;
  venue_id: string | null;
  venue_name: string | null;
  venue_city: string | null;
  start_date: string;
  end_date: string | null;
  image_url: string | null;
  genres: string[];
  going_count: number;
  interested_count: number;
  source: 'ra' | 'partyflock' | 'djguide' | 'manual';
  status: 'active' | 'cancelled' | 'draft' | 'past';
  created_at: string;
}

export interface EscalUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  events_attended: number;
  friends_count: number;
  badges_count: number;
  status: 'active' | 'banned' | 'suspended';
  created_at: string;
  last_seen: string | null;
}

export interface LiveLocation {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  event_id: string | null;
  event_title: string | null;
  lat: number;
  lng: number;
  share_with: 'all' | 'friends' | 'buddies';
  expires_at: string;
  created_at: string;
}

export interface ScraperStatus {
  id: string;
  source: 'ra' | 'partyflock' | 'djguide';
  name: string;
  status: 'running' | 'success' | 'error' | 'idle';
  last_run: string | null;
  next_run: string | null;
  events_scraped: number;
  success_rate: number;
  last_error: string | null;
}

export interface ScraperLog {
  id: string;
  source: string;
  status: 'success' | 'error';
  events_found: number;
  events_created: number;
  events_updated: number;
  errors: string[];
  duration_ms: number;
  timestamp: string;
}

export interface EscalMetrics {
  totalEvents: number;
  activeUsers: number;
  liveNow: number;
  scrapersOk: number;
  trends: {
    totalEvents: number;
    activeUsers: number;
    liveNow: number;
  };
}

export interface RadiusMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  event_id: string;
  event_title: string;
  message: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface BuddyPair {
  id: string;
  user_id: string;
  user_name: string;
  buddy_id: string;
  buddy_name: string;
  event_id: string;
  event_title: string;
  check_interval_minutes: number;
  last_check: string | null;
  status: 'active' | 'alert' | 'ended';
}

export interface SafetyAlert {
  id: string;
  type: 'emergency' | 'missed_checkin' | 'sos';
  user_id: string;
  username: string;
  event_id: string | null;
  event_title: string | null;
  message: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  resolved: boolean;
}

export interface AnalyticsData {
  userGrowth: { date: string; users: number; newUsers: number }[];
  eventsPerMonth: { month: string; events: number }[];
  topGenres: { genre: string; count: number; percentage: number }[];
  engagement: { date: string; going: number; interested: number; checkins: number }[];
  checkinsHeatmap: { day: number; hour: number; count: number }[];
}

export interface SourceData {
  name: string;
  date: string;
  venue: string;
  lineup: string[];
  stages: string[];
  extraInfo: string;
  website: string;
  instagram: string;
  facebook: string;
}

export interface ScrapedEventComparison {
  id: string;
  sources: {
    ra?: SourceData;
    djguide?: SourceData;
    partyflock?: SourceData;
  };
  eigen: Partial<SourceData>;
  conclusie: SourceData;
  matchScore: number;
  status: 'nieuw' | 'conflict' | 'geverifieerd';
}

export interface EscalSettings {
  scraperIntervals: {
    ra: string;
    partyflock: string;
    djguide: string;
  };
  locationExpirationMinutes: number;
  radiusChatDistanceMeters: number;
  buddyCheckIntervals: number[];
  moderationKeywords: string[];
  featureFlags: {
    liveLocations: boolean;
    radiusChat: boolean;
    buddySystem: boolean;
    gamification: boolean;
  };
}

// ============================================================================
// Hooks
// ============================================================================

export function useEscalMetrics() {
  const [metrics, setMetrics] = useState<EscalMetrics>({
    totalEvents: 0,
    activeUsers: 0,
    liveNow: 0,
    scrapersOk: 0,
    trends: { totalEvents: 0, activeUsers: 0, liveNow: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await fetchEscalMetrics();

        setMetrics({
          totalEvents: data.totalEvents || 0,
          activeUsers: 0, // TODO: implement user metrics
          liveNow: 0, // TODO: implement live user tracking
          scrapersOk: data.scrapersOk || 0,
          trends: data.trends || { totalEvents: 0, activeUsers: 0, liveNow: 0 },
        });
        setLoading(false);
      } catch (err) {
        console.error('[useEscalMetrics] Error fetching Escal metrics:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}

export function useEscalEvents(filters?: {
  status?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [events, setEvents] = useState<EscalEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEscalEvents({
        status: filters?.status as any,
        source: filters?.source,
        search: filters?.search,
        page: filters?.page,
        limit: filters?.limit,
      });

      setEvents(data.events || []);
      setTotal(data.total || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
      setTotal(0);
      setError(err as Error);
      setLoading(false);
    }
  }, [filters?.status, filters?.source, filters?.search, filters?.page, filters?.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, total, loading, error, refetch: fetchEvents };
}

export function useEscalEvent(eventId: string) {
  const [event, setEvent] = useState<EscalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        // TODO: Koppel aan Supabase single-event fetch
        setEvent(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
}

export function useEscalUsers(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [users, setUsers] = useState<EscalUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Koppel aan Supabase
      setUsers([]);
      setTotal(0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [filters?.status, filters?.search, filters?.page, filters?.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, total, loading, error, refetch: fetchUsers };
}

export function useEscalUser(userId: string) {
  const [user, setUser] = useState<EscalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        // TODO: Koppel aan Supabase
        setUser(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

export function useLiveLocations() {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: Koppel aan Supabase realtime
    setLocations([]);
    setLoading(false);
  }, []);

  return { locations, loading, error };
}

export function useScraperStatus() {
  const [scrapers, setScrapers] = useState<ScraperStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const triggerScraper = useCallback(async (source: string) => {
    // TODO: Koppel aan API om scraper te triggeren
    console.log(`Triggering scraper: ${source}`);
  }, []);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setScrapers([]);
    setLoading(false);
  }, []);

  return { scrapers, loading, error, triggerScraper };
}

export function useScraperLogs() {
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setLogs([]);
    setLoading(false);
  }, []);

  return { logs, loading };
}

export function useRadiusMessages(eventId?: string) {
  const [messages, setMessages] = useState<RadiusMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase realtime
    setMessages([]);
    setLoading(false);
  }, [eventId]);

  return { messages, loading };
}

export function useBuddyPairs() {
  const [pairs, setPairs] = useState<BuddyPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setPairs([]);
    setLoading(false);
  }, []);

  return { pairs, loading };
}

export function useSafetyAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setAlerts([]);
    setLoading(false);
  }, []);

  return { alerts, loading };
}

export function useEscalAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setData(null);
    setLoading(false);
  }, []);

  return { data, loading };
}

export function useEscalSettings() {
  const [settings, setSettings] = useState<EscalSettings>({
    scraperIntervals: {
      ra: '0 */4 * * *',
      partyflock: '0 */4 * * *',
      djguide: '0 */4 * * *',
    },
    locationExpirationMinutes: 60,
    radiusChatDistanceMeters: 500,
    buddyCheckIntervals: [15, 30, 60],
    moderationKeywords: [],
    featureFlags: {
      liveLocations: false,
      radiusChat: false,
      buddySystem: false,
      gamification: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setLoading(false);
  }, []);

  const saveSettings = useCallback(async (newSettings: EscalSettings) => {
    setSaving(true);
    try {
      // TODO: Koppel aan Supabase
      setSettings(newSettings);
      setSaving(false);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaving(false);
      return false;
    }
  }, []);

  return { settings, loading, saving, saveSettings };
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<
    {
      id: string;
      type: 'event_created' | 'user_registered' | 'checkin' | 'scraper_run';
      title: string;
      description: string;
      timestamp: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setActivities([]);
    setLoading(false);
  }, []);

  return { activities, loading };
}

export function useTopEvents() {
  const [events, setEvents] = useState<
    { id: string; title: string; going: number; interested: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase
    setEvents([]);
    setLoading(false);
  }, []);

  return { events, loading };
}

// ============================================================================
// Scraped Event Verification
// ============================================================================

export function useScrapedEventVerification() {
  const [events, setEvents] = useState<ScrapedEventComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Koppel aan Supabase wanneer scraper data is geimporteerd
    setEvents([]);
    setLoading(false);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<ScrapedEventComparison>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const bulkApprove = useCallback((ids: string[]) => {
    setEvents((prev) =>
      prev.map((e) =>
        ids.includes(e.id) ? { ...e, status: 'geverifieerd' as const } : e
      )
    );
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
  }, []);

  return { events, loading, updateEvent, deleteEvent, bulkApprove, bulkDelete };
}
