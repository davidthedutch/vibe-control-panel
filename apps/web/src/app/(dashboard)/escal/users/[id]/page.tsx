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
  Award,
  Shield,
  Ban,
  Trash2,
  Mail,
  Clock,
  Heart,
  Star,
  Music,
  Loader2,
  UserCheck,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { useEscalUser } from '@/lib/hooks/use-escal-data';

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
    banned: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status] || styles.active}`}>
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
  color: 'emerald' | 'amber' | 'purple' | 'blue' | 'indigo';
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
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/40',
      text: 'text-purple-600 dark:text-purple-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/40',
      text: 'text-indigo-600 dark:text-indigo-400',
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
// XP Progress Bar
// ---------------------------------------------------------------------------

function XpProgressBar({ xp, level }: { xp: number; level: number }) {
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Level {level}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading, error } = useEscalUser(id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/users" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/users" />
        <div className="flex flex-col items-center justify-center py-24">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">User not found</p>
          <Link
            href="/escal/users"
            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for activities, friends, badges
  const recentActivity = [
    { id: '1', type: 'checkin', description: 'Checked in at Awakenings Festival', date: '2026-02-07' },
    { id: '2', type: 'friend', description: 'Became friends with User456', date: '2026-02-05' },
    { id: '3', type: 'review', description: 'Reviewed De School event', date: '2026-02-03' },
    { id: '4', type: 'badge', description: 'Earned "Night Owl" badge', date: '2026-02-01' },
  ];

  const friends = [
    { id: '1', username: 'DJFan99', level: 12 },
    { id: '2', username: 'TechnoQueen', level: 8 },
    { id: '3', username: 'RaveKing', level: 15 },
    { id: '4', username: 'BassDrop', level: 5 },
  ];

  const badges = [
    { id: '1', name: 'First Event', icon: '🎉', earned: true },
    { id: '2', name: 'Social Butterfly', icon: '🦋', earned: true },
    { id: '3', name: 'Night Owl', icon: '🦉', earned: true },
    { id: '4', name: 'Music Lover', icon: '🎵', earned: true },
    { id: '5', name: 'Festival Veteran', icon: '🏆', earned: false },
    { id: '6', name: 'Party Animal', icon: '🐺', earned: false },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Back link */}
      <Link
        href="/escal/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      {/* Sub Navigation */}
      <SubNav current="/escal/users" />

      {/* User Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="h-10 w-10 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {user.username}
              </h1>
              <StatusBadge status={user.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(user.created_at)}
              </span>
            </div>
            <div className="mt-3">
              <XpProgressBar xp={user.xp} level={user.level} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.status === 'active' ? (
            <button className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-amber-900/20">
              <Ban className="h-4 w-4" />
              Suspend
            </button>
          ) : (
            <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
              <Shield className="h-4 w-4" />
              Activate
            </button>
          )}
          <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Level"
          value={user.level}
          color="indigo"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Events"
          value={user.events_attended}
          color="emerald"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Friends"
          value={user.friends_count}
          color="blue"
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Badges"
          value={user.badges_count}
          color="amber"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="XP"
          value={user.xp.toLocaleString()}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Activity & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Activity</h2>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{activity.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location History */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Check-in History</h2>
            <div className="mt-4 h-[200px] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Location map coming soon</p>
              </div>
            </div>
          </div>

          {/* Content Moderation */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">User Content</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Reviews</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">12</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">0 flagged</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Photos</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">34</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">0 pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Account Info</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">User ID</dt>
                <dd className="text-sm font-mono text-slate-600 dark:text-slate-400">{user.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                <dd><StatusBadge status={user.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Last Seen</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user.last_seen ? new Date(user.last_seen).toLocaleString('nl-NL') : 'Never'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Friends */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Friends</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{user.friends_count}</span>
            </div>
            <div className="mt-4 space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{friend.username}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Lvl {friend.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Badges</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {badges.filter(b => b.earned).length}/{badges.length}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 ${
                    badge.earned
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                      : 'border-slate-200 bg-slate-50 opacity-50 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                  title={badge.name}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="mt-1 text-xs text-slate-600 dark:text-slate-400 text-center truncate w-full">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
