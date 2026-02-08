'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, BellOff, Save, X } from 'lucide-react';

interface NotificationConfig {
  enabled: boolean;
  notifyOnFail: boolean;
  notifyOnWarn: boolean;
  notifyOnScoreDrops: boolean;
  scoreDropThreshold: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [config, setConfig] = useState<NotificationConfig>({
    enabled: true,
    notifyOnFail: true,
    notifyOnWarn: true,
    notifyOnScoreDrops: true,
    scoreDropThreshold: 10,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/health/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/health/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Health Check Instellingen
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Notificaties
            </h3>

            {/* Enable/Disable All */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
              />
              <div className="flex items-center gap-2">
                {config.enabled ? (
                  <Bell className="h-4 w-4 text-indigo-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-slate-400" />
                )}
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Notificaties inschakelen
                </span>
              </div>
            </label>

            {config.enabled && (
              <div className="ml-7 space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                {/* Notify on Fail */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.notifyOnFail}
                    onChange={(e) =>
                      setConfig({ ...config, notifyOnFail: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Bij mislukte checks
                  </span>
                </label>

                {/* Notify on Warn */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.notifyOnWarn}
                    onChange={(e) =>
                      setConfig({ ...config, notifyOnWarn: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Bij waarschuwingen
                  </span>
                </label>

                {/* Notify on Score Drop */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.notifyOnScoreDrops}
                    onChange={(e) =>
                      setConfig({ ...config, notifyOnScoreDrops: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Bij score daling
                  </span>
                </label>

                {/* Score Drop Threshold */}
                {config.notifyOnScoreDrops && (
                  <div className="ml-7">
                    <label className="block text-xs text-slate-500 dark:text-slate-400">
                      Drempelwaarde voor notificatie
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={config.scoreDropThreshold}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          scoreDropThreshold: parseInt(e.target.value, 10),
                        })
                      }
                      className="mt-1 w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                    />
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      punten
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auto-run Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Automatisch uitvoeren
            </h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Om health checks automatisch uit te voeren na elke deploy, voeg het volgende
                toe aan je CI/CD pipeline:
              </p>
              <pre className="mt-3 overflow-x-auto rounded bg-slate-800 p-3 text-xs text-slate-100">
                {`# .github/workflows/deploy.yml
- name: Run Health Checks
  run: |
    curl -X POST https://your-domain.com/api/health/run`}
              </pre>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>

            {saved && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Opgeslagen!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
