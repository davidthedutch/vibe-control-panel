'use client';

import { useState } from 'react';
import { ChevronDown, FileCode2 } from 'lucide-react';
import type { EscalTabKey, EscalComponentEntry, EscalFeatureDoc } from './escal-components-data';
import { escalTabs } from './escal-components-data';

const typeBadgeColors: Record<string, string> = {
  ui: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  layout: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  feature: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  page: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
};

const statusBadgeColors: Record<string, string> = {
  working: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  planned: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  broken: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  working: 'Werkend',
  planned: 'Gepland',
  broken: 'Kapot',
};

function ComponentCard({ comp }: { comp: EscalComponentEntry }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{comp.name}</h4>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBadgeColors[comp.type] || typeBadgeColors.ui}`}>
          {comp.type}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeColors[comp.status] || statusBadgeColors.planned}`}>
          {statusLabels[comp.status] || comp.status}
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{comp.description}</p>
      {comp.props.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {comp.props.map((prop) => (
            <span key={prop} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {prop}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
        <FileCode2 className="h-3 w-3" />
        <span className="font-mono">{comp.filePath}</span>
      </div>
    </div>
  );
}

function FeatureDocItem({ feature }: { feature: EscalFeatureDoc }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{feature.name}</h4>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          {feature.actions.length > 0 && (
            <div className="mb-3">
              <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Acties</h5>
              <div className="flex flex-wrap gap-1.5">
                {feature.actions.map((action) => (
                  <span key={action} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}
          {feature.userFlow.length > 0 && (
            <div>
              <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">User Flow</h5>
              <div className="relative ml-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                {feature.userFlow.map((step, i) => (
                  <div key={i} className="relative pb-2 last:pb-0">
                    <span className="absolute -left-[1.375rem] flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-[9px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface EscalSectionTabProps {
  tabKey: Exclude<EscalTabKey, 'all'>;
}

export function EscalSectionTab({ tabKey }: EscalSectionTabProps) {
  const data = escalTabs[tabKey];
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Component Catalogus */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Componenten ({data.components.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.components.map((comp) => (
            <ComponentCard key={comp.name} comp={comp} />
          ))}
        </div>
      </div>

      {/* Feature Docs */}
      {data.features.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Feature Documentatie ({data.features.length})
          </h3>
          <div className="flex flex-col gap-2">
            {data.features.map((feature) => (
              <FeatureDocItem key={feature.name} feature={feature} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
