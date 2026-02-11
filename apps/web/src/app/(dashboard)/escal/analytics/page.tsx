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
  Loader2,
  Music,
  BarChart3,
  PieChart,
  LineChart,
  UserPlus,
  Heart,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useEscalAnalytics } from '@/lib/hooks/use-escal-data';

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
// Simple Bar Chart Component
// ---------------------------------------------------------------------------

function SimpleBarChart({
  data,
  dataKey,
  color = 'orange',
  height = 200,
}: {
  data: { label: string; value: number }[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col items-center justify-end" style={{ height: height - 24 }}>
            <div
              className={`w-full max-w-8 rounded-t ${colorClasses[color]} transition-all duration-300`}
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? 4 : 0 }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
          <span className="text-xs text-slate-400 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple Line Chart Component
// ---------------------------------------------------------------------------

function SimpleLineChart({
  data,
  lines,
  height = 200,
}: {
  data: { label: string; [key: string]: number | string }[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
}) {
  if (data.length === 0) return null;

  const allValues = lines.flatMap((line) => data.map((d) => Number(d[line.key]) || 0));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  return (
    <div className="relative" style={{ height }}>
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-slate-100 dark:border-slate-800" />
        ))}
      </div>

      {/* Chart area */}
      <svg className="absolute inset-0" viewBox={`0 0 ${data.length * 20} ${height}`} preserveAspectRatio="none">
        {lines.map((line) => {
          const points = data
            .map((d, i) => {
              const value = Number(d[line.key]) || 0;
              const x = i * 20 + 10;
              const y = height - ((value - minValue) / range) * (height - 20) - 10;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth="2"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pt-2">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple Pie Chart Component
// ---------------------------------------------------------------------------

function SimplePieChart({
  data,
  size = 200,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle };
  });

  const radius = size / 2 - 10;
  const center = size / 2;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {segments.map((segment, i) => {
          const startRad = (segment.startAngle - 90) * (Math.PI / 180);
          const endRad = (segment.startAngle + segment.angle - 90) * (Math.PI / 180);
          const largeArc = segment.angle > 180 ? 1 : 0;

          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);

          const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={i}
              d={path}
              fill={segment.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          );
        })}
        <circle cx={center} cy={center} r={radius * 0.6} fill="white" className="dark:fill-slate-900" />
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-slate-900 dark:text-slate-100">{item.label}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap Component
// ---------------------------------------------------------------------------

function CheckinHeatmap({ data }: { data: { day: number; hour: number; count: number }[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxCount = Math.max(...data.map((d) => d.count));

  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-slate-100 dark:bg-slate-800';
    if (intensity < 0.4) return 'bg-orange-100 dark:bg-orange-900/40';
    if (intensity < 0.6) return 'bg-orange-200 dark:bg-orange-800/60';
    if (intensity < 0.8) return 'bg-orange-400 dark:bg-orange-600';
    return 'bg-orange-600 dark:bg-orange-500';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-1">
          <div className="w-10" />
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-xs text-slate-400"
            >
              {hour % 4 === 0 ? `${hour}:00` : ''}
            </div>
          ))}
        </div>
        {days.map((day, dayIndex) => (
          <div key={day} className="flex gap-1 mt-1">
            <div className="w-10 text-xs text-slate-500 dark:text-slate-400 flex items-center">
              {day}
            </div>
            {hours.map((hour) => {
              const cell = data.find((d) => d.day === dayIndex && d.hour === hour);
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`flex-1 h-4 rounded-sm ${getColor(cell?.count || 0)}`}
                  title={`${day} ${hour}:00 - ${cell?.count || 0} check-ins`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const { data, loading } = useEscalAnalytics();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/analytics" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/analytics" />
        <div className="flex flex-col items-center justify-center py-24">
          <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No analytics data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userGrowthChart = data.userGrowth.slice(-14).map((d) => ({
    label: new Date(d.date).getDate().toString(),
    users: d.users,
    newUsers: d.newUsers,
  }));

  const eventsBarData = data.eventsPerMonth.map((d) => ({
    label: d.month,
    value: d.events,
  }));

  const genrePieData = data.topGenres.map((g, i) => ({
    label: g.genre,
    value: g.percentage,
    color: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'][i] || '#94a3b8',
  }));

  const engagementChart = data.engagement.slice(-14).map((d) => ({
    label: new Date(d.date).getDate().toString(),
    going: d.going,
    interested: d.interested,
    checkins: d.checkins,
  }));

  // Summary stats
  const latestUsers = data.userGrowth[data.userGrowth.length - 1]?.users || 0;
  const totalNewUsers = data.userGrowth.reduce((sum, d) => sum + d.newUsers, 0);
  const totalEvents = data.eventsPerMonth.reduce((sum, d) => sum + d.events, 0);
  const avgEngagement = Math.round(
    data.engagement.reduce((sum, d) => sum + d.going + d.interested, 0) / data.engagement.length
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights into user growth, events, and engagement
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                dateRange === range
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal/analytics" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {latestUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">New Users (30d)</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalNewUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalEvents.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Avg Daily Engagement</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgEngagement.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">User Growth</h2>
          </div>
          <SimpleLineChart
            data={userGrowthChart}
            lines={[
              { key: 'users', color: '#6366f1', label: 'Total Users' },
              { key: 'newUsers', color: '#10b981', label: 'New Users' },
            ]}
            height={220}
          />
        </div>

        {/* Events Per Month */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Events Per Month</h2>
          </div>
          <SimpleBarChart data={eventsBarData} dataKey="events" color="orange" height={220} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Genres */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Top Genres</h2>
          </div>
          <SimplePieChart data={genrePieData} size={180} />
        </div>

        {/* Engagement Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Engagement Trend</h2>
          </div>
          <SimpleLineChart
            data={engagementChart}
            lines={[
              { key: 'going', color: '#10b981', label: 'Going' },
              { key: 'interested', color: '#f59e0b', label: 'Interested' },
              { key: 'checkins', color: '#8b5cf6', label: 'Check-ins' },
            ]}
            height={220}
          />
        </div>
      </div>

      {/* Check-ins Heatmap */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Check-ins Heatmap</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">(by day/hour)</span>
        </div>
        <CheckinHeatmap data={data.checkinsHeatmap} />
      </div>
    </div>
  );
}
