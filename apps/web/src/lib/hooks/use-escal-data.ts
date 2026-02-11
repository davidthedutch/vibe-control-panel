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
// Demo Data Generators
// ============================================================================

function generateDemoEvents(count: number): EscalEvent[] {
  const venues = [
    { name: 'Paradiso', city: 'Amsterdam' },
    { name: 'De School', city: 'Amsterdam' },
    { name: 'Shelter', city: 'Amsterdam' },
    { name: 'Closure', city: 'Amsterdam' },
    { name: 'Now&Wow', city: 'Rotterdam' },
    { name: 'BASIS', city: 'Utrecht' },
    { name: 'Radion', city: 'Amsterdam' },
    { name: 'De Marktkantine', city: 'Amsterdam' },
  ];
  const genres = ['Techno', 'House', 'Minimal', 'Trance', 'Drum & Bass', 'Hardcore', 'Ambient', 'Deep House'];
  const sources: ('ra' | 'partyflock' | 'djguide' | 'manual')[] = ['ra', 'partyflock', 'djguide', 'manual'];
  const statuses: ('active' | 'cancelled' | 'draft' | 'past')[] = ['active', 'active', 'active', 'past'];

  return Array.from({ length: count }, (_, i) => {
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 5);

    return {
      id: `event-${i + 1}`,
      title: `${['Awakenings', 'DGTL', 'Verknipt', 'Straf_werk', 'Loveland', 'Paaspop'][i % 6]} ${i + 1}`,
      description: 'An amazing night of electronic music.',
      venue_id: `venue-${i + 1}`,
      venue_name: venue.name,
      venue_city: venue.city,
      start_date: startDate.toISOString(),
      end_date: new Date(startDate.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      image_url: null,
      genres: [genres[Math.floor(Math.random() * genres.length)], genres[Math.floor(Math.random() * genres.length)]].filter((v, i, a) => a.indexOf(v) === i),
      going_count: Math.floor(Math.random() * 500) + 50,
      interested_count: Math.floor(Math.random() * 300) + 100,
      source: sources[Math.floor(Math.random() * sources.length)],
      status: startDate < new Date() ? 'past' : statuses[Math.floor(Math.random() * statuses.length)],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

function generateDemoUsers(count: number): EscalUser[] {
  const names = ['DJFan123', 'TechnoLover', 'RaveQueen', 'BassDrop', 'NightOwl', 'ClubKid', 'PartyPeople', 'BeatJunkie'];
  const statuses: ('active' | 'banned' | 'suspended')[] = ['active', 'active', 'active', 'active', 'active', 'banned', 'suspended'];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    username: `${names[i % names.length]}${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar_url: null,
    xp: Math.floor(Math.random() * 5000),
    level: Math.floor(Math.random() * 20) + 1,
    events_attended: Math.floor(Math.random() * 50),
    friends_count: Math.floor(Math.random() * 100),
    badges_count: Math.floor(Math.random() * 15),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
  }));
}

function generateDemoLiveLocations(count: number): LiveLocation[] {
  // Amsterdam coordinates with slight variations
  const baseLatLng = { lat: 52.3676, lng: 4.9041 };

  return Array.from({ length: count }, (_, i) => ({
    id: `loc-${i + 1}`,
    user_id: `user-${i + 1}`,
    username: `User${i + 1}`,
    avatar_url: null,
    event_id: Math.random() > 0.3 ? `event-${Math.floor(Math.random() * 10) + 1}` : null,
    event_title: Math.random() > 0.3 ? `Event ${Math.floor(Math.random() * 10) + 1}` : null,
    lat: baseLatLng.lat + (Math.random() - 0.5) * 0.05,
    lng: baseLatLng.lng + (Math.random() - 0.5) * 0.08,
    share_with: ['all', 'friends', 'buddies'][Math.floor(Math.random() * 3)] as 'all' | 'friends' | 'buddies',
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
  }));
}

function generateDemoScraperStatus(): ScraperStatus[] {
  return [
    {
      id: 'scraper-ra',
      source: 'ra',
      name: 'Resident Advisor',
      status: 'success',
      last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      events_scraped: 147,
      success_rate: 98.5,
      last_error: null,
    },
    {
      id: 'scraper-partyflock',
      source: 'partyflock',
      name: 'Partyflock',
      status: 'success',
      last_run: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      events_scraped: 89,
      success_rate: 95.2,
      last_error: null,
    },
    {
      id: 'scraper-djguide',
      source: 'djguide',
      name: 'DJ Guide',
      status: 'error',
      last_run: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      next_run: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      events_scraped: 0,
      success_rate: 82.1,
      last_error: 'Connection timeout after 30s',
    },
  ];
}

function generateDemoScraperLogs(count: number): ScraperLog[] {
  const sources = ['ra', 'partyflock', 'djguide'];
  return Array.from({ length: count }, (_, i) => {
    const isError = Math.random() < 0.1;
    return {
      id: `log-${i + 1}`,
      source: sources[i % 3],
      status: isError ? 'error' : 'success',
      events_found: isError ? 0 : Math.floor(Math.random() * 50) + 10,
      events_created: isError ? 0 : Math.floor(Math.random() * 20),
      events_updated: isError ? 0 : Math.floor(Math.random() * 30),
      errors: isError ? ['Connection timeout', 'Rate limited'] : [],
      duration_ms: Math.floor(Math.random() * 30000) + 5000,
      timestamp: new Date(Date.now() - i * 4 * 60 * 60 * 1000).toISOString(),
    };
  });
}

function generateDemoRadiusMessages(count: number): RadiusMessage[] {
  const messages = [
    'Anyone at stage 2?',
    'Great set by the DJ!',
    'Where is everyone?',
    'Meeting at the bar in 5',
    'Lost my friends, anyone seen them?',
    'This is amazing!',
    'Heading to the chill area',
    'Water station is near entrance',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i + 1}`,
    user_id: `user-${Math.floor(Math.random() * 50) + 1}`,
    username: `User${Math.floor(Math.random() * 50) + 1}`,
    avatar_url: null,
    event_id: `event-${Math.floor(Math.random() * 5) + 1}`,
    event_title: `Event ${Math.floor(Math.random() * 5) + 1}`,
    message: messages[Math.floor(Math.random() * messages.length)],
    lat: 52.3676 + (Math.random() - 0.5) * 0.01,
    lng: 4.9041 + (Math.random() - 0.5) * 0.01,
    created_at: new Date(Date.now() - i * 2 * 60 * 1000).toISOString(),
  }));
}

function generateDemoBuddyPairs(count: number): BuddyPair[] {
  const statuses: ('active' | 'alert' | 'ended')[] = ['active', 'active', 'active', 'alert', 'ended'];
  return Array.from({ length: count }, (_, i) => ({
    id: `buddy-${i + 1}`,
    user_id: `user-${i * 2 + 1}`,
    user_name: `User${i * 2 + 1}`,
    buddy_id: `user-${i * 2 + 2}`,
    buddy_name: `User${i * 2 + 2}`,
    event_id: `event-${Math.floor(Math.random() * 5) + 1}`,
    event_title: `Event ${Math.floor(Math.random() * 5) + 1}`,
    check_interval_minutes: [15, 30, 60][Math.floor(Math.random() * 3)],
    last_check: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

function generateDemoSafetyAlerts(count: number): SafetyAlert[] {
  const types: ('emergency' | 'missed_checkin' | 'sos')[] = ['missed_checkin', 'missed_checkin', 'emergency', 'sos'];
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    user_id: `user-${Math.floor(Math.random() * 50) + 1}`,
    username: `User${Math.floor(Math.random() * 50) + 1}`,
    event_id: `event-${Math.floor(Math.random() * 5) + 1}`,
    event_title: `Event ${Math.floor(Math.random() * 5) + 1}`,
    message: types[i % types.length] === 'emergency' ? 'Need help!' : null,
    lat: 52.3676 + (Math.random() - 0.5) * 0.01,
    lng: 4.9041 + (Math.random() - 0.5) * 0.01,
    created_at: new Date(Date.now() - i * 15 * 60 * 1000).toISOString(),
    resolved: i > 2,
  }));
}

function generateDemoAnalytics(): AnalyticsData {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return date.toLocaleString('nl-NL', { month: 'short', year: '2-digit' });
  });

  return {
    userGrowth: last30Days.map((date, i) => ({
      date,
      users: 1000 + i * 30 + Math.floor(Math.random() * 50),
      newUsers: Math.floor(Math.random() * 30) + 10,
    })),
    eventsPerMonth: last12Months.map((month) => ({
      month,
      events: Math.floor(Math.random() * 100) + 50,
    })),
    topGenres: [
      { genre: 'Techno', count: 450, percentage: 35 },
      { genre: 'House', count: 320, percentage: 25 },
      { genre: 'Minimal', count: 190, percentage: 15 },
      { genre: 'Trance', count: 130, percentage: 10 },
      { genre: 'Drum & Bass', count: 100, percentage: 8 },
      { genre: 'Other', count: 90, percentage: 7 },
    ],
    engagement: last30Days.map((date) => ({
      date,
      going: Math.floor(Math.random() * 200) + 100,
      interested: Math.floor(Math.random() * 150) + 50,
      checkins: Math.floor(Math.random() * 100) + 20,
    })),
    checkinsHeatmap: Array.from({ length: 7 * 24 }, (_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      count: i % 24 >= 22 || i % 24 <= 4 ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 20),
    })),
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
      console.log('[useEscalMetrics] Starting fetchMetrics...');
      try {
        console.log('[useEscalMetrics] Calling fetchEscalMetrics server action...');
        // Fetch real metrics using server action
        const data = await fetchEscalMetrics();
        console.log('[useEscalMetrics] Received data:', data);

        setMetrics({
          totalEvents: data.totalEvents || 0,
          activeUsers: 0, // TODO: implement user metrics
          liveNow: 0, // TODO: implement live user tracking
          scrapersOk: data.scrapersOk || 0,
          trends: data.trends || { totalEvents: 0, activeUsers: 0, liveNow: 0 },
        });
        console.log('[useEscalMetrics] Metrics updated, setting loading to false');
        setLoading(false);
      } catch (err) {
        console.error('[useEscalMetrics] Error fetching Escal metrics:', err);
        // Fallback to demo data
        const scrapers = generateDemoScraperStatus();
        const scrapersOk = scrapers.filter((s) => s.status === 'success' || s.status === 'idle').length;
        setMetrics({
          totalEvents: 1247,
          activeUsers: 3891,
          liveNow: 156,
          scrapersOk,
          trends: {
            totalEvents: 12.5,
            activeUsers: 8.3,
            liveNow: 23.1,
          },
        });
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
      // Fetch real data using server action
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
      // Fallback to demo data on error
      let demoEvents = generateDemoEvents(50);
      if (filters?.status && filters.status !== 'all') {
        demoEvents = demoEvents.filter((e) => e.status === filters.status);
      }
      if (filters?.source && filters.source !== 'all') {
        demoEvents = demoEvents.filter((e) => e.source === filters.source);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        demoEvents = demoEvents.filter(
          (e) =>
            e.title.toLowerCase().includes(search) ||
            e.venue_name?.toLowerCase().includes(search) ||
            e.venue_city?.toLowerCase().includes(search)
        );
      }
      setTotal(demoEvents.length);
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      setEvents(demoEvents.slice(start, start + limit));
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
        await new Promise((resolve) => setTimeout(resolve, 200));
        const demoEvents = generateDemoEvents(50);
        const found = demoEvents.find((e) => e.id === eventId);
        setEvent(found || null);
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
      await new Promise((resolve) => setTimeout(resolve, 300));
      let demoUsers = generateDemoUsers(100);

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        demoUsers = demoUsers.filter((u) => u.status === filters.status);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        demoUsers = demoUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
      }

      setTotal(demoUsers.length);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const start = (page - 1) * limit;
      setUsers(demoUsers.slice(start, start + limit));
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
        await new Promise((resolve) => setTimeout(resolve, 200));
        const demoUsers = generateDemoUsers(100);
        const found = demoUsers.find((u) => u.id === userId);
        setUser(found || null);
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
    const fetchLocations = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setLocations(generateDemoLiveLocations(25));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  return { locations, loading, error };
}

