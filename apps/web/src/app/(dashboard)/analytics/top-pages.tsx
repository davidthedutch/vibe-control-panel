'use client';

interface TopPage {
  url: string;
  views: number;
  unique: number;
  avgTime: string;
  bounceRate: string;
}

interface TopPagesProps {
  pages: TopPage[];
}

export default function TopPages({ pages }: TopPagesProps) {
  const sortedPages = [...pages].sort((a, b) => b.views - a.views);
  const maxViews = sortedPages[0]?.views ?? 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Top pagina&apos;s
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 text-left font-medium text-slate-500 dark:text-slate-400">
                Pagina
              </th>
              <th className="pb-3 text-right font-medium text-slate-500 dark:text-slate-400">
                Views
              </th>
              <th className="hidden pb-3 text-right font-medium text-slate-500 sm:table-cell dark:text-slate-400">
                Uniek
              </th>
              <th className="hidden pb-3 text-right font-medium text-slate-500 md:table-cell dark:text-slate-400">
                Gem. tijd
              </th>
              <th className="hidden pb-3 text-right font-medium text-slate-500 md:table-cell dark:text-slate-400">
                Bounce
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map((page) => (
              <tr
                key={page.url}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
              >
                <td className="py-3 pr-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {page.url}
                    </span>
                    <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(page.views / maxViews) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                  {page.views.toLocaleString('nl-NL')}
                </td>
                <td className="hidden py-3 text-right tabular-nums text-slate-600 sm:table-cell dark:text-slate-300">
                  {page.unique.toLocaleString('nl-NL')}
                </td>
                <td className="hidden py-3 text-right tabular-nums text-slate-600 md:table-cell dark:text-slate-300">
                  {page.avgTime}
                </td>
                <td className="hidden py-3 text-right md:table-cell">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      parseInt(page.bounceRate) > 45
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : parseInt(page.bounceRate) > 35
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}
                  >
                    {page.bounceRate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
