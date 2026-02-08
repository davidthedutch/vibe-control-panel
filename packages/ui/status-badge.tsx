import React from 'react';

const statusStyles: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  working: 'bg-green-100 text-green-700',
  broken: 'bg-red-100 text-red-700',
  deprecated: 'bg-gray-100 text-gray-700',
  needs_review: 'bg-amber-100 text-amber-700',
  pass: 'bg-green-100 text-green-700',
  warn: 'bg-amber-100 text-amber-700',
  fail: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
