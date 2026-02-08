'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface HealthCheck {
  id: string;
  name: string;
  type: string;
  status: 'pass' | 'warn' | 'fail';
  score: number;
  details: string;
  expanded: string;
}

interface CheckResultsProps {
  checks: HealthCheck[];
}

const statusConfig = {
  pass: {
    icon: CheckCircle2,
    border: 'border-green-300 dark:border-green-700',
    bg: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-500',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
    label: 'OK',
  },
  warn: {
    icon: AlertTriangle,
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
    label: 'Waarschuwing',
  },
  fail: {
    icon: XCircle,
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
    label: 'Fout',
  },
};

function CheckCard({ check }: { check: HealthCheck }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[check.status];
  const StatusIcon = config.icon;
  const hasExpanded = check.expanded.length > 0;

  return (
    <div
      className={`rounded-xl border-2 ${config.border} ${config.bg} transition-all duration-150`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {check.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                {check.details}
              </p>
            </div>
          </div>

          {/* Score badge */}
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
          >
            {check.score}
          </span>
        </div>

        {/* Expand button */}
        {hasExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex w-full items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label={isExpanded ? 'Details verbergen' : 'Details tonen'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Details verbergen
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Details tonen
              </>
            )}
          </button>
        )}
      </div>

      {/* Expanded details */}
      {hasExpanded && isExpanded && (
        <div className="border-t border-slate-200 bg-slate-100/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {check.expanded}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function CheckResults({ checks }: CheckResultsProps) {
  // Sort: failures first, then warnings, then passes
  const sortedChecks = [...checks].sort((a, b) => {
    const order = { fail: 0, warn: 1, pass: 2 };
    return order[a.status] - order[b.status];
  });

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {checks.length} checks
        </span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-slate-600 dark:text-slate-400">{passCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">{warnCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-slate-600 dark:text-slate-400">{failCount}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sortedChecks.map((check) => (
          <CheckCard key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}
