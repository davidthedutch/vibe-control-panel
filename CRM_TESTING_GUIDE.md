# CRM Testing Guide

Complete testing procedures to verify all CRM functionality.

## Pre-Testing Checklist

- [ ] Database migrations applied (001 and 002)
- [ ] Seed data loaded
- [ ] `.env.local` configured with Supabase credentials
- [ ] Real-time enabled for `site_sessions`, `site_users`, `user_events`
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)

## Test Suite 1: Database Setup

### Test 1.1: Verify Tables Exist

**Open Supabase Dashboard → Database → Tables**

Expected tables:
- [x] projects
- [x] components
- [x] features
- [x] site_users
- [x] site_sessions
- [x] user_events
- [x] daily_user_stats
- [x] funnel_steps

### Test 1.2: Verify Functions Exist

**Open Supabase Dashboard → SQL Editor → New Query**

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'get_online_users',
    'calculate_daily_stats',
    'calculate_funnel_conversion',
    'update_user_activity'
  );
```

**Expected**: 4 rows returned

### Test 1.3: Verify Seed Data

```sql
-- Check users
SELECT COUNT(*) FROM site_users
WHERE project_id = '00000000-0000-0000-0000-000000000001';
-- Expected: At least 5 users

-- Check sessions
SELECT COUNT(*) FROM site_sessions
WHERE project_id = '00000000-0000-0000-0000-000000000001'
  AND is_online = true;
-- Expected: At least 3 active sessions

-- Check events
SELECT COUNT(*) FROM user_events
WHERE project_id = '00000000-0000-0000-0000-000000000001';
-- Expected: At least 5 events

-- Check daily stats
SELECT COUNT(*) FROM daily_user_stats
WHERE project_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 30 rows (last 30 days)
```

### Test 1.4: Verify Realtime Publication

```sql
-- Check if tables are in realtime publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('site_sessions', 'site_users', 'user_events');
```

**Expected**: 3 rows returned

---

## Test Suite 2: UI Component Rendering

### Test 2.1: Page Loads

1. Navigate to http://localhost:3000/crm
2. **Expected**:
   - Page loads without errors
   - No console errors
   - Loading spinners appear briefly

### Test 2.2: Metric Cards Display

**Check these elements:**
- [ ] "Totaal gebruikers" card shows a number
- [ ] "Online nu" card shows a number with green pulse
- [ ] "Nieuwe deze week" card shows a number
- [ ] "Churn rate" card shows a percentage
- [ ] All cards show trend arrows (up/down)
- [ ] Trends show percentage values

### Test 2.3: Charts Render

**Users Chart:**
- [ ] Area chart displays with green gradient
- [ ] X-axis shows dates
- [ ] Y-axis shows user counts
- [ ] Hovering shows tooltip with exact value
- [ ] Chart is responsive

**Funnel Chart:**
- [ ] Shows 4 steps: Bezoekers, Signup, Actief, Betaald
- [ ] Each step shows count and percentage
- [ ] Visual bars scale proportionally
- [ ] Drop-off indicators between steps

### Test 2.4: Active Users Table

**Check these elements:**
- [ ] Table shows at least 3 users
- [ ] Each row shows:
  - Green pulse indicator
  - User name or "Anoniem #..."
  - Email or "Onbekend"
  - Current page (e.g., /dashboard)
  - Time on site (e.g., "12 min")
  - Device icon and label
  - Segment badge
- [ ] Hovering row highlights it
- [ ] Clicking row does something (opens modal)

### Test 2.5: Segment Filter

**Test each filter option:**
1. Click "Alle" → Shows all users
2. Click "Actief" → Shows only premium/user segments
3. Click "Inactief" → Shows only visitors
4. Click "Premium" → Shows only premium users
5. Click "Trial" → Shows only trial users
6. Click "Churned" → Shows only churned users

**Expected**: User count updates, table filters correctly

### Test 2.6: Export Buttons

**Test Export Metrics:**
1. Click "Export" button near online counter
2. **Expected**: CSV file downloads with metrics

**Test Export Users:**
1. Click "Export CSV" button above users table
2. **Expected**: CSV file downloads with active users

**Verify CSV contents:**
- Open downloaded files
- Check headers are correct
- Check data is properly formatted
- No extra commas or broken rows

### Test 2.7: Integration Snippet

1. Click "Integratie Code" button
2. **Expected**:
   - Modal opens with code snippet
   - Code includes correct Supabase URL
   - Code includes correct anon key
   - "Kopieer" button exists
3. Click "Kopieer" button
4. **Expected**: Button text changes to "Gekopieerd!"
5. Paste clipboard content
6. **Expected**: Valid JavaScript code

---

## Test Suite 3: Real-time Features

### Test 3.1: User Detail Modal

1. Click any row in active users table
2. **Expected**:
   - Modal opens
   - Shows user name/email
   - Shows segment, device, browser
   - Shows "Sessie geschiedenis" section
   - Shows at least one session
3. Check session details
4. **Expected**:
   - Date and time displayed
   - Duration shown
   - Pages visited shown (code blocks)
5. Click "Sluiten"
6. **Expected**: Modal closes

### Test 3.2: Auto-Refresh Online Users

**Setup**: Note current time on site for a user

**Wait 15 seconds**

**Expected**: Time on site increases (e.g., "12 min" → "12 min", "1 min" → "1 min")

**Note**: Time updates every 10 seconds

### Test 3.3: Real-time New Session

**Run this SQL in Supabase:**

```sql
-- Insert new user
INSERT INTO site_users (
  id, project_id, name, email, segment, external_id
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Realtime Test User',
  'realtime@test.com',
  'user',
  'rt_test_' || extract(epoch from now())::text
)
RETURNING id;
```

**Copy the returned ID, then run:**

```sql
-- Insert active session (replace USER_ID)
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
  '/realtime-test',
  true,
  NOW()
);
```

**Expected within 10 seconds**:
- New user appears in active users table
- Online counter increments by 1

### Test 3.4: Real-time Session End

**Run this SQL:**

```sql
-- Mark session offline
UPDATE site_sessions
SET is_online = false,
    ended_at = NOW()
