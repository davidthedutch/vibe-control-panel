'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  Bot,
  TrendingUp,
  Activity,
  Radio,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Music,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import {
  useScraperStatus,
  useScraperLogs,
  type ScraperStatus,
  type ScraperLog,
} from '@/lib/hooks/use-escal-data';

// ---------------------------------------------------------------------------
// Sub Navigation
// ---------------------------------------------------------------------------

const subNavItems = [
  { label: 'Dashboard', href: '/escal', icon: Activity },
  { label: 'Events', href: '/escal/events', icon: Calendar },
  { label: 'Users', href: '/escal/users', icon: Users },
  { label: 'Live', href: '/escal/live', icon: Radio },
  { label: 'Scrapers', href: '/escal/scrapers', icon: Bot },
  { label: 'Verificatie', href: '/escal/scrapers/verificatie', icon: ShieldCheck },
  { label: 'Analytics', href: '/escal/analytics', icon: TrendingUp },
];

function SubNav({ current }: { current: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {subNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = current === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-orange-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 0) {
    // Future time (next run)
    const absSeconds = Math.abs(seconds);
    if (absSeconds < 60) return 'in <1m';
    const minutes = Math.floor(absSeconds / 60);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `in ${hours}h ${minutes % 60}m`;
  }
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

// ---------------------------------------------------------------------------
// Scraper Status Card
// ---------------------------------------------------------------------------

function ScraperCard({
  scraper,
  onTrigger,
}: {
  scraper: ScraperStatus;
  onTrigger: () => void;
}) {
  const statusColors = {
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    idle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };

  const statusIcons = {
    running: <RefreshCw className="h-4 w-4 animate-spin" />,
    success: <CheckCircle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    idle: <Clock className="h-4 w-4" />,
  };

  const sourceColors: Record<string, string> = {
    ra: 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    partyflock: 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    djguide: 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  };

  return (
    <div className={`rounded-xl border p-6 ${sourceColors[scraper.source] || 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
            <Bot className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{scraper.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{scraper.source.toUpperCase()}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusColors[scraper.status]}`}>
          {statusIcons[scraper.status]}
          {scraper.status.charAt(0).toUpperCase() + scraper.status.slice(1)}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last Run</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatTimeAgo(scraper.last_run)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Next Run</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatTimeAgo(scraper.next_run)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Events Scraped</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {scraper.events_scraped}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Success Rate</p>
          <p className={`mt-1 text-lg font-semibold ${
            scraper.success_rate >= 95
              ? 'text-emerald-600 dark:text-emerald-400'
              : scraper.success_rate >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
          }`}>
            {scraper.success_rate.toFixed(1)}%
          </p>
        </div>
      </div>

      {scraper.last_error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Last Error:</span>
          </div>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{scraper.last_error}</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={onTrigger}
          disabled={scraper.status === 'running'}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scraper.status === 'running' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Now
            </>
          )}
        </button>
        <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          View Logs
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Log Row
// ---------------------------------------------------------------------------

function LogRow({ log, expanded, onToggle }: { log: ScraperLog; expanded: boolean; onToggle: () => void }) {
  const statusColors = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  };

  const sourceLabels: Record<string, string> = {
    ra: 'Resident Advisor',
    partyflock: 'Partyflock',
    djguide: 'DJ Guide',
  };

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div
        className="flex items-center gap-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 -mx-4"
        onClick={onToggle}
      >
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[log.status]}`}>
          {log.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
          {log.status}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-32">
          {sourceLabels[log.source] || log.source}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400 flex-1">
          {log.events_found} found, {log.events_created} created, {log.events_updated} updated
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDuration(log.duration_ms)}
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500 w-24">
          {formatTimeAgo(log.timestamp)}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </div>
      {expanded && (
        <div className="pb-4 px-4 -mx-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="grid grid-cols-4 gap-4 py-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Events Found</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.events_found}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Events Created</p>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{log.events_created}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Events Updated</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{log.events_updated}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDuration(log.duration_ms)}</p>
            </div>
          </div>
          {log.errors.length > 0 && (
            <div className="mt-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">Errors:</p>
              <ul className="mt-1 list-disc list-inside text-sm text-red-600 dark:text-red-400">
                {log.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Full timestamp: {new Date(log.timestamp).toLocaleString('nl-NL')}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ScrapersPage() {
  const { scrapers, loading: scrapersLoading, triggerScraper } = useScraperStatus();
  const { logs, loading: logsLoading } = useScraperLogs();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredLogs = sourceFilter === 'all'
    ? logs
    : logs.filter((log) => log.source === sourceFilter);

  const successCount = scrapers.filter((s) => s.status === 'success' || s.status === 'idle').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Scrapers Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage event scrapers from RA, Partyflock, and DJ Guide
          </p>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
          <span className={`h-3 w-3 rounded-full ${successCount === scrapers.length ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {successCount}/{scrapers.length} Scrapers OK
          </span>
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal/scrapers" />

      {/* Scraper Cards */}
      {scrapersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {scrapers.map((scraper) => (
            <ScraperCard
              key={scraper.id}
              scraper={scraper}
              onTrigger={() => triggerScraper(scraper.source)}
            />
          ))}
        </div>
      )}

      {/* Scraper Logs */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Recent Scrape Jobs
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">All Sources</option>
              <option value="ra">Resident Advisor</option>
              <option value="partyflock">Partyflock</option>
              <option value="djguide">DJ Guide</option>
            </select>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No logs found</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.slice(0, 20).map((log) => (
              <LogRow
                key={log.id}
                log={log}
                expanded={expandedLog === log.id}
                onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
