'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Play, FileText, MousePointerClick, TrendingDown } from 'lucide-react';
import { analyzeFunnel, type FunnelStep, type FunnelAnalysis } from '@/lib/analytics';

interface FunnelBuilderProps {
  projectId: string;
  range: number;
}

export default function FunnelBuilder({ projectId, range }: FunnelBuilderProps) {
  const [steps, setSteps] = useState<FunnelStep[]>([
    { id: '1', name: 'Homepage bezoek', type: 'page', value: '/', order: 0 },
    { id: '2', name: 'Product pagina', type: 'page', value: '/product', order: 1 },
    { id: '3', name: 'Checkout', type: 'page', value: '/checkout', order: 2 },
  ]);

  const [analysis, setAnalysis] = useState<FunnelAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // New step form state
  const [newStepName, setNewStepName] = useState('');
  const [newStepType, setNewStepType] = useState<'page' | 'event'>('page');
  const [newStepValue, setNewStepValue] = useState('');

  async function handleAnalyze() {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFunnel(projectId, steps, range);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing funnel:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAddStep() {
    if (!newStepName.trim() || !newStepValue.trim()) return;

    const newStep: FunnelStep = {
      id: Date.now().toString(),
      name: newStepName.trim(),
      type: newStepType,
      value: newStepValue.trim(),
      order: steps.length,
    };

    setSteps([...steps, newStep]);
    setNewStepName('');
    setNewStepValue('');
    setIsAddingStep(false);
  }

  function handleDeleteStep(id: string) {
    const newSteps = steps
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, order: i }));
    setSteps(newSteps);
    setAnalysis(null);
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedStep);

    // Update order
    newSteps.forEach((step, i) => {
      step.order = i;
    });

    setSteps(newSteps);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setAnalysis(null);
  }

  return (
    <div className="space-y-6">
      {/* Funnel Configuration */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Funnel Builder
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sleep stappen om de volgorde aan te passen
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingStep(!isAddingStep)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Stap Toevoegen
            </button>
            <button
              onClick={handleAnalyze}
              disabled={steps.length < 2 || isAnalyzing}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-3.5 w-3.5" />
              {isAnalyzing ? 'Analyseren...' : 'Analyseer Funnel'}
            </button>
          </div>
        </div>

        {isAddingStep && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Stap Naam
                </label>
                <input
                  type="text"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  placeholder="bijv. Product bekeken"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => setNewStepType('page')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      newStepType === 'page'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="mx-auto mb-1 h-4 w-4" />
                    Pagina
                  </button>
                  <button
                    onClick={() => setNewStepType('event')}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      newStepType === 'event'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MousePointerClick className="mx-auto mb-1 h-4 w-4" />
                    Event
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {newStepType === 'page' ? 'URL Pad' : 'Event Naam'}
                </label>
                <input
                  type="text"
                  value={newStepValue}
                  onChange={(e) => setNewStepValue(e.target.value)}
                  placeholder={newStepType === 'page' ? '/product' : 'button_clicked'}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStep}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Toevoegen
                </button>
                <button
                  onClick={() => {
                    setIsAddingStep(false);
                    setNewStepName('');
                    setNewStepValue('');
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all dark:border-slate-700 dark:bg-slate-800/50 ${
                draggedIndex === index ? 'opacity-50' : 'hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <button className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300">
                <GripVertical className="h-4 w-4" />
              </button>

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {step.type === 'page' ? (
                    <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <MousePointerClick className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {step.name}
                  </span>
                </div>
                <code className="text-xs text-slate-500 dark:text-slate-400">
                  {step.value}
                </code>
              </div>

              <button
                onClick={() => handleDeleteStep(step.id)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {steps.length === 0 && (
          <div className="py-8 text-center">
            <TrendingDown className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Geen funnel stappen gedefinieerd
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Voeg stappen toe om conversie te tracken
            </p>
          </div>
        )}
      </div>

      {/* Funnel Analysis Results */}
      {analysis && analysis.steps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Funnel Analyse Resultaten
          </h3>

          <div className="space-y-4">
            {analysis.steps.map((result, index) => {
              const isFirst = index === 0;
              const previousVisitors = index > 0 ? analysis.steps[index - 1].visitors : 0;

              return (
                <div key={result.step.id}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {result.step.name}
                          </span>
                          {!isFirst && (
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                              {result.conversionRate.toFixed(1)}% conversie
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {result.visitors.toLocaleString('nl-NL')} bezoekers
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{
                            width: isFirst
                              ? '100%'
                              : `${result.conversionRate}%`,
                          }}
                        />
                      </div>

                      {!isFirst && result.dropoffRate > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <TrendingDown className="h-3 w-3" />
                          <span>
                            {Math.round(previousVisitors - result.visitors).toLocaleString('nl-NL')} bezoekers ({result.dropoffRate.toFixed(1)}%) drop-off
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {index < analysis.steps.length - 1 && (
                    <div className="my-2 ml-4 h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Start
                </div>
                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {analysis.steps[0]?.visitors.toLocaleString('nl-NL') || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Eind
                </div>
                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {analysis.steps[analysis.steps.length - 1]?.visitors.toLocaleString('nl-NL') || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Totale Conversie
                </div>
                <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.steps[0]?.visitors
                    ? (
                        (analysis.steps[analysis.steps.length - 1]?.visitors /
                          analysis.steps[0]?.visitors) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
