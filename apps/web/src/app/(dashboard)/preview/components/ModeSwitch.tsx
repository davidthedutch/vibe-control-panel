'use client';

import { Eye, MousePointer, Edit3 } from 'lucide-react';

export type PreviewMode = 'preview' | 'select' | 'edit';

interface ModeSwitchProps {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}

export default function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  const modes: Array<{ id: PreviewMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="h-4 w-4" />,
      description: 'View the site normally',
    },
    {
      id: 'select',
      label: 'Select',
      icon: <MousePointer className="h-4 w-4" />,
      description: 'Hover to highlight components',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit3 className="h-4 w-4" />,
      description: 'Click to edit components',
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === m.id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
          title={m.description}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
