'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Trash2, Key, Loader2, Save, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface Secret {
  id: string;
  key: string;
  value: string;
  description?: string;
}

const defaultSecrets: Secret[] = [];

export default function SecretsManager() {
  const { data, loading, save, saving } = useSettings<Secret[]>('secrets', defaultSecrets);
  const [secrets, setSecrets] = useState<Secret[]>(defaultSecrets);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync data from API to local state
  useEffect(() => {
    if (data) {
      setSecrets(data);
    }
  }, [data]);

  async function handleSave() {
    try {
      await save(secrets);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save secrets:', error);
      alert('Failed to save secrets. Please try again.');
    }
  }

  function toggleVisibility(id: string) {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function deleteSecret(id: string) {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  }

  function addSecret() {
    if (!newKey.trim() || !newValue.trim()) return;
    setSecrets((prev) => [
      ...prev,
      {
        id: `secret-${Date.now()}`,
        key: newKey.trim(),
        value: newValue.trim(),
        description: newDescription.trim(),
      },
    ]);
    setNewKey('');
    setNewValue('');
    setNewDescription('');
    setShowNewForm(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Security Notice
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            Secrets are encrypted but should never be exposed in client-side code. Use
            environment variables for production. This manager is for development only.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {secrets.length}
          </span>{' '}
          {secrets.length === 1 ? 'secret' : 'secrets'} configured
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add Secret
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* New Secret Form */}
      {showNewForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
          <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Add New Secret
          </h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Key
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. NEXT_PUBLIC_API_KEY"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Value
              </label>
              <input
                type="password"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Secret value"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Description (optional)
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What is this secret for?"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addSecret}
                disabled={!newKey.trim() || !newValue.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Secret
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewKey('');
                  setNewValue('');
                  setNewDescription('');
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secrets List */}
      {secrets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Key className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            No secrets configured
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            Add your first secret to get started
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
          {secrets.map((secret) => (
            <div
              key={secret.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-750"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium text-slate-800 dark:text-slate-100">
                      {secret.key}
                    </p>
                    {secret.description && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {secret.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type={visibleSecrets.has(secret.id) ? 'text' : 'password'}
                    value={secret.value}
                    readOnly
                    className="min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                  />
                  <button
                    onClick={() => toggleVisibility(secret.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    aria-label={
                      visibleSecrets.has(secret.id) ? 'Hide secret' : 'Show secret'
                    }
                  >
                    {visibleSecrets.has(secret.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSecret(secret.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    aria-label={`Delete secret: ${secret.key}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Environment Variables Guide */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Using Environment Variables
        </h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>Add these to your .env.local file:</p>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900">
            {secrets.length > 0
              ? secrets.map((s) => `${s.key}="${s.value}"`).join('\n')
              : '# No secrets configured yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}
