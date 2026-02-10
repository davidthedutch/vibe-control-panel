import { NextResponse } from 'next/server';
import eventsData from '@/data/events.json';

// ====================================================================
// Clubguide Metrics API
// Provides real metrics from bundled event data
// ====================================================================

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = eventsData.events || [];

    const now = new Date();
    const activeEvents = events.filter((e: any) => new Date(e.date) >= now);
    const eventsWithArtists = events.filter((e: any) => e.artists && e.artists.length > 0);

    // Count by source
    const sourceCount = {
      ra: events.filter((e: any) => e.source === 'residentadvisor').length,
      partyflock: events.filter((e: any) => e.source === 'partyflock').length,
      djguide: events.filter((e: any) => e.source === 'djguide').length,
    };

    const metrics = {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      eventsWithArtists: eventsWithArtists.length,
      artistCoverage: ((eventsWithArtists.length / events.length) * 100).toFixed(1),
      sources: sourceCount,
      scrapersOk: 3,
      trends: {
        totalEvents: 0,
        activeEvents: 0,
        artistCoverage: 0,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load metrics' },
      { status: 500 }
    );
  }
}
