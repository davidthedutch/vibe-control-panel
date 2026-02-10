'use client';

import { useState } from 'react';
import { Shield, Phone, Volume2, Coffee, Droplets, MapPin, Timer, Activity, AlertTriangle, Cigarette, ChevronRight } from 'lucide-react';
import { useBuddyPairs } from '@/lib/hooks/use-escal-data';

export default function ArsenalScreen() {
  const { pairs, loading: pairsLoading } = useBuddyPairs();
  const [bpmTaps, setBpmTaps] = useState<number[]>([]);
  const [bpmValue, setBpmValue] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);

  const activePairs = pairs.filter((p) => p.status === 'active');
  const alertPairs = pairs.filter((p) => p.status === 'alert');

  const handleBpmTap = () => {
    const now = Date.now();
    const newTaps = [...bpmTaps, now].filter((t) => now - t < 5000);
    setBpmTaps(newTaps);
    if (newTaps.length >= 3) {
      const intervals = newTaps.slice(1).map((t, i) => t - newTaps[i]);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpmValue(Math.round(60000 / avgInterval));
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      <h1 className="text-lg font-bold text-white">Arsenal</h1>

      {/* BPM Meter */}
      <button
        onClick={handleBpmTap}
        className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-4 text-center active:bg-white/[0.1] transition-colors"
      >
        <Activity className="mx-auto mb-2 h-6 w-6 text-orange-400" />
        <p className="text-2xl font-bold text-white">{bpmValue ?? '—'}</p>
        <p className="text-[10px] text-slate-400">BPM — Tik om te meten</p>
        {bpmTaps.length > 0 && bpmTaps.length < 3 && (
          <p className="mt-1 text-[10px] text-orange-400">Blijf tikken... ({bpmTaps.length}/3)</p>
        )}
      </button>

      {/* Timer */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Timer</span>
          </div>
          {timerActive && (
            <span className="text-xs font-bold text-blue-400">{timerMinutes}:00</span>
          )}
        </div>
        {!timerActive ? (
          <div className="flex gap-1.5">
            {[5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => { setTimerMinutes(m); setTimerActive(true); }}
                className={`flex-1 rounded-full py-1.5 text-[10px] font-medium ${
                  timerMinutes === m ? 'bg-blue-500 text-white' : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setTimerActive(false)}
            className="w-full rounded-full bg-red-500/20 py-1.5 text-[10px] font-medium text-red-400"
          >
            Stop timer
          </button>
        )}
      </div>

      {/* EHBO */}
      <div className="rounded-[20px] bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-lg shadow-black/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-red-400" />
          <span className="text-xs font-semibold text-red-300">EHBO Post</span>
        </div>
        <p className="text-[11px] text-slate-300">Locatie: Bij de hoofdingang, links</p>
        <p className="text-[11px] text-slate-300">Tel: 020-123 4567</p>
        <p className="mt-1 text-[10px] text-slate-500">Altijd bemand tijdens events</p>
      </div>

      {/* SOS Noodknop */}
      <button className="flex items-center justify-center gap-2 rounded-[20px] border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 active:bg-red-500/20">
        <Phone className="h-4 w-4" />
        SOS Noodknop
      </button>

      {/* Buddy System */}
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

      {/* dB Meter */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-white">dB Meter</span>
          </div>
          <span className="text-sm font-bold text-orange-400">92 dB</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500" />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">Bescherm je gehoor — gebruik oordopjes boven 85 dB</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Coffee, label: 'Bar', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Shield, label: 'Garderobe', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Cigarette, label: 'Roken', color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ].map((item) => (
          <button key={item.label} className={`flex flex-col items-center gap-1 rounded-[20px] ${item.bg} backdrop-blur-xl border border-white/[0.08] py-2.5`}>
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className="text-[9px] font-medium text-slate-300">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Veilig Thuiskomen */}
      <button className="flex items-center justify-center gap-2 rounded-[20px] bg-green-500/10 py-3 text-sm font-semibold text-green-400 active:bg-green-500/20">
        <Shield className="h-4 w-4" />
        Ik ben veilig thuis
      </button>
    </div>
  );
}