export function useScraperStatus() {
  const [scrapers, setScrapers] = useState<ScraperStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const triggerScraper = useCallback(async (source: string) => {
    // In production, call API to trigger scraper
    console.log(`Triggering scraper: ${source}`);
    setScrapers((prev) =>
      prev.map((s) =>
        s.source === source ? { ...s, status: 'running' as const } : s
      )
    );

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setScrapers((prev) =>
        prev.map((s) =>
          s.source === source
            ? {
                ...s,
                status: 'success' as const,
                last_run: new Date().toISOString(),
                events_scraped: Math.floor(Math.random() * 50) + 20,
              }
            : s
        )
      );
    }, 3000);
  }, []);

  useEffect(() => {
    const fetchScrapers = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setScrapers(generateDemoScraperStatus());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching scrapers:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchScrapers();
    const interval = setInterval(fetchScrapers, 60000);
    return () => clearInterval(interval);
  }, []);

  return { scrapers, loading, error, triggerScraper };
}

export function useScraperLogs() {
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setLogs(generateDemoScraperLogs(50));
      setLoading(false);
    };

    fetchLogs();
  }, []);

  return { logs, loading };
}

export function useRadiusMessages(eventId?: string) {
  const [messages, setMessages] = useState<RadiusMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      let msgs = generateDemoRadiusMessages(30);
      if (eventId) {
        msgs = msgs.filter((m) => m.event_id === eventId);
      }
      setMessages(msgs);
      setLoading(false);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  return { messages, loading };
}

