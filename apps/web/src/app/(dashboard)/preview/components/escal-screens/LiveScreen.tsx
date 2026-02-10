'use client';

import { useState } from 'react';
import { MapPin, MessageCircle, Shield, Radio, AlertTriangle, Footprints, Phone, Navigation, Coffee, Droplets, Volume2, CheckCircle, Send } from 'lucide-react';
import { useLiveLocations, useRadiusMessages, useBuddyPairs } from '@/lib/hooks/use-escal-data';

export default function LiveScreen() {
  const { locations, loading: locsLoading } = useLiveLocations();
  const { messages, loading: msgsLoading } = useRadiusMessages();
  const { pairs, loading: pairsLoading } = useBuddyPairs();
  const [checkedIn, setCheckedIn] = useState(false);
  const [stagePosition, setStagePosition] = useState('Main Stage');
  const [statusText, setStatusText] = useState('');

  const activePairs = pairs.filter((p) => p.status === 'active');
  const alertPairs = pairs.filter((p) => p.status === 'alert');

  return (
    <div className="flex flex-col gap-5 p-5">
      <h1 className="text-lg font-bold text-white">Live</h1>

      {/* Live stats bar */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-green-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-400">{locsLoading ? '...' : locations.length}</p>
            <p className="text-[10px] text-slate-400">Live</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-2">
          <MessageCircle className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-sm font-bold text-blue-400">{msgsLoading ? '...' : messages.length}</p>
            <p className="text-[10px] text-slate-400">Chat</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-2">
          <Shield className="h-4 w-4 text-orange-400" />
          <div>
            <p className="text-sm font-bold text-orange-400">{pairsLoading ? '...' : activePairs.length}</p>
            <p className="text-[10px] text-slate-400">Buddy</p>
          </div>
        </div>
      </div>

      {/* Check-in + Status */}
      <div className="flex gap-2">
        <button
          onClick={() => setCheckedIn(!checkedIn)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-[20px] py-2.5 text-xs font-semibold ${
            checkedIn ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {checkedIn ? 'Ingecheckt!' : 'Check-in'}
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] py-2.5 text-xs font-medium text-slate-300">
          <Navigation className="h-3.5 w-3.5" />
          Locatie Delen
        </button>
      </div>

      {/* Stage Position */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <p className="mb-2 text-[11px] font-medium text-slate-400">Waar sta je?</p>
        <div className="flex flex-wrap gap-1.5">
          {['Main Stage', 'Stage 2', 'Bar', 'Toilet', 'Ingang', 'Chill Zone'].map((pos) => (
            <button
              key={pos}
              onClick={() => setStagePosition(pos)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                stagePosition === pos
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Status Update */}
      <div className="flex items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
        <input
          type="text"
          placeholder="Status: 'Epic set!', 'Bij de bar'..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          value={statusText}
          onChange={(e) => setStatusText(e.target.value)}
        />
        <Send className="h-4 w-4 text-orange-400" />
      </div>

      {/* Stappenteller */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-white">Stappen vanavond</span>
          </div>
          <span className="text-sm font-bold text-green-400">6.832</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">Leaderboard: #3 van je vrienden</div>
      </div>

      {/* Fake map area */}
      <div className="relative h-32 overflow-hidden rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-800/50" />
        {!locsLoading && locations.slice(0, 8).map((loc, i) => (
          <div
            key={loc.id}
            className="absolute"
            style={{
              left: `${15 + (i * 10) % 70}%`,
              top: `${15 + ((i * 17) % 60)}%`,
            }}
          >
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 backdrop-blur-sm">
          <p className="text-[10px] text-slate-300">Amsterdam &bull; Live Map</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Coffee, label: 'Bar', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: MapPin, label: 'EHBO', color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: Volume2, label: 'dB Meter', color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((item) => (
          <button key={item.label} className={`flex flex-col items-center gap-1 rounded-[20px] ${item.bg} backdrop-blur-xl border border-white/[0.08] py-2.5`}>
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className="text-[9px] font-medium text-slate-300">{item.label}</span>
          </button>
        ))}
      </div>

      {/* SOS Button */}
      <button className="flex items-center justify-center gap-2 rounded-[20px] border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 active:bg-red-500/20">
        <Phone className="h-4 w-4" />
        SOS Noodknop
      </button>

      {/* Radius Chat */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <MessageCircle className="h-4 w-4 text-blue-400" />
          500m Radius Chat
        </h2>
        <div className="flex flex-col gap-1.5">
          {msgsLoading ? (
            <div className="h-16 animate-pulse rounded-[16px] bg-white/[0.06]" />
          ) : (
            messages.slice(0, 4).map((msg) => (
              <div key={msg.id} className="rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-300">{msg.username}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-300">{msg.message}</p>
              </div>
            ))
          )}
        </div>
        {/* Chat input */}
        <div className="mt-2 flex items-center gap-2 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
          <input
            type="text"
            placeholder="Bericht versturen..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          />
          <Send className="h-4 w-4 text-orange-400" />
        </div>
      </div>

      {/* Buddy Pairs */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Shield className="h-4 w-4 text-orange-400" />
          Buddy System
          {alertPairs.length > 0 && (
            <span className="flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {alertPairs.length} alert
            </span>
          )}
        </h2>
        <div className="flex flex-col gap-1.5">
          {pairsLoading ? (
            <div className="h-12 animate-pulse rounded-[16px] bg-white/[0.06]" />
          ) : (
            pairs.slice(0, 4).map((pair) => (
              <div key={pair.id} className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
                <div className={`h-2 w-2 rounded-full ${
                  pair.status === 'active' ? 'bg-green-400' :
                  pair.status === 'alert' ? 'bg-red-400 animate-pulse' : 'bg-slate-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {pair.user_name} &amp; {pair.buddy_name}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">{pair.event_title} &bull; Check elke {pair.check_interval_minutes}min</p>
                </div>
                <span className={`text-[10px] font-medium ${
                  pair.status === 'active' ? 'text-green-400' :
                  pair.status === 'alert' ? 'text-red-400' : 'text-slate-500'
                }`}>
                  {pair.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Veilig Thuiskomen */}
      <button className="flex items-center justify-center gap-2 rounded-[20px] bg-green-500/10 py-3 text-sm font-semibold text-green-400 active:bg-green-500/20">
        <CheckCircle className="h-4 w-4" />
        Ik ben veilig thuis
      </button>
    </div>
  );
}
