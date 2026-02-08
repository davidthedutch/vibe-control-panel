# CRM Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S WEBSITE                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │  JavaScript Tracking Snippet (Embedded in <head>)       │          │
│  │  ─────────────────────────────────────────────────────  │          │
│  │  • Initializes on page load                            │          │
│  │  • Creates/updates user session                        │          │
│  │  • Tracks page views automatically                     │          │
│  │  • Sends heartbeat every 30 seconds                    │          │
│  │  • Exposes window.vibeTrack() API                      │          │
│  │  • Exposes window.vibeIdentify() API                   │          │
│  └─────────────────────┬───────────────────────────────────┘          │
│                        │                                               │
└────────────────────────┼───────────────────────────────────────────────┘
                         │ HTTP POST
                         │ (Supabase REST API)
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE BACKEND                                 │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                           │  │
│  │                                                                  │  │
│  │  Tables:                                                         │  │
│  │  ├─ site_users          (user profiles)                         │  │
│  │  ├─ site_sessions       (active & historical sessions)          │  │
│  │  ├─ user_events         (event log)                             │  │
│  │  ├─ daily_user_stats    (aggregated metrics)                    │  │
│  │  └─ funnel_steps        (conversion funnel config)              │  │
│  │                                                                  │  │
│  │  Functions:                                                      │  │
│  │  ├─ get_online_users()           (fetch active users)           │  │
│  │  ├─ calculate_daily_stats()      (aggregate metrics)            │  │
│  │  ├─ calculate_funnel_conversion() (compute funnel)              │  │
│  │  └─ update_user_activity()       (trigger for timestamps)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                         │                                               │
│                         │ Database Changes                              │
│                         ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  Realtime Engine                                 │  │
│  │  ─────────────────────────────────────────────────────────       │  │
│  │  Broadcasts changes via WebSocket to subscribed clients          │  │
│  │  • site_sessions changes                                         │  │
│  │  • site_users changes                                            │  │
│  │  • user_events changes                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   VIBE CONTROL PANEL (Next.js)                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Hooks Layer                             │  │
│  │                                                                  │  │
│  │  Custom Hooks (src/lib/hooks/use-crm-data.ts):                  │  │
│  │  ├─ useOnlineUsers()      → Fetches + subscribes to sessions    │  │
│  │  ├─ useCrmMetrics()       → Aggregates user metrics             │  │
│  │  ├─ useChartData()        → Fetches daily stats                 │  │
│  │  ├─ useFunnelData()       → Computes funnel conversion          │  │
│  │  └─ useUserSessions()     → Fetches user session history        │  │
│  │                                                                  │  │
│  │  Features:                                                       │  │
│  │  • Auto-refresh (10-30s intervals)                              │  │
│  │  • Real-time subscriptions                                      │  │
│  │  • Loading states                                               │  │
│  │  • Error handling                                               │  │
│  └──────────────────────┬───────────────────────────────────────────┘  │
│                         │                                               │
│                         ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  UI Components Layer                             │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │ page.tsx (Main CRM Page)                                │   │  │
│  │  │ ─────────────────────────────────────────────────────   │   │  │
│  │  │ • Orchestrates all components                           │   │  │
│  │  │ • Manages state (selected user, segment filter)         │   │  │
│  │  │ • Handles exports                                       │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │  │
│  │  │ MetricCards    │  │ UsersChart     │  │ FunnelChart    │   │  │
│  │  │ ────────────── │  │ ────────────── │  │ ────────────── │   │  │
│  │  │ • Total Users  │  │ • 30-day chart │  │ • Conversion   │   │  │
│  │  │ • Online Now   │  │ • Recharts     │  │   funnel       │   │  │
│  │  │ • New This Wk  │  │ • Tooltips     │  │ • Drop-off %   │   │  │
│  │  │ • Churn Rate   │  │                │  │                │   │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │ ActiveUsersTable                                        │   │  │
│  │  │ ─────────────────────────────────────────────────────   │   │  │
│  │  │ • Live user list                                        │   │  │
│  │  │ • Segment filtering                                     │   │  │
│  │  │ • Click to view details                                 │   │  │
│  │  │ • Auto-refresh every 10s                                │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐  ┌──────────────────────────────┐     │  │
│  │  │ UserDetailModal    │  │ IntegrationSnippet           │     │  │
│  │  │ ────────────────── │  │ ──────────────────────────── │     │  │
│  │  │ • User info        │  │ • Generates tracking code    │     │  │
│  │  │ • Session history  │  │ • Copy to clipboard          │     │  │
│  │  │ • Pages visited    │  │ • Usage instructions         │     │  │
│  │  └────────────────────┘  └──────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Utilities Layer                               │  │
│  │                                                                  │  │
│  │  • export-csv.ts    → CSV export functionality                  │  │
│  │  • supabase.ts      → Supabase client configuration             │  │
│  │  • types/crm.ts     → TypeScript type definitions               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                         ▲
                         │ HTTPS
                         │ (User Access)
                         │
                    ┌────┴─────┐
                    │  Admin   │
                    │  User    │
                    └──────────┘
