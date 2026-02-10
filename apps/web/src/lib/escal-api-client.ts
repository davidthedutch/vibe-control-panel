/**
 * Escal API Client
 * Server-to-server connection from Vibe Control Panel to Escal API
 * Falls back to bundled JSON data when API is unavailable
 */

const ESCAL_API_URL = process.env.ESCAL_API_URL || 'http://localhost:4000';
const ESCAL_API_KEY = process.env.ESCAL_API_KEY || '';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

class EscalApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'EscalApiError';
  }
}

async function escalFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, cache, revalidate, tags } = options;

  const url = `${ESCAL_API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (ESCAL_API_KEY) {
    headers['X-API-Key'] = ESCAL_API_KEY;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method,
    headers,
    cache,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (revalidate !== undefined || tags) {
    fetchOptions.next = {};
    if (revalidate !== undefined) fetchOptions.next.revalidate = revalidate;
    if (tags) fetchOptions.next.tags = tags;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new EscalApiError(
      response.status,
      errorBody?.error?.code || 'UNKNOWN',
      errorBody?.error?.message || `HTTP ${response.status}`,
    );
  }

  return response.json();
}

// ============================================================================
// Events API
// ============================================================================

export interface EscalEventFilters {
  status?: 'active' | 'past' | 'all';
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchEvents(filters?: EscalEventFilters) {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.source && filters.source !== 'all') params.set('source', filters.source);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));

  const qs = params.toString();
  return escalFetch<{
    events: unknown[];
    total: number;
    page: number;
    limit: number;
  }>(`/api/events${qs ? `?${qs}` : ''}`, {
    revalidate: 60,
    tags: ['escal-events'],
  });
}

export async function fetchEventById(id: string) {
  return escalFetch<{ event: unknown }>(`/api/events/${id}`, {
    revalidate: 60,
    tags: ['escal-events'],
  });
}

// ============================================================================
// Users API
// ============================================================================

export async function fetchUsers(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));

  const qs = params.toString();
  return escalFetch<{ users: unknown[]; total: number }>(
    `/api/users${qs ? `?${qs}` : ''}`,
    { revalidate: 30, tags: ['escal-users'] },
  );
}

// ============================================================================
// Venues API
// ============================================================================

export async function fetchVenues() {
  return escalFetch<{ venues: unknown[] }>('/api/venues', {
    revalidate: 300,
    tags: ['escal-venues'],
  });
}

// ============================================================================
// Scrapers API
// ============================================================================

export async function fetchScrapersStatus() {
  return escalFetch<{ scrapers: unknown[] }>('/api/admin/scrapers', {
    revalidate: 30,
    tags: ['escal-scrapers'],
  });
}

export async function triggerScraper(source: string) {
  return escalFetch<{ success: boolean }>(
    `/api/admin/scrapers/${source}/trigger`,
    { method: 'POST' },
  );
}

// ============================================================================
// Analytics API
// ============================================================================

export async function fetchAnalytics() {
  return escalFetch<{
    userGrowth: unknown[];
    eventsPerMonth: unknown[];
    topGenres: unknown[];
  }>('/api/analytics', {
    revalidate: 300,
    tags: ['escal-analytics'],
  });
}

// ============================================================================
// Live / WebSocket helpers
// ============================================================================

export function getWebSocketUrl() {
  const wsUrl = ESCAL_API_URL.replace(/^http/, 'ws');
  return wsUrl;
}

// ============================================================================
// Features API (Feature Registry)
// ============================================================================

export interface Feature {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  config: Record<string, unknown>;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchFeatures() {
  return escalFetch<{ features: Feature[] }>('/api/features', {
    revalidate: 30,
    tags: ['escal-features'],
  });
}

export async function updateFeature(
  id: string,
  updates: { enabled?: boolean; config?: Record<string, unknown> },
) {
  return escalFetch<{ feature: Feature }>(`/api/features/${id}`, {
    method: 'PATCH',
    body: updates,
  });
}

// ============================================================================
// Health check
// ============================================================================

export async function checkApiHealth() {
  try {
    const data = await escalFetch<{ status: string; service: string }>(
      '/health',
      { cache: 'no-store' },
    );
    return { connected: data.status === 'ok', data };
  } catch {
    return { connected: false, data: null };
  }
}

// Export error class for consumer use
export { EscalApiError };
