# Quick Start Guide - CRM Real-time Features

Get the CRM tab up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" → "New Project"
3. Choose organization, enter project name, database password
4. Wait for project to be created (~2 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. In the project root, navigate to `apps/web/`
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Edit `.env.local` and paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

## Step 4: Set Up Database

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Create another new query
6. Copy the contents of `supabase/migrations/002_crm_realtime.sql`
7. Paste and click **Run**
8. Create another new query
9. Copy the contents of `supabase/seed.sql`
10. Paste and click **Run**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Seed database
supabase db reset --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## Step 5: Enable Realtime

1. In Supabase dashboard, go to **Database** → **Replication**
2. Enable replication for these tables:
   - `site_sessions`
   - `site_users`
   - `user_events`
3. Click **Save**

## Step 6: Run the Application

```bash
# Navigate to web app
cd apps/web

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

## Step 7: Open CRM Dashboard

1. Open browser to http://localhost:3000
2. Navigate to the **CRM** tab
3. You should see:
   - 5 demo users online
   - Metrics cards with data
   - Charts showing activity
   - Active sessions table

## Testing Real-time Features

### Test 1: Simulate New Session

Run this SQL in Supabase SQL Editor:

```sql
-- Create a new user
INSERT INTO site_users (project_id, name, email, segment, external_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  'test@example.com',
  'user',
  'test_user_' || floor(random() * 1000)
)
RETURNING id;

-- Use the returned ID in next query
-- Create an active session (replace USER_ID with the ID from above)
INSERT INTO site_sessions (
  user_id,
  project_id,
  device,
  browser,
  current_page,
  is_online,
  last_activity_at
)
VALUES (
  'USER_ID_HERE',
  '00000000-0000-0000-0000-000000000001',
  'desktop',
  'Chrome',
  '/test',
  true,
  NOW()
);
```

**Expected Result**: New user appears in the active users table within 10 seconds.

### Test 2: Update User Activity

```sql
-- Update a session's current page
UPDATE site_sessions
SET current_page = '/new-page',
    last_activity_at = NOW()
WHERE id = (
  SELECT id FROM site_sessions
  WHERE is_online = true
  LIMIT 1
);
```

**Expected Result**: User's current page updates in the table.

### Test 3: User Goes Offline

```sql
-- Mark session as offline
UPDATE site_sessions
SET is_online = false,
    ended_at = NOW()
WHERE id = (
  SELECT id FROM site_sessions
  WHERE is_online = true
  LIMIT 1
);
```

**Expected Result**: User disappears from active users table, online counter decreases.

## Integrating with Your Website

1. Click **"Integratie Code"** button in CRM dashboard
2. Copy the generated JavaScript snippet
3. Add to your website's `<head>` section
4. Deploy your website
5. Visit your website → You should appear in the CRM dashboard!

### Test Custom Events

Add this to your website:

```html
<button onclick="window.vibeTrack('button_click', { button: 'cta' })">
  Click Me
</button>
```

Check Supabase `user_events` table to see the event logged.

## Common Issues

### "No users online" showing

**Solution**:
- Check that seed data loaded successfully
- Verify `is_online = true` in some sessions
- Check that `last_activity_at` is within last 5 minutes

### Charts are empty

**Solution**:
- Run this SQL to generate stats for last 30 days:
```sql
DO $$
DECLARE
  v_date DATE;
BEGIN
  FOR v_date IN
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE
  LOOP
    PERFORM calculate_daily_stats('00000000-0000-0000-0000-000000000001', v_date);
  END LOOP;
END $$;
```

### "Supabase credentials not found" error

**Solution**:
- Ensure `.env.local` exists in `apps/web/` directory
- Check that variable names match exactly (including `NEXT_PUBLIC_` prefix)
- Restart development server after changing env variables

### Real-time not working

**Solution**:
- Enable replication in Supabase dashboard (Step 5)
- Check browser console for WebSocket errors
- Verify your Supabase project has real-time enabled (free tier includes it)

## Next Steps

- Customize funnel steps for your business
- Set up automated daily stats calculation
- Add more user segments
- Export data for analysis
- Integrate tracking in your production website

## Support

For issues or questions:
1. Check the full documentation in `CRM_IMPLEMENTATION.md`
2. Review Supabase docs: https://supabase.com/docs
3. Check the browser console for error messages
4. Verify database functions exist in SQL Editor

---

**Congratulations!** 🎉 Your CRM real-time dashboard is now running!
