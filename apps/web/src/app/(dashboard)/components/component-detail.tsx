'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Link, FolderOpen, Save, Loader2 } from 'lucide-react';
import type { ComponentItem, ComponentStatus } from './page';
import { updateComponent, deleteComponent } from '@vibe/shared/lib/api';

interface ComponentDetailProps {
  component: ComponentItem;
  allComponents: ComponentItem[];
  onClose: () => void;
  onUpdate: (component: ComponentItem) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
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

const TYPE_COLORS: Record<string, string> = {
  ui: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/50 dark:text-violet-400 dark:ring-violet-500/30',
  layout: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-400 dark:ring-sky-500/30',
  feature: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/50 dark:text-orange-400 dark:ring-orange-500/30',
  page: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-500/30',
};

const TOKEN_SWATCHES: Record<string, string> = {
  '--color-primary': '#4f46e5',
  '--color-accent': '#f59e0b',
  '--color-surface': '#f8fafc',
  '--color-muted': '#94a3b8',
  '--color-text': '#0f172a',
  '--color-border': '#e2e8f0',
  '--color-error': '#ef4444',
  '--spacing-sm': '#a1a1aa',
  '--spacing-md': '#71717a',
  '--spacing-lg': '#52525b',
  '--radius-lg': '#3f3f46',
  '--font-heading': '#6366f1',
};

export function ComponentDetail({
  component,
  allComponents,
  onClose,
  onUpdate,
  onDelete,
  onRefresh,
}: ComponentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [description, setDescription] = useState(component.description);
  const [status, setStatus] = useState<ComponentStatus>(component.status);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDescription(component.description);
    setStatus(component.status);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setError(null);
  }, [component.id, component.description, component.status]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    return () => setIsVisible(false);
  }, []);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const result = await updateComponent(component.id, {
        description,
        status,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Update local state
      onUpdate({ ...component, description, status });
      setIsEditing(false);

      // Refresh the full list to ensure consistency
      onRefresh();
    } catch (err) {
      console.error('Error updating component:', err);
      setError(err instanceof Error ? err.message : 'Failed to update component');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setDescription(component.description);
    setStatus(component.status);
    setIsEditing(false);
    setError(null);
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteComponent(component.id);

      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }

      // Update local state and close
      onDelete(component.id);
      handleClose();
    } catch (err) {
      console.error('Error deleting component:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete component');
      setIsDeleting(false);
    }
  }

  const statusCfg = STATUS_CONFIG[component.status];
  const typeColor = TYPE_COLORS[component.type] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-500/30';

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

  const sectionLabelClass =
    'mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Panel */}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out dark:border-slate-700 dark:bg-slate-900 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Panel Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {component.name}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCfg.badgeClass}`}
                  >
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                    {statusCfg.label}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${typeColor}`}
                  >
                    {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="ml-4 rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Panel Body */}
          <div className="flex-1 space-y-6 px-6 py-5">
            {/* Description */}
            <section>
              <h3 className={sectionLabelClass}>Beschrijving</h3>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {component.description}
                </p>
              )}
            </section>

            {/* Status (editable) */}
            {isEditing && (
              <section>
                <h3 className={sectionLabelClass}>Status</h3>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComponentStatus)}
                  className={inputClass}
                >
                  <option value="planned">Gepland</option>
                  <option value="in_progress">In progress</option>
                  <option value="working">Werkend</option>
                  <option value="broken">Kapot</option>
                  <option value="needs_review">Needs review</option>
                </select>
              </section>
            )}

            {/* Category */}
            <section>
              <h3 className={sectionLabelClass}>Categorie</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{component.category}</p>
            </section>

            {/* File Path */}
            <section>
              <h3 className={sectionLabelClass}>Bestandspad</h3>
              <div className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <FolderOpen className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <code className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
                  {component.filePath}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(component.filePath)}
                  className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition-all duration-150 hover:text-slate-600 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-slate-300"
                  title="Kopieer pad"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            {/* Props */}
            {component.props && component.props.length > 0 && (
              <section>
                <h3 className={sectionLabelClass}>
                  Props
                  <span className="ml-1 text-slate-300 dark:text-slate-600">
                    ({component.props.length})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {component.props.map((prop) => (
                    <span
                      key={prop}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {prop}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Tokens */}
            {component.tokens && component.tokens.length > 0 && (
              <section>
                <h3 className={sectionLabelClass}>
                  Tokens
                  <span className="ml-1 text-slate-300 dark:text-slate-600">
                    ({component.tokens.length})
                  </span>
                </h3>
                <div className="space-y-1.5">
                  {component.tokens.map((token) => (
                    <div
                      key={token}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <span
                        className="inline-block h-4 w-4 shrink-0 rounded border border-slate-200 dark:border-slate-600"
                        style={{ backgroundColor: TOKEN_SWATCHES[token] ?? '#a1a1aa' }}
                      />
                      <code className="text-xs text-slate-600 dark:text-slate-400">{token}</code>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dependencies: Uses */}
            <section>
              <h3 className={sectionLabelClass}>
                Gebruikt
                {component.dependencies.length > 0 && (
                  <span className="ml-1 text-slate-300 dark:text-slate-600">
                    ({component.dependencies.length})
                  </span>
                )}
              </h3>
              {component.dependencies.length > 0 ? (
                <div className="space-y-1.5">
                  {component.dependencies.map((dep) => {
                    const depComp = allComponents.find((c) => c.name === dep);
                    const depStatus = depComp ? STATUS_CONFIG[depComp.status] : null;
                    return (
                      <div
                        key={dep}
                        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                      >
                        {depStatus && (
                          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${depStatus.dotClass}`} />
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {dep}
                        </span>
                        {depComp && (
                          <code className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                            {depComp.filePath}
                          </code>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  Geen afhankelijkheden
                </p>
              )}
            </section>

            {/* Dependents: Used by */}
            <section>
              <h3 className={sectionLabelClass}>
                Gebruikt door
                {component.dependents.length > 0 && (
                  <span className="ml-1 text-slate-300 dark:text-slate-600">
                    ({component.dependents.length})
                  </span>
                )}
              </h3>
              {component.dependents.length > 0 ? (
                <div className="space-y-1.5">
                  {component.dependents.map((dep) => {
                    const depComp = allComponents.find((c) => c.name === dep);
                    const depStatus = depComp ? STATUS_CONFIG[depComp.status] : null;
                    return (
                      <div
                        key={dep}
                        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                      >
                        {depStatus && (
                          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${depStatus.dotClass}`} />
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {dep}
                        </span>
                        {depComp && (
                          <code className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                            {depComp.filePath}
                          </code>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  Niet gebruikt door andere componenten
                </p>
              )}
            </section>

            {/* Created by prompt */}
            {component.createdByPrompt && (
              <section>
                <h3 className={sectionLabelClass}>Aangemaakt via prompt</h3>
                <a
                  href={`#prompt-${component.createdByPrompt}`}
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 transition-colors duration-150 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Link className="h-3.5 w-3.5" />
                  Prompt #{component.createdByPrompt}
                </a>
              </section>
            )}

            {/* Last Modified */}
            {component.lastModified && (
              <section>
                <h3 className={sectionLabelClass}>Laatst gewijzigd</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {component.lastModified}
                </p>
              </section>
            )}
          </div>

          {/* Panel Footer */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            {showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Weet je het zeker?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Verwijderen
                  </button>
                </div>
              </div>
            ) : isEditing ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Verwijderen
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Opslaan...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Opslaan
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Verwijderen
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Bewerken
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
