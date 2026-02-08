'use client';

import { useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import type { ComponentItem, ComponentStatus } from './page';

interface DependencyGraphProps {
  components: ComponentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_COLORS: Record<ComponentStatus, { fill: string; stroke: string; text: string; fillDark: string; strokeDark: string; textDark: string }> = {
  working: {
    fill: '#f0fdf4', stroke: '#22c55e', text: '#166534',
    fillDark: '#052e16', strokeDark: '#4ade80', textDark: '#bbf7d0',
  },
  broken: {
    fill: '#fef2f2', stroke: '#ef4444', text: '#991b1b',
    fillDark: '#450a0a', strokeDark: '#f87171', textDark: '#fecaca',
  },
  planned: {
    fill: '#f8fafc', stroke: '#94a3b8', text: '#475569',
    fillDark: '#1e293b', strokeDark: '#64748b', textDark: '#cbd5e1',
  },
  in_progress: {
    fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af',
    fillDark: '#172554', strokeDark: '#60a5fa', textDark: '#bfdbfe',
  },
  needs_review: {
    fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e',
    fillDark: '#451a03', strokeDark: '#fbbf24', textDark: '#fde68a',
  },
};

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function DependencyGraph({ components, selectedId, onSelect }: DependencyGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { nodes, edges, svgWidth, svgHeight } = useMemo(() => {
    const nameToComp = new Map<string, ComponentItem>();
    components.forEach((c) => nameToComp.set(c.name, c));

    // Compute topological levels
    const levels = new Map<string, number>();

    function getLevel(name: string, visited: Set<string>): number {
      if (levels.has(name)) return levels.get(name)!;
      if (visited.has(name)) return 0;
      visited.add(name);

      const comp = nameToComp.get(name);
      if (!comp || comp.dependencies.length === 0) {
        levels.set(name, 0);
        return 0;
      }

      let maxDep = 0;
      for (const dep of comp.dependencies) {
        if (nameToComp.has(dep)) {
          maxDep = Math.max(maxDep, getLevel(dep, visited) + 1);
        }
      }
      levels.set(name, maxDep);
      return maxDep;
    }

    components.forEach((c) => getLevel(c.name, new Set()));

    // Group by level
    const levelGroups = new Map<number, ComponentItem[]>();
    components.forEach((c) => {
      const lvl = levels.get(c.name) ?? 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(c);
    });

    const nodeWidth = 160;
    const nodeHeight = 48;
    const horizontalGap = 60;
    const verticalGap = 80;
    const paddingX = 50;
    const paddingY = 50;

    const maxLevel = Math.max(...Array.from(levelGroups.keys()), 0);
    const maxGroupSize = Math.max(
      ...Array.from(levelGroups.values()).map((g) => g.length),
      1
    );

    const totalWidth = Math.max(
      (nodeWidth + horizontalGap) * maxGroupSize - horizontalGap + paddingX * 2,
      600
    );
    const totalHeight = (nodeHeight + verticalGap) * (maxLevel + 1) - verticalGap + paddingY * 2;

    // Position nodes
    const positions = new Map<string, NodePosition>();

    for (let level = 0; level <= maxLevel; level++) {
      const group = levelGroups.get(level) ?? [];
      const groupWidth = (nodeWidth + horizontalGap) * group.length - horizontalGap;
      const startX = (totalWidth - groupWidth) / 2;

      group.forEach((comp, idx) => {
        positions.set(comp.id, {
          x: startX + idx * (nodeWidth + horizontalGap),
          y: paddingY + level * (nodeHeight + verticalGap),
          width: nodeWidth,
          height: nodeHeight,
        });
      });
    }

    // Build edges
    const edgeList: { fromId: string; toId: string }[] = [];
    components.forEach((comp) => {
      comp.dependencies.forEach((depName) => {
        const depComp = nameToComp.get(depName);
        if (depComp) {
          edgeList.push({ fromId: comp.id, toId: depComp.id });
        }
      });
    });

    const nodeList = components
      .filter((c) => positions.has(c.id))
      .map((c) => ({
        component: c,
        position: positions.get(c.id)!,
      }));

    return {
      nodes: nodeList,
      edges: edgeList,
      svgWidth: totalWidth,
      svgHeight: totalHeight,
    };
  }, [components]);

  function getEdgePath(fromId: string, toId: string): string {
    const fromNode = nodes.find((n) => n.component.id === fromId);
    const toNode = nodes.find((n) => n.component.id === toId);
    if (!fromNode || !toNode) return '';

    const fp = fromNode.position;
    const tp = toNode.position;

    const x1 = fp.x + fp.width / 2;
    const y1 = fp.y;
    const x2 = tp.x + tp.width / 2;
    const y2 = tp.y + tp.height;

    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
        <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          Geen componenten om weer te geven
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Legenda:</span>
        {(Object.entries(STATUS_COLORS) as [ComponentStatus, typeof STATUS_COLORS[ComponentStatus]][]).map(
          ([status, colors]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border"
                style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {status === 'working'
                  ? 'Werkend'
                  : status === 'broken'
                  ? 'Kapot'
                  : status === 'planned'
                  ? 'Gepland'
                  : status === 'in_progress'
                  ? 'In progress'
                  : 'Review'}
              </span>
            </div>
          )
        )}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ minHeight: Math.max(svgHeight, 300) }}
      >
        <defs>
          <marker
            id="dep-arrow"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" className="fill-slate-300 dark:fill-slate-600" />
          </marker>
          <marker
            id="dep-arrow-active"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" className="fill-indigo-500 dark:fill-indigo-400" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, idx) => {
          const isActive =
            hoveredId === edge.fromId ||
            hoveredId === edge.toId ||
            selectedId === edge.fromId ||
            selectedId === edge.toId;
          return (
            <path
              key={`edge-${idx}`}
              d={getEdgePath(edge.fromId, edge.toId)}
              fill="none"
              stroke={isActive ? '#6366f1' : '#d1d5db'}
              strokeWidth={isActive ? 2 : 1.5}
              markerStart={isActive ? 'url(#dep-arrow-active)' : 'url(#dep-arrow)'}
              className="transition-all duration-150"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(({ component: comp, position: pos }) => {
          const colors = STATUS_COLORS[comp.status];
          const isSelected = selectedId === comp.id;
          const isHovered = hoveredId === comp.id;

          return (
            <g
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              onMouseEnter={() => setHoveredId(comp.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              {/* Shadow */}
              <rect
                x={pos.x + 1}
                y={pos.y + 2}
                width={pos.width}
                height={pos.height}
                rx={10}
                fill="rgba(0,0,0,0.05)"
              />
              {/* Node rect */}
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx={10}
                fill={colors.fill}
                stroke={isSelected ? '#6366f1' : isHovered ? colors.stroke : colors.stroke}
                strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
              {/* Status dot */}
              <circle
                cx={pos.x + 16}
                cy={pos.y + pos.height / 2}
                r={4}
                fill={colors.stroke}
              />
              {/* Component name */}
              <text
                x={pos.x + 28}
                y={pos.y + pos.height / 2 + 1}
                dominantBaseline="middle"
                fill={colors.text}
                fontSize={13}
                fontWeight={600}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {comp.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
