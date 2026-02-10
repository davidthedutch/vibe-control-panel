'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, ChevronRight, Heart, Search, Filter, CalendarDays } from 'lucide-react';
import { useEscalEvents } from '@/lib/hooks/use-escal-data';

interface EventsScreenProps {
  onSelectEvent: (eventId: string) => void;
}

const FRIEND_AVATARS = ['DJ', 'TL', 'RQ', 'BD', 'NO'];

export default function EventsScreen({ onSelectEvent }: EventsScreenProps) {
  const [activeGenre, setActiveGenre] = useState('all');
  const [activeDate, setActiveDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['event-1', 'event-3']));

  const { events, loading } = useEscalEvents({
    limit: 20,
    status: 'active',
    search: searchQuery || undefined,
  });

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  // Simulate friend count going to events
  const getFriendsGoing = (eventId: string) => {
    const hash = eventId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return hash % 5;
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

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">
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
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'all', label: 'Alles' },
          { id: 'today', label: 'Vandaag' },
          { id: 'weekend', label: 'Dit weekend' },
          { id: 'week', label: 'Deze week' },
          { id: 'month', label: 'Deze maand' },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDate(d.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
              activeDate === d.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {d.id !== 'all' && <CalendarDays className="h-3 w-3" />}
            {d.label}
          </button>
        ))}
      </div>

      {/* Genre filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Alle genres' },
          { id: 'techno', label: 'Techno' },
          { id: 'house', label: 'House' },
          { id: 'minimal', label: 'Minimal' },
          { id: 'trance', label: 'Trance' },
          { id: 'dnb', label: 'D&B' },
          { id: 'hardcore', label: 'Hardcore' },
        ].map((genre) => (
          <button
            key={genre.id}
            onClick={() => setActiveGenre(genre.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              activeGenre === genre.id
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-2.5">
        {events.map((event) => {
          const friendsGoing = getFriendsGoing(event.id);
          return (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className="flex items-start gap-3 rounded-xl bg-slate-800/80 p-3 text-left transition-colors active:bg-slate-700/80"
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
                {/* Friends going */}
                {friendsGoing > 0 && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="flex -space-x-1.5">
                      {FRIEND_AVATARS.slice(0, friendsGoing).map((name, i) => (
                        <div key={i} className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-800 bg-purple-500/50 text-[7px] font-bold text-white">
                          {name}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-purple-300">{friendsGoing} vriend{friendsGoing > 1 ? 'en' : ''} gaan</span>
                  </div>
                )}
              </div>

              {/* Favorite + chevron */}
              <div className="flex flex-col items-center gap-2 pt-0.5">
                <button onClick={(e) => toggleFavorite(event.id, e)}>
                  <Heart
                    className={`h-4 w-4 ${favorites.has(event.id) ? 'text-red-400' : 'text-slate-600'}`}
                    fill={favorites.has(event.id) ? 'currentColor' : 'none'}
                  />
                </button>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </button>
          );
        })}
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
