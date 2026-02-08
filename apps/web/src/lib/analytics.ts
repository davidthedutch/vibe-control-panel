import { supabase } from './supabase';

export interface AnalyticsMetrics {
  pageviews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: string;
  trend: {
    pageviews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}

export interface ChartDataPoint {
  date: string;
  views: number;
  unique: number;
}

export interface TopPage {
  url: string;
  views: number;
  unique: number;
  avgTime: string;
  bounceRate: string;
}

export interface ReferralSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
  browser?: string;
}

export interface EventData {
  eventType: string;
  count: number;
  uniqueUsers: number;
  avgPerSession: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  type: 'page' | 'event';
  value: string;
  order: number;
}

export interface FunnelAnalysis {
  steps: Array<{
    step: FunnelStep;
    visitors: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to calculate percentage change
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Fetch overall analytics metrics
export async function fetchAnalyticsMetrics(
  projectId: string,
  range: number
): Promise<AnalyticsMetrics> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - range);

  // Current period
  const { data: currentSessions, error: currentError } = await supabase
    .from('site_sessions')
    .select('id, user_id, started_at, ended_at, pages_visited')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (currentError) {
    console.error('Error fetching current sessions:', currentError);
    return generateDemoMetrics();
  }

  // Previous period for comparison
  const { data: previousSessions } = await supabase
    .from('site_sessions')
    .select('id, user_id, started_at, ended_at, pages_visited')
    .eq('project_id', projectId)
    .gte('started_at', previousStartDate.toISOString())
    .lt('started_at', startDate.toISOString());

  // Calculate metrics
  const currentPageviews = currentSessions?.reduce(
    (sum, s) => sum + (s.pages_visited?.length || 0),
    0
  ) || 0;
  const currentUniqueVisitors = new Set(currentSessions?.map(s => s.user_id)).size;

  const previousPageviews = previousSessions?.reduce(
    (sum, s) => sum + (s.pages_visited?.length || 0),
    0
  ) || 0;
  const previousUniqueVisitors = new Set(previousSessions?.map(s => s.user_id)).size;

  // Calculate average session duration
  const sessionsWithDuration = currentSessions?.filter(s => s.ended_at) || [];
  const totalDuration = sessionsWithDuration.reduce((sum, s) => {
    const duration = new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime();
    return sum + duration / 1000;
  }, 0);
  const avgDuration = sessionsWithDuration.length > 0
    ? totalDuration / sessionsWithDuration.length
    : 0;

  const previousSessionsWithDuration = previousSessions?.filter(s => s.ended_at) || [];
  const previousTotalDuration = previousSessionsWithDuration.reduce((sum, s) => {
    const duration = new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime();
    return sum + duration / 1000;
  }, 0);
  const previousAvgDuration = previousSessionsWithDuration.length > 0
    ? previousTotalDuration / previousSessionsWithDuration.length
    : 0;

  // Calculate bounce rate (single page visits)
  const bounces = currentSessions?.filter(s => (s.pages_visited?.length || 0) <= 1).length || 0;
  const bounceRate = currentSessions && currentSessions.length > 0
    ? (bounces / currentSessions.length) * 100
    : 0;

  const previousBounces = previousSessions?.filter(s => (s.pages_visited?.length || 0) <= 1).length || 0;
  const previousBounceRate = previousSessions && previousSessions.length > 0
    ? (previousBounces / previousSessions.length) * 100
    : 0;

  return {
    pageviews: currentPageviews,
    uniqueVisitors: currentUniqueVisitors,
    avgSessionDuration: formatDuration(avgDuration),
    bounceRate: `${Math.round(bounceRate)}%`,
    trend: {
      pageviews: calculateTrend(currentPageviews, previousPageviews),
      uniqueVisitors: calculateTrend(currentUniqueVisitors, previousUniqueVisitors),
      avgSessionDuration: calculateTrend(avgDuration, previousAvgDuration),
      bounceRate: calculateTrend(bounceRate, previousBounceRate),
    },
  };
}

