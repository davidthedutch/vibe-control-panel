'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  Bot,
  TrendingUp,
  Activity,
  Radio,
  ArrowLeft,
  Star,
  Heart,
  Eye,
  Clock,
  Music,
  ExternalLink,
  Loader2,
  User,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { useEscalEvent } from '@/lib/hooks/use-escal-data';

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
        const isActive = current.startsWith(item.href);
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
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    past: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'emerald' | 'amber' | 'orange' | 'blue';
}) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      text: 'text-amber-600 dark:text-amber-400',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/40',
      text: 'text-orange-600 dark:text-orange-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
  };

  const styles = colorStyles[color];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${styles.bg}`}>
        <span className={styles.text}>{icon}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { event, loading, error } = useEscalEvent(id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/events" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/events" />
        <div className="flex flex-col items-center justify-center py-24">
          <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">Event not found</p>
          <Link
            href="/escal/events"
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  // Mock lineup data
  const lineup = [
    { id: '1', name: 'DJ Abstract', time: '22:00 - 23:30', stage: 'Main Stage' },
    { id: '2', name: 'Minimal Mind', time: '23:30 - 01:00', stage: 'Main Stage' },
    { id: '3', name: 'Techno Terror', time: '01:00 - 02:30', stage: 'Main Stage' },
    { id: '4', name: 'Deep Diver', time: '22:00 - 00:00', stage: 'Room 2' },
  ];

  // Mock reviews data
  const reviews = [
    { id: '1', user: 'User123', rating: 5, comment: 'Amazing night!', date: '2026-01-15' },
    { id: '2', user: 'TechnoFan', rating: 4, comment: 'Great music, bit crowded', date: '2026-01-14' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Back link */}
      <Link
        href="/escal/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Sub Navigation */}
      <SubNav current="/escal/events" />

      {/* Event Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Music className="h-10 w-10 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {event.title}
              </h1>
              <StatusBadge status={event.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.venue_name}, {event.venue_city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(event.start_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(event.start_date)} - {event.end_date ? formatTime(event.end_date) : 'Late'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <Star className="h-4 w-4" />
            Feature
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <ExternalLink className="h-4 w-4" />
            View Public
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Going"
          value={event.going_count}
          color="emerald"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Interested"
          value={event.interested_count}
          color="amber"
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Views"
          value={Math.floor(Math.random() * 5000) + 1000}
          color="orange"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Avg Rating"
          value="4.5"
          color="blue"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Description</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {event.description || 'No description available.'}
            </p>
          </div>

          {/* Lineup */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Lineup</h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {lineup.map((dj) => (
                <div key={dj.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{dj.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{dj.stage}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{dj.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Photos</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">0 photos</span>
            </div>
            <div className="mt-4 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 dark:border-slate-700">
              <div className="text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No photos uploaded yet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Event Info</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Source</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {event.source.toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Created</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {new Date(event.created_at).toLocaleDateString('nl-NL')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Event ID</dt>
                <dd className="text-sm font-mono text-slate-600 dark:text-slate-400">{event.id}</dd>
              </div>
            </dl>
          </div>

          {/* Reviews */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Reviews</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{reviews.length} reviews</span>
            </div>
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{review.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Analytics</h2>
            <div className="mt-4 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Charts coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
