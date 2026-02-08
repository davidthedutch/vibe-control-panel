'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import type { ComponentItem, ComponentStatus, ComponentType } from './page';

interface ComponentTableProps {
  components: ComponentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_CONFIG: Record<ComponentStatus, { label: string; dotClass: string; badgeClass: string }> = {
  working: {
    label: 'Werkend',
    dotClass: 'bg-green-500',
    badgeClass: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/50 dark:text-green-400 dark:ring-green-500/30',
  },
  broken: {
    label: 'Kapot',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-500/30',
  },
  planned: {
    label: 'Gepland',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
    badgeClass: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-500/30',
  },
  in_progress: {
    label: 'In progress',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-500/30',
  },
  needs_review: {
    label: 'Review',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-500/30',
  },
};

const TYPE_LABELS: Record<ComponentType, string> = {
  ui: 'UI',
  layout: 'Layout',
  feature: 'Feature',
  page: 'Page',
};

type SortKey = 'name' | 'type' | 'category' | 'status' | 'filePath' | 'lastModified';
type SortDirection = 'asc' | 'desc';

export function ComponentTable({ components, selectedId, onSelect }: ComponentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...components].sort((a, b) => {
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-1 inline h-3 w-3 text-slate-300 dark:text-slate-600" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-slate-600 dark:text-slate-300" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-slate-600 dark:text-slate-300" />
    );
  }

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
        <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          Geen componenten gevonden
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Pas je filters aan of voeg een nieuw component toe
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="w-[120px] px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Status
                  <SortIcon column="status" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort('name')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Naam
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="w-[100px] px-4 py-3">
                <button
                  onClick={() => handleSort('type')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Type
                  <SortIcon column="type" />
                </button>
              </th>
              <th className="w-[120px] px-4 py-3">
                <button
                  onClick={() => handleSort('category')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Categorie
                  <SortIcon column="category" />
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort('filePath')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Pad
                  <SortIcon column="filePath" />
                </button>
              </th>
              <th className="w-[130px] px-4 py-3">
                <button
                  onClick={() => handleSort('lastModified')}
                  className="inline-flex items-center text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Gewijzigd
                  <SortIcon column="lastModified" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((comp) => {
              const statusCfg = STATUS_CONFIG[comp.status];
              return (
                <tr
                  key={comp.id}
                  onClick={() => onSelect(comp.id)}
                  className={`cursor-pointer transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    selectedId === comp.id
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCfg.badgeClass}`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {comp.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {TYPE_LABELS[comp.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {comp.category}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-slate-500 dark:text-slate-400">
                      {comp.filePath}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                    {comp.lastModified ?? '\u2014'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