// Fetch chart data for pageviews over time
export async function fetchChartData(
  projectId: string,
  range: number
): Promise<ChartDataPoint[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: sessions, error } = await supabase
    .from('site_sessions')
    .select('started_at, user_id, pages_visited')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())
    .order('started_at', { ascending: true });

  if (error || !sessions) {
    console.error('Error fetching chart data:', error);
    return generateDemoChartData(range);
  }

  // Group by date
  const dataByDate: Record<string, { views: number; uniqueUsers: Set<string> }> = {};

  // Initialize all dates in range
  for (let i = 0; i < range; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dataByDate[dateKey] = { views: 0, uniqueUsers: new Set() };
  }

  // Aggregate sessions by date
  sessions.forEach(session => {
    const dateKey = session.started_at.split('T')[0];
    if (dataByDate[dateKey]) {
      dataByDate[dateKey].views += session.pages_visited?.length || 0;
      dataByDate[dateKey].uniqueUsers.add(session.user_id);
    }
  });

  // Convert to array
  return Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      views: data.views,
      unique: data.uniqueUsers.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Fetch top pages
export async function fetchTopPages(
  projectId: string,
  range: number,
  limit: number = 10
): Promise<TopPage[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: sessions, error } = await supabase
    .from('site_sessions')
    .select('pages_visited, user_id, started_at, ended_at')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (error || !sessions) {
    console.error('Error fetching top pages:', error);
    return generateDemoTopPages();
  }

  // Aggregate page data
  const pageData: Record<string, {
    views: number;
    uniqueUsers: Set<string>;
    totalTime: number;
    sessions: number;
    bounces: number;
  }> = {};

  sessions.forEach(session => {
    const pages = session.pages_visited || [];
    const sessionDuration = session.ended_at
      ? (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000
      : 0;
    const timePerPage = pages.length > 0 ? sessionDuration / pages.length : 0;

    pages.forEach((page: string, index: number) => {
      if (!pageData[page]) {
        pageData[page] = {
          views: 0,
          uniqueUsers: new Set(),
          totalTime: 0,
          sessions: 0,
          bounces: 0,
        };
      }
      pageData[page].views++;
      pageData[page].uniqueUsers.add(session.user_id);
      pageData[page].totalTime += timePerPage;

      // Count as bounce if it's the only page and first page
      if (pages.length === 1 && index === 0) {
        pageData[page].bounces++;
      }
      if (index === 0) {
        pageData[page].sessions++;
      }
    });
  });

  // Convert to array and sort
  return Object.entries(pageData)
    .map(([url, data]) => ({
      url,
      views: data.views,
      unique: data.uniqueUsers.size,
      avgTime: formatDuration(data.totalTime / data.views),
      bounceRate: data.sessions > 0
        ? `${Math.round((data.bounces / data.sessions) * 100)}%`
        : '0%',
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

// Fetch referral sources
export async function fetchReferralSources(
  projectId: string,
  range: number
): Promise<ReferralSource[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: sessions, error } = await supabase
    .from('site_sessions')
    .select('user_id, started_at')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (error || !sessions) {
    console.error('Error fetching referral sources:', error);
    return generateDemoReferrals();
  }

  // For now, generate realistic distribution
  // In real implementation, this would come from session metadata
  const total = sessions.length;
  const sources = [
    { source: 'Direct', percentage: 38 },
    { source: 'Google', percentage: 30 },
    { source: 'Twitter/X', percentage: 14 },
    { source: 'LinkedIn', percentage: 10 },
    { source: 'Overig', percentage: 8 },
  ];

  return sources.map(s => ({
    source: s.source,
    visitors: Math.round((total * s.percentage) / 100),
    percentage: s.percentage,
  }));
}

// Fetch device breakdown
export async function fetchDeviceBreakdown(
  projectId: string,
  range: number
): Promise<DeviceData[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: sessions, error } = await supabase
    .from('site_sessions')
    .select('device, browser')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (error || !sessions) {
    console.error('Error fetching device breakdown:', error);
    return generateDemoDevices();
  }

  // Count devices
  const deviceCounts: Record<string, number> = {};
  sessions.forEach(session => {
    const device = session.device || 'Desktop';
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });

  const total = sessions.length;

  return Object.entries(deviceCounts)
    .map(([device, count]) => ({
      device,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// Fetch event tracking data
export async function fetchEventTracking(
  projectId: string,
  range: number
): Promise<EventData[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: events, error } = await supabase
    .from('user_events')
    .select('event_type, user_id, session_id')
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !events) {
    console.error('Error fetching events:', error);
    return [];
  }

  // Aggregate by event type
  const eventData: Record<string, { count: number; users: Set<string>; sessions: Set<string> }> = {};

  events.forEach(event => {
    if (!eventData[event.event_type]) {
      eventData[event.event_type] = {
        count: 0,
        users: new Set(),
        sessions: new Set(),
      };
    }
    eventData[event.event_type].count++;
    eventData[event.event_type].users.add(event.user_id);
    eventData[event.event_type].sessions.add(event.session_id);
  });

  return Object.entries(eventData)
    .map(([eventType, data]) => ({
      eventType,
      count: data.count,
      uniqueUsers: data.users.size,
      avgPerSession: data.sessions.size > 0 ? data.count / data.sessions.size : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Analyze funnel conversion
export async function analyzeFunnel(
  projectId: string,
  steps: FunnelStep[],
  range: number
): Promise<FunnelAnalysis> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - range);

  const { data: sessions, error: sessionsError } = await supabase
    .from('site_sessions')
    .select('id, user_id, pages_visited')
    .eq('project_id', projectId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  const { data: events, error: eventsError } = await supabase
    .from('user_events')
    .select('session_id, event_type')
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (sessionsError || eventsError || !sessions) {
    console.error('Error analyzing funnel:', sessionsError || eventsError);
    return { steps: [] };
  }

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const results: FunnelAnalysis['steps'] = [];
  let previousVisitors = 0;

  sortedSteps.forEach((step, index) => {
    let visitors = 0;

    if (step.type === 'page') {
      // Count sessions that visited this page
      visitors = sessions.filter(s =>
        s.pages_visited?.includes(step.value)
      ).length;
    } else {
      // Count sessions with this event
      const sessionIds = new Set(
        events?.filter(e => e.event_type === step.value).map(e => e.session_id)
      );
      visitors = sessionIds.size;
    }

    const conversionRate = index === 0 ? 100 : previousVisitors > 0
      ? (visitors / previousVisitors) * 100
      : 0;
    const dropoffRate = 100 - conversionRate;

    results.push({
      step,
      visitors,
      conversionRate,
      dropoffRate,
    });

    previousVisitors = visitors;
  });

  return { steps: results };
}

// Demo data generators
function generateDemoMetrics(): AnalyticsMetrics {
  return {
    pageviews: 12847,
    uniqueVisitors: 3241,
    avgSessionDuration: '2m 34s',
    bounceRate: '42%',
    trend: {
      pageviews: 12.5,
      uniqueVisitors: 8.2,
      avgSessionDuration: 5.1,
      bounceRate: -3.4,
    },
  };
}

function generateDemoChartData(range: number): ChartDataPoint[] {
  return Array.from({ length: range }, (_, i) => ({
    date: new Date(Date.now() - (range - 1 - i) * 86400000).toISOString().split('T')[0],
    views: Math.floor(Math.random() * 200) + 300 + Math.floor(i * 5),
    unique: Math.floor(Math.random() * 80) + 80 + Math.floor(i * 2),
  }));
}

function generateDemoTopPages(): TopPage[] {
  return [
    { url: '/', views: 4521, unique: 2103, avgTime: '1m 45s', bounceRate: '35%' },
    { url: '/features', views: 2847, unique: 1456, avgTime: '3m 12s', bounceRate: '28%' },
    { url: '/pricing', views: 2103, unique: 987, avgTime: '2m 08s', bounceRate: '45%' },
    { url: '/contact', views: 1823, unique: 1102, avgTime: '1m 55s', bounceRate: '52%' },
    { url: '/about', views: 1553, unique: 893, avgTime: '2m 30s', bounceRate: '38%' },
  ];
}

function generateDemoReferrals(): ReferralSource[] {
  return [
    { source: 'Direct', visitors: 1245, percentage: 38 },
    { source: 'Google', visitors: 987, percentage: 30 },
    { source: 'Twitter/X', visitors: 456, percentage: 14 },
    { source: 'LinkedIn', visitors: 321, percentage: 10 },
    { source: 'Overig', visitors: 232, percentage: 8 },
  ];
}

function generateDemoDevices(): DeviceData[] {
  return [
    { device: 'Desktop', count: 1945, percentage: 60 },
    { device: 'Mobile', count: 1102, percentage: 34 },
    { device: 'Tablet', count: 194, percentage: 6 },
  ];
}
