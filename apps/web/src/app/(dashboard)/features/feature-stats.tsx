'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FeatureStatsProps {
  total: number;
  working: number;
  broken: number;
  planned: number;
}

const COLORS = {
  working: '#22c55e',
  broken: '#ef4444',
  planned: '#94a3b8',
};

export default function FeatureStats({ total, working, broken, planned }: FeatureStatsProps) {
  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const workingPct = getPercentage(working);
  const brokenPct = getPercentage(broken);
  const plannedPct = getPercentage(planned);

  const chartData = [
    { name: 'Werkend', value: working, color: COLORS.working },
    { name: 'Kapot', value: broken, color: COLORS.broken },
    { name: 'Gepland', value: planned, color: COLORS.planned },
  ].filter((item) => item.value > 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        {/* Left side: Numbers and progress bar */}
        <div>
          {/* Numbers row */}
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Totaal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{working}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Werkend</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{broken}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kapot</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">{planned}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gepland</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="flex h-full">
              {workingPct > 0 && (
                <div
                  className="bg-green-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${workingPct}%` }}
                  title={`Werkend: ${working} (${workingPct}%)`}
                />
              )}
              {brokenPct > 0 && (
                <div
                  className="bg-red-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${brokenPct}%` }}
                  title={`Kapot: ${broken} (${brokenPct}%)`}
                />
              )}
              {plannedPct > 0 && (
                <div
                  className="bg-slate-300 transition-all duration-300 ease-in-out dark:bg-slate-600"
                  style={{ width: `${plannedPct}%` }}
                  title={`Gepland: ${planned} (${plannedPct}%)`}
                />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              Werkend {workingPct}%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Kapot {brokenPct}%
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              Gepland {plannedPct}%
            </div>
          </div>
        </div>

        {/* Right side: Pie chart */}
        {total > 0 && (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
