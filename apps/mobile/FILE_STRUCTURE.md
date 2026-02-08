# File Structure

Complete file structure of the Vibe Control Panel mobile app.

```
apps/mobile/
│
├── 📱 App Directory (Expo Router)
│   ├── app/
│   │   ├── (tabs)/                          # Tab navigation group
│   │   │   ├── _layout.tsx                  # Tab bar configuration with icons
│   │   │   ├── preview.tsx                  # Tab 1: WebView + PostMessage
│   │   │   ├── components.tsx               # Tab 2: Component list + search
│   │   │   ├── crm.tsx                      # Tab 3: User analytics
│   │   │   ├── health.tsx                   # Tab 4: Health monitoring
│   │   │   └── terminal.tsx                 # Tab 5: Command terminal
│   │   ├── _layout.tsx                      # Root layout + authentication
│   │   └── index.tsx                        # Entry redirect
│   │
│   ├── 🧩 Components
│   │   ├── components/
│   │   │   ├── AuthScreen.tsx               # Biometric/PIN authentication UI
│   │   │   ├── LoadingSpinner.tsx           # Reusable loading component
│   │   │   └── EmptyState.tsx               # Empty state component
│   │
│   ├── 🔧 Library (Core Utilities)
│   │   ├── lib/
│   │   │   ├── supabase.ts                  # Supabase client configuration
│   │   │   ├── theme.ts                     # Dark/light theme system
│   │   │   ├── auth.ts                      # Authentication helpers
│   │   │   └── notifications.ts             # Push notification system
│   │
│   ├── 🪝 Custom Hooks
│   │   ├── hooks/
│   │   │   ├── useSupabaseQuery.ts          # Data fetching hook
│   │   │   └── useRealtimeSubscription.ts   # Real-time updates hook
│   │
│   ├── 🎨 Assets
│   │   ├── assets/
│   │   │   ├── README.md                    # Asset requirements guide
│   │   │   ├── icon.png                     # App icon (1024x1024)
│   │   │   ├── adaptive-icon.png            # Android adaptive icon
│   │   │   ├── splash.png                   # Splash screen
│   │   │   ├── favicon.png                  # Web favicon
│   │   │   └── notification-icon.png        # Notification icon
│   │
│   ├── ⚙️ Configuration Files
│   │   ├── package.json                     # Dependencies and scripts
│   │   ├── app.json                         # Expo configuration
│   │   ├── tsconfig.json                    # TypeScript configuration
│   │   ├── babel.config.js                  # Babel/Metro configuration
│   │   ├── eas.json                         # EAS Build configuration
│   │   ├── .env.example                     # Environment template
│   │   ├── .gitignore                       # Git exclusions
│   │
│   └── 📚 Documentation
│       ├── README.md                        # Complete project documentation
│       ├── SETUP.md                         # Step-by-step setup guide
│       ├── QUICKSTART.md                    # 5-minute quick start
│       ├── FEATURES.md                      # Detailed feature docs
│       ├── TROUBLESHOOTING.md               # Common issues & solutions
│       ├── PROJECT_SUMMARY.md               # Project overview
│       └── FILE_STRUCTURE.md                # This file
```

## File Purposes

### App Routes (Expo Router)

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `app/_layout.tsx` | Root layout, handles auth | ~70 | Authentication check, splash screen |
| `app/(tabs)/_layout.tsx` | Tab bar config | ~60 | 5 tabs with icons, theming |
| `app/(tabs)/preview.tsx` | WebView preview | ~150 | PostMessage bridge, injected JS |
| `app/(tabs)/components.tsx` | Component list | ~280 | Search, filters, real-time |
| `app/(tabs)/crm.tsx` | User analytics | ~320 | Metrics, user list, subscriptions |
| `app/(tabs)/health.tsx` | Health monitoring | ~300 | Score calc, checks, notifications |
| `app/(tabs)/terminal.tsx` | Command terminal | ~230 | Built-in commands, logging |
| `app/index.tsx` | Entry redirect | ~5 | Simple redirect |

### Components

| File | Purpose | Lines | Reusability |
|------|---------|-------|-------------|
| `AuthScreen.tsx` | Auth UI | ~150 | Used in root layout |
| `LoadingSpinner.tsx` | Loading state | ~30 | Universal |
| `EmptyState.tsx` | Empty state | ~40 | Universal |

### Library

| File | Purpose | Lines | Key Exports |
|------|---------|-------|-------------|
| `lib/supabase.ts` | DB client | ~30 | `supabase` client |
| `lib/theme.ts` | Theming | ~40 | `useThemeColors()` hook |
| `lib/auth.ts` | Auth helpers | ~60 | 7+ auth functions |
| `lib/notifications.ts` | Notifications | ~90 | 5+ notification functions |

### Hooks

| File | Purpose | Lines | Return Values |
|------|---------|-------|---------------|
| `useSupabaseQuery.ts` | Data fetching | ~60 | `{ data, loading, error, refetch }` |
| `useRealtimeSubscription.ts` | Real-time | ~50 | Subscription channel |

### Configuration

| File | Purpose | Type |
|------|---------|------|
| `package.json` | Dependencies | JSON |
| `app.json` | Expo config | JSON |
| `tsconfig.json` | TypeScript | JSON |
| `babel.config.js` | Babel | JS |
| `eas.json` | EAS Build | JSON |
| `.env.example` | Environment | ENV |
| `.gitignore` | Git | TXT |

