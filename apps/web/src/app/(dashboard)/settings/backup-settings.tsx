'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileJson, Archive, Clock, HardDrive, CheckCircle } from 'lucide-react';

interface BackupState {
  lastBackup: string;
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

const frequencyLabels: Record<BackupState['frequency'], string> = {
  daily: 'Dagelijks',
  weekly: 'Wekelijks',
  monthly: 'Maandelijks',
};

export default function BackupSettings() {
  const [backup, setBackup] = useState<BackupState>({
    lastBackup: '2026-02-06T14:32:00',
    autoBackup: true,
    frequency: 'weekly',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExportZip() {
    setExportingZip(true);
    try {
      // Fetch all settings
      const response = await fetch('/api/settings?projectId=default');
      const allSettings = await response.json();

      // Create a comprehensive backup object
      const backup = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          projectName: allSettings.project?.name || 'Vibe Control Panel',
        },
        settings: allSettings,
      };

      // In a real implementation, you would use JSZip library
      // For now, we'll create a JSON backup file
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibe-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Update last backup time
      setBackup(prev => ({
        ...prev,
        lastBackup: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to export backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setTimeout(() => setExportingZip(false), 1500);
    }
  }

  async function handleExportJson() {
    setExportingJson(true);
    try {
      // Fetch all settings
      const response = await fetch('/api/settings?projectId=default');
      const allSettings = await response.json();

      // Create site manifest
      const manifest = {
        project: allSettings.project?.name || 'Vibe Control Panel',
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        status: allSettings.project?.status || 'in_development',
        urls: allSettings.project?.urls || {},
        techStack: allSettings.project?.techStack || {},
        policies: {
          total: allSettings.policies?.length || 0,
          enabled: allSettings.policies?.filter((p: any) => p.enabled).length || 0,
        },
        integrations: {
          total: allSettings.integrations?.integrations?.length || 0,
          connected: allSettings.integrations?.integrations?.filter((i: any) => i.connected).length || 0,
        },
        designTokens: {
          colors: allSettings.tokens?.colors?.length || 0,
          fonts: allSettings.tokens?.fonts?.length || 0,
          spacing: allSettings.tokens?.spacing?.length || 0,
        },
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SITE_MANIFEST.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export manifest:', error);
      alert('Failed to export manifest. Please try again.');
    } finally {
      setTimeout(() => setExportingJson(false), 1000);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processImportFile(file);
    }
  }

  function handleFileSelect() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await processImportFile(file);
    }
  }

  async function processImportFile(file: File) {
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON backup file');
      return;
    }

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validate backup structure
      if (!backup.settings) {
        alert('Invalid backup file format');
        return;
      }

      // Confirm import
      const confirmed = confirm(
        `This will restore settings from ${new Date(backup.metadata?.exportedAt).toLocaleString()}. Continue?`
      );

      if (!confirmed) return;

      // Import each section
      if (backup.settings.project) {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default',
            section: 'project',
            data: backup.settings.project,
          }),
        });
      }

      if (backup.settings.tokens) {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default',
            section: 'tokens',
            data: backup.settings.tokens,
          }),
        });
      }

      if (backup.settings.policies) {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default',
            section: 'policies',
            data: backup.settings.policies,
          }),
        });
      }

      if (backup.settings.integrations) {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default',
            section: 'integrations',
            data: backup.settings.integrations,
          }),
        });
      }

      alert('Settings imported successfully! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to import backup:', error);
      alert('Failed to import backup. Please check the file and try again.');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-8">
      {/* Export Buttons */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Exporteren
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={handleExportZip}
            disabled={exportingZip}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {exportingZip ? 'Exporteren...' : 'Export project als ZIP'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alle bestanden, configuratie en assets
              </p>
            </div>
          </button>

          <button
            onClick={handleExportJson}
            disabled={exportingJson}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {exportingJson ? 'Exporteren...' : 'Export manifest als JSON'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SITE_MANIFEST.json met alle metadata
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Importeren
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/20'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isDragging
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            }`}
          >
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {isDragging ? 'Laat los om te uploaden' : 'Sleep een bestand hierheen'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              of{' '}
              <span className="text-indigo-600 underline dark:text-indigo-400">
                klik om te selecteren
              </span>{' '}
              - ZIP of JSON
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </section>

      {/* Auto-backup Settings */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <HardDrive className="h-5 w-5 text-slate-400" />
          Automatische backup
        </h3>

        <div className="space-y-5">
          {/* Last backup */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Laatste backup
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {formatDate(backup.lastBackup)}
              </p>
            </div>
          </div>

          {/* Auto-backup toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Auto-backup inschakelen
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatisch een backup maken op het ingestelde interval
              </p>
            </div>
            <button
              role="switch"
              aria-checked={backup.autoBackup}
              onClick={() =>
                setBackup((prev) => ({ ...prev, autoBackup: !prev.autoBackup }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                backup.autoBackup ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  backup.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Frequency selector */}
          {backup.autoBackup && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Frequentie
              </label>
              <div className="flex gap-2">
                {(Object.entries(frequencyLabels) as [BackupState['frequency'], string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setBackup((prev) => ({ ...prev, frequency: value }))}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        backup.frequency === value
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Backup Info */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          What gets backed up?
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Project Settings
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Name, description, URLs, tech stack
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Design Tokens
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Colors, fonts, spacing, typography
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Policy Rules
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                All custom and default policies
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Integrations
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Connection status and configuration
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
