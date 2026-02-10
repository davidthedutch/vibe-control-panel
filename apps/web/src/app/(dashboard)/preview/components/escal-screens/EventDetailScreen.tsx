'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Clock, Share2, Heart, Music, Ticket, MessageSquare, AlertTriangle } from 'lucide-react';
import { useEscalEvent } from '@/lib/hooks/use-escal-data';

interface EventDetailScreenProps {
  eventId: string;
  onBack: () => void;
}

const DEMO_LINEUP = [
  { name: 'DJ Nobu', time: '23:00 - 01:00', stage: 'Main Stage' },
  { name: 'Ben Klock', time: '01:00 - 03:00', stage: 'Main Stage' },
  { name: 'Charlotte de Witte', time: '03:00 - 05:00', stage: 'Main Stage' },
  { name: 'Rebekah', time: '23:30 - 01:30', stage: 'Stage 2' },
  { name: 'I Hate Models', time: '01:30 - 03:30', stage: 'Stage 2' },
];

const DEMO_FRIENDS_GOING = [
  { name: 'DJFan', initials: 'DJ' },
  { name: 'TechnoLover', initials: 'TL' },
  { name: 'RaveQueen', initials: 'RQ' },
  { name: 'BassDrop', initials: 'BD' },
];

const DEMO_REACTIES = [
  { user: 'NightOwl', text: 'Beste event van het jaar!', date: '2 weken geleden' },
  { user: 'ClubKid', text: 'Geweldige line-up, geluid was top.', date: '1 maand geleden' },
  { user: 'DJFan123', text: 'Charlotte de Witte was insane 🔥', date: '3 dagen geleden' },
];

export default function EventDetailScreen({ eventId, onBack }: EventDetailScreenProps) {
  const { event, loading } = useEscalEvent(eventId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isGoing, setIsGoing] = useState(false);

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
      <div className="flex flex-col p-5">
        <button onClick={onBack} className="mb-4 flex items-center text-sm text-orange-400">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug
        </button>
        <div className="h-40 animate-pulse rounded-[20px] bg-white/[0.06]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <button onClick={onBack} className="mb-4 self-start flex items-center text-sm text-orange-400">
          <ArrowLeft className="mr-1 h-4 w-4" /> Terug
        </button>
        <p className="text-sm text-slate-400">Event niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header image area */}
      <div className="relative h-44 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600">
        <button
          onClick={onBack}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-400' : 'text-white'}`} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Share2 className="h-4 w-4 text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1D23] to-transparent p-4 pt-12">
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 p-5">
        {/* Quick info */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="h-4 w-4 text-orange-400" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Clock className="h-4 w-4 text-orange-400" />
            <span>{formatTime(event.start_date)}{event.end_date ? ` - ${formatTime(event.end_date)}` : ''}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span>{event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Ticket className="h-4 w-4 text-orange-400" />
            <span className="text-green-400">Tickets beschikbaar</span>
            <span className="text-[11px] text-slate-500">vanaf €25</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsGoing(!isGoing)}
            className={`flex-1 rounded-[20px] py-2.5 text-sm font-semibold ${
              isGoing
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
            }`}
          >
            {isGoing ? '✓ Ik ga!' : `Ik ga! (${event.going_count})`}
          </button>
          <button className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-300">
            Interesse
          </button>
        </div>

        {/* Attendance */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3 text-center">
            <p className="text-lg font-bold text-green-400">{event.going_count + (isGoing ? 1 : 0)}</p>
            <p className="text-[11px] text-slate-400">Going</p>
          </div>
          <div className="flex-1 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{event.interested_count}</p>
            <p className="text-[11px] text-slate-400">Interested</p>
          </div>
        </div>

        {/* Friends Going */}
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Vrienden die gaan</h3>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {DEMO_FRIENDS_GOING.map((f, i) => (
                <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A1D23] bg-orange-500/60 text-[9px] font-bold text-white">
                  {f.initials}
                </div>
              ))}
            </div>
            <span className="text-xs text-orange-300">{DEMO_FRIENDS_GOING.length} vrienden gaan</span>
          </div>
        </div>

        {/* Line-up / Timetable */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
              <Music className="h-3.5 w-3.5" /> Line-up
            </h3>
            <span className="text-[10px] text-orange-400">Volledig schema</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {DEMO_LINEUP.map((dj, i) => (
              <div key={i} className="flex items-center justify-between rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-[9px] font-bold text-orange-300">
                    {dj.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{dj.name}</p>
                    <p className="text-[10px] text-slate-500">{dj.stage}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{dj.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genres */}
        {event.genres.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {event.genres.map((genre) => (
                <span key={genre} className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300">
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

        {/* Reacties */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-500">
              <MessageSquare className="h-3.5 w-3.5" /> Reacties
            </h3>
            <span className="text-[10px] text-slate-400">{DEMO_REACTIES.length} reacties</span>
          </div>
          <div className="flex flex-col gap-2">
            {DEMO_REACTIES.map((reactie, i) => (
              <div key={i} className="rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-300">{reactie.user}</span>
                  <span className="text-[10px] text-slate-500">{reactie.date}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">{reactie.text}</p>
              </div>
            ))}
          </div>
          <button className="mt-2 w-full rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] py-2 text-xs text-orange-400">
            Schrijf een reactie
          </button>
        </div>

        {/* Age indicator */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1 text-[11px] text-orange-400">
            <AlertTriangle className="h-3 w-3" />
            18+
          </div>
        </div>
      </div>
    </div>
  );
}
