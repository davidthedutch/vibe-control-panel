# Mobile App Setup Guide

Quick guide to get the Vibe Control Panel mobile app running.

## Step 1: Install Dependencies

From the monorepo root:

```bash
cd H:\Onedrive\PC-Rogier\Oud\2026-02-07\vibe-control-panel
pnpm install
```

## Step 2: Configure Environment

1. Copy the example environment file:

```bash
cd apps/mobile
cp .env.example .env
```

2. Edit `.env` with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from:
- Supabase Dashboard > Project Settings > API
- URL: Project URL
- Anon Key: anon/public key

## Step 3: Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
```

Or use npx:

```bash
npx expo start
```

## Step 4: Prepare Assets

You need to add image assets to `apps/mobile/assets/`:

### Quick Option: Use Placeholder Images

Create simple placeholder images:

1. **icon.png** (1024x1024): App icon
2. **adaptive-icon.png** (1024x1024): Android icon
3. **splash.png** (1284x2778): Splash screen
4. **favicon.png** (48x48): Web favicon
5. **notification-icon.png** (96x96): Android notification icon

You can use any image editor or online tools to create these.

### Recommended: Use Expo Asset Generator

Visit https://www.appicon.co/ to generate all required assets from a single image.

## Step 5: Start Development Server

```bash
cd apps/mobile
pnpm start
```

This will:
- Start Metro bundler
- Display QR code
- Show available commands

## Step 6: Run on Device/Simulator

### Option A: Physical Device (Easiest)

1. Install Expo Go:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Scan QR code from terminal with:
   - iOS: Camera app
   - Android: Expo Go app

### Option B: iOS Simulator (Mac only)

```bash
pnpm ios
```

Or press `i` after running `pnpm start`

### Option C: Android Emulator

1. Install Android Studio
2. Create an Android Virtual Device (AVD)
3. Start emulator
4. Run:

```bash
pnpm android
```

Or press `a` after running `pnpm start`

## Step 7: Configure Authentication (Optional)

By default, authentication is enabled. To disable for development:

1. Open the app
2. If stuck on auth screen, modify `lib/auth.ts` to default to disabled:

```typescript
export async function isAuthEnabled(): Promise<boolean> {
  return false; // Temporarily disable auth
}
```

To set up a PIN:

```typescript
import { setPIN } from '@/lib/auth';
await setPIN('1234');
```

## Step 8: Test Features

### Test Preview Tab
1. Update URL in `app/(tabs)/preview.tsx` to your site
2. Ensure your site has Vibe SDK installed
3. Check WebView loads correctly

### Test Components Tab
1. Ensure Supabase has components data
2. Try search functionality
3. Pull to refresh

### Test CRM Tab
1. Check user metrics display
2. Verify real-time updates work
3. Test user list

### Test Health Tab
1. Add health checks to database
2. Verify score calculation
3. Check status indicators

### Test Terminal
1. Type `help` to see commands
2. Try `status` command
3. Try `history` command
4. Test custom prompts

## Troubleshooting

### Metro Bundler Issues

Clear cache:
```bash
expo start -c
```

### Module Resolution Errors

Reinstall dependencies:
```bash
cd ../.. # Go to monorepo root
rm -rf node_modules
pnpm install
```

### Supabase Connection Issues

1. Check `.env` file exists and has correct values
2. Verify Supabase project is running
3. Check network connectivity
4. Try restarting dev server

### WebView Not Loading

1. Verify URL is correct
2. Check site is accessible from browser
3. Try using HTTPS instead of HTTP
4. Check device/simulator network connection

### Authentication Stuck

Temporarily disable auth in `lib/auth.ts` or set a PIN:

```typescript
import { setPIN, setAuthEnabled } from '@/lib/auth';

// Disable auth
await setAuthEnabled(false);

// OR set a PIN
await setPIN('1234');
```

### Asset Loading Issues

Ensure all required images exist in `assets/` folder. Use placeholders if needed.

### Push Notifications Not Working

1. Update project ID in `lib/notifications.ts`
2. Check notification permissions
3. Test on physical device (won't work in simulator)

## Development Workflow

### Hot Reload

Most changes hot reload instantly. If not:
- Shake device for dev menu
- Press `r` to reload manually

### Debugging

1. Open dev menu:
   - iOS: Cmd+D or shake device
   - Android: Cmd+M or shake device

2. Enable "Debug Remote JS"

3. Use Chrome DevTools or React Native Debugger

### Viewing Logs

Terminal shows all logs, or use:

```bash
npx react-native log-ios
npx react-native log-android
```

## Building for Production

### Prerequisites

1. Sign up for Expo Application Services (EAS)
2. Install EAS CLI:

```bash
npm install -g eas-cli
```

3. Login:

```bash
eas login
```

### Configure EAS

```bash
eas build:configure
```

### Build iOS

```bash
eas build --platform ios
```

### Build Android

```bash
eas build --platform android
```

### Submit to App Stores

```bash
eas submit --platform ios
eas submit --platform android
```

## Next Steps

1. Customize colors in `lib/theme.ts`
2. Add your app icon and splash screen
3. Configure push notification project ID
4. Test on multiple devices
5. Set up authentication preferences
6. Add custom features

## Resources

- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev
- Expo Router: https://docs.expo.dev/router/introduction/
- Supabase Docs: https://supabase.com/docs

## Support

If you encounter issues:

1. Check console logs
2. Review error messages
3. Search Expo forums
4. Check React Native documentation
5. Review Supabase connection status

Happy coding!
