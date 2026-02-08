# Quick Start Guide

Get the Vibe Control Panel mobile app running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- iOS Simulator (Mac) or Android Emulator, or physical device

## 1. Install Dependencies

```bash
# From monorepo root
cd H:\Onedrive\PC-Rogier\Oud\2026-02-07\vibe-control-panel
pnpm install
```

## 2. Configure Environment

```bash
cd apps/mobile
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Add Placeholder Assets

Create simple PNG files in `assets/` folder:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `favicon.png` (48x48)
- `notification-icon.png` (96x96)

Or download from: https://www.appicon.co/

## 4. Start Development Server

```bash
pnpm start
```

## 5. Run on Device

### Option A: Physical Device (Easiest)
1. Install Expo Go app
2. Scan QR code from terminal

### Option B: Simulator/Emulator
- iOS: Press `i` in terminal
- Android: Press `a` in terminal

## 6. Test the App

Once running:
1. Disable auth temporarily (edit `lib/auth.ts`)
2. Explore all 5 tabs
3. Test search and refresh
4. Check WebView loads

## Common Commands

```bash
# Start with cache clear
pnpm start:clear

# Run on specific platform
pnpm ios
pnpm android

# Type check
pnpm type-check

# Build for production
pnpm build:prod
```

## Need Help?

- Check `SETUP.md` for detailed instructions
- See `README.md` for full documentation
- Review `FEATURES.md` for feature details

## Next Steps

1. Customize theme colors
2. Add real app assets
3. Configure push notifications
4. Set up authentication
5. Test on multiple devices

That's it! You're ready to develop.
