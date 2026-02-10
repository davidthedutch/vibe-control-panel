import { NextRequest, NextResponse } from 'next/server';
import eventsData from '@/data/events.json';

// ====================================================================
// Real Event Data API
// Serves enriched events from bundled event data
// ====================================================================

export const dynamic = 'force-dynamic';

interface EnrichedEvent {
  source: string;
  sourceUrl?: string;
  name: string;
  date: string | Date;
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

function loadEvents(): EnrichedEvent[] {
  return (eventsData.events || []) as EnrichedEvent[];
}

function convertToEscalFormat(event: EnrichedEvent, index: number) {
  const date = new Date(event.date);
  const isActive = date >= new Date();

  return {
    id: `event-${index + 1}`,
    title: event.name,
    description: event.description || null,
    venue_id: event.venue ? `venue-${event.venue}` : null,
    venue_name: event.venue || null,
    venue_city: event.city || null,
    start_date: date.toISOString(),
    end_date: null,
    image_url: event.imageUrl || null,
    genres: event.genres || [],
    going_count: event.artists?.length ? event.artists.length * 50 : 0, // Estimate based on artists
    interested_count: event.artists?.length ? event.artists.length * 30 : 0,
    source: (event.source === 'residentadvisor' ? 'ra' : event.source) as 'ra' | 'partyflock' | 'djguide' | 'manual',
    status: isActive ? 'active' as const : 'past' as const,
    created_at: new Date().toISOString(),
    artists: event.artists || [],
    source_url: event.sourceUrl,
    enriched_from: event.enrichedFrom,
    match_score: event.enrichedMatchScore,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Load all events
    const allEvents = loadEvents();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const source = searchParams.get('source') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Filter events
    let filteredEvents = allEvents;

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
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Get total before pagination
    const total = filteredEvents.length;

    // Paginate
    const start = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(start, start + limit);

    // Convert to escal format
    const events = paginatedEvents.map((e, i) => convertToEscalFormat(e, start + i));

    return NextResponse.json({
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: start + limit < total,
    });
  } catch (error) {
    console.error('[Escal API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}