export function useBuddyPairs() {
  const [pairs, setPairs] = useState<BuddyPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPairs = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setPairs(generateDemoBuddyPairs(15));
      setLoading(false);
    };

    fetchPairs();
    const interval = setInterval(fetchPairs, 10000);
    return () => clearInterval(interval);
  }, []);

  return { pairs, loading };
}

export function useSafetyAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setAlerts(generateDemoSafetyAlerts(8));
      setLoading(false);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return { alerts, loading };
}

export function useEscalAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(generateDemoAnalytics());
      setLoading(false);
    };

    fetchAnalytics();
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
    moderationKeywords: ['spam', 'scam', 'illegal'],
    featureFlags: {
      liveLocations: true,
      radiusChat: true,
      buddySystem: true,
      gamification: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSettings = useCallback(async (newSettings: EscalSettings) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
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
    const fetchActivity = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const types = ['event_created', 'user_registered', 'checkin', 'scraper_run'] as const;
      const activities = Array.from({ length: 10 }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)];
        return {
          id: `activity-${i + 1}`,
          type,
          title:
            type === 'event_created'
              ? 'New event scraped'
              : type === 'user_registered'
                ? 'New user registered'
                : type === 'checkin'
                  ? 'User checked in'
                  : 'Scraper completed',
          description:
            type === 'event_created'
              ? 'Awakenings Festival 2026 added from RA'
              : type === 'user_registered'
                ? `User${Math.floor(Math.random() * 1000)} joined`
                : type === 'checkin'
                  ? `Check-in at De School`
                  : 'RA scraper found 45 events',
          timestamp: new Date(Date.now() - i * 5 * 60 * 1000).toISOString(),
        };
      });

      setActivities(activities);
      setLoading(false);
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  return { activities, loading };
}

export function useTopEvents() {
  const [events, setEvents] = useState<
    { id: string; title: string; going: number; interested: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEvents = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const demoEvents = generateDemoEvents(10);
      setEvents(
        demoEvents
          .sort((a, b) => b.going_count - a.going_count)
          .slice(0, 5)
          .map((e) => ({
            id: e.id,
            title: e.title,
            going: e.going_count,
            interested: e.interested_count,
          }))
      );
      setLoading(false);
    };

    fetchTopEvents();
  }, []);

  return { events, loading };
}

// ============================================================================
// Scraped Event Verification
// ============================================================================