```

## Data Flow Sequences

### 1. User Visits Website

```
User Browser                Tracking Script              Supabase DB
     │                            │                           │
     ├─[Page Load]───────────────>│                           │
     │                            ├─[Check localStorage]─────>│
     │                            │                           │
     │                            ├─[Create/Get User]────────>│
     │                            │<─[User ID]────────────────┤
     │                            │                           │
     │                            ├─[Create Session]─────────>│
     │                            │<─[Session ID]─────────────┤
     │                            │                           │
     │                            ├─[Track Page View]────────>│
     │                            │                           │
     │                            ├─[Start Heartbeat]         │
     │                            │   (every 30s)             │
     │                            │                           │
```

### 2. Admin Views Dashboard

```
Admin Browser           React Hooks              Supabase DB          Realtime
     │                       │                         │                  │
     ├─[Load /crm]──────────>│                         │                  │
     │                       ├─[useOnlineUsers()]─────>│                  │
     │                       │<─[Active Users]─────────┤                  │
     │                       │                         │                  │
     │                       ├─[useCrmMetrics()]──────>│                  │
     │                       │<─[Metrics Data]─────────┤                  │
     │                       │                         │                  │
     │                       ├─[useChartData()]───────>│                  │
     │                       │<─[Chart Data]───────────┤                  │
     │                       │                         │                  │
     │                       ├─[Subscribe to changes]─────────────────────>│
     │                       │                         │                  │
     │<─[Render UI]──────────┤                         │                  │
     │                       │                         │                  │
     │                       │                         │<─[New Session]───┤
     │                       │<─[WebSocket Update]─────────────────────────┤
     │<─[Update UI]──────────┤                         │                  │
     │                       │                         │                  │
```

### 3. User Interacts with Website

```
User Browser            Tracking Script           Supabase DB         Dashboard
     │                        │                         │                 │
     ├─[Click Button]────────>│                         │                 │
     │                        │                         │                 │
     │                        ├─[vibeTrack()]─────────>│                 │
     │                        │   ('button_click')      │                 │
     │                        │                         ├─[INSERT]        │
     │                        │                         │  user_events    │
     │                        │                         │                 │
     │                        │                         ├─[Realtime]─────>│
     │                        │                         │  Broadcast      │
     │                        │                         │                 │
     │                        │<─[Success]──────────────┤                 │
     │<─[Continue]────────────┤                         │                 │
     │                        │                         │                 │
```

### 4. Daily Stats Calculation (Automated)

```
Cron Job                 Supabase Function            Database
    │                          │                          │
    ├─[Midnight Trigger]───────>│                          │
    │                          ├─[calculate_daily_stats()]>│
    │                          │                          │
    │                          │                          ├─[Aggregate]
    │                          │                          │  • Count users
    │                          │                          │  • Count sessions
    │                          │                          │  • Calculate trends
    │                          │                          │
    │                          │<─[Stats Computed]────────┤
    │                          │                          │
    │                          ├─[INSERT daily_user_stats]>│
    │<─[Complete]──────────────┤                          │
    │                          │                          │
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         page.tsx                                │
│  (Main Orchestrator)                                            │
│  • Manages global state                                         │
│  • Coordinates all child components                             │
│  • Handles modals and exports                                   │
└───┬─────────────────┬─────────────────┬─────────────────────────┘
    │                 │                 │
    │                 │                 │
    ▼                 ▼                 ▼
