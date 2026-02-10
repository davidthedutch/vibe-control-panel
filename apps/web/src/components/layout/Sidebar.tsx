'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Eye,
  Blocks,
  Zap,
  Users,
  Search,
  BarChart3,
  HeartPulse,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Music,
} from 'lucide-react';

const navItems = [
  { label: 'Preview', href: '/preview', icon: Eye },
  { label: 'Componenten', href: '/components', icon: Blocks },
  { label: 'Features', href: '/features', icon: Zap },
  { label: 'CRM', href: '/crm', icon: Users },
  { label: 'SEO', href: '/seo', icon: Search },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Health', href: '/health', icon: HeartPulse },
  { label: 'Terminal', href: '/terminal', icon: Terminal },
  { label: 'Escal', href: '/escal', icon: Music },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${mobile ? 'flex h-full' : 'hidden md:flex'} flex-col bg-slate-900 text-slate-300 transition-all duration-150 ease-in-out ${
        collapsed ? 'w-16' : 'w-65'
      }`}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          V
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-white">
            Vibe CP
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          // Support sub-routes for sections like Escal
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Inklappen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