WHERE id = (
  SELECT id FROM site_sessions
  WHERE project_id = '00000000-0000-0000-0000-000000000001'
    AND is_online = true
  ORDER BY started_at DESC
  LIMIT 1
);
```

**Expected within 10 seconds**:
- One user disappears from table
- Online counter decrements by 1

### Test 3.5: Real-time Page Change

**Run this SQL:**

```sql
-- Update current page
UPDATE site_sessions
SET current_page = '/realtime-page-change',
    last_activity_at = NOW()
WHERE id = (
  SELECT id FROM site_sessions
  WHERE project_id = '00000000-0000-0000-0000-000000000001'
    AND is_online = true
  LIMIT 1
);
```

**Expected within 10 seconds**:
- User's current page updates in table

---

## Test Suite 4: Integration Testing

### Test 4.1: Embed Tracking Snippet

**Create a test HTML file:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tracking Test</title>
  <!-- Paste integration snippet here -->
</head>
<body>
  <h1>Test Page</h1>
  <button onclick="window.vibeTrack('button_click', { button: 'test' })">
    Track Event
  </button>
  <button onclick="window.vibeIdentify({ name: 'Test User', email: 'test@example.com', segment: 'user' })">
    Identify User
  </button>
</body>
</html>
```

**Test Steps:**
1. Save file as `tracking-test.html`
2. Open in browser
3. Open browser console
4. Check for:
   - No JavaScript errors
   - `vibeTrack` and `vibeIdentify` functions exist
5. Wait 5 seconds
6. Check CRM dashboard
7. **Expected**: New user appears

**Test Event Tracking:**
1. Click "Track Event" button
2. Check Supabase `user_events` table
3. **Expected**: New row with `event_type = 'button_click'`

**Test User Identification:**
1. Click "Identify User" button
2. Check CRM dashboard
3. **Expected**: User name changes to "Test User"

### Test 4.2: Multi-page Tracking

**Create second test page:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Page 2</title>
  <!-- Paste integration snippet here -->
</head>
<body>
  <h1>Second Page</h1>
  <a href="tracking-test.html">Back to Page 1</a>
