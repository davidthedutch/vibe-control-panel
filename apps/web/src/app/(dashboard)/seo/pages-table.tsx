'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Image,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export interface SeoPageData {
  url: string;
  title: string;
  description: string;
  h1: string | null;
  hasOgImage: boolean;
  score: number;
  issues: SeoIssue[];
}

interface PagesTableProps {
  pages: SeoPageData[];
  onPageUpdate: (url: string, field: 'title' | 'description', value: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950';
  if (score >= 50) return 'bg-amber-50 dark:bg-amber-950';
  return 'bg-red-50 dark:bg-red-950';
}

function IssueIcon({ type }: { type: SeoIssue['type'] }) {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function IssueBadge({ issues }: { issues: SeoIssue[] }) {
  const errors = issues.filter((i) => i.type === 'error').length;
  const warnings = issues.filter((i) => i.type === 'warning').length;
  const infos = issues.filter((i) => i.type === 'info').length;

  if (issues.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        OK
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {errors > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {errors}
        </span>
      )}
      {warnings > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {warnings}
        </span>
      )}
      {infos > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {infos}
        </span>
      )}
    </div>
  );
}

function InlineEdit({
  value,
  placeholder,
  onChange,
  maxLength,
  showCount,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCount?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          autoFocus
          className="w-full rounded-md border border-indigo-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-indigo-600 dark:bg-slate-800 dark:text-slate-200"
        />
        {showCount && (
          <span
            className={`text-right text-[11px] tabular-nums ${
              draft.length > 160
                ? 'text-red-500'
                : draft.length >= 150
                  ? 'text-emerald-500'
                  : 'text-slate-400'
            }`}
          >
            {draft.length} / 160 karakters
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group w-full text-left"
      title="Klik om te bewerken"
    >
      {value ? (
        <span className="text-sm text-slate-700 group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400">
          {value}
        </span>
      ) : (
        <span className="text-sm italic text-red-400 group-hover:text-red-500 dark:text-red-500 dark:group-hover:text-red-400">
          {placeholder}
        </span>
      )}
    </button>
  );
}

function ExpandedDetails({
  page,
  onPageUpdate,
}: {
  page: SeoPageData;
  onPageUpdate: (field: 'title' | 'description', value: string) => void;
}) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Edit fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Meta Tags Bewerken
          </h4>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Title Tag
            </label>
            <InlineEdit
              value={page.title}
              placeholder="Voeg een title tag toe..."
              onChange={(v) => onPageUpdate('title', v)}
              maxLength={70}
            />
            {page.title && (
              <span
                className={`mt-0.5 block text-[11px] tabular-nums ${
                  page.title.length > 60
                    ? 'text-amber-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {page.title.length} / 60 karakters
              </span>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Meta Description
            </label>
            <InlineEdit
              value={page.description}
              placeholder="Voeg een meta description toe..."
              onChange={(v) => onPageUpdate('description', v)}
              maxLength={200}
              showCount
            />
          </div>
        </div>

        {/* Page details */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pagina Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">URL</span>
              <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                {page.url}
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">H1 Heading</span>
              {page.h1 ? (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {page.h1}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-3.5 w-3.5" />
                  Ontbreekt
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">OG Image</span>
              {page.hasOgImage ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aanwezig
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Ontbreekt
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Score</span>
              <span className={`font-semibold tabular-nums ${getScoreColor(page.score)}`}>
                {page.score}/100
              </span>
            </div>
          </div>

          {/* Issues in expanded view */}
          {page.issues.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Issues
              </h4>
              {page.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    issue.type === 'error'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                      : issue.type === 'warning'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  }`}
                >
                  <IssueIcon type={issue.type} />
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagesTable({ pages, onPageUpdate }: PagesTableProps) {
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  const toggleExpand = (url: string) => {
    setExpandedUrl(expandedUrl === url ? null : url);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Pagina&apos;s
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {pages.length} pagina&apos;s geanalyseerd
        </p>
      </div>

      {/* Table header */}
      <div className="hidden border-b border-slate-100 bg-slate-50/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid md:grid-cols-12 md:gap-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-500">
        <div className="col-span-2">URL</div>
        <div className="col-span-3">Title</div>
        <div className="col-span-3">Description</div>
        <div className="col-span-1 text-center">H1</div>
        <div className="col-span-1 text-center">OG</div>
        <div className="col-span-1 text-center">Score</div>
        <div className="col-span-1 text-center">Issues</div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {pages.map((page) => {
          const isExpanded = expandedUrl === page.url;

          return (
            <div key={page.url}>
              {/* Row */}
              <button
                onClick={() => toggleExpand(page.url)}
                className="w-full text-left transition-colors duration-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="grid grid-cols-1 gap-2 px-6 py-3.5 md:grid-cols-12 md:items-center md:gap-4">
                  {/* URL */}
                  <div className="col-span-2 flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <span className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
                      {page.url}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-medium text-slate-400 md:hidden">Title: </span>
                    <InlineEdit
                      value={page.title}
                      placeholder="Ontbreekt"
                      onChange={(v) => onPageUpdate(page.url, 'title', v)}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-medium text-slate-400 md:hidden">
                      Description:{' '}
                    </span>
                    <InlineEdit
                      value={page.description}
                      placeholder="Ontbreekt"
                      onChange={(v) => onPageUpdate(page.url, 'description', v)}
                      showCount
                    />
                  </div>

                  {/* H1 */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 md:hidden">H1: </span>
                    {page.h1 ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4.5 w-4.5 text-red-400" />
                    )}
                  </div>

                  {/* OG Image */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 md:hidden">OG: </span>
                    {page.hasOgImage ? (
                      <div className="flex h-7 w-10 items-center justify-center rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        <Image className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-10 items-center justify-center rounded border border-dashed border-slate-300 dark:border-slate-700">
                        <Image className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 md:hidden">Score: </span>
                    <span
                      className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums ${getScoreColor(page.score)} ${getScoreBg(page.score)}`}
                    >
                      {page.score}
                    </span>
                  </div>

                  {/* Issues */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 md:hidden">Issues: </span>
                    <IssueBadge issues={page.issues} />
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <ExpandedDetails
                  page={page}
                  onPageUpdate={(field, value) => onPageUpdate(page.url, field, value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
