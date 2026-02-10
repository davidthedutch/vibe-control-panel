'use client';

import { useMemo } from 'react';
import { Zap, Bell, Heart, Ticket } from 'lucide-react';
import { useTopEvents, useRecentActivity, useEscalEvents } from '@/lib/hooks/use-escal-data';

// Extended event type with extra mock fields for the home screen
interface HomeEvent {
  id: string;
  title: string;
  venue_name: string | null;
  start_date: string;
  end_date: string | null;
  going_count: number;
  capacity: number;
  price: number | null;
  ticketswap_count: number;
  friends_going: number;
}

// Generate mock extended fields for demo events
function enrichEvent(event: { id: string; title: string; venue_name: string | null; start_date: string; end_date: string | null; going_count: number }): HomeEvent {
  const hash = event.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    ...event,
    capacity: [200, 350, 500, 800, 1200, 2500][hash % 6],
    price: [15, 22.5, 35, 45, 55, null][hash % 6] as number | null,
    ticketswap_count: [0, 3, 7, 12, 24, 42][hash % 6],
    friends_going: [0, 1, 2, 4, 6, 8][hash % 6],
  };
}

function formatDayTime(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['ZO', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA'];
  const day = days[d.getDay()];
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${hours}:${mins}`;
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRemainingDuration(startDate: string, endDate: string | null): string | null {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);

  // If event hasn't started or already ended, don't show remaining
  if (now < start || now > end) return null;

  const remaining = end.getTime() - now.getTime();
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}u ${mins}min`;
}

function formatTimeRange(startDate: string, endDate: string | null): string {
  const startStr = formatDayTime(startDate);
  if (!endDate) return startStr;
  const endStr = formatDayTime(endDate);
  return `${startStr} - ${endStr}`;
}

export default function HomeScreen() {
  const { events: topEvents, loading: eventsLoading } = useTopEvents();
  const { activities, loading: activityLoading } = useRecentActivity();
  const { events: allEvents, loading: eventsListLoading } = useEscalEvents({ limit: 20, status: 'active' });

  // Enrich events with mock fields and group by date
  const groupedEvents = useMemo(() => {
    const enriched = allEvents.map(enrichEvent);
    const groups = new Map<string, { label: string; events: HomeEvent[] }>();

    enriched.forEach((event) => {
      const key = getDateKey(event.start_date);
      if (!groups.has(key)) {
        groups.set(key, { label: formatDateHeader(event.start_date), events: [] });
      }
      groups.get(key)!.events.push(event);
    });

    // Sort by date key
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, group]) => ({ key, ...group }));
  }, [allEvents]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalatie Guide</h1>
        <div className="flex items-center gap-2">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
            <Zap className="h-4 w-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Events grouped by date */}
      <div className="flex flex-col gap-3">
        {eventsListLoading ? (
          <>
            <div className="h-5 w-40 animate-pulse rounded bg-slate-700" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-800/80" />
            <div className="h-16 animate-pulse rounded-xl bg-slate-800/80" />
          </>
        ) : groupedEvents.length === 0 ? (
          <div className="rounded-xl bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-400">Geen aankomende events</p>
          </div>
        ) : (
          groupedEvents.map((group) => (
            <div key={group.key} className="flex flex-col gap-1.5">
              {/* Date header */}
              <h2 className="text-xs font-semibold text-orange-400">{group.label}</h2>

              {/* Events for this date */}
              {group.events.map((event) => {
                const remaining = getRemainingDuration(event.start_date, event.end_date);
                return (
                  <div key={event.id} className="rounded-xl bg-slate-800/80 px-3 py-2.5">
                    {/* Row 1: Name + time range + capacity/going/friends */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
                        {event.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[10px] text-orange-400">
                          {formatTimeRange(event.start_date, event.end_date)}
                        </span>
                        <span className="text-[10px]">
                          <span className="text-slate-400">{event.capacity}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-orange-400">{event.going_count}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-green-400">{event.friends_going}</span>
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Venue + remaining + price + ticketswap */}
                    <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                      <span className="min-w-0 truncate text-slate-400">
                        {event.venue_name || 'TBA'}
                      </span>
                      {remaining && (
                        <span className="shrink-0 text-orange-400">{remaining}</span>
                      )}
                      {event.price !== null && (
                        <span className="shrink-0 text-white">&euro;{event.price}</span>
                      )}
                      {event.ticketswap_count > 0 && (
                        <span className="flex shrink-0 items-center gap-0.5 text-blue-400">
                          <Ticket className="h-2.5 w-2.5" />
                          TS #{event.ticketswap_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Trending Events */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Trending Events</h2>
        <div className="flex flex-col gap-2">
          {eventsLoading ? (
            <div className="rounded-xl bg-slate-800/80 p-3">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
            </div>
          ) : (
            topEvents.slice(0, 3).map((event, i) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-sm font-bold text-orange-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{event.going} going &bull; {event.interested} interested</p>
                </div>
                <Heart className="h-3.5 w-3.5 text-slate-500" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Recente Activiteit</h2>
        <div className="flex flex-col gap-1.5">
          {activityLoading ? (
            <div className="h-12 animate-pulse rounded-lg bg-slate-800/80" />
          ) : (
            activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2">
                <div className={`h-2 w-2 rounded-full ${
                  act.type === 'event_created' ? 'bg-blue-400' :
                  act.type === 'user_registered' ? 'bg-green-400' :
                  act.type === 'checkin' ? 'bg-orange-400' : 'bg-orange-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{act.title}</p>
                  <p className="truncate text-[10px] text-slate-500">{act.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-500">
                  {new Date(act.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
