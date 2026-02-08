'use client';

import { useState, useMemo } from 'react';

interface ChartDataPoint {
  date: string;
  views: number;
  unique: number;
}

interface AnalyticsChartsProps {
  data: ChartDataPoint[];
  range: number;
}

export default function AnalyticsCharts({ data, range }: AnalyticsChartsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => data.slice(-range), [data, range]);

  const maxViews = useMemo(
    () => Math.max(...chartData.map((d) => d.views)) * 1.1,
    [chartData]
  );

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 800;
  const chartHeight = 320;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = useMemo(
    () =>
      chartData.map((d, i) => ({
        x: padding.left + (i / (chartData.length - 1)) * innerWidth,
        y: padding.top + innerHeight - (d.views / maxViews) * innerHeight,
        data: d,
        index: i,
      })),
    [chartData, maxViews, innerWidth, innerHeight, padding.left, padding.top]
  );

  const uniquePoints = useMemo(
    () =>
      chartData.map((d, i) => ({
        x: padding.left + (i / (chartData.length - 1)) * innerWidth,
        y: padding.top + innerHeight - (d.unique / maxViews) * innerHeight,
      })),
    [chartData, maxViews, innerWidth, innerHeight, padding.left, padding.top]
  );

  const viewsLinePath = useMemo(
    () => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [points]
  );

  const uniqueLinePath = useMemo(
    () => uniquePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [uniquePoints]
  );

  const viewsAreaPath = useMemo(
    () =>
      viewsLinePath +
      ` L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerHeight}` +
      ` L ${points[0]?.x ?? 0} ${padding.top + innerHeight} Z`,
    [viewsLinePath, points, padding.top, innerHeight]
  );

  const yTicks = useMemo(() => {
    const step = Math.ceil(maxViews / 5 / 50) * 50;
    const ticks: number[] = [];
    for (let v = 0; v <= maxViews; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [maxViews]);

  const xLabelInterval = useMemo(() => {
    if (chartData.length <= 7) return 1;
    if (chartData.length <= 14) return 2;
    if (chartData.length <= 30) return 5;
    return 10;
  }, [chartData.length]);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Pageviews over tijd
        </h3>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Uniek
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = padding.top + innerHeight - (tick / maxViews) * innerHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] dark:fill-slate-500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {chartData.map((d, i) => {
            if (i % xLabelInterval !== 0 && i !== chartData.length - 1) return null;
            const x = padding.left + (i / (chartData.length - 1)) * innerWidth;
            return (
              <text
                key={d.date}
                x={x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] dark:fill-slate-500"
              >
                {formatDate(d.date)}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={viewsAreaPath} fill="url(#viewsGradient)" />

          {/* Views line */}
          <path
            d={viewsLinePath}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Unique line */}
          <path
            d={uniqueLinePath}
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
          />

          {/* Hover zones */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={
                  i === 0
                    ? padding.left
                    : p.x - innerWidth / (chartData.length - 1) / 2
                }
                y={padding.top}
                width={
                  i === 0 || i === chartData.length - 1
                    ? innerWidth / (chartData.length - 1) / 2
                    : innerWidth / (chartData.length - 1)
                }
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            </g>
          ))}

          {/* Hover indicator */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <>
              <line
                x1={points[hoveredIndex].x}
                y1={padding.top}
                x2={points[hoveredIndex].x}
                y2={padding.top + innerHeight}
                stroke="rgb(148, 163, 184)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r={4}
                fill="rgb(59, 130, 246)"
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={uniquePoints[hoveredIndex].x}
                cy={uniquePoints[hoveredIndex].y}
                r={4}
                fill="rgb(16, 185, 129)"
                stroke="white"
                strokeWidth={2}
              />

              {/* Tooltip */}
              <g>
                <rect
                  x={
                    points[hoveredIndex].x > chartWidth / 2
                      ? points[hoveredIndex].x - 150
                      : points[hoveredIndex].x + 12
                  }
                  y={Math.max(padding.top, points[hoveredIndex].y - 40)}
                  width={138}
                  height={62}
                  rx={8}
                  className="fill-slate-800 dark:fill-slate-700"
                  opacity={0.95}
                />
                <text
                  x={
                    points[hoveredIndex].x > chartWidth / 2
                      ? points[hoveredIndex].x - 140
                      : points[hoveredIndex].x + 22
                  }
                  y={Math.max(padding.top, points[hoveredIndex].y - 40) + 18}
                  className="fill-slate-300 text-[10px] font-medium"
                >
                  {formatDate(chartData[hoveredIndex].date)}
                </text>
                <text
                  x={
                    points[hoveredIndex].x > chartWidth / 2
                      ? points[hoveredIndex].x - 140
                      : points[hoveredIndex].x + 22
                  }
                  y={Math.max(padding.top, points[hoveredIndex].y - 40) + 35}
                  className="fill-blue-400 text-[11px] font-semibold"
                >
                  Views: {chartData[hoveredIndex].views.toLocaleString('nl-NL')}
                </text>
                <text
                  x={
                    points[hoveredIndex].x > chartWidth / 2
                      ? points[hoveredIndex].x - 140
                      : points[hoveredIndex].x + 22
                  }
                  y={Math.max(padding.top, points[hoveredIndex].y - 40) + 52}
                  className="fill-emerald-400 text-[11px] font-semibold"
                >
                  Uniek: {chartData[hoveredIndex].unique.toLocaleString('nl-NL')}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
