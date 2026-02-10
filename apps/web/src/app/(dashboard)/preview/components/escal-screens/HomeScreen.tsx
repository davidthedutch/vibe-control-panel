'use client';

import { Calendar, Users, MapPin, TrendingUp, Activity, Zap, Bell, Cloud, Sun, CloudRain, Heart, Clock, Star, Footprints } from 'lucide-react';
import { useEscalMetrics, useTopEvents, useRecentActivity, useEscalEvents } from '@/lib/hooks/use-escal-data';

export default function HomeScreen() {
  const { metrics, loading: metricsLoading } = useEscalMetrics();
  const { events: topEvents, loading: eventsLoading } = useTopEvents();
  const { activities, loading: activityLoading } = useRecentActivity();
  const { events: upcomingEvents, loading: upcomingLoading } = useEscalEvents({ limit: 3, status: 'active' });

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with notification bell */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Escal</h1>
          <p className="text-xs text-slate-400">Welkom terug</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
            <Zap className="h-4 w-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600/30 to-slate-600/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-300">Weer in Amsterdam</p>
            <div className="mt-1 flex items-center gap-2">
              <Sun className="h-6 w-6 text-yellow-400" />
              <span className="text-2xl font-bold text-white">14°</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-300">Vanavond: 9° - Licht bewolkt</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
              <Cloud className="h-3 w-3" /> <span>Za: 12°</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
              <CloudRain className="h-3 w-3" /> <span>Zo: 8°</span>
            </div>
            <p className="text-[9px] text-blue-300">Neem een jas mee!</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Events', value: metricsLoading ? '...' : metrics.totalEvents.toLocaleString(), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: metrics.trends.totalEvents },
          { label: 'Gebruikers', value: metricsLoading ? '...' : metrics.activeUsers.toLocaleString(), icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', trend: metrics.trends.activeUsers },
          { label: 'Live Nu', value: metricsLoading ? '...' : metrics.liveNow.toString(), icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: metrics.trends.liveNow },
          { label: 'Scrapers OK', value: metricsLoading ? '...' : `${metrics.scrapersOk}/3`, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', trend: null },
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

      {/* My Upcoming Events */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Mijn Agenda</h2>
          <span className="text-[10px] text-orange-400">Alles bekijken</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {upcomingLoading ? (
            <div className="h-20 w-40 shrink-0 animate-pulse rounded-xl bg-slate-800/80" />
          ) : (
            upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="w-40 shrink-0 rounded-xl bg-gradient-to-br from-orange-600/30 to-amber-600/20 p-3">
                <p className="truncate text-xs font-semibold text-white">{event.title}</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-300">{event.venue_name || 'TBA'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-orange-300">
                    {new Date(event.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </span>
                  <Heart className="h-3 w-3 text-red-400" fill="currentColor" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-300">Dagelijkse Challenge</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-300">Check 3 events vandaag - <span className="text-yellow-400">+50 XP</span></p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-1/3 rounded-full bg-yellow-400" />
          </div>
          <span className="text-[10px] text-slate-400">1/3</span>
        </div>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-sm font-bold text-orange-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{event.title}</p>
                  <p className="text-[11px] text-slate-400">{event.going} going &bull; {event.interested} interested</p>
                </div>
                <Heart className="h-3.5 w-3.5 text-slate-500" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Steps Today */}
      <div className="rounded-xl bg-slate-800/80 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-white">Stappen Vandaag</span>
          </div>
          <span className="text-sm font-bold text-green-400">4.231</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full w-[42%] rounded-full bg-green-400" />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">Doel: 10.000 stappen</p>
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
                  act.type === 'checkin' ? 'bg-orange-400' : 'bg-orange-400'
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
