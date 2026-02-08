'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { getComponents } from '@vibe/shared/lib/api';
import type { Component } from '@vibe/shared/types';

type FeatureStatus = 'planned' | 'in_progress' | 'working' | 'broken';
type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';
type ActionStatus = 'planned' | 'working' | 'broken';

interface NewAction {
  trigger: string;
  behavior: string;
  inputData: string;
  outputResult: string;
  errorHandling: string;
  status: ActionStatus;
}

interface NewFeatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (feature: {
    name: string;
    description: string;
    status: FeatureStatus;
    priority: FeaturePriority;
    actions: NewAction[];
    userFlowSteps: string[];
    componentIds: string[];
  }) => void;
  saving?: boolean;
  projectId: string;
}

export default function NewFeatureDialog({ open, onClose, onSave, saving = false, projectId }: NewFeatureDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<FeatureStatus>('planned');
  const [priority, setPriority] = useState<FeaturePriority>('medium');
  const [actions, setActions] = useState<NewAction[]>([]);
  const [userFlowSteps, setUserFlowSteps] = useState<string[]>([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // Load available components
  useEffect(() => {
    if (open) {
      loadComponents();
    }
  }, [open, projectId]);

  const loadComponents = async () => {
    setLoadingComponents(true);
    const result = await getComponents(projectId);
    if (result.data) {
      setAvailableComponents(result.data);
    }
    setLoadingComponents(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('planned');
    setPriority('medium');
    setActions([]);
    setUserFlowSteps([]);
    setSelectedComponentIds([]);
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleSave = () => {
    if (!name.trim() || saving) return;
    onSave({
      name,
      description,
      status,
      priority,
      actions,
      userFlowSteps,
      componentIds: selectedComponentIds,
    });
    resetForm();
  };

  const addAction = () => {
    setActions([...actions, {
      trigger: '',
      behavior: '',
      inputData: '',
      outputResult: '',
      errorHandling: '',
      status: 'planned',
    }]);
  };

  const updateAction = (index: number, field: keyof NewAction, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    setActions(updated);
  };

  const toggleComponent = (componentId: string) => {
    setSelectedComponentIds((prev) =>
      prev.includes(componentId)
        ? prev.filter((id) => id !== componentId)
        : [...prev, componentId]
    );
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const addFlowStep = () => {
    setUserFlowSteps([...userFlowSteps, '']);
  };

  const updateFlowStep = (index: number, value: string) => {
    const updated = [...userFlowSteps];
    updated[index] = value;
    setUserFlowSteps(updated);
  };

  const removeFlowStep = (index: number) => {
    setUserFlowSteps(userFlowSteps.filter((_, i) => i !== index));
  };

  if (!open) return null;

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

  const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Nieuwe feature
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Name */}
          <div>
            <label htmlFor="feature-name" className={labelClass}>
              Naam
            </label>
            <input
              id="feature-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Contact Formulier"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="feature-description" className={labelClass}>
              Beschrijving
            </label>
            <textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Wat doet deze feature?"
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="feature-status" className={labelClass}>
                Status
              </label>
              <select
                id="feature-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as FeatureStatus)}
                className={selectClass}
              >
                <option value="planned">Gepland</option>
                <option value="in_progress">In ontwikkeling</option>
                <option value="working">Werkend</option>
                <option value="broken">Kapot</option>
              </select>
            </div>
            <div>
              <label htmlFor="feature-priority" className={labelClass}>
                Prioriteit
              </label>
              <select
                id="feature-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as FeaturePriority)}
                className={selectClass}
              >
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
                <option value="critical">Kritiek</option>
              </select>
            </div>
          </div>

          {/* Components */}
          <div>
            <label className={labelClass}>Gekoppelde componenten</label>
            {loadingComponents ? (
              <div className="rounded-lg border border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Componenten laden...
              </div>
            ) : availableComponents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Nog geen componenten beschikbaar.
              </div>
            ) : (
              <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <div className="space-y-1">
                  {availableComponents.map((component) => (
                    <label
                      key={component.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedComponentIds.includes(component.id)}
                        onChange={() => toggleComponent(component.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{component.name}</span>
                      <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                        {component.type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass + ' mb-0'}>Acties</label>
              <button
                type="button"
                onClick={addAction}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition-colors duration-150 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <Plus className="h-3.5 w-3.5" />
                Actie toevoegen
              </button>
            </div>

            {actions.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Nog geen acties. Klik op &ldquo;Actie toevoegen&rdquo; om te beginnen.
              </p>
            )}

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Actie {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="rounded p-1 text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      aria-label={`Actie ${index + 1} verwijderen`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={action.trigger}
                      onChange={(e) => updateAction(index, 'trigger', e.target.value)}
                      placeholder="Trigger (bijv. Klik op knop)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={action.behavior}
                      onChange={(e) => updateAction(index, 'behavior', e.target.value)}
                      placeholder="Gedrag (bijv. Opent dialoogvenster)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={action.inputData}
                      onChange={(e) => updateAction(index, 'inputData', e.target.value)}
                      placeholder="Input data (bijv. User ID, form values)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={action.outputResult}
                      onChange={(e) => updateAction(index, 'outputResult', e.target.value)}
                      placeholder="Output result (bijv. Success message, redirect)"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={action.errorHandling}
                      onChange={(e) => updateAction(index, 'errorHandling', e.target.value)}
                      placeholder="Error handling (bijv. Show error toast)"
                      className={inputClass}
                    />
                    <select
                      value={action.status}
                      onChange={(e) => updateAction(index, 'status', e.target.value)}
                      className={selectClass}
                    >
                      <option value="planned">Gepland</option>
                      <option value="working">Werkend</option>
                      <option value="broken">Kapot</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Flow Steps */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass + ' mb-0'}>User flow stappen</label>
              <button
                type="button"
                onClick={addFlowStep}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition-colors duration-150 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <Plus className="h-3.5 w-3.5" />
                Stap toevoegen
              </button>
            </div>

            {userFlowSteps.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Nog geen stappen. Klik op &ldquo;Stap toevoegen&rdquo; om te beginnen.
              </p>
            )}

            <div className="space-y-2">
              {userFlowSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateFlowStep(index, e.target.value)}
                    placeholder={`Stap ${index + 1}`}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeFlowStep(index)}
                    className="shrink-0 rounded p-1 text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    aria-label={`Stap ${index + 1} verwijderen`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}
