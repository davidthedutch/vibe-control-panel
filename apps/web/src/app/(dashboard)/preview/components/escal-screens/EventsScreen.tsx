'use client';

import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { useEscalEvents, type EscalEvent } from '@/lib/hooks/use-escal-data';

interface EventsScreenProps {
  onSelectEvent: (eventId: string) => void;
}

export default function EventsScreen({ onSelectEvent }: EventsScreenProps) {
  const { events, loading } = useEscalEvents({ limit: 20, status: 'active' });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <h1 className="text-lg font-bold text-white">Events</h1>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-800/80" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-lg font-bold text-white">Events</h1>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Alles', 'Techno', 'House', 'Minimal', 'Trance'].map((genre, i) => (
          <button
            key={genre}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              i === 0
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-2.5">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelectEvent(event.id)}
            className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 text-left transition-colors active:bg-slate-700/80"
          >
            {/* Date badge */}
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-500/20">
              <span className="text-[10px] font-medium uppercase text-purple-300">
                {new Date(event.start_date).toLocaleDateString('nl-NL', { month: 'short' })}
              </span>
              <span className="text-lg font-bold leading-tight text-purple-400">
                {new Date(event.start_date).getDate()}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{event.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center text-[11px] text-slate-400">
                  <MapPin className="mr-0.5 h-3 w-3" />
                  {event.venue_name || 'TBA'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[11px] text-slate-400">{formatTime(event.start_date)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center text-[11px] text-slate-500">
                  <Users className="mr-0.5 h-3 w-3" />
                  {event.going_count} going
                </span>
                {event.genres.length > 0 && (
                  <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {event.genres[0]}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
          </button>
        ))}
      </div>

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">Geen events gevonden</p>
        </div>
      )}
    </div>
  );
}
