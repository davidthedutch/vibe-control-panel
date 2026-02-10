'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Phone, Volume2, Coffee, Droplets, MapPin, Timer, Activity, AlertTriangle, Cigarette, Check, X } from 'lucide-react';
import { useBuddyPairs } from '@/lib/hooks/use-escal-data';
import { usePersistedState } from './use-persisted-state';

export default function ArsenalScreen() {
  const { pairs, loading: pairsLoading } = useBuddyPairs();
  const [bpmTaps, setBpmTaps] = useState<number[]>([]);
  const [bpmValue, setBpmValue] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerActive = timerSeconds > 0;
  const timerStartMinRef = useRef(0);
  const [timerHistory, setTimerHistory] = usePersistedState<{ minutes: number; time: string; date: string }[]>('escal-arsenal-timer-history', []);
  const [sosPressed, setSosPressed] = useState(false);
  const [safeHome, setSafeHome] = usePersistedState('escal-arsenal-safehome', false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [dbLevel, setDbLevel] = usePersistedState('escal-arsenal-db', 92);
  const [dbMeasuring, setDbMeasuring] = useState(false);

  const startTimer = useCallback((minutes: number) => {
    timerStartMinRef.current = minutes;
    setTimerSeconds(minutes * 60);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timerSeconds <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Timer completed — add to history if it was started (not just init)
      if (timerStartMinRef.current > 0) {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const date = now.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
        setTimerHistory((prev) => [
          { minutes: timerStartMinRef.current, time, date },
          ...prev.slice(0, 9),
        ]);
        timerStartMinRef.current = 0;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const timerProgress = timerSeconds > 0 ? ((timerSeconds % 60) / 60) * 100 : 0;

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

  const handleBpmReset = () => {
    setBpmTaps([]);
    setBpmValue(null);
  };

  const handleMeasureDb = () => {
    setDbMeasuring(true);
    // Simulate measuring with random fluctuation
    const interval = setInterval(() => {
      setDbLevel(Math.floor(75 + Math.random() * 30));
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setDbMeasuring(false);
      setDbLevel(Math.floor(80 + Math.random() * 25));
    }, 2000);
  };

  const handleQuickAction = (label: string) => {
    setActiveQuickAction(label);
    setTimeout(() => setActiveQuickAction(null), 2000);
  };

  const dbPercent = Math.min(100, Math.max(0, ((dbLevel - 50) / 70) * 100));
  const dbColor = dbLevel >= 100 ? 'text-red-400' : dbLevel >= 85 ? 'text-orange-400' : 'text-green-400';

  return (
    <div className="flex flex-col gap-5 p-5">
      <h1 className="text-lg font-bold text-white">Arsenal</h1>

      {/* BPM Meter */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-4 text-center">
        <button
          onClick={handleBpmTap}
          className="w-full active:scale-95 transition-transform"
        >
          <Activity className={`mx-auto mb-2 h-6 w-6 ${bpmValue ? 'text-orange-400' : 'text-slate-400'}`} />
          <p className="text-2xl font-bold text-white">{bpmValue ?? '—'}</p>
          <p className="text-[10px] text-slate-400">BPM — Tik om te meten</p>
          {bpmTaps.length > 0 && bpmTaps.length < 3 && (
            <p className="mt-1 text-[10px] text-orange-400">Blijf tikken... ({bpmTaps.length}/3)</p>
          )}
        </button>
        {bpmValue && (
          <button
            onClick={handleBpmReset}
            className="mt-2 text-[10px] text-slate-500 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Timer */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className={`h-4 w-4 ${timerActive ? 'text-blue-400 animate-pulse' : 'text-blue-400'}`} />
            <span className="text-xs font-semibold text-white">Timer</span>
          </div>
          {timerActive && (
            <span className="text-lg font-bold tabular-nums text-blue-400">{formatTimer(timerSeconds)}</span>
          )}
        </div>
        {timerActive && (
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-1000"
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        )}
        {!timerActive ? (
          <div className="flex gap-1.5">
            {[5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => startTimer(m)}
                className="flex-1 rounded-full py-1.5 text-[10px] font-medium bg-white/[0.06] text-slate-400 active:bg-blue-500 active:text-white transition-colors"
              >
                {m} min
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={stopTimer}
            className="w-full rounded-full bg-red-500/20 py-1.5 text-[10px] font-medium text-red-400 active:bg-red-500/30"
          >
            Stop timer
          </button>
        )}
        {/* Timer historie */}
        {timerHistory.length > 0 && (
          <div className="mt-2 border-t border-white/[0.06] pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Historie</span>
              <button
                onClick={() => setTimerHistory([])}
                className="text-[9px] text-slate-600 active:text-red-400"
              >
                Wis
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {timerHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{entry.minutes} min</span>
                  <span className="text-[10px] text-slate-600">{entry.time} &bull; {entry.date}</span>
                </div>
              ))}
            </div>
          </div>
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
      {!sosPressed ? (
        <button
          onClick={() => setSosPressed(true)}
          className="flex items-center justify-center gap-2 rounded-[20px] border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 active:bg-red-500/20"
        >
          <Phone className="h-4 w-4" />
          SOS Noodknop
        </button>
      ) : (
        <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-center text-xs font-bold text-red-400 mb-2">Weet je het zeker?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSosPressed(false)}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/[0.06] py-2 text-xs text-slate-300"
            >
              <X className="h-3 w-3" />
              Annuleer
            </button>
            <button
              onClick={() => setSosPressed(false)}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-red-500 py-2 text-xs font-bold text-white"
            >
              <Phone className="h-3 w-3" />
              Bel 112
            </button>
          </div>
        </div>
      )}

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
      <button
        onClick={handleMeasureDb}
        className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3 text-left active:bg-white/[0.08]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Volume2 className={`h-4 w-4 ${dbColor} ${dbMeasuring ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-semibold text-white">dB Meter</span>
          </div>
          <span className={`text-sm font-bold ${dbColor}`}>{dbLevel} dB</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 transition-all duration-200"
            style={{ width: `${dbPercent}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          {dbMeasuring ? 'Meten...' : 'Tik om opnieuw te meten — oordopjes boven 85 dB'}
        </p>
      </button>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-500/10', activeBg: 'bg-blue-500' },
          { icon: Coffee, label: 'Bar', color: 'text-yellow-400', bg: 'bg-yellow-500/10', activeBg: 'bg-yellow-500' },
          { icon: Shield, label: 'Garderobe', color: 'text-purple-400', bg: 'bg-purple-500/10', activeBg: 'bg-purple-500' },
          { icon: Cigarette, label: 'Roken', color: 'text-slate-400', bg: 'bg-slate-500/10', activeBg: 'bg-slate-500' },
        ].map((item) => {
          const isActive = activeQuickAction === item.label;
          return (
            <button
              key={item.label}
              onClick={() => handleQuickAction(item.label)}
              className={`flex flex-col items-center gap-1 rounded-[20px] backdrop-blur-xl border border-white/[0.08] py-2.5 transition-colors ${
                isActive ? `${item.activeBg} text-white` : item.bg
              }`}
            >
              {isActive ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <item.icon className={`h-4 w-4 ${item.color}`} />
              )}
              <span className={`text-[9px] font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {isActive ? 'Gevonden!' : item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Veilig Thuiskomen */}
      <button
        onClick={() => setSafeHome(!safeHome)}
        className={`flex items-center justify-center gap-2 rounded-[20px] py-3 text-sm font-semibold transition-colors ${
          safeHome
            ? 'bg-green-500 text-white'
            : 'bg-green-500/10 text-green-400 active:bg-green-500/20'
        }`}
      >
        {safeHome ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        {safeHome ? 'Veilig thuis gemeld!' : 'Ik ben veilig thuis'}
      </button>
    </div>
  );
}