┌──────────┐    ┌──────────┐    ┌──────────────┐
│ Metrics  │    │  Charts  │    │ Users Table  │
│  Cards   │    │  Section │    │   Section    │
└──────────┘    └─┬────┬───┘    └──────┬───────┘
                  │    │               │
         ┌────────┘    └───────┐       │
         ▼                     ▼       ▼
   ┌───────────┐      ┌────────────┐  ┌──────────────────┐
   │ Users     │      │  Funnel    │  │ ActiveUsersTable │
   │ Chart     │      │  Chart     │  │                  │
   │ (Recharts)│      │            │  └────────┬─────────┘
   └───────────┘      └────────────┘           │
                                               │ (onClick)
                                               ▼
                                      ┌──────────────────┐
                                      │ UserDetailModal  │
                                      │ • User info      │
                                      │ • Session history│
                                      └──────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────┐
│                    Application State                       │
│                                                            │
│  Global State (page.tsx):                                 │
│  ├─ selectedUser: OnlineUser | null                       │
│  └─ segment: Segment                                      │
│                                                            │
│  Hook State (use-crm-data.ts):                            │
│  ├─ useOnlineUsers()                                      │
│  │  ├─ users: OnlineUser[]                                │
│  │  ├─ loading: boolean                                   │
│  │  └─ error: Error | null                                │
│  │                                                         │
│  ├─ useCrmMetrics()                                       │
│  │  ├─ metrics: CrmMetrics                                │
│  │  ├─ loading: boolean                                   │
│  │  └─ error: Error | null                                │
│  │                                                         │
│  ├─ useChartData()                                        │
│  │  ├─ data: ChartDataPoint[]                             │
│  │  ├─ loading: boolean                                   │
│  │  └─ error: Error | null                                │
│  │                                                         │
│  ├─ useFunnelData()                                       │
│  │  ├─ data: FunnelStep[]                                 │
│  │  ├─ loading: boolean                                   │
│  │  └─ error: Error | null                                │
│  │                                                         │
│  └─ useUserSessions(userId)                               │
│     ├─ sessions: UserSession[]                            │
│     ├─ loading: boolean                                   │
│     └─ error: Error | null                                │
└────────────────────────────────────────────────────────────┘
```

## API Endpoints (Supabase)

```
REST API:
  GET    /rest/v1/site_users          → Fetch users
  POST   /rest/v1/site_users          → Create user
  PATCH  /rest/v1/site_users?id=...   → Update user

  GET    /rest/v1/site_sessions       → Fetch sessions
  POST   /rest/v1/site_sessions       → Create session
  PATCH  /rest/v1/site_sessions?id=...→ Update session

  POST   /rest/v1/user_events         → Track event

  GET    /rest/v1/daily_user_stats    → Fetch daily stats

  POST   /rest/v1/rpc/get_online_users
  POST   /rest/v1/rpc/calculate_funnel_conversion

WebSocket:
  /realtime/v1                        → Real-time subscriptions
    - site_sessions:*
    - site_users:*
    - user_events:*
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Production Setup                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Vercel (Next.js Hosting)               │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  • /crm route                                   │   │
│  │  • Environment variables                        │   │
│  │  • Edge functions                               │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │ HTTPS                             │
│                    │                                   │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │       Supabase (Database + Realtime)            │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  • PostgreSQL database                          │   │
│  │  • Real-time engine                             │   │
│  │  • REST API                                     │   │
│  │  • Row Level Security                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Customer Websites                     │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  • Tracking snippet embedded                    │   │
│  │  • Sends events to Supabase                     │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Supabase over Custom Backend
**Why**: Built-in real-time, managed infrastructure, generous free tier

### 2. Polling + Subscriptions Hybrid
**Why**: Polling for time updates, subscriptions for new data

### 3. Recharts over Custom SVG
**Why**: Better tooltips, less code, responsive out of the box

### 4. Client-side Aggregation for Metrics
**Why**: Faster UI updates, reduces database load

### 5. Modal over Separate Page for User Details
**Why**: Better UX, maintains context, faster navigation

---

## Performance Optimizations

1. **Indexed Queries**: All queries use indexed columns
2. **Polling Intervals**: Tuned to balance freshness vs load
3. **Memo & Callbacks**: React performance optimizations
4. **Lazy Loading**: Components load data on mount
5. **WebSocket Reuse**: Single connection for all subscriptions

---

This architecture provides a scalable, maintainable foundation for real-time user analytics with room for future expansion.
