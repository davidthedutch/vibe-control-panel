'use client';

import { useState } from 'react';
import {
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export interface SeoIssueWithPage {
  type: 'error' | 'warning' | 'info';
  message: string;
  pageUrl: string;
}

interface IssuesPanelProps {
  issues: SeoIssueWithPage[];
}

interface GroupConfig {
  type: 'error' | 'warning' | 'info';
  label: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  itemBg: string;
  itemBorder: string;
}

const GROUP_CONFIGS: GroupConfig[] = [
  {
    type: 'error',
    label: 'Fouten',
    description: 'Kritieke SEO problemen die direct opgelost moeten worden',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    borderColor: 'border-red-200 dark:border-red-900',
    bgColor: 'bg-red-50/50 dark:bg-red-950/20',
    textColor: 'text-red-800 dark:text-red-200',
    badgeBg: 'bg-red-100 dark:bg-red-900',
    badgeText: 'text-red-700 dark:text-red-300',
    itemBg: 'bg-white dark:bg-slate-900',
    itemBorder: 'border-red-100 dark:border-red-900/50',
  },
  {
    type: 'warning',
    label: 'Waarschuwingen',
    description: 'Aanbevolen verbeteringen voor betere SEO',
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    borderColor: 'border-amber-200 dark:border-amber-900',
    bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
    textColor: 'text-amber-800 dark:text-amber-200',
    badgeBg: 'bg-amber-100 dark:bg-amber-900',
    badgeText: 'text-amber-700 dark:text-amber-300',
    itemBg: 'bg-white dark:bg-slate-900',
    itemBorder: 'border-amber-100 dark:border-amber-900/50',
  },
  {
    type: 'info',
    label: 'Suggesties',
    description: 'Optionele verbeteringen voor optimale resultaten',
    icon: <Info className="h-5 w-5 text-blue-500" />,
    borderColor: 'border-blue-200 dark:border-blue-900',
    bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
    textColor: 'text-blue-800 dark:text-blue-200',
    badgeBg: 'bg-blue-100 dark:bg-blue-900',
    badgeText: 'text-blue-700 dark:text-blue-300',
    itemBg: 'bg-white dark:bg-slate-900',
    itemBorder: 'border-blue-100 dark:border-blue-900/50',
  },
];

function generateFixPrompt(issue: SeoIssueWithPage): string {
  const prompts: Record<string, string> = {
    'Title tag ontbreekt': `Voeg een beschrijvende <title> tag toe aan de pagina "${issue.pageUrl}". Gebruik het formaat: "Paginanaam - Sitenaam". Houd het onder de 60 karakters.`,
    'Meta description ontbreekt': `Schrijf een meta description voor de pagina "${issue.pageUrl}". Gebruik 150-160 karakters en neem relevante zoekwoorden op.`,
    'H1 heading ontbreekt': `Voeg een <h1> heading toe aan de pagina "${issue.pageUrl}". Zorg dat deze de hoofdinhoud van de pagina beschrijft en uniek is.`,
    'OG image ontbreekt': `Voeg een Open Graph image toe aan de pagina "${issue.pageUrl}". Gebruik het formaat 1200x630px. Voeg de volgende meta tag toe: <meta property="og:image" content="URL_NAAR_AFBEELDING" />`,
  };

  // Check for partial matches
  for (const [key, prompt] of Object.entries(prompts)) {
    if (issue.message.includes(key) || issue.message.toLowerCase().includes(key.toLowerCase())) {
      return prompt;
    }
  }

  return `Los het volgende SEO probleem op voor de pagina "${issue.pageUrl}": ${issue.message}`;
}

function IssueItem({ issue, config }: { issue: SeoIssueWithPage; config: GroupConfig }) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className={`rounded-lg border ${config.itemBorder} ${config.itemBg} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-2.5">
          <span className="mt-0.5 shrink-0">{config.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {issue.message}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <ExternalLink className="h-3 w-3" />
              {issue.pageUrl}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors duration-100 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
          title="Genereer een fix suggestie"
        >
          <Sparkles className="h-3 w-3" />
          Fix
        </button>
      </div>

      {/* Fix prompt */}
      {showPrompt && (
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3 w-3" />
            Fix Suggestie
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {generateFixPrompt(issue)}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateFixPrompt(issue));
            }}
            className="mt-2 rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors duration-100 hover:bg-indigo-700"
          >
            Kopieer prompt
          </button>
        </div>
      )}
    </div>
  );
}

function IssueGroup({
  config,
  issues,
}: {
  config: GroupConfig;
  issues: SeoIssueWithPage[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (issues.length === 0) return null;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Group header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-100 hover:bg-white/30 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <h3 className={`text-sm font-semibold ${config.textColor}`}>{config.label}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ${config.badgeBg} ${config.badgeText}`}
          >
            {issues.length}
          </span>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Issue list */}
      {!collapsed && (
        <div className="space-y-2 px-4 pb-4">
          {issues.map((issue, i) => (
            <IssueItem key={`${issue.pageUrl}-${i}`} issue={issue} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function IssuesPanel({ issues }: IssuesPanelProps) {
  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');
  const infos = issues.filter((i) => i.type === 'info');

  const totalCount = issues.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              SEO Issues
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {totalCount} {totalCount === 1 ? 'issue' : 'issues'} gevonden
            </p>
          </div>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                <XCircle className="h-3 w-3" />
                {errors.length}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length}
              </span>
            )}
            {infos.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Info className="h-3 w-3" />
                {infos.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {GROUP_CONFIGS.map((config) => {
          const groupIssues = issues.filter((i) => i.type === config.type);
          return (
            <IssueGroup key={config.type} config={config} issues={groupIssues} />
          );
        })}

        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
              <svg
                className="h-6 w-6 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Geen issues gevonden
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Alle pagina&apos;s zijn geoptimaliseerd
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
