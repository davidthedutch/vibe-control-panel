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
  AlertTriangle,
  MessageSquare,
  Shield,
  Loader2,
  Music,
  UserCheck,
  Clock,
  Eye,
} from 'lucide-react';
import {
  useLiveLocations,
  useRadiusMessages,
  useBuddyPairs,
  useSafetyAlerts,
  type LiveLocation,
  type RadiusMessage,
  type BuddyPair,
  type SafetyAlert,
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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Live Location Card
// ---------------------------------------------------------------------------

function LocationCard({ location }: { location: LiveLocation }) {
  const privacyColors = {
    all: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    friends: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    buddies: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <Users className="h-5 w-5 text-slate-400" />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-800" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{location.username}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {location.event_title || 'No event'}
        </p>
      </div>
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${privacyColors[location.share_with]}`}>
        {location.share_with}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Radius Message Card
// ---------------------------------------------------------------------------

function MessageCard({ message }: { message: RadiusMessage }) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Users className="h-4 w-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">{message.username}</span>
          <span className="text-xs text-slate-400">{formatTimeAgo(message.created_at)}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message.message}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          <MapPin className="inline h-3 w-3 mr-1" />
          {message.event_title}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buddy Pair Card
// ---------------------------------------------------------------------------

function BuddyCard({ pair }: { pair: BuddyPair }) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    alert: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    ended: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center border-2 border-white dark:border-slate-800">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center border-2 border-white dark:border-slate-800">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {pair.user_name} & {pair.buddy_name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{pair.event_title}</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[pair.status]}`}>
          {pair.status === 'alert' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {pair.status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Every {pair.check_interval_minutes}m
        </span>
        <span>
          Last check: {pair.last_check ? formatTimeAgo(pair.last_check) : 'Never'}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Safety Alert Card
// ---------------------------------------------------------------------------

function AlertCard({ alert }: { alert: SafetyAlert }) {
  const typeColors = {
    emergency: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    missed_checkin: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    sos: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  };

  const typeIcons = {
    emergency: AlertTriangle,
    missed_checkin: Clock,
    sos: Shield,
  };

  const Icon = typeIcons[alert.type];

  return (
    <div className={`rounded-lg border-l-4 p-4 ${typeColors[alert.type]} ${alert.resolved ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          alert.type === 'missed_checkin' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-red-100 dark:bg-red-900/40'
        }`}>
          <Icon className={`h-4 w-4 ${
            alert.type === 'missed_checkin' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {alert.type === 'emergency' ? 'Emergency Alert' : alert.type === 'sos' ? 'SOS Alert' : 'Missed Check-in'}
            </span>
            {alert.resolved && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Resolved
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            User: {alert.username}
            {alert.event_title && ` at ${alert.event_title}`}
          </p>
          {alert.message && (
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">"{alert.message}"</p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(alert.created_at)}</p>
        </div>
        {!alert.resolved && (
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LiveMonitoringPage() {
  const { locations, loading: locationsLoading } = useLiveLocations();
  const { messages, loading: messagesLoading } = useRadiusMessages();
  const { pairs, loading: pairsLoading } = useBuddyPairs();
  const { alerts, loading: alertsLoading } = useSafetyAlerts();

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const activeBuddies = pairs.filter((p) => p.status !== 'ended');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Live Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time view of user locations, chat, and safety status
          </p>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {locations.length} Live Users
            </span>
          </div>
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {activeAlerts.length} Active Alerts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal/live" />

      {/* Safety Alerts */}
      {activeAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-900/10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Active Safety Alerts
          </h2>
          <div className="mt-4 space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Map */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Live Users Map
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {locations.length} active locations
            </span>
          </div>
          <div className="relative h-[400px] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {locationsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            ) : (
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Google Maps integration
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Shows {locations.length} users sharing location
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Locations List */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Live Locations
          </h2>
          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {locationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : locations.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No active locations</p>
            ) : (
              locations.slice(0, 15).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radius Chat Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Radius Chat Feed
          </h2>
          <div className="max-h-[400px] overflow-y-auto">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No recent messages</p>
            ) : (
              messages.slice(0, 20).map((message) => (
                <MessageCard key={message.id} message={message} />
              ))
            )}
          </div>
        </div>

        {/* Buddy System */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Active Buddy Pairs
            <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
              {activeBuddies.length} active
            </span>
          </h2>
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {pairsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : activeBuddies.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No active buddy pairs</p>
            ) : (
              activeBuddies.map((pair) => (
                <BuddyCard key={pair.id} pair={pair} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Safety Alert History
        </h2>
        <div className="space-y-3">
          {alertsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : alerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No safety alerts</p>
          ) : (
            alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
