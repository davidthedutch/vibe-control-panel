'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Wifi, WifiOff } from 'lucide-react';
import EscalAppPreview from './components/EscalAppPreview';
import { useEscalMetrics } from '@/lib/hooks/use-escal-data';

type DeviceMode = 'iphone' | 'ipad';

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceMode>('iphone');
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
        <EscalAppPreview device={device} />
      </div>
    </div>
  );
}