function generateDemoVerificationData(): ScrapedEventComparison[] {
  const events: ScrapedEventComparison[] = [
    {
      id: 'verify-1',
      sources: {
        ra: {
          name: 'Awakenings New Year Special',
          date: '2026-02-14',
          venue: 'Gashouder',
          lineup: ['Adam Beyer', 'Amelie Lens', 'Enrico Sangiuliano'],
          stages: ['Main', 'Tent'],
          extraInfo: '18+, Techno',
          website: 'https://ra.co/events/awakenings-nye',
          instagram: '@awaborig',
          facebook: 'fb.com/awakenings',
        },
        djguide: {
          name: 'Awakenings NYE Special',
          date: '2026-02-14',
          venue: 'Gashouder Amsterdam',
          lineup: ['Adam Beyer', 'Amelie Lens'],
          stages: [],
          extraInfo: 'Techno',
          website: 'https://djguide.nl/awakenings',
          instagram: '',
          facebook: '',
        },
        partyflock: {
          name: 'Awakenings - New Year Special 2026',
          date: '14-02-2026',
          venue: 'Gashouder',
          lineup: ['Adam Beyer', 'Amelie Lens', 'Enrico Sangiuliano', 'Charlotte de Witte'],
          stages: ['Main'],
          extraInfo: '',
          website: 'https://partyflock.nl/party/awakenings-nye',
          instagram: '@awaborig',
          facebook: '',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Awakenings New Year Special',
        date: '2026-02-14',
        venue: 'Gashouder',
        lineup: ['Adam Beyer', 'Amelie Lens', 'Enrico Sangiuliano', 'Charlotte de Witte'],
        stages: ['Main', 'Tent'],
        extraInfo: '18+, Techno',
        website: 'https://ra.co/events/awakenings-nye',
        instagram: '@awaborig',
        facebook: 'fb.com/awakenings',
      },
      matchScore: 92,
      status: 'conflict',
    },
    {
      id: 'verify-2',
      sources: {
        ra: {
          name: 'Verknipt Indoor',
          date: '2026-02-21',
          venue: 'Jaarbeurs Utrecht',
          lineup: ['Reinier Zonneveld', 'I Hate Models', 'FJAAK'],
          stages: ['Hall 1', 'Hall 2'],
          extraInfo: '18+, Techno, Hard Techno',
          website: 'https://ra.co/events/verknipt-indoor',
          instagram: '@verknipt',
          facebook: 'fb.com/verknipt',
        },
        partyflock: {
          name: 'Verknipt Indoor',
          date: '21-02-2026',
          venue: 'Jaarbeurs',
          lineup: ['Reinier Zonneveld', 'I Hate Models', 'FJAAK'],
          stages: ['Hall 1', 'Hall 2'],
          extraInfo: 'Hard Techno',
          website: 'https://partyflock.nl/party/verknipt',
          instagram: '@verknipt',
          facebook: '',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Verknipt Indoor',
        date: '2026-02-21',
        venue: 'Jaarbeurs Utrecht',
        lineup: ['Reinier Zonneveld', 'I Hate Models', 'FJAAK'],
        stages: ['Hall 1', 'Hall 2'],
        extraInfo: '18+, Techno, Hard Techno',
        website: 'https://ra.co/events/verknipt-indoor',
        instagram: '@verknipt',
        facebook: 'fb.com/verknipt',
      },
      matchScore: 97,
      status: 'geverifieerd',
    },
    {
      id: 'verify-3',
      sources: {
        ra: {
          name: 'DGTL Amsterdam 2026',
          date: '2026-03-28',
          venue: 'NDSM Werf',
          lineup: ['Dixon', 'Nina Kraviz', 'Ben Klock', 'Tale Of Us'],
          stages: ['Main', 'Frequency', 'Gain'],
          extraInfo: '18+, Techno, House',
          website: 'https://ra.co/events/dgtl-2026',
          instagram: '@dgtl',
          facebook: 'fb.com/dgtlfestival',
        },
        djguide: {
          name: 'DGTL Festival 2026',
          date: '2026-03-28',
          venue: 'NDSM',
          lineup: ['Dixon', 'Nina Kraviz'],
          stages: ['Main'],
          extraInfo: 'Techno',
          website: 'https://djguide.nl/dgtl',
          instagram: '',
          facebook: '',
        },
        partyflock: {
          name: 'DGTL 2026',
          date: '28-03-2026',
          venue: 'NDSM-werf Amsterdam',
          lineup: ['Dixon', 'Nina Kraviz', 'Ben Klock', 'Tale Of Us', 'Maceo Plex'],
          stages: ['Main', 'Frequency', 'Gain'],
          extraInfo: '',
          website: 'https://partyflock.nl/party/dgtl-2026',
          instagram: '@dgtl',
          facebook: 'fb.com/dgtlfestival',
        },
      },
      eigen: {},
      conclusie: {
        name: 'DGTL Amsterdam 2026',
        date: '2026-03-28',
        venue: 'NDSM Werf',
        lineup: ['Dixon', 'Nina Kraviz', 'Ben Klock', 'Tale Of Us', 'Maceo Plex'],
        stages: ['Main', 'Frequency', 'Gain'],
        extraInfo: '18+, Techno, House',
        website: 'https://ra.co/events/dgtl-2026',
        instagram: '@dgtl',
        facebook: 'fb.com/dgtlfestival',
      },
      matchScore: 88,
      status: 'conflict',
    },
    {
      id: 'verify-4',
      sources: {
        ra: {
          name: 'Loveland Festival',
          date: '2026-04-11',
          venue: 'Sloterpark Amsterdam',
          lineup: ['Solomun', 'Jamie Jones', 'The Martinez Brothers'],
          stages: ['Stage 1', 'Stage 2', 'Stage 3'],
          extraInfo: '18+, House, Tech House',
          website: 'https://ra.co/events/loveland',
          instagram: '@lovelandfestival',
          facebook: 'fb.com/loveland',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Loveland Festival',
        date: '2026-04-11',
        venue: 'Sloterpark Amsterdam',
        lineup: ['Solomun', 'Jamie Jones', 'The Martinez Brothers'],
        stages: ['Stage 1', 'Stage 2', 'Stage 3'],
        extraInfo: '18+, House, Tech House',
        website: 'https://ra.co/events/loveland',
        instagram: '@lovelandfestival',
        facebook: 'fb.com/loveland',
      },
      matchScore: 100,
      status: 'nieuw',
    },
    {
      id: 'verify-5',
      sources: {
        djguide: {
          name: 'Straf_werk',
          date: '2026-03-07',
          venue: 'Warehouse Elementenstraat',
          lineup: ['Kobosil', 'SPFDJ', 'Blawan'],
          stages: ['Main', 'Dark Room'],
          extraInfo: 'Techno',
          website: 'https://djguide.nl/strafwerk',
          instagram: '@straf_werk',
          facebook: '',
        },
        partyflock: {
          name: 'STRAF_WERK',
          date: '07-03-2026',
          venue: 'Warehouse Elementenstraat',
          lineup: ['Kobosil', 'SPFDJ', 'Blawan', 'Rebekah'],
          stages: ['Main', 'Dark Room'],
          extraInfo: 'Industrial Techno',
          website: 'https://partyflock.nl/party/strafwerk',
          instagram: '@straf_werk',
          facebook: 'fb.com/strafwerk',
        },
      },
      eigen: {},
      conclusie: {
        name: 'STRAF_WERK',
        date: '2026-03-07',
        venue: 'Warehouse Elementenstraat',
        lineup: ['Kobosil', 'SPFDJ', 'Blawan', 'Rebekah'],
        stages: ['Main', 'Dark Room'],
        extraInfo: 'Industrial Techno',
        website: 'https://partyflock.nl/party/strafwerk',
        instagram: '@straf_werk',
        facebook: 'fb.com/strafwerk',
      },
      matchScore: 94,
      status: 'nieuw',
    },
    {
      id: 'verify-6',
      sources: {
        ra: {
          name: 'Katharsis at Shelter',
          date: '2026-02-28',
          venue: 'Shelter Amsterdam',
          lineup: ['DVS1', 'Surgeon', 'Ancient Methods'],
          stages: ['Main'],
          extraInfo: '18+, Industrial Techno',
          website: 'https://ra.co/events/katharsis',
          instagram: '@shelter.ams',
          facebook: '',
        },
        partyflock: {
          name: 'Katharsis',
          date: '28-02-2026',
          venue: 'Shelter',
          lineup: ['DVS1', 'Surgeon'],
          stages: [],
          extraInfo: '',
          website: 'https://partyflock.nl/party/katharsis',
          instagram: '',
          facebook: '',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Katharsis at Shelter',
        date: '2026-02-28',
        venue: 'Shelter Amsterdam',
        lineup: ['DVS1', 'Surgeon', 'Ancient Methods'],
        stages: ['Main'],
        extraInfo: '18+, Industrial Techno',
        website: 'https://ra.co/events/katharsis',
        instagram: '@shelter.ams',
        facebook: '',
      },
      matchScore: 85,
      status: 'conflict',
    },
    {
      id: 'verify-7',
      sources: {
        ra: {
          name: 'Thuishaven Season Opening',
          date: '2026-04-04',
          venue: 'Thuishaven Amsterdam',
          lineup: ['Job Jobse', 'Carista', 'Dekmantel Soundsystem'],
          stages: ['Outdoor', 'Indoor', 'Greenhouse'],
          extraInfo: 'House, Disco, Leftfield',
          website: 'https://ra.co/events/thuishaven-opening',
          instagram: '@thuishaven',
          facebook: 'fb.com/thuishaven',
        },
        djguide: {
          name: 'Thuishaven Opening 2026',
          date: '2026-04-04',
          venue: 'Thuishaven',
          lineup: ['Job Jobse', 'Carista'],
          stages: ['Outdoor'],
          extraInfo: 'House',
          website: 'https://djguide.nl/thuishaven',
          instagram: '',
          facebook: '',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Thuishaven Season Opening',
        date: '2026-04-04',
        venue: 'Thuishaven Amsterdam',
        lineup: ['Job Jobse', 'Carista', 'Dekmantel Soundsystem'],
        stages: ['Outdoor', 'Indoor', 'Greenhouse'],
        extraInfo: 'House, Disco, Leftfield',
        website: 'https://ra.co/events/thuishaven-opening',
        instagram: '@thuishaven',
        facebook: 'fb.com/thuishaven',
      },
      matchScore: 90,
      status: 'geverifieerd',
    },
    {
      id: 'verify-8',
      sources: {
        ra: {
          name: 'Dekmantel Festival 2026',
          date: '2026-07-30',
          venue: 'Amsterdamse Bos',
          lineup: ['DJ Stingray', 'Shackleton', 'Midland', 'Joy Orbison'],
          stages: ['Main', 'Greenhouse', 'Selectors', 'UFO'],
          extraInfo: '18+, Eclectic, Techno, House',
          website: 'https://ra.co/events/dekmantel-2026',
          instagram: '@dekmantelfestival',
          facebook: 'fb.com/dekmantel',
        },
        djguide: {
          name: 'Dekmantel 2026',
          date: '2026-07-30',
          venue: 'Amsterdamse Bos',
          lineup: ['DJ Stingray', 'Shackleton'],
          stages: ['Main'],
          extraInfo: 'Techno',
          website: 'https://djguide.nl/dekmantel',
          instagram: '',
          facebook: '',
        },
        partyflock: {
          name: 'Dekmantel Festival',
          date: '30-07-2026',
          venue: 'Amsterdamse Bos',
          lineup: ['DJ Stingray', 'Shackleton', 'Midland', 'Joy Orbison', 'Antal'],
          stages: ['Main', 'Greenhouse', 'Selectors', 'UFO'],
          extraInfo: 'Eclectic',
          website: 'https://partyflock.nl/party/dekmantel',
          instagram: '@dekmantelfestival',
          facebook: 'fb.com/dekmantel',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Dekmantel Festival 2026',
        date: '2026-07-30',
        venue: 'Amsterdamse Bos',
        lineup: ['DJ Stingray', 'Shackleton', 'Midland', 'Joy Orbison', 'Antal'],
        stages: ['Main', 'Greenhouse', 'Selectors', 'UFO'],
        extraInfo: '18+, Eclectic, Techno, House',
        website: 'https://ra.co/events/dekmantel-2026',
        instagram: '@dekmantelfestival',
        facebook: 'fb.com/dekmantel',
      },
      matchScore: 91,
      status: 'geverifieerd',
    },
    {
      id: 'verify-9',
      sources: {
        partyflock: {
          name: 'Voltt Outdoor',
          date: '15-05-2026',
          venue: 'NDSM-werf Amsterdam',
          lineup: ['Marcel Fengler', 'Etapp Kyle'],
          stages: ['Main', 'Hangar'],
          extraInfo: 'Techno',
          website: 'https://partyflock.nl/party/voltt',
          instagram: '@volttevents',
          facebook: '',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Voltt Outdoor',
        date: '2026-05-15',
        venue: 'NDSM-werf Amsterdam',
        lineup: ['Marcel Fengler', 'Etapp Kyle'],
        stages: ['Main', 'Hangar'],
        extraInfo: 'Techno',
        website: 'https://partyflock.nl/party/voltt',
        instagram: '@volttevents',
        facebook: '',
      },
      matchScore: 100,
      status: 'nieuw',
    },
    {
      id: 'verify-10',
      sources: {
        ra: {
          name: 'Paradigm Festival',
          date: '2026-08-15',
          venue: 'Paradigm Groningen',
          lineup: ['Ben UFO', 'Hunee', 'Marcel Dettmann'],
          stages: ['Main', 'Second'],
          extraInfo: '18+, Techno, House',
          website: 'https://ra.co/events/paradigm',
          instagram: '@paradigmfestival',
          facebook: 'fb.com/paradigm',
        },
        djguide: {
          name: 'Paradigm',
          date: '2026-08-15',
          venue: 'Paradigm',
          lineup: ['Ben UFO', 'Hunee'],
          stages: [],
          extraInfo: '',
          website: 'https://djguide.nl/paradigm',
          instagram: '',
          facebook: '',
        },
        partyflock: {
          name: 'Paradigm Festival 2026',
          date: '15-08-2026',
          venue: 'Paradigm Groningen',
          lineup: ['Ben UFO', 'Hunee', 'Marcel Dettmann', 'Job Jobse'],
          stages: ['Main', 'Second'],
          extraInfo: 'Techno, House',
          website: 'https://partyflock.nl/party/paradigm',
          instagram: '@paradigmfestival',
          facebook: 'fb.com/paradigm',
        },
      },
      eigen: {},
      conclusie: {
        name: 'Paradigm Festival 2026',
        date: '2026-08-15',
        venue: 'Paradigm Groningen',
        lineup: ['Ben UFO', 'Hunee', 'Marcel Dettmann', 'Job Jobse'],
        stages: ['Main', 'Second'],
        extraInfo: '18+, Techno, House',
        website: 'https://ra.co/events/paradigm',
        instagram: '@paradigmfestival',
        facebook: 'fb.com/paradigm',
      },
      matchScore: 89,
      status: 'conflict',
    },
  ];

  // Genereer extra events om de echte dataset te simuleren (1134 events)
  const eventNames = [
    'Waagnatie Invites', 'Chin Chin Club', 'Into The Woods', 'Draaimolen Festival',
    'Reaktor', 'Superstition', 'Oddity', 'Garage Noord', 'Vault Sessions', 'Vuurwerk',
    'De Nachtwacht', 'Audio Obsura', 'Nacht van de Gracht', 'Pleinvrees', 'WAS.',
    'Het Magazijn', 'Club NYX Night', 'Wildeburg Festival', 'Soenda Festival', 'Pitch Festival',
    'Nachtcollege Presents', 'We Are Electric', 'Free Your Mind', 'Mystic Garden Festival',
    'AIR Amsterdam Night', 'Karavaan', 'Welcome to the Future', 'Lowlands Dancetent',
    'Unpolished', 'Crystal', 'Intercell', 'BASIS Invites', 'Sisyphos Tour NL',
    'No Art Festival', 'Kingsnight Special', 'Rave Alert', 'Kompass Klub NL',
    'Hyte Amsterdam', 'Boiler Room AMS', 'Encore Festival', 'By The Creek',
    'Vunzige Deansen', 'Milkshake Festival', 'Verboden Vrucht', 'Piknik', 'Toffler Indoor',
    'FEST Festival NL', 'Ade Opening Concert', 'ADE Closing', 'Diynamic Showcase',
    'Afterlife Amsterdam', 'Drumcode Night', 'Circoloco AMS', 'Exhale at Shelter',
    'MORD Night', 'Herrensauna NL', 'Possession NL', 'HEX at De School',
    'Lente Kabinet', 'Voltt Loves Summer', 'Tobacco Dock NL Pop-up', 'Cocoon AMS',
    'Cadenza Night', 'Innervisions Open Air', 'Watergate Tour NL', 'Tresor meets AMS',
    'Berghain Tour NL', 'De Marktkantine Night', 'Radion All Night Long',
    'Parallel Festival', 'Wicked Jazz Sounds', 'Appelsap', 'Push It',
    'S!CK Festival', 'Hardshock Festival', 'Masters of Hardcore NL', 'Thunderdome',
    'Defqon.1 Warmup', 'Rebirth Festival', 'Intents Festival', 'Ground Zero',
    'Q-Base NL', 'Let It Roll NL', 'Noisia Invites', 'Blackout NL', 'Rampage NL',
    'Liquicity Festival', 'Sun City Open Air', 'Buiten Westen', 'DGTL Revolution',
    'Strafwerk XL', 'Awakenings Summer', 'Loveland Kingsday', 'Verknipt Outdoor',
    'Junction 2 AMS', 'Time Warp NL', 'Sonar AMS', 'Movement AMS',
  ];
  const venues = [
    { name: 'Paradiso', city: 'Amsterdam' }, { name: 'De School', city: 'Amsterdam' },
    { name: 'Shelter', city: 'Amsterdam' }, { name: 'Closure', city: 'Amsterdam' },
    { name: 'Radion', city: 'Amsterdam' }, { name: 'De Marktkantine', city: 'Amsterdam' },
    { name: 'Warehouse Elementenstraat', city: 'Amsterdam' },
    { name: 'NDSM Werf', city: 'Amsterdam' }, { name: 'Thuishaven', city: 'Amsterdam' },
    { name: 'AIR Amsterdam', city: 'Amsterdam' }, { name: 'Club NYX', city: 'Amsterdam' },
    { name: 'Melkweg', city: 'Amsterdam' }, { name: 'Beurs van Berlage', city: 'Amsterdam' },
    { name: 'Ziggo Dome', city: 'Amsterdam' }, { name: 'AFAS Live', city: 'Amsterdam' },
    { name: 'Jaarbeurs', city: 'Utrecht' }, { name: 'BASIS', city: 'Utrecht' },
    { name: 'TivoliVredenburg', city: 'Utrecht' }, { name: 'Now&Wow', city: 'Rotterdam' },
    { name: 'Maassilo', city: 'Rotterdam' }, { name: 'Toffler', city: 'Rotterdam' },
    { name: 'Cruise Terminal', city: 'Rotterdam' }, { name: 'Gashouder', city: 'Amsterdam' },
    { name: 'Sloterpark', city: 'Amsterdam' }, { name: 'Amsterdamse Bos', city: 'Amsterdam' },
    { name: 'Het Twiske', city: 'Amsterdam' }, { name: 'Stadspark', city: 'Groningen' },
    { name: 'Paradigm', city: 'Groningen' }, { name: 'Doornroosje', city: 'Nijmegen' },
    { name: 'Effenaar', city: 'Eindhoven' },
  ];
  const djs = [
    'Adam Beyer', 'Amelie Lens', 'Charlotte de Witte', 'Ben Klock', 'Marcel Dettmann',
    'Nina Kraviz', 'Dixon', 'Tale Of Us', 'Solomun', 'Jamie Jones', 'Joseph Capriati',
    'Reinier Zonneveld', 'I Hate Models', 'FJAAK', 'Kobosil', 'SPFDJ', 'Blawan',
    'DVS1', 'Surgeon', 'Ancient Methods', 'Job Jobse', 'Carista', 'Hunee',
    'Ben UFO', 'Joy Orbison', 'Midland', 'Antal', 'Shackleton', 'DJ Stingray',
    'Maceo Plex', 'Rebekah', 'Dax J', 'Perc', 'Ansome', 'Paula Temple',
    'Helena Hauff', 'Objekt', 'Call Super', 'Palms Trax', 'Octo Octa',
    'Roi Perez', 'Vladimir Ivkovic', 'Binh', 'Nastia', 'Peggy Gou',
    'DJ Nobu', 'Wata Igarashi', 'Donato Dozzy', 'Neel', 'Rrose',
    'Speedy J', 'Jeff Mills', 'Robert Hood', 'Juan Atkins', 'Derrick May',
    'Joris Voorn', 'Kolsch', 'Patrice Baumel', 'San Proper', 'Young Marco',
  ];
  const stages = ['Main', 'Tent', 'Outdoor', 'Indoor', 'Hall 1', 'Hall 2', 'Dark Room', 'Greenhouse', 'Hangar', 'Terrace'];
  const genres = ['Techno', 'House', 'Minimal', 'Hard Techno', 'Industrial', 'Trance', 'Deep House', 'Disco', 'Leftfield', 'Electro'];
  const statuses: ('nieuw' | 'conflict' | 'geverifieerd')[] = ['nieuw', 'conflict', 'geverifieerd'];

  // Deterministic seed based on index for consistent demo data
  function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  for (let i = 0; i < 150; i++) {
    const seed = i + 100;
    const r = (offset: number) => seededRandom(seed + offset);

    const eventName = eventNames[i % eventNames.length] + (i >= eventNames.length ? ` #${Math.floor(i / eventNames.length) + 1}` : '');
    const venue = venues[Math.floor(r(0) * venues.length)];
    const baseDate = new Date('2026-02-01');
    baseDate.setDate(baseDate.getDate() + Math.floor(r(1) * 180));
    const dateStr = baseDate.toISOString().split('T')[0];
    const ddmmyyyy = `${dateStr.slice(8)}-${dateStr.slice(5, 7)}-${dateStr.slice(0, 4)}`;

    const numDjs = Math.floor(r(2) * 4) + 1;
    const djStart = Math.floor(r(3) * (djs.length - numDjs));
    const lineup = djs.slice(djStart, djStart + numDjs);

    const numStages = Math.floor(r(4) * 3) + 1;
    const stageStart = Math.floor(r(5) * (stages.length - numStages));
    const eventStages = stages.slice(stageStart, stageStart + numStages);

    const genre = genres[Math.floor(r(6) * genres.length)];

    // Determine which sources have this event
    const hasRA = r(7) > 0.25;
    const hasDJGuide = r(8) > 0.45;
    const hasPartyflock = r(9) > 0.3;
    // Ensure at least one source
    const hasAtLeastOne = hasRA || hasDJGuide || hasPartyflock;

    const sources: ScrapedEventComparison['sources'] = {};

    if (hasRA || !hasAtLeastOne) {
      sources.ra = {
        name: eventName,
        date: dateStr,
        venue: venue.name + (r(10) > 0.5 ? ' ' + venue.city : ''),
        lineup: lineup,
        stages: eventStages,
        extraInfo: `18+, ${genre}`,
        website: `https://ra.co/events/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        instagram: `@${eventName.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(0, 20),
        facebook: r(11) > 0.4 ? `fb.com/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(0, 30) : '',
      };
    }

    if (hasDJGuide) {
      // DJGuide often has less data
      sources.djguide = {
        name: r(12) > 0.3 ? eventName : eventName.replace(/ /g, ' ').toUpperCase(),
        date: dateStr,
        venue: venue.name,
        lineup: lineup.slice(0, Math.max(1, lineup.length - 1)),
        stages: r(13) > 0.5 ? eventStages.slice(0, 1) : [],
        extraInfo: genre,
        website: `https://djguide.nl/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        instagram: '',
        facebook: '',
      };
    }

    if (hasPartyflock) {
      // Partyflock uses dd-mm-yyyy and sometimes has extra DJs
      const pfLineup = [...lineup];
      if (r(14) > 0.5 && djs.length > djStart + numDjs) {
        pfLineup.push(djs[djStart + numDjs]);
      }
      sources.partyflock = {
        name: r(15) > 0.5 ? eventName : eventName + ' 2026',
        date: ddmmyyyy,
        venue: venue.name + (r(16) > 0.6 ? ' ' + venue.city : ''),
        lineup: pfLineup,
        stages: eventStages,
        extraInfo: r(17) > 0.5 ? genre : '',
        website: `https://partyflock.nl/party/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        instagram: r(18) > 0.5 ? `@${eventName.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(0, 20) : '',
        facebook: r(19) > 0.6 ? `fb.com/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(0, 30) : '',
      };
    }

    const sourceCount = Object.keys(sources).length;
    const matchScore = sourceCount === 1 ? 100 : Math.floor(75 + r(20) * 25);
    const status = sourceCount === 1
      ? (r(21) > 0.5 ? 'nieuw' : 'geverifieerd')
      : statuses[Math.floor(r(22) * statuses.length)];

    // Build conclusie from best available data (RA preferred, then Partyflock, then DJGuide)
    const primary = sources.ra || sources.partyflock || sources.djguide!;
    const pfData = sources.partyflock;
    const conclusie: SourceData = {
      name: primary.name,
      date: dateStr,
      venue: venue.name + ' ' + venue.city,
      lineup: pfData && pfData.lineup.length > primary.lineup.length ? pfData.lineup : primary.lineup,
      stages: primary.stages.length > 0 ? primary.stages : (pfData?.stages || []),
      extraInfo: sources.ra?.extraInfo || primary.extraInfo,
      website: sources.ra?.website || primary.website,
      instagram: sources.ra?.instagram || pfData?.instagram || primary.instagram,
      facebook: sources.ra?.facebook || pfData?.facebook || primary.facebook,
    };

    events.push({
      id: `verify-gen-${i + 1}`,
      sources,
      eigen: {},
      conclusie,
      matchScore,
      status,
    });
  }

  return events;
}

export function useScrapedEventVerification() {
  const [events, setEvents] = useState<ScrapedEventComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setEvents(generateDemoVerificationData());
      setLoading(false);
    };

    fetchData();
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
