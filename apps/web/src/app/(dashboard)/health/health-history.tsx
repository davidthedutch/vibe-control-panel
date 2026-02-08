'use client';

import { useMemo } from 'react';

interface HistoryPoint {
  date: string;
  score: number;
}

interface HealthHistoryProps {
  data: HistoryPoint[];
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export default function HealthHistory({ data }: HealthHistoryProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const width = 600;
    const height = 160;
    const paddingX = 40;
    const paddingTop = 16;
    const paddingBottom = 28;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingTop - paddingBottom;

    const minScore = Math.min(...data.map((d) => d.score));
    const maxScore = Math.max(...data.map((d) => d.score));
    const scoreRange = maxScore - minScore || 1;

    const points = data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.score - minScore) / scoreRange) * chartHeight;
      return { x, y, score: d.score, date: d.date };
    });

    // Build path
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    // Build area path (for gradient fill)
    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x.toFixed(1)} ${height - paddingBottom}` +
      ` L ${points[0].x.toFixed(1)} ${height - paddingBottom} Z`;

    // Y-axis labels
    const yLabels = [
      { value: maxScore, y: paddingTop },
      { value: Math.round((maxScore + minScore) / 2), y: paddingTop + chartHeight / 2 },
      { value: minScore, y: paddingTop + chartHeight },
    ];

    // X-axis labels (show ~5)
    const xStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data
      .filter((_, i) => i % xStep === 0 || i === data.length - 1)
      .map((d, _, arr) => {
        const idx = data.indexOf(d);
        return {
          label: d.date.slice(5), // MM-DD
          x: paddingX + (idx / (data.length - 1)) * chartWidth,
        };
      });

    // Latest score for color
    const latestScore = data[data.length - 1].score;

    return {
      width,
      height,
      linePath,
      areaPath,
      points,
      yLabels,
      xLabels,
      paddingBottom,
      latestScore,
      gridLines: yLabels.map((l) => ({
        y: l.y,
        x1: paddingX,
        x2: width - paddingX,
      })),
    };
  }, [data]);

  if (!chartData) return null;

  const color = getColor(chartData.latestScore);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Health Score - Laatste 30 dagen
      </h3>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {chartData.gridLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y}
              x2={line.x2}
              y2={line.y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200 dark:text-slate-700"
            />
          ))}

          {/* Area fill */}
          <path d={chartData.areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={chartData.linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots (latest + extremes) */}
          {chartData.points
            .filter(
              (_, i) => i === chartData.points.length - 1 || i === 0
            )
            .map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={getColor(p.score)}
                stroke="white"
                strokeWidth="2"
              />
            ))}

          {/* Y-axis labels */}
          {chartData.yLabels.map((label, i) => (
            <text
              key={i}
              x={chartData.gridLines[0].x1 - 8}
              y={label.y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
            >
              {label.value}
            </text>
          ))}

          {/* X-axis labels */}
          {chartData.xLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={chartData.height - 4}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] dark:fill-slate-500"
            >
              {label.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
