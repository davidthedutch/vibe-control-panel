'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Wifi, WifiOff, User, UserX } from 'lucide-react';
import EscalAppPreview from './components/EscalAppPreview';
import { useEscalMetrics } from '@/lib/hooks/use-escal-data';

type DeviceMode = 'iphone' | 'ipad';

export type PreviewUser = {
  id: string;
  username: string;
  userCode: string;
  level: number;
  xp: number;
  xpNext: number;
  eventsAttended: number;
  friends: number;
  streak: number;
  topGenre: string;
  venuesVisited: number;
};

const PREVIEW_USERS: PreviewUser[] = [
  {
    id: 'admin1',
    username: 'admin1',
    userCode: '100001',
    level: 25,
    xp: 4800,
    xpNext: 5000,
    eventsAttended: 87,
    friends: 142,
    streak: 12,
    topGenre: 'Techno',
    venuesVisited: 34,
  },
  {
    id: 'admin2',
    username: 'admin2',
    userCode: '200002',
    level: 15,
    xp: 2100,
    xpNext: 3000,
    eventsAttended: 41,
    friends: 68,
    streak: 5,
    topGenre: 'House',
    venuesVisited: 18,
  },
  {
    id: 'admin3',
    username: 'admin3',
    userCode: '300003',
    level: 8,
    xp: 950,
    xpNext: 1500,
    eventsAttended: 12,
    friends: 23,
    streak: 2,
    topGenre: 'Drum & Bass',
    venuesVisited: 7,
  },
];

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceMode>('iphone');
  const [activeUser, setActiveUser] = useState<PreviewUser | null>(PREVIEW_USERS[0]);
  const { error: metricsError, loading: metricsLoading } = useEscalMetrics();

  const isConnected = !metricsError && !metricsLoading;

  const devices: { id: DeviceMode; label: string; icon: typeof Smartphone; size: string }[] = [
    { id: 'iphone', label: 'iPhone', icon: Smartphone, size: '375x812' },
    { id: 'ipad', label: 'iPad', icon: Tablet, size: '768x1024' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Escal App Preview
          </h1>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Device Switch */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700/50">
            {devices.map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  device === d.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                title={`${d.label} (${d.size})`}
              >
                <d.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* User Switch */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700/50">
            <button
              onClick={() => setActiveUser(null)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeUser === null
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <UserX className="h-4 w-4" />
              <span className="hidden sm:inline">Uitgelogd</span>
            </button>
            {PREVIEW_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveUser(u)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeUser?.id === u.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{u.username}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Status */}
        <div className="flex items-center gap-2 text-sm">
          {metricsLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
              <span className="text-slate-400">Verbinden...</span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-slate-600 dark:text-slate-400">Escal API</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-orange-400" />
              <span className="text-orange-500 dark:text-orange-400">Demo modus</span>
            </>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-8 dark:bg-slate-900/50">
        <EscalAppPreview device={device} user={activeUser} />
      </div>
    </div>
  );
}
