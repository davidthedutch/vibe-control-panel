'use client';

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelStep[];
}

const stepColors = [
  { bar: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
  { bar: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
  { bar: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700' },
  { bar: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
];

export default function FunnelChart({ data }: FunnelChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">Conversie funnel</h3>
        <p className="text-sm text-gray-500">Van bezoeker tot betalend</p>
      </div>

      <div className="space-y-3">
        {data.map((step, i) => {
          const colors = stepColors[i % stepColors.length];
          const widthPercent = (step.count / data[0].count) * 100;
          const dropOff = i > 0 ? data[i - 1].count - step.count : 0;
          const dropOffPercent = i > 0 ? ((dropOff / data[i - 1].count) * 100).toFixed(1) : null;
          const isHighDropOff = dropOffPercent !== null && parseFloat(dropOffPercent) > 50;

          return (
            <div key={step.step}>
              {/* Drop-off indicator between steps */}
              {i > 0 && (
                <div className="flex items-center gap-2 py-1.5 pl-2">
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span
                    className={`text-xs font-medium ${
                      isHighDropOff ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    -{dropOff.toLocaleString('nl-NL')} ({dropOffPercent}% drop-off)
                  </span>
                  {isHighDropOff && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                      Hoog
                    </span>
                  )}
                </div>
              )}

              {/* Funnel bar */}
              <div className={`relative rounded-lg ${colors.light} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bar} text-sm font-bold text-white`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${colors.text}`}>{step.step}</p>
                      <p className="text-xs text-gray-500">{step.percentage}% conversie</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{step.count.toLocaleString('nl-NL')}</p>
                </div>
                {/* Visual bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60">
                  <div
                    className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
