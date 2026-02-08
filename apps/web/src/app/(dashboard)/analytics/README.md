# Analytics Module Structure

## File Organization

```
apps/web/src/app/(dashboard)/analytics/
├── page.tsx                    # Main analytics dashboard
├── analytics-charts.tsx        # Pageviews chart component
├── top-pages.tsx              # Top pages table
├── referral-sources.tsx       # Traffic sources breakdown
├── device-breakdown.tsx       # Device distribution
├── event-tracking.tsx         # Event tracking overview
├── custom-events.tsx          # Custom event manager
├── funnel-builder.tsx         # Funnel analysis builder
├── analytics-snippet.tsx      # Integration code generator
├── advanced/
│   └── page.tsx              # Advanced analytics page
└── README.md                  # This file

apps/web/src/lib/
└── analytics.ts               # Data fetching utilities

apps/web/src/components/ui/
└── tabs.tsx                   # Tabs component
```

## Component Hierarchy

```
AnalyticsPage (/)
├── Header with date range selector
├── Metric Cards (4x)
│   ├── Pageviews
│   ├── Unique Visitors
│   ├── Avg Session Duration
│   └── Bounce Rate
├── AnalyticsCharts
│   └── Line chart with views & unique visitors
└── Grid Layout
    ├── TopPages (2 cols)
    └── Sidebar (1 col)
        ├── ReferralSources
        └── DeviceBreakdown

AdvancedAnalyticsPage (/advanced)
└── Tabs
    ├── Event Tracking
    │   └── EventTracking component
    ├── Custom Events
    │   └── CustomEvents component
    ├── Funnels
    │   └── FunnelBuilder component
    └── Integration
        └── AnalyticsSnippet component
```

## Data Flow

```
User Action
    ↓
Page Component (useState for data)
    ↓
useEffect triggers
    ↓
Fetch functions from lib/analytics.ts
    ↓
Supabase queries (site_sessions, user_events)
    ↓
Data aggregation and calculations
    ↓
Return formatted data
    ↓
Update component state
    ↓
Re-render with new data
```

## Key Features by Component

### Main Dashboard (`page.tsx`)
- Real-time metrics
- Trend indicators
- Date range filtering
- Responsive layout

### Event Tracking (`event-tracking.tsx`)
- Lists all custom events
- Shows counts and unique users
- Visual progress bars
- Icon categorization

### Custom Events (`custom-events.tsx`)
- Create/delete events
- Define event properties
- Generate tracking code
- View implementation examples

### Funnel Builder (`funnel-builder.tsx`)
- Drag-and-drop steps
- Page/event step types
- Conversion analysis
- Drop-off visualization

### Integration (`analytics-snippet.tsx`)
- Multi-framework support
- Copy/download code
- API key management
- Installation instructions

## Adding New Components

To add a new analytics component:

1. Create component file in `analytics/` directory
2. Import data types from `lib/analytics.ts`
3. Fetch data using provided utility functions
4. Follow existing styling patterns
5. Add to main page or advanced page as needed

Example:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchYourData } from '@/lib/analytics';

export default function YourComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const result = await fetchYourData(projectId, range);
      setData(result);
    }
    load();
  }, []);

  return <div>Your Component</div>;
}
```

## Styling Guidelines

### Colors
- Primary: Blue (blue-500, blue-600)
- Success: Emerald (emerald-500, emerald-600)
- Warning: Amber (amber-500, amber-600)
- Danger: Red (red-500, red-600)
- Neutral: Slate (slate-100 to slate-900)

### Common Classes
- Card: `rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900`
- Button: `rounded-lg px-3 py-1.5 text-xs font-medium`
- Input: `rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm`

### Dark Mode
Always include dark mode variants:
- `dark:bg-slate-900`
- `dark:text-slate-100`
- `dark:border-slate-700`

## Testing Checklist

- [ ] Component renders without errors
- [ ] Data fetches correctly from Supabase
- [ ] Loading states display properly
- [ ] Empty states show helpful messages
- [ ] Date range changes trigger refetch
- [ ] Dark mode works correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Performance is acceptable

## Common Issues & Solutions

### Issue: Data not loading
**Solution:** Check Supabase credentials in `.env` file

### Issue: TypeScript errors
**Solution:** Ensure types are imported from `lib/analytics.ts`

### Issue: Styling inconsistencies
**Solution:** Follow the color palette and common classes above

### Issue: Component not updating
**Solution:** Check useEffect dependencies array

## Performance Tips

1. Use `useMemo` for expensive calculations
2. Debounce rapid state changes
3. Implement virtual scrolling for large lists
4. Lazy load components with `next/dynamic`
5. Optimize Supabase queries with indexes

## Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
