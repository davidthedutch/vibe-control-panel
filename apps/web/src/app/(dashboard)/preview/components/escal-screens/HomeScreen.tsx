'use client';

import { Calendar, Users, MapPin, TrendingUp, Activity, Zap } from 'lucide-react';
import { useEscalMetrics, useTopEvents, useRecentActivity } from '@/lib/hooks/use-escal-data';

export default function HomeScreen() {
  const { metrics, loading: metricsLoading } = useEscalMetrics();
  const { events: topEvents, loading: eventsLoading } = useTopEvents();
  const { activities, loading: activityLoading } = useRecentActivity();

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Escal</h1>
          <p className="text-xs text-slate-400">Welkom terug</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
          <Zap className="h-4 w-4 text-purple-400" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Events', value: metricsLoading ? '...' : metrics.totalEvents.toLocaleString(), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: metrics.trends.totalEvents },
          { label: 'Gebruikers', value: metricsLoading ? '...' : metrics.activeUsers.toLocaleString(), icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', trend: metrics.trends.activeUsers },
          { label: 'Live Nu', value: metricsLoading ? '...' : metrics.liveNow.toString(), icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: metrics.trends.liveNow },
          { label: 'Scrapers OK', value: metricsLoading ? '...' : `${metrics.scrapersOk}/3`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: null },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-800/80 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              {item.trend !== null && (
                <span className="flex items-center text-[10px] text-green-400">
                  <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                  {item.trend > 0 ? '+' : ''}{typeof item.trend === 'number' ? item.trend.toFixed(1) : 0}%
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-white">{item.value}</p>
            <p className="text-[11px] text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Trending Events */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Trending Events</h2>
        <div className="flex flex-col gap-2">
          {eventsLoading ? (
            <div className="rounded-xl bg-slate-800/80 p-3">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
            </div>
          ) : (
            topEvents.slice(0, 3).map((event, i) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{event.going} going</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-white">Recente Activiteit</h2>
        <div className="flex flex-col gap-1.5">
          {activityLoading ? (
            <div className="h-12 animate-pulse rounded-lg bg-slate-800/80" />
          ) : (
            activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2">
                <div className={`h-2 w-2 rounded-full ${
                  act.type === 'event_created' ? 'bg-blue-400' :
                  act.type === 'user_registered' ? 'bg-green-400' :
                  act.type === 'checkin' ? 'bg-orange-400' : 'bg-purple-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{act.title}</p>
                  <p className="truncate text-[10px] text-slate-500">{act.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-500">
                  {new Date(act.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
