'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import {
  getFeatures,
  createFeature,
  updateFeature,
  setFeatureComponents,
  getFeatureComponents,
} from '@vibe/shared/lib/api';
import type { Feature } from '@vibe/shared/types';
import FeatureStats from './feature-stats';
import FeatureList from './feature-list';
import NewFeatureDialog from './new-feature-dialog';

// Hardcoded project ID - in production, get from context or route
const PROJECT_ID = 'default-project';

// --- Page ---

export default function FeaturesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load features on mount
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);
    const result = await getFeatures(PROJECT_ID);
    if (result.error) {
      setError(result.error);
    } else {
      // Load features with their component relationships
      const featuresWithComponents = await Promise.all(
        (result.data || []).map(async (feature) => {
          const componentsResult = await getFeatureComponents(feature.id);
          return {
            ...feature,
            components: componentsResult.data || [],
          };
        })
      );
      setFeatures(featuresWithComponents);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const total = features.length;
    const working = features.filter((f) => f.status === 'working').length;
    const broken = features.filter((f) => f.status === 'broken').length;
    const planned = features.filter(
      (f) => f.status === 'planned' || f.status === 'in_progress'
    ).length;
    return { total, working, broken, planned };
  }, [features]);

  const handleSaveFeature = async (newFeature: {
    name: string;
    description: string;
    status: string;
    priority: string;
    actions: { trigger: string; behavior: string; inputData: string; outputResult: string; errorHandling: string; status: string }[];
    userFlowSteps: string[];
    componentIds: string[];
  }) => {
    setSaving(true);
    setError(null);

    const featureData: Omit<Feature, 'id' | 'createdAt' | 'updatedAt' | 'components'> = {
      projectId: PROJECT_ID,
      name: newFeature.name,
      description: newFeature.description,
      status: newFeature.status as Feature['status'],
      priority: newFeature.priority as Feature['priority'],
      actions: newFeature.actions.map((a) => ({
        id: `action-${Date.now()}-${Math.random()}`,
        trigger: a.trigger,
        behavior: a.behavior,
        inputData: a.inputData || '',
        outputResult: a.outputResult || '',
        errorHandling: a.errorHandling || '',
        status: a.status as 'planned' | 'working' | 'broken',
        testedOn: null,
      })),
      userFlows: newFeature.userFlowSteps.length > 0
        ? [
            {
              name: 'Standaard flow',
              steps: newFeature.userFlowSteps.filter((s) => s.trim() !== ''),
              happyPath: true,
              edgeCases: [],
            },
          ]
        : [],
      createdByPrompt: null,
    };

    const result = await createFeature(featureData);

    if (result.error) {
      setError(`Fout bij opslaan: ${result.error}`);
      setSaving(false);
      return;
    }

    if (result.data) {
      // Link components to the feature
      if (newFeature.componentIds.length > 0) {
        await setFeatureComponents(result.data.id, newFeature.componentIds);
      }

      setFeatures((prev) => [
        ...prev,
        { ...result.data!, components: newFeature.componentIds },
      ]);
    }

    setSaving(false);
  };

  const handleUpdateFeature = async (featureId: string, updates: Partial<Feature>) => {
    const result = await updateFeature(featureId, updates);

    if (result.error) {
      setError(`Fout bij bijwerken: ${result.error}`);
      return;
    }

    if (result.data) {
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? result.data! : f))
      );
    }
  };

  const handleReorder = async (reorderedFeatures: Feature[]) => {
    // Optimistically update UI
    setFeatures(reorderedFeatures);
    // In a real implementation, you might save the order to the database
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Features &amp; Acties
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overzicht van alle features, hun acties en user flows.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nieuwe feature</span>
          <span className="sm:hidden">Nieuw</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Er is een fout opgetreden</p>
            <p className="mt-1 text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Features laden...
          </p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <FeatureStats
            total={stats.total}
            working={stats.working}
            broken={stats.broken}
            planned={stats.planned}
          />

          {/* Feature list */}
          <FeatureList
            features={features}
            onReorder={handleReorder}
            onUpdate={handleUpdateFeature}
            projectId={PROJECT_ID}
          />
        </>
      )}

      {/* New feature dialog */}
      <NewFeatureDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveFeature}
        saving={saving}
        projectId={PROJECT_ID}
      />
    </div>
  );
}
