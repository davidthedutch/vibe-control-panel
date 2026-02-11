'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Bot,
  TrendingUp,
  Activity,
  Radio,
  ShieldCheck,
  Loader2,
  Music,
  Search,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  useScrapedEventVerification,
  type ScrapedEventComparison,
  type SourceData,
} from '@/lib/hooks/use-escal-data';

// ---------------------------------------------------------------------------
// Sub Navigation
// ---------------------------------------------------------------------------

const subNavItems = [
  { label: 'Dashboard', href: '/escal', icon: Activity },
  { label: 'Events', href: '/escal/events', icon: Calendar },
  { label: 'Users', href: '/escal/users', icon: Users },
  { label: 'Live', href: '/escal/live', icon: Radio },
  { label: 'Scrapers', href: '/escal/scrapers', icon: Bot },
  { label: 'Verificatie', href: '/escal/scrapers/verificatie', icon: ShieldCheck },
  { label: 'Analytics', href: '/escal/analytics', icon: TrendingUp },
];

function SubNav({ current }: { current: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {subNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = current === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-orange-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sourceLabels: Record<string, string> = {
  ra: 'Resident Advisor',
  djguide: 'DJ Guide',
  partyflock: 'Partyflock',
};

const sourceColors: Record<string, string> = {
  ra: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  djguide: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  partyflock: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  geverifieerd: {
    label: 'Geverifieerd',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    icon: CheckCircle,
  },
  conflict: {
    label: 'Conflict',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    icon: AlertTriangle,
  },
  nieuw: {
    label: 'Nieuw',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    icon: Sparkles,
  },
};

function formatDate(dateStr: string): string {
  // Handle dd-mm-yyyy format
  const ddmmyyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceColors[source] || 'bg-slate-100 text-slate-700'}`}>
      {sourceLabels[source] || source}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Comparison fields config
// ---------------------------------------------------------------------------

type FieldKey = keyof SourceData;

const comparisonFields: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Evenementnaam' },
  { key: 'date', label: 'Datum' },
  { key: 'venue', label: 'Venue' },
  { key: 'lineup', label: 'Lineup' },
  { key: 'stages', label: 'Stages' },
  { key: 'extraInfo', label: 'Extra info' },
  { key: 'website', label: 'Website' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
];

function cellValue(source: SourceData | undefined, key: FieldKey): string {
  if (!source) return '';
  const val = source[key];
  if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '';
  return (val as string) || '';
}

function cellMatchesConclusie(
  source: SourceData | undefined,
  conclusie: SourceData,
  key: FieldKey
): 'match' | 'mismatch' | 'empty' {
  const srcVal = cellValue(source, key);
  if (!srcVal) return 'empty';
  const conVal = cellValue(conclusie, key);
  // Normalize dates for comparison
  if (key === 'date') {
    return formatDate(srcVal) === formatDate(conVal) ? 'match' : 'mismatch';
  }
  return srcVal === conVal ? 'match' : 'mismatch';
}

const cellBg: Record<string, string> = {
  match: 'bg-emerald-50 dark:bg-emerald-900/20',
  mismatch: 'bg-amber-50 dark:bg-amber-900/20',
  empty: 'bg-slate-50 dark:bg-slate-800/50',
};

// ---------------------------------------------------------------------------
// Detail View
// ---------------------------------------------------------------------------

function DetailView({
  event,
  onBack,
  onApprove,
  onDelete,
  onUpdateEigen,
  onUpdateConclusie,
}: {
  event: ScrapedEventComparison;
  onBack: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onUpdateEigen: (key: FieldKey, value: string) => void;
  onUpdateConclusie: (key: FieldKey, value: string) => void;
}) {
  const [editingCell, setEditingCell] = useState<{ col: 'eigen' | 'conclusie'; key: FieldKey } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sources = (['ra', 'djguide', 'partyflock'] as const).filter(
    (s) => event.sources[s]
  );

  function startEdit(col: 'eigen' | 'conclusie', key: FieldKey) {
    const current = col === 'eigen'
      ? cellValue(event.eigen as SourceData, key)
      : cellValue(event.conclusie, key);
    setEditValue(current);
    setEditingCell({ col, key });
  }

  function saveEdit() {
    if (!editingCell) return;
    if (editingCell.col === 'eigen') {
      onUpdateEigen(editingCell.key, editValue);
    } else {
      onUpdateConclusie(editingCell.key, editValue);
    }
    setEditingCell(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {event.conclusie.name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Match score: {event.matchScore}%
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {sources.length} bron{sources.length !== 1 ? 'nen' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            disabled={event.status === 'geverifieerd'}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Goedkeuren
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            Verwijder
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Weet je zeker dat je dit event wilt verwijderen?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                onDelete();
                onBack();
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Ja, verwijder
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuleer
            </button>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Veld
                </th>
                {sources.map((src) => (
                  <th
                    key={src}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    <SourceBadge source={src} />
                  </th>
                ))}
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Eigen
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Conclusie
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => (
                <tr key={field.key} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {field.label}
                  </td>
                  {sources.map((src) => {
                    const status = cellMatchesConclusie(event.sources[src], event.conclusie, field.key);
                    const val = cellValue(event.sources[src], field.key);
                    return (
                      <td
                        key={src}
                        className={`max-w-[200px] truncate px-4 py-3 text-sm text-slate-900 dark:text-slate-100 ${cellBg[status]}`}
                        title={val || '—'}
                      >
                        {val || <span className="text-slate-400 dark:text-slate-600">—</span>}
                      </td>
                    );
                  })}
                  {/* Eigen kolom */}
                  <td
                    className="max-w-[200px] cursor-pointer px-4 py-3 text-sm text-slate-900 hover:bg-blue-50 dark:text-slate-100 dark:hover:bg-blue-900/20"
                    onClick={() => startEdit('eigen', field.key)}
                  >
                    {editingCell?.col === 'eigen' && editingCell.key === field.key ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          onBlur={saveEdit}
                          className="w-full rounded border border-blue-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-700 dark:bg-slate-800"
                        />
                      </div>
                    ) : (
                      cellValue(event.eigen as SourceData, field.key) || (
                        <span className="text-slate-300 dark:text-slate-600">klik om in te vullen</span>
                      )
                    )}
                  </td>
                  {/* Conclusie kolom */}
                  <td
                    className="max-w-[200px] cursor-pointer bg-orange-50/50 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-orange-100/50 dark:bg-orange-900/10 dark:text-slate-100 dark:hover:bg-orange-900/20"
                    onClick={() => startEdit('conclusie', field.key)}
                  >
                    {editingCell?.col === 'conclusie' && editingCell.key === field.key ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          onBlur={saveEdit}
                          className="w-full rounded border border-orange-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-orange-700 dark:bg-slate-800"
                        />
                      </div>
                    ) : (
                      cellValue(event.conclusie, field.key) || (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function VerificatiePage() {
  const { events, loading, updateEvent, deleteEvent, bulkApprove, bulkDelete } =
    useScrapedEventVerification();

  // View state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [multipleSources, setMultipleSources] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score' | 'sources'>('date');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filtered & sorted events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.conclusie.name.toLowerCase().includes(s) ||
          e.conclusie.venue.toLowerCase().includes(s) ||
          e.conclusie.lineup.some((a) => a.toLowerCase().includes(s))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (sourceFilter !== 'all') {
      result = result.filter((e) => e.sources[sourceFilter as keyof typeof e.sources]);
    }

    if (multipleSources) {
      result = result.filter(
        (e) => Object.keys(e.sources).length > 1
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.conclusie.date).getTime() - new Date(b.conclusie.date).getTime();
        case 'name':
          return a.conclusie.name.localeCompare(b.conclusie.name);
        case 'score':
          return b.matchScore - a.matchScore;
        case 'sources':
          return Object.keys(b.sources).length - Object.keys(a.sources).length;
        default:
          return 0;
      }
    });

    return result;
  }, [events, search, statusFilter, sourceFilter, multipleSources, sortBy]);

  const totalPages = Math.ceil(filteredEvents.length / perPage);
  const paginatedEvents = filteredEvents.slice((page - 1) * perPage, page * perPage);

  // Stats
  const stats = useMemo(() => {
    const total = events.length;
    const geverifieerd = events.filter((e) => e.status === 'geverifieerd').length;
    const conflicten = events.filter((e) => e.status === 'conflict').length;
    const avgBronnen =
      total > 0
        ? (events.reduce((sum, e) => sum + Object.keys(e.sources).length, 0) / total).toFixed(1)
        : '0';
    return { total, geverifieerd, conflicten, avgBronnen };
  }, [events]);

  // Selected event for detail view
  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId) || null
    : null;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginatedEvents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedEvents.map((e) => e.id)));
    }
  }

  // If detail view
  if (selectedEvent) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
                <Music className="h-5 w-5" />
              </div>
              Event Verificatie
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Vergelijk brondata en bepaal de definitieve conclusie
            </p>
          </div>
        </div>

        <SubNav current="/escal/scrapers/verificatie" />

        <DetailView
          event={selectedEvent}
          onBack={() => setSelectedEventId(null)}
          onApprove={() => {
            updateEvent(selectedEvent.id, { status: 'geverifieerd' });
          }}
          onDelete={() => {
            deleteEvent(selectedEvent.id);
            setSelectedEventId(null);
          }}
          onUpdateEigen={(key, value) => {
            const newEigen = { ...selectedEvent.eigen, [key]: key === 'lineup' || key === 'stages' ? value.split(',').map((s) => s.trim()) : value };
            updateEvent(selectedEvent.id, { eigen: newEigen });
          }}
          onUpdateConclusie={(key, value) => {
            const newConclusie = { ...selectedEvent.conclusie, [key]: key === 'lineup' || key === 'stages' ? value.split(',').map((s) => s.trim()) : value };
            updateEvent(selectedEvent.id, { conclusie: newConclusie });
          }}
        />
      </div>
    );
  }

  // Overview list
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Event Verificatie
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Controleer en verifieer gescrapte event data van meerdere bronnen
          </p>
        </div>
      </div>

      <SubNav current="/escal/scrapers/verificatie" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Totaal events', value: stats.total, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Geverifieerd', value: stats.geverifieerd, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Conflicten', value: stats.conflicten, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Gem. bronnen', value: stats.avgBronnen, color: 'text-blue-600 dark:text-blue-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op naam, venue, artiest..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-64 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">Alle statussen</option>
            <option value="geverifieerd">Geverifieerd</option>
            <option value="conflict">Conflict</option>
            <option value="nieuw">Nieuw</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">Alle bronnen</option>
            <option value="ra">Resident Advisor</option>
            <option value="djguide">DJ Guide</option>
            <option value="partyflock">Partyflock</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="date">Sorteer op datum</option>
            <option value="name">Sorteer op naam</option>
            <option value="score">Sorteer op match score</option>
            <option value="sources">Sorteer op bronnen</option>
          </select>

          {/* Multiple sources checkbox */}
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={multipleSources}
              onChange={(e) => {
                setMultipleSources(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            Meerdere bronnen
          </label>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
            {selected.size} geselecteerd
          </span>
          <button
            onClick={() => {
              bulkApprove(Array.from(selected));
              setSelected(new Set());
            }}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Goedkeuren
          </button>
          <button
            onClick={() => {
              bulkDelete(Array.from(selected));
              setSelected(new Set());
            }}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400"
          >
            Verwijderen
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded p-1 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShieldCheck className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Geen events gevonden
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size === paginatedEvents.length && paginatedEvents.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Event naam
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Datum
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Bronnen
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Match Score
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actie
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => {
                    const sourcesArr = Object.keys(event.sources) as (keyof typeof event.sources)[];
                    return (
                      <tr
                        key={event.id}
                        className="group border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(event.id)}
                            onChange={() => toggleSelect(event.id)}
                            className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="max-w-[250px] truncate px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {event.conclusie.name}
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {event.conclusie.venue}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(event.conclusie.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {sourcesArr.map((src) => (
                              <SourceBadge key={src} source={src} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                className={`h-full rounded-full ${
                                  event.matchScore >= 95
                                    ? 'bg-emerald-500'
                                    : event.matchScore >= 85
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${event.matchScore}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {event.matchScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={event.status} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedEventId(event.id)}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
                          >
                            Bekijk
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredEvents.length} events &middot; pagina {page} van {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
