'use client';

interface SeoCategory {
  label: string;
  score: number;
  maxScore: number;
}

interface SeoScoreProps {
  overallScore: number;
  categories: SeoCategory[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Uitstekend';
  if (score >= 80) return 'Goed';
  if (score >= 50) return 'Matig';
  return 'Slecht';
}

export default function SeoScore({ overallScore, categories }: SeoScoreProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Totale SEO Score
      </h2>

      {/* Large score display */}
      <div className="mb-6 flex items-baseline gap-3">
        <span className={`text-6xl font-bold tabular-nums tracking-tight ${getScoreColor(overallScore)}`}>
          {overallScore}
        </span>
        <span className="text-lg text-slate-400 dark:text-slate-500">/ 100</span>
      </div>

      {/* Score label */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            overallScore >= 80
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : overallScore >= 50
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {getScoreLabel(overallScore)}
        </span>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Onderdelen
        </h3>
        {categories.map((cat) => {
          const pct = Math.round((cat.score / cat.maxScore) * 100);
          return (
            <div key={cat.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {cat.label}
                </span>
                <span className={`text-sm font-semibold tabular-nums ${getScoreColor(pct)}`}>
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-in-out ${getBarColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
