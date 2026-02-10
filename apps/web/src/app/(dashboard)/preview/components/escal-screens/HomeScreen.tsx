'use client';

import { useState, useMemo } from 'react';
import { Zap, Bell, Search, Filter, CalendarDays, Ticket, Calendar } from 'lucide-react';
import { useEscalEvents } from '@/lib/hooks/use-escal-data';

interface HomeScreenProps {
  onSelectEvent?: (eventId: string) => void;
}

// Extended event type with extra mock fields
interface HomeEvent {
  id: string;
  title: string;
  venue_name: string | null;
  start_date: string;
  end_date: string | null;
  going_count: number;
  genres: string[];
  capacity: number;
  price: number | null;
  ticketswap_count: number;
  friends_going: number;
}

function enrichEvent(event: { id: string; title: string; venue_name: string | null; start_date: string; end_date: string | null; going_count: number; genres: string[] }): HomeEvent {
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
  return `${days[d.getDay()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateHeader(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
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
  if (now < start || now > end) return null;
  const remaining = end.getTime() - now.getTime();
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}u ${mins}min`;
}

function formatTimeRange(startDate: string, endDate: string | null): string {
  const startStr = formatDayTime(startDate);
  if (!endDate) return startStr;
  return `${startStr} - ${formatDayTime(endDate)}`;
}

const DATE_FILTERS = [
  { id: 'all', label: 'Alles' },
  { id: 'today', label: 'Vandaag' },
  { id: 'weekend', label: 'Dit weekend' },
  { id: 'week', label: 'Deze week' },
  { id: 'month', label: 'Deze maand' },
];

const GENRE_FILTERS = [
  { id: 'all', label: 'Alle genres' },
  { id: 'techno', label: 'Techno' },
  { id: 'house', label: 'House' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'trance', label: 'Trance' },
  { id: 'dnb', label: 'D&B' },
  { id: 'hardcore', label: 'Hardcore' },
];

export default function HomeScreen({ onSelectEvent }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDate, setActiveDate] = useState('all');
  const [activeGenre, setActiveGenre] = useState('all');

  const { events: allEvents, loading } = useEscalEvents({
    limit: 30,
    status: 'active',
    search: searchQuery || undefined,
  });

  // Enrich events and group by date
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

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, group]) => ({ key, ...group }));
  }, [allEvents]);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalatie Guide</h1>
        <div className="flex items-center gap-2">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
            <Zap className="h-4 w-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Zoek events, venues, DJ's..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Filter className="h-4 w-4 text-slate-400" />
      </div>

      {/* Date filter */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
        {DATE_FILTERS.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDate(d.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
              activeDate === d.id
                ? 'bg-orange-500 text-white'
                : 'bg-white/[0.06] text-slate-400'
            }`}
          >
            {d.id !== 'all' && <CalendarDays className="h-3 w-3" />}
            {d.label}
          </button>
        ))}
      </div>

      {/* Genre filter */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
        {GENRE_FILTERS.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              activeGenre === genre.id
                ? 'bg-orange-500 text-white'
                : 'bg-white/[0.06] text-slate-400'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Events grouped by date */}
      {loading ? (
        <div className="flex flex-col gap-5">
          <div className="h-5 w-40 animate-pulse rounded bg-white/[0.06]" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-[20px] bg-white/[0.06]" />
          ))}
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">Geen events gevonden</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groupedEvents.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              {/* Date header */}
              <h2 className="text-xs font-semibold text-orange-400">{group.label}</h2>

              {/* Events for this date */}
              {group.events.map((event) => {
                const remaining = getRemainingDuration(event.start_date, event.end_date);
                return (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent?.(event.id)}
                    className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-2.5 text-left transition-colors active:bg-white/[0.1]"
                  >
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
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
