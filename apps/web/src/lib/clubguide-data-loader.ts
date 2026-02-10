import * as fs from 'fs';
import * as path from 'path';

// ====================================================================
// Clubguide Data Loader
// Direct data loading for clubguide (bypasses API routes)
// ====================================================================

const ENRICHED_DATA_PATH = path.join('H:', 'Onedrive', 'PC-Rogier', 'Oud', 'Feesten', 'data', 'enriched_events_2026-02-08.json');

interface EnrichedEvent {
  source: string;
  sourceUrl?: string;
  name: string;
  date: string | Date;
  time?: string;
  venue?: string;
  city?: string;
  artists?: string[];
  genres?: string[];
  description?: string;
  imageUrl?: string;
  ticketUrl?: string;
  enrichedFrom?: string;
  enrichedMatchScore?: number;
}

// Parse dates in format "8 feb" or "Sun, 8 Feb" to ISO date
function parseEventDate(dateStr: string | Date | undefined): Date {
  if (!dateStr) {
    return new Date(); // Return current date as fallback
  }

  if (dateStr instanceof Date) {
    return dateStr;
  }

  const year = 2026; // Events are from 2026

  // Remove day name if present (e.g., "Sun, 8 Feb" -> "8 Feb")
  const cleanDate = dateStr.replace(/^[A-Za-z]+,\s*/, '');

  // Parse "8 feb" or "8 Feb" format
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const parts = cleanDate.toLowerCase().split(/\s+/);

  if (parts.length >= 2) {
    const day = parseInt(parts[0]);
    const monthIndex = monthNames.indexOf(parts[1].substring(0, 3));

    if (monthIndex >= 0 && !isNaN(day)) {
      return new Date(year, monthIndex, day);
    }
  }

  // Fallback: try to parse as regular date
  return new Date(dateStr);
}

interface EventData {
  events: EnrichedEvent[];
  metadata?: any;
}

let eventsCache: EnrichedEvent[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

export function loadEnrichedEvents(): EnrichedEvent[] {
  const now = Date.now();

  // Return cached data if still valid
  if (eventsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return eventsCache;
  }

  try {
    const fileContent = fs.readFileSync(ENRICHED_DATA_PATH, 'utf-8');
    const data: EventData = JSON.parse(fileContent);
    eventsCache = data.events || [];
    cacheTimestamp = now;

    console.log(`[Clubguide] Loaded ${eventsCache.length} events from enriched data`);
    return eventsCache;
  } catch (error) {
    console.error('[Clubguide] Error loading enriched events:', error);
    return [];
  }
}

export function getClubguideMetrics() {
  const events = loadEnrichedEvents();
  const now = new Date();

  const activeEvents = events.filter((e: EnrichedEvent) => parseEventDate(e.date as string) >= now);
  const eventsWithArtists = events.filter((e: EnrichedEvent) => e.artists && e.artists.length > 0);

  const sourceCount = {
    ra: events.filter((e: EnrichedEvent) => e.source === 'residentadvisor').length,
    partyflock: events.filter((e: EnrichedEvent) => e.source === 'partyflock').length,
    djguide: events.filter((e: EnrichedEvent) => e.source === 'djguide').length,
  };

  return {
    totalEvents: events.length,
    activeEvents: activeEvents.length,
    eventsWithArtists: eventsWithArtists.length,
    artistCoverage: ((eventsWithArtists.length / events.length) * 100).toFixed(1),
    sources: sourceCount,
    scrapersOk: 3,
    trends: {
      totalEvents: 0,
      activeUsers: 0,
      liveNow: 0,
    },
  };
}

export interface ClubguideFilters {
  status?: 'active' | 'past' | 'all';
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function getClubguideEvents(filters: ClubguideFilters = {}) {
  const {
    status = 'all',
    source = 'all',
    search = '',
    page = 1,
    limit = 10,
  } = filters;

  let filteredEvents = loadEnrichedEvents();

  // Status filter
  if (status !== 'all') {
    const now = new Date();
    if (status === 'active') {
      filteredEvents = filteredEvents.filter(e => parseEventDate(e.date as string) >= now);
    } else if (status === 'past') {
      filteredEvents = filteredEvents.filter(e => parseEventDate(e.date as string) < now);
    }
  }

  // Source filter
  if (source !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.source === source);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredEvents = filteredEvents.filter(e =>
      e.name.toLowerCase().includes(searchLower) ||
      e.venue?.toLowerCase().includes(searchLower) ||
      e.city?.toLowerCase().includes(searchLower) ||
      e.artists?.some(a => a.toLowerCase().includes(searchLower))
    );
  }

  // Sort by date (upcoming first for active, most recent first for past)
  filteredEvents = filteredEvents.sort((a, b) => {
    return parseEventDate(b.date as string).getTime() - parseEventDate(a.date as string).getTime();
  });

  const total = filteredEvents.length;
  const start = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(start, start + limit);

  // Convert to clubguide format
  const events = paginatedEvents.map((event, index) => {
    const date = parseEventDate(event.date as string);
    const isActive = date >= new Date();

    return {
      id: `event-${start + index + 1}`,
      title: event.name,
      description: event.description || null,
      venue_id: event.venue ? `venue-${event.venue}` : null,
      venue_name: event.venue || null,
      venue_city: event.city || null,
      start_date: date.toISOString(),
      end_date: null,
      image_url: event.imageUrl || null,
      genres: event.genres || [],
      going_count: event.artists?.length ? event.artists.length * 50 : 0,
      interested_count: event.artists?.length ? event.artists.length * 30 : 0,
      source: event.source as 'ra' | 'partyflock' | 'djguide' | 'manual',
      status: isActive ? 'active' as const : 'past' as const,
      created_at: new Date().toISOString(),
      artists: event.artists || [],
      source_url: event.sourceUrl,
      enriched_from: event.enrichedFrom,
      match_score: event.enrichedMatchScore,
    };
  });

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: start + limit < total,
  };
}
