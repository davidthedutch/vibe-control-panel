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
  ChevronRight,
  Loader2,
  Music,
  UserCheck,
  Radio,
} from 'lucide-react';
import {
  useEscalMetrics,
  useRecentActivity,
  useTopEvents,
  useLiveLocations,
} from '@/lib/hooks/use-escal-data';

// ---------------------------------------------------------------------------
// Accent Styles
// ---------------------------------------------------------------------------

const accentStyles = {
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/40',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  orange: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-100 dark:border-orange-900/40',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/40',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
} as const;

type AccentColor = keyof typeof accentStyles;

// ---------------------------------------------------------------------------
// Sub Navigation
// ---------------------------------------------------------------------------

const subNavItems = [
  { label: 'Dashboard', href: '/escal', icon: Activity },
  { label: 'Events', href: '/escal/events', icon: Calendar },
  { label: 'Users', href: '/escal/users', icon: Users },
  { label: 'Live', href: '/escal/live', icon: Radio },
  { label: 'Scrapers', href: '/escal/scrapers', icon: Bot },
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
                ? 'bg-indigo-600 text-white'
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
// Activity Feed Item
// ---------------------------------------------------------------------------

function ActivityFeedItem({
  item,
}: {
  item: {
    id: string;
    type: 'event_created' | 'user_registered' | 'checkin' | 'scraper_run';
    title: string;
    description: string;
    timestamp: string;
  };
}) {
  const iconMap = {
    event_created: Calendar,
    user_registered: UserCheck,
    checkin: MapPin,
    scraper_run: Bot,
  };
  const colorMap = {
    event_created: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    user_registered: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    checkin: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    scraper_run: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  };

  const Icon = iconMap[item.type];
  const timeAgo = formatTimeAgo(new Date(item.timestamp));

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorMap[item.type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{timeAgo}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EscalDashboard() {
  const { metrics, loading: metricsLoading } = useEscalMetrics();
  const { activities, loading: activitiesLoading } = useRecentActivity();
  const { events: topEvents, loading: topEventsLoading } = useTopEvents();
  const { locations, loading: locationsLoading } = useLiveLocations();

  const metricCards: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: AccentColor;
    trend: number;
    href: string;
  }[] = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Total Events',
      value: metricsLoading ? '-' : metrics.totalEvents.toLocaleString('nl-NL'),
      accent: 'indigo',
      trend: metrics.trends.totalEvents,
      href: '/escal/events',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Active Users',
      value: metricsLoading ? '-' : metrics.activeUsers.toLocaleString('nl-NL'),
      accent: 'emerald',
      trend: metrics.trends.activeUsers,
      href: '/escal/users',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: 'Live Now',
      value: metricsLoading ? '-' : metrics.liveNow,
      accent: 'orange',
      trend: metrics.trends.liveNow,
      href: '/escal/live',
    },
    {
      icon: <Bot className="h-5 w-5" />,
      label: 'Scrapers OK',
      value: metricsLoading ? '-' : `${metrics.scrapersOk}/3`,
      accent: 'amber',
      trend: 0,
      href: '/escal/scrapers',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Escal
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage your DJ events platform
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {locationsLoading ? '...' : locations.length}
            </p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500">users live now</p>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal" />

      {/* Metric cards */}
      {metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card) => {
            const styles = accentStyles[card.accent];
            const isPositive = card.trend > 0;
            const isNegative = card.trend < 0;
            const trendFormatted = isPositive
              ? `+${card.trend.toFixed(1)}%`
              : isNegative
                ? `${card.trend.toFixed(1)}%`
                : '-';

            return (
              <Link
                key={card.label}
                href={card.href}
                className={`group rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}
                  >
                    <span className={styles.iconColor}>{card.icon}</span>
                  </div>
                  {card.trend !== 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isNegative
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {trendFormatted}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <div className="flex items-center justify-between">
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {card.value}
                  </p>
                  <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Map Placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Live Events Map
            </h2>
            <Link
              href="/escal/live"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          <div className="relative h-[300px] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {locationsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            ) : (
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {locations.length} active locations
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Google Maps integration coming soon
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No recent activity</p>
            ) : (
              activities.slice(0, 6).map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Events */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Top Events
          </h2>
          <Link
            href="/escal/events"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all events
          </Link>
        </div>
        {topEventsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Event
                  </th>
                  <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Going
                  </th>
                  <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interested
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topEvents.map((event, index) => (
                  <tr key={event.id} className="group">
                    <td className="py-3">
                      <Link
                        href={`/escal/events/${event.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                          {event.title}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {event.going}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        {event.interested}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
