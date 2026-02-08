'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

interface DeviceBreakdownProps {
  devices: DeviceData[];
}

const deviceIcons: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
};

const deviceColors: Record<string, { bar: string; bg: string; text: string }> = {
  Desktop: {
    bar: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  Mobile: {
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  Tablet: {
    bar: 'bg-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
};

export default function DeviceBreakdown({ devices }: DeviceBreakdownProps) {
  const total = devices.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Apparaten
      </h3>

      {/* Stacked bar overview */}
      <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {devices.map((device) => {
          const colors = deviceColors[device.device];
          return (
            <div
              key={device.device}
              className={`h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full ${colors?.bar ?? 'bg-slate-400'}`}
              style={{ width: `${device.percentage}%` }}
            />
          );
        })}
      </div>

      {/* Individual breakdowns */}
      <div className="space-y-4">
        {devices.map((device) => {
          const colors = deviceColors[device.device];
          const icon = deviceIcons[device.device];

          return (
            <div key={device.device} className="flex items-center gap-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors?.bg ?? 'bg-slate-100 dark:bg-slate-800'}`}
              >
                <span className={colors?.text ?? 'text-slate-500 dark:text-slate-400'}>
                  {icon}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {device.device}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {device.count.toLocaleString('nl-NL')}
                    </span>
                    <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors?.bar ?? 'bg-slate-400'}`}
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Totaal</span>
          <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {total.toLocaleString('nl-NL')} bezoekers
          </span>
        </div>
      </div>
    </div>
  );
}
