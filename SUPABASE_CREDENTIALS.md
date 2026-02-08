# Supabase Credentials - vibe-control-panel

**Project Name**: vibe-control-panel
**Organization**: davidthedutch's Org (Free Tier)
**Region**: West EU (Frankfurt)
**Status**: ✅ Active
**Created**: 2026-02-08

---

## 🔑 API Credentials

### Project URL
```
https://oprkkdajaywinvohnhoc.supabase.co
```

### Anon (Public) Key
**Use**: Safe for client-side code (browser, mobile app)
**Access**: Read-only with Row Level Security enabled

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmtrZGFqYXl3aW52b2huaG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTczODEsImV4cCI6MjA1NDY5MzM4MX0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### Service Role Key (SECRET!)
**Use**: Server-side only (API routes, serverless functions)
**Access**: Full admin access - bypasses Row Level Security
**⚠️ NEVER commit this to git or expose publicly!**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmtrZGFqYXl3aW52b2huaG9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTExNzM4MSwiZXhwIjoyMDU0NjkzMzgxfQ.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

---

## 📦 Environment Variables

### Voor Next.js Web App (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oprkkdajaywinvohnhoc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmtrZGFqYXl3aW52b2huaG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTczODEsImV4cCI6MjA1NDY5MzM4MX0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmtrZGFqYXl3aW52b2huaG9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTExNzM4MSwiZXhwIjoyMDU0NjkzMzgxfQ.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### Voor Expo Mobile App (.env)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://oprkkdajaywinvohnhoc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmtrZGFqYXl3aW52b2huaG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTczODEsImV4cCI6MjA1NDY5MzM4MX0.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### Voor Vercel Deployment
Add deze als environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret!)

---

## 🗄️ Database Schema

**Status**: Not yet deployed

### Next Steps:
1. Navigate to SQL Editor in Supabase dashboard
2. Run the schema from `DEPLOYMENT_INSTRUCTIONS.md`
3. Tables to create:
   - `sites` - Website registry
   - `components` - Component tracking
   - `features` - Feature flags
   - `app_users` - CRM users
   - `events` - Analytics events
   - `health_checks` - Monitoring

---

## 🔐 Security Notes

### Row Level Security (RLS)
- **Status**: Enabled by default
- **Policies**: To be configured per table
- Client-side queries use anon key → RLS applies
- Server-side queries with service_role key → bypasses RLS

### Best Practices
1. ✅ **DO** use anon key in browser/mobile code
2. ✅ **DO** use service_role key only in API routes/serverless functions
3. ❌ **DON'T** commit service_role key to git
4. ❌ **DON'T** expose service_role key in client bundle
5. ✅ **DO** configure RLS policies before going to production

---

## 📊 Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| Edge Functions | 500K invocations/month |
| Auth Users | Unlimited |
| Realtime | 200 concurrent connections |

### Upgrade Path
When you hit limits, upgrade to **Pro Plan** (€25/month):
- 8 GB database
- 100 GB storage
- 250 GB bandwidth
- 2M edge function invocations
- 500 concurrent realtime connections

---

## 🔗 Quick Links

- **Dashboard**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc
- **API Docs**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/api
- **Table Editor**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/editor
- **SQL Editor**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/sql
- **Storage**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/storage/files
- **Auth**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/auth/users
- **Realtime**: https://supabase.com/dashboard/project/oprkkdajaywinvohnhoc/realtime/inspector

---

## 🚀 Getting Started

### 1. Install Supabase Client
```bash
cd apps/web
npm install @supabase/supabase-js
```

### 2. Initialize Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Query Data
```typescript
// Fetch all sites
const { data, error } = await supabase
  .from('sites')
  .select('*')

// Insert new site
const { data, error } = await supabase
  .from('sites')
  .insert({ name: 'My Site', url: 'https://example.com' })
```

---

**⚠️ SECURITY WARNING**

This file contains sensitive credentials. It is listed in `.gitignore` and should NEVER be committed to version control!

If these credentials are ever exposed:
1. Go to Supabase dashboard → Settings → API Keys
2. Click "Reset" on the service_role key
3. Update all environment variables with new keys

---

*Last updated: 2026-02-08*
