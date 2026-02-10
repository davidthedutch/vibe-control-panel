'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  GripVertical,
  Link as LinkIcon,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Feature } from '@vibe/shared/types';

// --- Types ---

// --- Status & Priority styles ---

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  working: {
    label: 'Werkend',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    icon: CheckCircle2,
  },
  broken: {
    label: 'Kapot',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: XCircle,
  },
  planned: {
    label: 'Gepland',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    icon: Clock,
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: {
    label: 'Laag',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  medium: {
    label: 'Gemiddeld',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  high: {
    label: 'Hoog',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  critical: {
    label: 'Kritiek',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
};

const actionStatusConfig: Record<string, { label: string; dot: string }> = {
  working: { label: 'Werkend', dot: 'bg-green-500' },
  broken: { label: 'Kapot', dot: 'bg-red-500' },
  planned: { label: 'Gepland', dot: 'bg-slate-400 dark:bg-slate-500' },
};

// --- Sortable Item Component ---

interface SortableFeatureItemProps {
  feature: Feature;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTestFeature: () => void;
  onNavigateToComponent: (componentId: string) => void;
}

function SortableFeatureItem({
  feature,
  isExpanded,
  onToggleExpand,
  onTestFeature,
  onNavigateToComponent,
}: SortableFeatureItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusCfg = statusConfig[feature.status] || statusConfig.planned;
  const priorityCfg = priorityConfig[feature.priority] || priorityConfig.medium;
  const StatusIcon = statusCfg.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-150 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Collapsed header */}
      <div className="flex w-full items-center gap-3 px-4 py-3.5">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 touch-none"
          aria-label="Versleep feature"
        >
          <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" />
        </button>

        {/* Expandable section */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-3 text-left"
          aria-expanded={isExpanded}
        >
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </span>

          {/* Feature name */}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {feature.name}
          </span>

          {/* Priority badge */}
          <span
            className={`hidden items-center rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${priorityCfg.className}`}
          >
            {priorityCfg.label}
          </span>

          {/* Component count */}
          <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex dark:text-slate-500">
            <Hash className="h-3 w-3" />
            {feature.components.length} comp
          </span>

          {/* Chevron */}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Test button */}
        <button
          type="button"
          onClick={onTestFeature}
          className="shrink-0 rounded-lg p-2 text-orange-600 transition-colors duration-150 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/50"
          title="Test feature"
        >
          <PlayCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded detail panel */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-4 pb-5 pt-4 dark:border-slate-800">
            {/* Description */}
            <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>

            {/* Mobile-only priority */}
            <div className="mb-4 flex items-center gap-2 sm:hidden">
              <span className="text-xs text-slate-500 dark:text-slate-400">Prioriteit:</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityCfg.className}`}
              >
                {priorityCfg.label}
              </span>
            </div>

            {/* Actions table */}
            {feature.actions.length > 0 && (
              <div className="mb-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Acties
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Trigger
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Gedrag
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Input/Output
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Error Handling
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {feature.actions.map((action) => {
                        const actionCfg = actionStatusConfig[action.status] || actionStatusConfig.planned;
                        return (
                          <tr key={action.id}>
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                              {action.trigger}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {action.behavior}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-500">
                              {action.inputData && <div>In: {action.inputData}</div>}
                              {action.outputResult && <div>Out: {action.outputResult}</div>}
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-500">
                              {action.errorHandling || '-'}
                            </td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className={`inline-block h-2 w-2 rounded-full ${actionCfg.dot}`} />
                                {actionCfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* User Flows */}
            {feature.userFlows.length > 0 && (
              <div className="mb-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  User Flows
                </h4>
                {feature.userFlows.map((flow, flowIndex) => (
                  <div key={flowIndex} className="mb-3 last:mb-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {flow.name}
                      </span>
                      {flow.happyPath && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          Happy path
                        </span>
                      )}
                    </div>
                    {/* Numbered vertical timeline */}
                    <div className="relative ml-3 border-l-2 border-slate-200 pl-5 dark:border-slate-700">
                      {flow.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="relative pb-3 last:pb-0">
                          {/* Timeline dot with number */}
                          <span className="absolute -left-[1.625rem] flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            {stepIndex + 1}
                          </span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    {flow.edgeCases && flow.edgeCases.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Edge cases: {flow.edgeCases.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Linked Components */}
            {feature.components.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Gekoppelde componenten
                </h4>
                <div className="flex flex-wrap gap-2">
                  {feature.components.map((componentId) => (
                    <button
                      key={componentId}
                      onClick={() => onNavigateToComponent(componentId)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors duration-150 hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-600 dark:hover:text-orange-400"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {componentId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt reference */}
            {feature.createdByPrompt && (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <Hash className="h-3 w-3" />
                <span>
                  Aangemaakt via prompt{' '}
                  <span className="font-mono font-semibold text-indigo-500 dark:text-indigo-400">
                    {feature.createdByPrompt}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component ---

interface FeatureListProps {
  features: Feature[];
  onReorder: (reorderedFeatures: Feature[]) => void;
  onUpdate: (featureId: string, updates: Partial<Feature>) => void;
  projectId: string;
}

export default function FeatureList({ features, onReorder, onUpdate, projectId }: FeatureListProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = features.findIndex((f) => f.id === active.id);
      const newIndex = features.findIndex((f) => f.id === over.id);

      const reordered = arrayMove(features, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const handleTestFeature = (feature: Feature) => {
    const featureName = feature.name.toLowerCase();

    // Known feature → page mapping
    const featureRoutes: Record<string, string> = {
      'live preview': '/preview',
      'crm dashboard': '/crm',
      'escal events': '/escal/events',
      'seo analyzer': '/seo',
      'health monitoring': '/health',
      'ai terminal': '/terminal',
      'live safety buddies': '/escal/live',
    };

    // Check exact match first
    const exactMatch = featureRoutes[featureName];
    if (exactMatch) {
      router.push(exactMatch);
      return;
    }

    // Keyword fallback
    if (featureName.includes('preview')) router.push('/preview');
    else if (featureName.includes('crm')) router.push('/crm');
    else if (featureName.includes('event')) router.push('/escal/events');
    else if (featureName.includes('seo')) router.push('/seo');
    else if (featureName.includes('health')) router.push('/health');
    else if (featureName.includes('terminal')) router.push('/terminal');
    else if (featureName.includes('live') || featureName.includes('buddy') || featureName.includes('safety')) router.push('/escal/live');
    else if (featureName.includes('component')) router.push('/components');
    else if (featureName.includes('feature')) router.push('/features');
    else router.push('/');
  };

  const handleNavigateToComponent = (componentId: string) => {
    router.push(`/components?highlight=${componentId}`);
  };

  if (features.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Nog geen features. Klik op &ldquo;Nieuwe feature&rdquo; om er een toe te voegen.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {features.map((feature) => (
            <SortableFeatureItem
              key={feature.id}
              feature={feature}
              isExpanded={expandedIds.has(feature.id)}
              onToggleExpand={() => toggleExpand(feature.id)}
              onTestFeature={() => handleTestFeature(feature)}
              onNavigateToComponent={handleNavigateToComponent}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
