'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  Bot,
  TrendingUp,
  Activity,
  Radio,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Star,
  EyeOff,
  Loader2,
  Music,
  ShieldCheck,
} from 'lucide-react';
import { useEscalEvents, type EscalEvent } from '@/lib/hooks/use-escal-data';

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
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: EscalEvent['status'] }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    past: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Source Badge
// ---------------------------------------------------------------------------

function SourceBadge({ source }: { source: EscalEvent['source'] }) {
  const styles = {
    ra: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    partyflock: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    djguide: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    manual: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };

  const labels = {
    ra: 'RA',
    partyflock: 'Partyflock',
    djguide: 'DJ Guide',
    manual: 'Manual',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[source]}`}>
      {labels[source]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Event Row
// ---------------------------------------------------------------------------

function EventRow({ event, selected, onSelect }: { event: EscalEvent; selected: boolean; onSelect: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <td className="py-3 pl-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
        />
      </td>
      <td className="py-3 pr-4">
        <Link href={`/escal/events/${event.id}`} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Music className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 group-hover:text-orange-600 dark:text-slate-100 dark:group-hover:text-orange-400">
              {event.title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {event.venue_name}, {event.venue_city}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm text-slate-900 dark:text-slate-100">{formatDate(event.start_date)}</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {event.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {genre}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-medium text-emerald-600 dark:text-emerald-400">{event.going_count}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-amber-600 dark:text-amber-400">{event.interested_count}</span>
      </td>
      <td className="py-3 px-4">
        <SourceBadge source={event.source} />
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={event.status} />
      </td>
      <td className="py-3 px-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <Link
                  href={`/escal/events/${event.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                  <Star className="h-4 w-4" />
                  Feature Event
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                  <EyeOff className="h-4 w-4" />
                  Hide Event
                </button>
                <hr className="my-1 border-slate-100 dark:border-slate-700" />
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const { events, total, loading, refetch } = useEscalEvents({
    status: statusFilter,
    source: sourceFilter,
    search,
    page,
    limit: 10,
  });

  const totalPages = Math.ceil(total / 10);

  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map((e) => e.id)));
    }
  };

  const handleSelectEvent = (id: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEvents(newSelected);
  };

  const handleExport = () => {
    // In production, this would generate a CSV
    const csv = events
      .map((e) => `${e.title},${e.venue_name},${e.start_date},${e.going_count},${e.interested_count}`)
      .join('\n');
    const blob = new Blob([`Title,Venue,Date,Going,Interested\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escal-events.csv';
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Events Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage and monitor all events in the platform
          </p>
        </div>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal/events" />

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All Sources</option>
            <option value="ra">Resident Advisor</option>
            <option value="partyflock">Partyflock</option>
            <option value="djguide">DJ Guide</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {selectedEvents.size > 0 && (
            <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" />
              Delete ({selectedEvents.size})
            </button>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {events.length} of {total} events
      </p>

      {/* Events Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="py-3 pl-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEvents.size === events.length && events.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Event
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Genres
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Going
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interested
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Source
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    selected={selectedEvents.has(event.id)}
                    onSelect={() => handleSelectEvent(event.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
