'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, HeartPulse, Bell, Settings } from 'lucide-react';
import HealthScore from './health-score';
import CheckResults, { type HealthCheck } from './check-results';
import HealthHistory from './health-history';
import SettingsPanel from './settings-panel';
import NotificationsPanel from './notifications-panel';

interface HistoryPoint {
  date: string;
  score: number;
}

export default function HealthPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [lastChecked, setLastChecked] = useState('Nog niet uitgevoerd');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load history and notifications on mount
  useEffect(() => {
    loadHistory();
    loadUnreadCount();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/health/history?days=30');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/health/notifications?action=count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const runChecks = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/health/run', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      const result = await response.json();

      setChecks(result.checks || []);
      setOverallScore(result.overallScore || 0);
      setLastChecked('zojuist');

      // Reload history and notifications to include the new check
      await loadHistory();
      await loadUnreadCount();
    } catch (err) {
      console.error('Health check error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Health Checks
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Notificaties"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Instellingen"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Run checks button */}
          <button
            onClick={runChecks}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Checks uitvoeren"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`}
            />
            {isRunning ? 'Bezig...' : 'Run Checks'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-400">
            Fout bij uitvoeren van checks: {error}
          </p>
        </div>
      )}

      {/* Health score circle */}
      <div className="flex justify-center rounded-xl border border-slate-200 bg-white py-10 dark:border-slate-700 dark:bg-slate-800/50">
        <HealthScore score={overallScore} lastChecked={lastChecked} />
      </div>

      {/* History chart */}
      {history.length > 0 && <HealthHistory data={history} />}

      {/* Check results grid */}
      {checks.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
            Check Resultaten
          </h2>
          <CheckResults checks={checks} />
        </div>
      )}

      {/* Empty state */}
      {checks.length === 0 && !isRunning && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <HeartPulse className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
            Geen checks uitgevoerd
          </h3>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Klik op &quot;Run Checks&quot; om de health checks uit te voeren
          </p>
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUpdate={loadUnreadCount}
      />
    </div>
  );
}
