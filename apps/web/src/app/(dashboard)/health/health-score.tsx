'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  lastChecked: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#22c55e', text: 'text-green-500', bg: 'text-green-500/20' };
  if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'text-amber-500/20' };
  return { stroke: '#ef4444', text: 'text-red-500', bg: 'text-red-500/20' };
}

export default function HealthScore({ score, lastChecked }: HealthScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setAnimatedScore(current);
      if (step >= steps) {
        setAnimatedScore(score);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const colors = getScoreColor(score);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = mounted ? (animatedScore / 100) * circumference : 0;
  const dashOffset = circumference - progress;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative h-56 w-56">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums ${colors.text}`}>
            {animatedScore}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            / 100
          </span>
        </div>
      </div>

      {/* Last checked */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Activity className="h-4 w-4" />
        <span>Laatst gecontroleerd: {lastChecked}</span>
      </div>
    </div>
  );
}