</body>
</html>
```

**Test Steps:**
1. Open first test page
2. Wait for session to initialize
3. Click link to second page
4. Check CRM dashboard
5. **Expected**: User's current page updates
6. Check `user_events` table
7. **Expected**: New `page_view` event

---

## Test Suite 5: Performance Testing

### Test 5.1: Load Time

1. Open Chrome DevTools → Network tab
2. Clear cache
3. Navigate to /crm
4. Measure "Load" time

**Expected**: < 2 seconds

### Test 5.2: Real-time Latency

1. Insert new session via SQL
2. Start timer
3. Wait for user to appear in dashboard
4. Stop timer

**Expected**: < 10 seconds

### Test 5.3: Memory Usage

1. Open Chrome DevTools → Performance Monitor
2. Navigate to /crm
3. Wait 5 minutes
4. Check memory usage

**Expected**: < 50 MB, stable (no leaks)

### Test 5.4: Multiple Connections

1. Open /crm in 5 different browser tabs
2. Wait 30 seconds
3. Check all tabs update together
4. Close 4 tabs
5. Verify last tab still updates

**Expected**: No errors, all tabs sync

---

## Test Suite 6: Error Handling

### Test 6.1: No Database Connection

1. Stop Supabase (or use invalid credentials)
2. Reload /crm page
3. **Expected**:
   - Loading spinners appear
   - No data loads
   - No JavaScript errors
   - Console shows Supabase warning

### Test 6.2: Malformed Data

**Run this SQL:**

```sql
-- Insert invalid session
INSERT INTO site_sessions (
  user_id,
  project_id,
  is_online
)
VALUES (
  '00000000-0000-0000-0003-000000000001',
  '00000000-0000-0000-0000-000000000001',
  true
);
```

**Expected**: Dashboard handles gracefully, shows "Unknown" for missing fields

### Test 6.3: Network Interruption

1. Open /crm
2. Open browser DevTools → Network
3. Set throttling to "Offline"
4. Wait 30 seconds
5. Set back to "Online"

**Expected**: Dashboard reconnects, data updates

---

## Test Suite 7: Mobile Responsiveness

### Test 7.1: Mobile Layout

1. Open /crm in mobile viewport (375x667)
2. **Expected**:
   - Metric cards stack vertically
   - Charts remain readable
   - Table scrolls horizontally
   - Buttons stack on small screens

### Test 7.2: Touch Interactions

1. Use touch emulation
2. Click user row
3. **Expected**: Modal opens
4. Swipe to close modal
5. **Expected**: Modal closes

---

## Test Suite 8: Cross-browser Testing

Test /crm page in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

For each browser, verify:
- [ ] Page loads
- [ ] Charts render
- [ ] Real-time updates work
- [ ] Export downloads CSV
- [ ] Modal opens/closes

---

## Test Suite 9: Edge Cases

### Test 9.1: No Active Users

**Run this SQL:**

```sql
-- Mark all sessions offline
UPDATE site_sessions
SET is_online = false
WHERE project_id = '00000000-0000-0000-0000-000000000001';
```

**Expected**:
- Online counter shows 0
- Table shows "Geen gebruikers gevonden"

### Test 9.2: Anonymous User

**Verify in table:**
- Users without email show "Onbekend"
- Users without name show "Anoniem #..."

### Test 9.3: Stuck User

**Run this SQL:**

```sql
-- Create stuck session
INSERT INTO site_sessions (
  user_id,
  project_id,
  started_at,
  is_online,
  current_page,
  last_activity_at
)
VALUES (
  (SELECT id FROM site_users LIMIT 1),
  '00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '10 minutes',
  true,
  '/checkout',
  NOW() - INTERVAL '2 minutes'
);
```

**Expected**: User shows "VASTGELOPEN" badge

### Test 9.4: Many Users (1000+)

**Run this SQL:**

```sql
-- Generate 1000 fake sessions
INSERT INTO site_users (project_id, segment, external_id)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'visitor',
  'bulk_test_' || generate_series
FROM generate_series(1, 1000);

INSERT INTO site_sessions (user_id, project_id, is_online, last_activity_at)
SELECT
  id,
  '00000000-0000-0000-0000-000000000001',
  true,
  NOW()
FROM site_users
WHERE external_id LIKE 'bulk_test_%';
```

**Expected**:
- Page remains responsive
- Table scrolls smoothly
- Counter shows correct total

---

## Test Suite 10: Accessibility

### Test 10.1: Keyboard Navigation

1. Tab through page
2. **Expected**: All interactive elements focusable
3. Press Enter on table row
4. **Expected**: Modal opens
5. Press Escape
6. **Expected**: Modal closes

### Test 10.2: Screen Reader

Use screen reader (NVDA/JAWS/VoiceOver):
- [ ] Page title announced
- [ ] Metric values announced
- [ ] Table headers announced
- [ ] Modal content readable

### Test 10.3: Color Contrast

Use Chrome DevTools → Lighthouse → Accessibility

**Expected**: 90+ score

---

## Cleanup After Testing

**Run this SQL to remove test data:**

```sql
-- Delete test users
DELETE FROM site_users
WHERE external_id LIKE 'test_%'
   OR external_id LIKE 'rt_test_%'
   OR external_id LIKE 'bulk_test_%';

-- Reset online status
UPDATE site_sessions
SET is_online = true,
    last_activity_at = NOW()
WHERE project_id = '00000000-0000-0000-0000-000000000001'
  AND user_id IN (
    SELECT id FROM site_users
    WHERE project_id = '00000000-0000-0000-0000-000000000001'
  )
  AND ended_at IS NULL;
```

---

## Automated Testing (Future)

Consider adding:
- [ ] Cypress E2E tests
- [ ] Jest unit tests for hooks
- [ ] React Testing Library for components
- [ ] Supabase database tests

---

## Testing Checklist Summary

**Database**:
- [x] Tables exist
- [x] Functions work
- [x] Seed data loaded
- [x] Realtime enabled

**UI Components**:
- [x] Page loads
- [x] Metrics display
- [x] Charts render
- [x] Table populates
- [x] Filters work
- [x] Exports download
- [x] Modals open/close

**Real-time**:
- [x] Auto-refresh works
- [x] New sessions appear
- [x] Sessions end properly
- [x] Page changes update

**Integration**:
- [x] Tracking snippet works
- [x] Events tracked
- [x] User identified
- [x] Multi-page works

**Performance**:
- [x] Fast load time
- [x] Low latency
- [x] No memory leaks
- [x] Handles scale

**Reliability**:
- [x] Error handling
- [x] Network resilience
- [x] Edge cases handled

**UX**:
- [x] Mobile responsive
- [x] Cross-browser
- [x] Accessible

---

**All tests passing?** ✅ Your CRM dashboard is production-ready!
