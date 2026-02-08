'use client';

import { Monitor, Tablet, Smartphone } from 'lucide-react';

export interface DeviceSize {
  width: number;
  height: number;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSwitchProps {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
}

export const DEVICE_SIZES: Record<DeviceType, DeviceSize> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export default function DeviceSwitch({ device, onChange }: DeviceSwitchProps) {
  const devices: Array<{ id: DeviceType; label: string; icon: React.ReactNode; size: string }> = [
    {
      id: 'desktop',
      label: 'Desktop',
      icon: <Monitor className="h-4 w-4" />,
      size: '1440×900',
    },
    {
      id: 'tablet',
      label: 'Tablet',
      icon: <Tablet className="h-4 w-4" />,
      size: '768×1024',
    },
    {
      id: 'mobile',
      label: 'Mobile',
      icon: <Smartphone className="h-4 w-4" />,
      size: '375×667',
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      {devices.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            device === d.id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
          title={`${d.label} (${d.size})`}
        >
          {d.icon}
          <span className="hidden sm:inline">{d.label}</span>
        </button>
      ))}
    </div>
  );
}
