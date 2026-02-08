'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  FileCode,
} from 'lucide-react';

interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  model: string;
  components: string[];
  filesChanged: string[];
}

interface PromptHistoryProps {
  entries: PromptHistoryEntry[];
  onRepeat: (prompt: string) => void;
}

function StatusBadge({ status }: { status: PromptHistoryEntry['status'] }) {
  switch (status) {
    case 'success':
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Succes
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
          <XCircle className="h-3 w-3" />
          Mislukt
        </span>
      );
    case 'partial':
      return (
        <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
          <AlertCircle className="h-3 w-3" />
          Deels
        </span>
      );
  }
}

function HistoryEntry({
  entry,
  onRepeat,
}: {
  entry: PromptHistoryEntry;
  onRepeat: (prompt: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-b-0">
      {/* Collapsed view */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-800/50"
      >
        <span className="mt-0.5 shrink-0 text-slate-500">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Prompt text (truncated) */}
          <p className={`text-sm text-slate-200 ${expanded ? '' : 'line-clamp-2'}`}>
            {entry.prompt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />

            <span className="text-xs text-slate-500">{entry.timestamp}</span>

            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              {entry.model}
            </span>
          </div>

          {/* Component chips */}
          {entry.components.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.components.map((comp) => (
                <span
                  key={comp}
                  className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 border-t border-slate-800 bg-slate-800/30 px-4 py-4 pl-11">
          {/* Full prompt */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Volledige prompt
            </h4>
            <p className="rounded bg-slate-900 p-3 text-sm text-slate-300">
              {entry.prompt}
            </p>
          </div>

          {/* Files changed */}
          {entry.filesChanged.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Gewijzigde bestanden
              </h4>
              <div className="space-y-1">
                {entry.filesChanged.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <FileCode className="h-3.5 w-3.5 text-slate-500" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Resultaat
            </h4>
            <p className="text-sm text-slate-400">
              {entry.status === 'success'
                ? `${entry.filesChanged.length} bestand${entry.filesChanged.length !== 1 ? 'en' : ''} gewijzigd, 0 fouten`
                : entry.status === 'failed'
                  ? 'Uitvoering mislukt - controleer de terminal output'
                  : 'Gedeeltelijk voltooid - sommige stappen zijn overgeslagen'}
            </p>
          </div>

          {/* Repeat button */}
          <button
            onClick={() => onRepeat(entry.prompt)}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Herhaal
          </button>
        </div>
      )}
    </div>
  );
}

export default function PromptHistory({
  entries,
  onRepeat,
}: PromptHistoryProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">
          Prompt historie
        </h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
          {entries.length}
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <RefreshCw className="h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">Nog geen prompts</p>
          </div>
        ) : (
          entries.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} onRepeat={onRepeat} />
          ))
        )}
      </div>
    </div>
  );
}
