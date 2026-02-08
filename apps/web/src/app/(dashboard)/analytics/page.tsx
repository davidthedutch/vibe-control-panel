'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  MousePointerClick,
  Loader2,
} from 'lucide-react';
import AnalyticsCharts from './analytics-charts';
import TopPages from './top-pages';
import ReferralSources from './referral-sources';
import DeviceBreakdown from './device-breakdown';
import {
  fetchAnalyticsMetrics,
  fetchChartData,
  fetchTopPages,
  fetchReferralSources,
  fetchDeviceBreakdown,
  type AnalyticsMetrics,
  type ChartDataPoint,
  type TopPage,
  type ReferralSource,
  type DeviceData,
} from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Metric card accent styles
// ---------------------------------------------------------------------------

const accentStyles = {
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/40',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  purple: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/40',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
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
// Date range options
// ---------------------------------------------------------------------------

const DATE_RANGES = [
  { label: 'Laatste 7 dagen', value: 7 },
  { label: 'Laatste 30 dagen', value: 30 },
  { label: 'Laatste 90 dagen', value: 90 },
] as const;

// TODO: Get project ID from context/params
const PROJECT_ID = '00000000-0000-0000-0000-000000000001';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [range, setRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [referrals, setReferrals] = useState<ReferralSource[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [metricsData, chartResult, pagesData, referralsData, devicesData] =
          await Promise.all([
            fetchAnalyticsMetrics(PROJECT_ID, range),
            fetchChartData(PROJECT_ID, range),
            fetchTopPages(PROJECT_ID, range),
            fetchReferralSources(PROJECT_ID, range),
            fetchDeviceBreakdown(PROJECT_ID, range),
          ]);

        setMetrics(metricsData);
        setChartData(chartResult);
        setTopPages(pagesData);
        setReferrals(referralsData);
        setDevices(devicesData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [range]);

  const metricCards: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: AccentColor;
    trend: number;
  }[] = metrics ? [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Pageviews',
      value: metrics.pageviews.toLocaleString('nl-NL'),
      accent: 'blue',
      trend: metrics.trend.pageviews,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Unieke bezoekers',
      value: metrics.uniqueVisitors.toLocaleString('nl-NL'),
      accent: 'emerald',
      trend: metrics.trend.uniqueVisitors,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Gem. sessieduur',
      value: metrics.avgSessionDuration,
      accent: 'purple',
      trend: metrics.trend.avgSessionDuration,
    },
    {
      icon: <MousePointerClick className="h-5 w-5" />,
      label: 'Bounce rate',
      value: metrics.bounceRate,
      accent: 'amber',
      trend: metrics.trend.bounceRate,
    },
  ] : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overzicht van je websiteverkeer en gebruikersgedrag.
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.value}
              onClick={() => setRange(dr.value)}
              disabled={loading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                range === dr.value
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !metrics ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card) => {
              const styles = accentStyles[card.accent];
              const isPositive = card.trend > 0;
              const isNegative = card.trend < 0;
              const trendFormatted = isPositive
                ? `+${card.trend.toFixed(1)}%`
                : isNegative
                  ? `${card.trend.toFixed(1)}%`
                  : '0%';

              return (
                <div
                  key={card.label}
                  className={`rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-sm transition-shadow hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}
                    >
                      <span className={styles.iconColor}>{card.icon}</span>
                    </div>
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
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pageviews chart */}
          <AnalyticsCharts data={chartData} range={range} />

          {/* Bottom section: tables + device breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TopPages pages={topPages} />
            </div>
            <div className="space-y-6">
              <ReferralSources sources={referrals} />
              <DeviceBreakdown devices={devices} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
