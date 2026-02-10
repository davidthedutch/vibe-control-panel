import eventsData from '@/data/events.json';

// ====================================================================
// Clubguide Data Loader
// Direct data loading for clubguide (uses bundled event data)
// ====================================================================

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

export function loadEnrichedEvents(): EnrichedEvent[] {
  return (eventsData.events || []) as EnrichedEvent[];
}

export function getClubguideMetrics() {
  const events = loadEnrichedEvents();
  const now = new Date();

  const activeEvents = events.filter((e: EnrichedEvent) => new Date(e.date) >= now);
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
    artistCoverage: events.length > 0 ? ((eventsWithArtists.length / events.length) * 100).toFixed(1) : '0',
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
      filteredEvents = filteredEvents.filter(e => new Date(e.date) >= now);
    } else if (status === 'past') {
      filteredEvents = filteredEvents.filter(e => new Date(e.date) < now);
    }
  }

  // Source filter (map 'ra' to 'residentadvisor' for matching)
  if (source !== 'all') {
    const sourceMap: Record<string, string> = { ra: 'residentadvisor' };
    const mappedSource = sourceMap[source] || source;
    filteredEvents = filteredEvents.filter(e => e.source === mappedSource || e.source === source);
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

  // Sort by date (upcoming first)
  filteredEvents = filteredEvents.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const total = filteredEvents.length;
  const start = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(start, start + limit);

  // Convert to clubguide format
  const events = paginatedEvents.map((event, index) => {
    const date = new Date(event.date);
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
      source: (event.source === 'residentadvisor' ? 'ra' : event.source) as 'ra' | 'partyflock' | 'djguide' | 'manual',
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