### Documentation

| File | Purpose | Pages |
|------|---------|-------|
| `README.md` | Main docs | 400+ lines |
| `SETUP.md` | Setup guide | 300+ lines |
| `QUICKSTART.md` | Quick start | 80+ lines |
| `FEATURES.md` | Feature docs | 800+ lines |
| `TROUBLESHOOTING.md` | Troubleshooting | 500+ lines |
| `PROJECT_SUMMARY.md` | Summary | 600+ lines |
| `FILE_STRUCTURE.md` | This file | 200+ lines |

## Code Statistics

### By Type

```
TypeScript Files:     16
React Components:     10
Custom Hooks:         2
Config Files:         7
Documentation:        7
Total Files:          ~30
```

### By Category

```
App Routes:           8 files (~1,400 lines)
Components:           3 files (~220 lines)
Libraries:            4 files (~220 lines)
Hooks:                2 files (~110 lines)
Configuration:        7 files
Documentation:        7 files (~2,900 lines)
```

### Lines of Code

```
Source Code:          ~2,000 lines
Documentation:        ~2,900 lines
Configuration:        ~100 lines
Total:                ~5,000 lines
```

## Import Structure

### External Dependencies

```typescript
// React & React Native
import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';

// Expo
import { Stack, Tabs, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Supabase
import { createClient } from '@supabase/supabase-js';

// WebView
import { WebView } from 'react-native-webview';
```

### Internal Dependencies

```typescript
// Shared package (monorepo)
import type { Component, HealthCheck, SiteUser } from '@vibe/shared';

// Local utilities
import { supabase } from '@/lib/supabase';
import { useThemeColors } from '@/lib/theme';
import { authenticateWithBiometric } from '@/lib/auth';
import { sendLocalNotification } from '@/lib/notifications';

// Components
import AuthScreen from '@/components/AuthScreen';
import LoadingSpinner from '@/components/LoadingSpinner';

// Hooks
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
```

## Dependency Graph

```
app/_layout.tsx
├── lib/notifications.ts → expo-notifications
├── lib/auth.ts → expo-local-authentication, expo-secure-store
├── lib/theme.ts → react-native
└── components/AuthScreen.tsx

app/(tabs)/_layout.tsx
├── lib/theme.ts
└── @expo/vector-icons

app/(tabs)/preview.tsx
├── lib/theme.ts
├── react-native-webview
└── @vibe/shared (types)

app/(tabs)/components.tsx
├── lib/supabase.ts → @supabase/supabase-js
├── lib/theme.ts
├── @vibe/shared (types)
└── @expo/vector-icons

app/(tabs)/crm.tsx
├── lib/supabase.ts
├── lib/theme.ts
├── lib/notifications.ts
├── @vibe/shared (types)
└── @expo/vector-icons

app/(tabs)/health.tsx
├── lib/supabase.ts
├── lib/theme.ts
├── lib/notifications.ts
├── @vibe/shared (types)
└── @expo/vector-icons

app/(tabs)/terminal.tsx
├── lib/supabase.ts
├── lib/theme.ts
├── @vibe/shared (types)
└── @expo/vector-icons
```

## Build Output

After building, additional files are generated:

```
.expo/                           # Expo cache
├── types/                      # Generated route types
└── ...

.expo-shared/                   # Shared Expo data
└── assets.json

node_modules/                   # Dependencies
└── ...

ios/                           # iOS build (if using dev client)
├── Pods/
└── ...

android/                       # Android build (if using dev client)
├── app/
└── ...
```

## File Size Estimates

```
Source Code:          ~200 KB
Dependencies:         ~150 MB (node_modules)
Assets:              ~5-10 MB (with images)
Documentation:        ~50 KB
Built App (iOS):      ~25-40 MB
Built App (Android):  ~20-35 MB
```

## Access Patterns

### Most Frequently Modified
1. `app/(tabs)/*.tsx` - Tab screens
2. `lib/supabase.ts` - DB queries
3. `lib/theme.ts` - Styling
4. `.env` - Configuration

### Rarely Modified
1. `app/_layout.tsx` - Root layout
2. `babel.config.js` - Build config
3. `tsconfig.json` - TS config
4. Documentation files

### Read-Only (Generated)
1. `.expo/` directory
2. `node_modules/` directory
3. Type definition files

## Navigation Flow

```
app/index.tsx (Entry)
    ↓
app/_layout.tsx (Root)
    ↓
[Auth Check]
    ↓ (authenticated)
app/(tabs)/_layout.tsx (Tab Bar)
    ├─→ preview.tsx      (Default)
    ├─→ components.tsx
    ├─→ crm.tsx
    ├─→ health.tsx
    └─→ terminal.tsx
```

## Data Flow

```
Supabase Database
    ↓ (queries/subscriptions)
lib/supabase.ts
    ↓
Tab Screens
    ↓
Components
    ↓
User Interface
```

---

**File Count**: ~30 source files
**Total Lines**: ~5,000 lines
**Documentation**: 7 guides
**Components**: 10 React components
**Screens**: 6 screens (5 tabs + auth)

Last Updated: 2026-02-08
