export const STATUS_COLORS = {
  planned: '#94a3b8',
  in_progress: '#3b82f6',
  working: '#10b981',
  broken: '#ef4444',
  deprecated: '#6b7280',
  needs_review: '#f59e0b',
} as const;

export const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
} as const;

export const TABS = [
  { id: 'preview', label: 'Preview', icon: 'Eye' },
  { id: 'components', label: 'Componenten', icon: 'Blocks' },
  { id: 'features', label: 'Features', icon: 'Zap' },
  { id: 'crm', label: 'CRM', icon: 'Users' },
  { id: 'seo', label: 'SEO', icon: 'Search' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'health', label: 'Health', icon: 'HeartPulse' },
  { id: 'terminal', label: 'Terminal', icon: 'Terminal' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
] as const;
