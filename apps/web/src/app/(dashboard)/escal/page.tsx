'use client';

import Link from 'next/link';
import {
  Activity,
  Calendar,
  Users,
  Bot,
  TrendingUp,
  Radio,
  ShieldCheck,
  Music,
  Timer,
  Footprints,
  Zap,
  MapPin,
  Map,
  ListMusic,
  Loader2,
} from 'lucide-react';
import {
  useArenaMetrics,
  useEscalSettings,
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
    <div className="flex flex-wrap gap-2">
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
// Arena Feature Config
// ---------------------------------------------------------------------------

const arenaFeatures = [
  {
    key: 'timers',
    name: 'Timers',
    description: 'Persoonlijke + vrienden timers, countdown, DJ set snelkeuze',
    icon: Timer,
    metricKey: 'activeTimers' as const,
    metricLabel: 'actieve timers',
    accent: 'orange' as const,
  },
  {
    key: 'stappenteller',
    name: 'Stappenteller',
    description: 'Stappen tellen + vrienden leaderboard',
    icon: Footprints,
    metricKey: 'totalStepsToday' as const,
    metricLabel: 'stappen vandaag',
    accent: 'emerald' as const,
  },
  {
    key: 'shazam',
    name: 'Shazam',
    description: 'Nummers herkennen + delen met vrienden',
    icon: Music,
    metricKey: 'shazamsToday' as const,
    metricLabel: 'shazams vandaag',
    accent: 'violet' as const,
  },
  {
    key: 'vriendenStatus',
    name: 'Vrienden Status',
    description: 'Locatie status delen (Main Stage, Bar, etc.)',
    icon: MapPin,
    metricKey: 'activeStatuses' as const,
    metricLabel: 'actieve statussen',
    accent: 'amber' as const,
  },
  {
    key: 'lineup',
    name: 'Line-up',
    description: 'Live timetable met now playing indicator',
    icon: ListMusic,
    metricKey: null,
    metricLabel: null,
    accent: 'orange' as const,
  },
  {
    key: 'plattegrond',
    name: 'Plattegrond',
    description: 'Venue map met pinch-to-zoom',
    icon: Map,
    metricKey: null,
    metricLabel: null,
    accent: 'emerald' as const,
  },
] as const;

// ---------------------------------------------------------------------------
// Accent Styles
// ---------------------------------------------------------------------------

const accentStyles = {
  orange: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-100 dark:border-orange-900/40',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/40',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-100 dark:border-violet-900/40',
    bg: 'bg-violet-50/50 dark:bg-violet-950/20',
  },
} as const;

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EscalDashboard() {
  const { metrics: arenaMetrics, loading: arenaLoading } = useArenaMetrics();
  const { settings } = useEscalSettings();

  const arenaEnabled = settings.featureFlags.arena;

  const metricCards = [
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Active Sessions',
      value: arenaLoading ? '—' : arenaMetrics.activeSessions,
      accent: 'orange' as const,
    },
    {
      icon: <Timer className="h-5 w-5" />,
      label: 'Active Timers',
      value: arenaLoading ? '—' : arenaMetrics.activeTimers,
      accent: 'amber' as const,
    },
    {
      icon: <Footprints className="h-5 w-5" />,
      label: 'Steps Today',
      value: arenaLoading ? '—' : arenaMetrics.totalStepsToday.toLocaleString('nl-NL'),
      accent: 'emerald' as const,
    },
    {
      icon: <Music className="h-5 w-5" />,
      label: 'Shazams Today',
      value: arenaLoading ? '—' : arenaMetrics.shazamsToday,
      accent: 'violet' as const,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Active Statuses',
      value: arenaLoading ? '—' : arenaMetrics.activeStatuses,
      accent: 'emerald' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
            <Zap className="h-5 w-5" />
          </div>
          Arena Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overzicht van alle arena features en real-time metrics
        </p>
      </div>

      {/* Arena Metric Cards */}
      {arenaLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {metricCards.map((card) => {
            const styles = accentStyles[card.accent];
            return (
              <div
                key={card.label}
                className={`rounded-xl border ${styles.border} ${styles.bg} p-4 shadow-sm`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.iconBg}`}>
                  <span className={styles.iconColor}>{card.icon}</span>
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {card.value}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Cards Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Arena Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {arenaFeatures.map((feature) => {
            const styles = accentStyles[feature.accent];
            const Icon = feature.icon;
            const metricValue =
              feature.metricKey && !arenaLoading
                ? arenaMetrics[feature.metricKey]
                : null;

            return (
              <div
                key={feature.key}
                className={`rounded-xl border ${styles.border} bg-white p-5 shadow-sm dark:bg-slate-900`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}>
                    <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      arenaEnabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {arenaEnabled ? 'Aan' : 'Uit'}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">
                  {feature.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
                {metricValue !== null && (
                  <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">
                      {typeof metricValue === 'number'
                        ? metricValue.toLocaleString('nl-NL')
                        : metricValue}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.metricLabel}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal" />
    </div>
  );
}
