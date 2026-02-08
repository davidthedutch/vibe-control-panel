# CRM Real-time Implementation - WERKSTROOM C4

Complete implementation of the CRM tab with Supabase real-time features for the Vibe Control Panel.

## Overview

The CRM tab provides real-time user tracking, analytics, and conversion funnel visualization with live updates powered by Supabase Realtime API.

## Features Implemented

### 1. Real-time User Tracking
- **Live user counter**: Shows currently active users (active in last 5 minutes)
- **Active users table**: Real-time table showing:
  - Name/email (or anonymous ID)
  - Current page
  - Time on site (auto-updating)
  - Device type (desktop/mobile)
  - Browser
  - User segment (visitor, user, premium, trial, churned)
  - Stuck indicator (users on page > 5 minutes)
- **Auto-refresh**: Updates every 10 seconds

### 2. Metrics Dashboard
Real-time metrics with week-over-week trends:
- Total Users
- Online Now (live counter)
- New This Week
- Churn Rate

All metrics update every 30 seconds automatically.

### 3. Analytics Charts
- **Daily Active Users Chart**: Line/area chart using Recharts showing 30-day user activity
- **Conversion Funnel**: Visual funnel showing drop-off rates between steps:
  - Bezoekers (Visitors)
  - Signup
  - Actief (Active)
  - Betaald (Paid)

### 4. User Detail Modal
Click any user in the active users table to view:
- User profile information
- Session history (last 20 sessions)
- Pages visited per session
- Session duration
- Device and browser info

### 5. Segment Filtering
Filter active users by segment:
- Alle (All)
- Actief (Active)
- Inactief (Inactive)
- Premium
- Trial
- Churned

### 6. Export Functionality
- **Export Users to CSV**: Export active users list
- **Export Metrics to CSV**: Export current metrics and trends

### 7. Integration Snippet
Complete JavaScript tracking snippet that can be embedded in any website to:
- Track page views
- Create user sessions
- Send heartbeat signals
- Track custom events
- Identify users

## Files Created/Modified

### Database
- `supabase/migrations/002_crm_realtime.sql` - Migration for CRM tables and functions
- `supabase/seed.sql` - Updated with demo users and sessions

### Components
- `apps/web/src/app/(dashboard)/crm/page.tsx` - Main CRM page (updated to use hooks)
- `apps/web/src/app/(dashboard)/crm/active-users-table.tsx` - Updated with click handler
- `apps/web/src/app/(dashboard)/crm/users-chart.tsx` - Converted to use Recharts
- `apps/web/src/app/(dashboard)/crm/user-detail-modal.tsx` - New modal component
- `apps/web/src/app/(dashboard)/crm/integration-snippet.tsx` - New integration code generator

### Utilities & Hooks
- `apps/web/src/lib/supabase.ts` - Supabase client with real-time config
- `apps/web/src/lib/hooks/use-crm-data.ts` - Custom hooks for all CRM data
- `apps/web/src/lib/utils/export-csv.ts` - CSV export utilities

## Database Schema

### Tables
- `site_users` - User profiles
- `site_sessions` - User sessions
- `user_events` - Event tracking
- `daily_user_stats` - Aggregated daily statistics
- `funnel_steps` - Conversion funnel configuration

### Functions
- `get_online_users(project_id)` - Get currently active users
- `calculate_daily_stats(project_id, date)` - Calculate daily statistics
- `calculate_funnel_conversion(project_id, days)` - Calculate funnel conversion rates
- `update_user_activity()` - Trigger to update user last_seen

### Real-time Subscriptions
- `site_sessions` - Real-time session updates
- `site_users` - Real-time user updates
- `user_events` - Real-time event tracking

## Setup Instructions

### 1. Apply Database Migrations
```bash
# If using Supabase CLI
supabase db reset

# Or manually run:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_crm_realtime.sql
# - supabase/seed.sql
```

### 2. Configure Environment Variables
Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
Dependencies are already in package.json:
- `@supabase/supabase-js` - Supabase client
- `recharts` - Chart library

### 4. Run the Application
```bash
cd apps/web
npm run dev
```

Navigate to `http://localhost:3000/crm`

## Using the Integration Snippet

### 1. Click "Integratie Code" button in CRM dashboard
### 2. Copy the generated JavaScript snippet
### 3. Add to your website's `<head>` tag

### Custom Event Tracking
```javascript
// Track custom events
window.vibeTrack('button_click', { button: 'signup' });
window.vibeTrack('signup', { plan: 'premium' });
window.vibeTrack('payment_success', { amount: 29.99 });
```

### Identify Users
```javascript
// After user signs up or logs in
window.vibeIdentify({
  email: 'user@example.com',
  name: 'John Doe',
  segment: 'user', // or 'premium', 'trial'
  metadata: { plan: 'pro' }
});
```

## Real-time Data Flow

1. **User visits website** → Tracking script initializes
2. **Session created** → Inserted into `site_sessions` table
3. **Page views tracked** → Inserted into `user_events` table
4. **Heartbeat every 30s** → Updates `last_activity_at` in session
5. **Supabase Realtime** → Broadcasts changes to all connected clients
6. **React hooks subscribe** → UI updates automatically
7. **User leaves** → Session marked as `is_online = false`

## Performance Considerations

- **Polling intervals**:
  - Online users: 10 seconds (to update time on site)
  - Metrics: 30 seconds
  - Chart data: Fetched once on mount
  - Funnel: Fetched once on mount

- **Real-time subscriptions**: Only active for `site_sessions` table
- **Indexes**: Created for fast queries on project_id, is_online, last_activity_at

## Customization

### Add New Funnel Steps
```sql
INSERT INTO funnel_steps (project_id, step_name, step_order, event_type) VALUES
  ('your-project-id', 'New Step', 5, 'custom_event');
```

### Calculate Daily Stats (Cron Job)
```sql
-- Run daily at midnight
SELECT calculate_daily_stats('your-project-id', CURRENT_DATE);
```

### Custom Segments
Edit the `segment` check constraint in `site_users` table to add new segments.

## Troubleshooting

### No Users Showing
1. Check if seed data was loaded
2. Verify Supabase credentials in `.env.local`
3. Check browser console for errors
4. Ensure real-time is enabled in Supabase project settings

### Sessions Not Updating
1. Verify `get_online_users` function exists
2. Check that sessions have `is_online = true`
3. Ensure `last_activity_at` is within last 5 minutes

### Charts Empty
1. Run `calculate_daily_stats` for the last 30 days
2. Check that `daily_user_stats` table has data

## Future Enhancements

- User cohort analysis
- Retention metrics
- Geographic data visualization
- Real-time notifications for stuck users
- A/B testing support
- Custom dashboard widgets
- Email alerts for specific events
- Integration with external analytics tools

## Technologies Used

- **Next.js 15** - React framework
- **Supabase** - Backend and real-time database
- **Recharts** - Chart visualization
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety
