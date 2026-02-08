'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface PolicyRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const defaultPolicies: PolicyRule[] = [
  {
    id: 'no-hardcoded-colors',
    label: 'Geen hardcoded kleuren',
    description: 'Alle kleuren moeten via design tokens worden gebruikt, geen inline hex/rgb waarden.',
    enabled: true,
  },
  {
    id: 'image-alt-text',
    label: 'Alle images moeten alt tekst hebben',
    description: 'Elke <img> en <Image> component moet een beschrijvende alt-tekst bevatten.',
    enabled: true,
  },
  {
    id: 'dependency-review',
    label: 'Geen nieuwe dependencies zonder review',
    description: 'Nieuwe npm packages moeten eerst beoordeeld worden op veiligheid en bundelgrootte.',
    enabled: true,
  },
  {
    id: 'tests-required',
    label: 'Tests verplicht bij nieuwe features',
    description: 'Elke nieuwe feature moet vergezeld gaan van unit- of integratietests.',
    enabled: false,
  },
  {
    id: 'max-lines',
    label: 'Max 200 regels per component',
    description: 'Componenten met meer dan 200 regels moeten opgesplitst worden in kleinere delen.',
    enabled: false,
  },
];

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
        enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function PoliciesEditor() {
  const { data, loading, save, saving } = useSettings<PolicyRule[]>('policies', defaultPolicies);
  const [policies, setPolicies] = useState<PolicyRule[]>(defaultPolicies);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync data from API to local state
  useEffect(() => {
    if (data) {
      setPolicies(data);
    }
  }, [data]);

  async function handleSave() {
    try {
      await save(policies);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save policies:', error);
      alert('Failed to save policies. Please try again.');
    }
  }

  function togglePolicy(id: string) {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }

  function deletePolicy(id: string) {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  }

  function addPolicy() {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setPolicies((prev) => [
      ...prev,
      {
        id: `${id}-${Date.now()}`,
        label: newLabel.trim(),
        description: newDescription.trim(),
        enabled: true,
      },
    ]);
    setNewLabel('');
    setNewDescription('');
    setShowNewForm(false);
  }

  const enabledCount = policies.filter((p) => p.enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {enabledCount}
          </span>{' '}
          van {policies.length} regels actief
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Nieuwe regel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : saved ? (
              <>
                <Save className="h-4 w-4" />
                Opgeslagen!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Opslaan
              </>
            )}
          </button>
        </div>
      </div>

      {/* New Rule Form */}
      {showNewForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
          <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Nieuwe regel toevoegen
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Regel
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Bijv. Geen inline styles"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Beschrijving (optioneel)
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Korte toelichting op de regel"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addPolicy}
                disabled={!newLabel.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Toevoegen
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewLabel('');
                  setNewDescription('');
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy List */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-750"
          >
            <div className="pt-0.5">
              <ToggleSwitch
                enabled={policy.enabled}
                onChange={() => togglePolicy(policy.id)}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  policy.enabled
                    ? 'text-slate-800 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {policy.label}
              </p>
              {policy.description && (
                <p
                  className={`mt-0.5 text-xs ${
                    policy.enabled
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                >
                  {policy.description}
                </p>
              )}
            </div>
            <button
              onClick={() => deletePolicy(policy.id)}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label={`Verwijder regel: ${policy.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
