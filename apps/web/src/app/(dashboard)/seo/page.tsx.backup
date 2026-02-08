'use client';

import { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import SeoScore from './seo-score';
import PagesTable from './pages-table';
import type { SeoPageData } from './pages-table';
import IssuesPanel from './issues-panel';
import type { SeoIssueWithPage } from './issues-panel';

const INITIAL_SEO_PAGES: SeoPageData[] = [
  {
    url: '/',
    title: 'Home — Demo Website',
    description: 'Welkom bij onze demo website. Ontdek onze features en services.',
    h1: 'Welkom bij Demo Website',
    hasOgImage: true,
    score: 95,
    issues: [],
  },
  {
    url: '/features',
    title: 'Features',
    description: '',
    h1: 'Onze Features',
    hasOgImage: false,
    score: 45,
    issues: [
      { type: 'error', message: 'Meta description ontbreekt' },
      { type: 'warning', message: 'OG image ontbreekt' },
    ],
  },
  {
    url: '/pricing',
    title: '',
    description: 'Bekijk onze prijzen',
    h1: null,
    hasOgImage: false,
    score: 20,
    issues: [
      { type: 'error', message: 'Title tag ontbreekt' },
      { type: 'error', message: 'H1 heading ontbreekt' },
      { type: 'warning', message: 'OG image ontbreekt' },
    ],
  },
  {
    url: '/contact',
    title: 'Contact — Demo Website',
    description: 'Neem contact met ons op via het contactformulier.',
    h1: 'Contact',
    hasOgImage: true,
    score: 90,
    issues: [
      { type: 'info', message: 'Overweeg structured data toe te voegen (LocalBusiness)' },
    ],
  },
  {
    url: '/about',
    title: 'Over Ons — Demo Website',
    description:
      'Leer meer over ons team en onze missie. Wij bouwen de beste tools voor developers.',
    h1: 'Over Ons',
    hasOgImage: true,
    score: 85,
    issues: [
      { type: 'warning', message: 'Description is 92 karakters \u2014 ideal is 150-160' },
    ],
  },
];

export default function SeoPage() {
  const [pages, setPages] = useState<SeoPageData[]>(INITIAL_SEO_PAGES);
  const [lastScan, setLastScan] = useState<string>('Vandaag, 14:32');

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (pages.length === 0) return 0;
    return Math.round(pages.reduce((sum, p) => sum + p.score, 0) / pages.length);
  }, [pages]);

  // Calculate category scores
  const categories = useMemo(() => {
    const totalPages = pages.length;
    if (totalPages === 0) return [];

    const withTitle = pages.filter((p) => p.title.length > 0).length;
    const withDescription = pages.filter((p) => p.description.length > 0).length;
    const withH1 = pages.filter((p) => p.h1 !== null).length;
    const withOgImage = pages.filter((p) => p.hasOgImage).length;

    return [
      { label: 'Title Tags', score: withTitle, maxScore: totalPages },
      { label: 'Meta Descriptions', score: withDescription, maxScore: totalPages },
      { label: 'Headings (H1)', score: withH1, maxScore: totalPages },
      { label: 'OG Images', score: withOgImage, maxScore: totalPages },
    ];
  }, [pages]);

  // Flatten issues with page URLs
  const allIssues: SeoIssueWithPage[] = useMemo(() => {
    return pages.flatMap((page) =>
      page.issues.map((issue) => ({
        ...issue,
        pageUrl: page.url,
      }))
    );
  }, [pages]);

  // Handle inline edits
  const handlePageUpdate = (url: string, field: 'title' | 'description', value: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.url !== url) return page;
        return { ...page, [field]: value };
      })
    );
  };

  // Simulate rescan
  const handleRescan = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setLastScan(`Vandaag, ${hours}:${minutes}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
            <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              SEO Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Laatste scan: {lastScan}
            </p>
          </div>
        </div>
        <button
          onClick={handleRescan}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Opnieuw scannen
        </button>
      </div>

      {/* Score + Issues overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SeoScore overallScore={overallScore} categories={categories} />
        </div>
        <div className="lg:col-span-2">
          <IssuesPanel issues={allIssues} />
        </div>
      </div>

      {/* Pages table */}
      <PagesTable pages={pages} onPageUpdate={handlePageUpdate} />
    </div>
  );
}
