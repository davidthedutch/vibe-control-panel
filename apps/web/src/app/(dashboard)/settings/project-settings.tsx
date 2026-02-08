'use client';

import { useState, useEffect } from 'react';
import { Globe, Save, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface ProjectData {
  name: string;
  description: string;
  status: 'planning' | 'in_development' | 'live' | 'maintenance';
  urls: {
    production: string;
    staging: string;
    development: string;
  };
  techStack: {
    framework: string;
    styling: string;
    database: string;
    auth: string;
    deployment: string;
  };
}

const statusLabels: Record<ProjectData['status'], string> = {
  planning: 'Planning',
  in_development: 'In ontwikkeling',
  live: 'Live',
  maintenance: 'Onderhoud',
};

const statusColors: Record<ProjectData['status'], string> = {
  planning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_development: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  live: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  maintenance: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const defaultProject: ProjectData = {
  name: 'Vibe Control Panel',
  description:
    'Een dashboard voor het beheren van vibe-coded websites. Biedt inzicht in componenten, features, design tokens, SEO en meer.',
  status: 'in_development',
  urls: {
    production: 'https://vibe-cp.vercel.app',
    staging: 'https://staging.vibe-cp.vercel.app',
    development: 'http://localhost:3000',
  },
  techStack: {
    framework: 'Next.js 15',
    styling: 'Tailwind CSS 4',
    database: 'Supabase',
    auth: 'Clerk',
    deployment: 'Vercel',
  },
};

export default function ProjectSettings() {
  const { data, loading, save, saving } = useSettings<ProjectData>('project', defaultProject);
  const [project, setProject] = useState<ProjectData>(defaultProject);
  const [saved, setSaved] = useState(false);

  // Sync data from API to local state
  useEffect(() => {
    if (data) {
      setProject(data);
    }
  }, [data]);

  async function handleSave() {
    try {
      await save(project);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save project settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  }

  function updateField<K extends keyof ProjectData>(key: K, value: ProjectData[K]) {
    setProject((prev) => ({ ...prev, [key]: value }));
  }

  function updateUrl(key: keyof ProjectData['urls'], value: string) {
    setProject((prev) => ({
      ...prev,
      urls: { ...prev.urls, [key]: value },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Info */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Project informatie
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Projectnaam
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Beschrijving
            </label>
            <textarea
              rows={3}
              value={project.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
              Status
            </label>
            <div className="flex items-center gap-3">
              <select
                value={project.status}
                onChange={(e) =>
                  updateField('status', e.target.value as ProjectData['status'])
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
              >
                {statusLabels[project.status]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* URLs */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Globe className="h-5 w-5 text-slate-400" />
          URLs
        </h3>
        <div className="space-y-4">
          {(
            [
              ['production', 'Production'],
              ['staging', 'Staging'],
              ['development', 'Development'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
                {label}
              </label>
              <input
                type="url"
                value={project.urls[key]}
                onChange={(e) => updateUrl(key, e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Tech Stack
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(project.techStack).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-sm font-medium capitalize text-slate-500 dark:text-slate-400">
                {key}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
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
  );
}
