'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, List, GitBranch, RefreshCw, AlertCircle } from 'lucide-react';
import { ComponentTable } from './component-table';
import { ComponentDetail } from './component-detail';
import { DependencyGraph } from './dependency-graph';
import { NewComponentDialog } from './new-component-dialog';
import { getComponents, getComponentDependencies } from '@vibe/shared/lib/api';
import type { Component } from '@vibe/shared/types';

export type ComponentStatus = 'working' | 'broken' | 'planned' | 'in_progress' | 'needs_review';
export type ComponentType = 'ui' | 'layout' | 'feature' | 'page';

export interface ComponentItem {
  id: string;
  name: string;
  type: ComponentType;
  category: string;
  filePath: string;
  status: ComponentStatus;
  description: string;
  dependencies: string[];
  dependents: string[];
  props?: string[];
  tokens?: string[];
  createdByPrompt?: string;
  lastModified?: string;
}

// Helper to convert API Component to ComponentItem
function componentToItem(comp: Component, deps: string[], dependents: string[]): ComponentItem {
  return {
    id: comp.id,
    name: comp.name,
    type: comp.type,
    category: comp.category,
    filePath: comp.filePath,
    status: comp.status as ComponentStatus,
    description: comp.description,
    dependencies: deps,
    dependents: dependents,
    props: comp.props.map(p => p.name),
    tokens: comp.tokensUsed,
    createdByPrompt: comp.createdByPrompt ?? undefined,
    lastModified: new Date(comp.updatedAt).toISOString().slice(0, 10),
  };
}

type ViewMode = 'list' | 'graph';
type StatusFilter = 'all' | ComponentStatus;
type TypeFilter = 'all' | ComponentType;

// TODO: Get this from user context or route params
const PROJECT_ID = 'default-project-id';

export default function ComponentsPage() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  // Fetch components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  async function loadComponents() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getComponents(PROJECT_ID);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (!result.data) {
        setComponents([]);
        setIsLoading(false);
        return;
      }

      // Build component ID to name mapping
      const idToName = new Map<string, string>();
      result.data.forEach(comp => idToName.set(comp.id, comp.name));

      // Fetch dependencies for all components
      const componentsWithDeps = await Promise.all(
        result.data.map(async (comp) => {
          // Get outgoing dependencies (components this one uses)
          const depsResult = await getComponentDependencies(comp.id, 'outgoing');
          const deps = depsResult.data?.map(d => idToName.get(d.targetId) || d.targetId) || [];

          // Get incoming dependencies (components that use this one)
          const dependentsResult = await getComponentDependencies(comp.id, 'incoming');
          const dependents = dependentsResult.data?.map(d => idToName.get(d.sourceId) || d.sourceId) || [];

          return componentToItem(comp, deps, dependents);
        })
      );

      setComponents(componentsWithDeps);
    } catch (err) {
      console.error('Error loading components:', err);
      setError(err instanceof Error ? err.message : 'Failed to load components');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    try {
      // TODO: Implement actual sync with codebase scanner
      // For now, just reload from database
      await loadComponents();
    } catch (err) {
      console.error('Sync error:', err);
      setError('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }

  const filtered = useMemo(() => {
    return components.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.filePath.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [components, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = components.length;
    const working = components.filter((c) => c.status === 'working').length;
    const broken = components.filter((c) => c.status === 'broken').length;
    const planned = components.filter((c) => c.status === 'planned').length;
    return { total, working, broken, planned };
  }, [components]);

  const selectedComponent = selectedId
    ? components.find((c) => c.id === selectedId) ?? null
    : null;

  function handleAddComponent(newComp: Omit<ComponentItem, 'id' | 'dependencies' | 'dependents' | 'lastModified'>) {
    // This will be handled by NewComponentDialog with real database insertion
    loadComponents();
  }

  function handleUpdateComponent(updated: ComponentItem) {
    setComponents((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleteComponent(id: string) {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
  }

  const statusFilterLabels: Record<StatusFilter, string> = {
    all: 'Alle',
    working: 'Werkend',
    broken: 'Kapot',
    planned: 'Gepland',
    in_progress: 'In ontwikkeling',
    needs_review: 'Review',
  };

  const typeFilterLabels: Record<TypeFilter, string> = {
    all: 'Alle',
    ui: 'UI',
    layout: 'Layout',
    feature: 'Feature',
    page: 'Page',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Componenten
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Beheer en bekijk alle componenten van je project
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Sync met codebase"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Nieuw component
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Fout bij laden van componenten</p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={loadComponents}
            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw className="h-10 w-10 animate-spin text-slate-400 dark:text-slate-500" />
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            Componenten laden...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.total}</span>
                <span className="text-slate-500 dark:text-slate-400">totaal</span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{stats.working}</span>
                <span className="text-slate-500 dark:text-slate-400">werkend</span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{stats.broken}</span>
                <span className="text-slate-500 dark:text-slate-400">kapot</span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{stats.planned}</span>
                <span className="text-slate-500 dark:text-slate-400">gepland</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Status
                </span>
                <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                  {(['all', 'working', 'broken', 'planned'] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                        statusFilter === s
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                      }`}
                    >
                      {statusFilterLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Type
                </span>
                <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                  {(['all', 'ui', 'layout', 'feature', 'page'] as TypeFilter[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                        typeFilter === t
                          ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                      }`}
                    >
                      {typeFilterLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 transition-colors duration-150 ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                title="Lijstweergave"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`rounded-md p-1.5 transition-colors duration-150 ${
                  viewMode === 'graph'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                title="Grafiekweergave"
              >
                <GitBranch className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === 'list' ? (
            <ComponentTable
              components={filtered}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          ) : (
            <DependencyGraph
              components={components}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
        </>
      )}

      {/* Detail Slide-over */}
      {selectedComponent && (
        <ComponentDetail
          component={selectedComponent}
          allComponents={components}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdateComponent}
          onDelete={handleDeleteComponent}
          onRefresh={loadComponents}
        />
      )}

      {/* New Component Dialog */}
      {showNewDialog && (
        <NewComponentDialog
          onClose={() => setShowNewDialog(false)}
          onAdd={handleAddComponent}
        />
      )}
    </div>
  );
}
