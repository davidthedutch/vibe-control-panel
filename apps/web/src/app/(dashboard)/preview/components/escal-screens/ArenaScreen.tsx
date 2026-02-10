'use client';

import { useState } from 'react';
import { MapPin, Radio, Navigation, Footprints, CheckCircle, Send, Droplets, Timer } from 'lucide-react';
import { useLiveLocations } from '@/lib/hooks/use-escal-data';

export default function ArenaScreen() {
  const { locations, loading: locsLoading } = useLiveLocations();
  const [checkedIn, setCheckedIn] = useState(false);
  const [stagePosition, setStagePosition] = useState('Main Stage');
  const [statusText, setStatusText] = useState('');
  const [waterTimer, setWaterTimer] = useState(false);

  return (
    <div className="flex flex-col gap-5 p-5">
      <h1 className="text-lg font-bold text-white">Arena</h1>

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
          <MapPin className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-sm font-bold text-blue-400">24</p>
            <p className="text-[10px] text-slate-400">Chat</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-2">
          <Footprints className="h-4 w-4 text-orange-400" />
          <div>
            <p className="text-sm font-bold text-orange-400">3</p>
            <p className="text-[10px] text-slate-400">Buddy</p>
          </div>
        </div>
      </div>

      {/* Check-in + Locatie Delen */}
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

      {/* Water Alert */}
      <div className="rounded-[20px] bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 shadow-lg shadow-black/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">Water Alert</span>
          </div>
          <button
            onClick={() => setWaterTimer(!waterTimer)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
              waterTimer ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-400'
            }`}
          >
            <Timer className="h-3 w-3" />
            {waterTimer ? 'Actief — 23 min' : 'Start timer'}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400">
          {waterTimer
            ? 'Je krijgt elke 30 min een herinnering om water te drinken'
            : 'Stel een interval in om herinnerd te worden'}
        </p>
        {!waterTimer && (
          <div className="mt-2 flex gap-1.5">
            {['15 min', '30 min', '45 min', '60 min'].map((interval) => (
              <button
                key={interval}
                onClick={() => setWaterTimer(true)}
                className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-medium text-blue-300"
              >
                {interval}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mini map */}
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
    </div>
  );
}
