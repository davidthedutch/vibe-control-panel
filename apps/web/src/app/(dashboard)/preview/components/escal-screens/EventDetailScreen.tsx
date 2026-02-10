'use client';

import { ArrowLeft, MapPin, Calendar, Users, Clock, Star, Share2 } from 'lucide-react';
import { useEscalEvent } from '@/lib/hooks/use-escal-data';

interface EventDetailScreenProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetailScreen({ eventId, onBack }: EventDetailScreenProps) {
  const { event, loading } = useEscalEvent(eventId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col p-4">
        <button onClick={onBack} className="mb-4 flex items-center text-sm text-purple-400">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug
        </button>
        <div className="h-40 animate-pulse rounded-xl bg-slate-800/80" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <button onClick={onBack} className="mb-4 self-start flex items-center text-sm text-purple-400">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug
        </button>
        <p className="text-sm text-slate-400">Event niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header image area */}
      <div className="relative h-44 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600">
        <button
          onClick={onBack}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <Share2 className="h-4 w-4 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 pt-12">
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* Quick info */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>{formatTime(event.start_date)}{event.end_date ? ` - ${formatTime(event.end_date)}` : ''}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MapPin className="h-4 w-4 text-purple-400" />
            <span>{event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}</span>
          </div>
        </div>

        {/* Attendance */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-slate-800/80 p-3 text-center">
            <p className="text-lg font-bold text-green-400">{event.going_count}</p>
            <p className="text-[11px] text-slate-400">Going</p>
          </div>
          <div className="flex-1 rounded-xl bg-slate-800/80 p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{event.interested_count}</p>
            <p className="text-[11px] text-slate-400">Interested</p>
          </div>
        </div>

        {/* Genres */}
        {event.genres.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {event.genres.map((genre) => (
                <span key={genre} className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Over dit event</h3>
            <p className="text-sm leading-relaxed text-slate-300">{event.description}</p>
          </div>
        )}

        {/* Source badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Bron:</span>
          <span className="rounded bg-slate-700 px-2 py-0.5 text-[11px] font-medium uppercase text-slate-300">
            {event.source}
          </span>
        </div>

        {/* Action button */}
        <button className="mt-2 w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white active:bg-purple-600">
          Ik ga! ({event.going_count + 1})
        </button>
      </div>
    </div>
  );
}
