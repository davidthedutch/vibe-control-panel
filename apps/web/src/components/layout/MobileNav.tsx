'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, Blocks, Users, HeartPulse, Terminal } from 'lucide-react';

const mobileNavItems = [
  { label: 'Preview', href: '/preview', icon: Eye },
  { label: 'Componenten', href: '/components', icon: Blocks },
  { label: 'CRM', href: '/crm', icon: Users },
  { label: 'Health', href: '/health', icon: HeartPulse },
  { label: 'Terminal', href: '/terminal', icon: Terminal },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
