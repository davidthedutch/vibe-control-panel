# Vibe Control Panel - Mobile App

A React Native mobile application built with Expo for the Vibe Control Panel. Monitor and manage your web projects from anywhere with a native mobile experience.

## Features

### 5 Main Tabs

#### 1. Preview Tab
- WebView displaying your live site
- PostMessage bridge for real-time communication with Vibe SDK
- Bidirectional messaging between mobile app and web app
- Visual feedback for element selection

#### 2. Components Tab
- List all project components
- Filter by status (working, broken, in_progress, etc.)
- Real-time search functionality
- Status indicators with icons
- Component details (type, category, file path)

#### 3. CRM Tab
- Live user tracking
- Metrics dashboard:
  - Total users
  - Active users (last 5 minutes)
  - New users today
  - Total sessions
- User list with online indicators
- Segment badges (visitor, user, premium, churned)
- Real-time updates via Supabase subscriptions
- Push notifications for new users

#### 4. Health Tab
- Overall health score visualization
- Health check history
- Status indicators (pass, warn, fail)
- Detailed check information
- Score progress bars
- Push notifications for failed checks
- Real-time health updates

#### 5. Terminal Tab
- Command-line interface
- Built-in commands:
  - `clear` - Clear terminal
  - `help` - Show available commands
  - `history` - Show recent prompts
  - `status` - Show system status
- Log prompts to database
- Timestamped entries
- Error handling with visual feedback

### Security Features

- Biometric authentication (Face ID, Touch ID, Fingerprint)
- PIN code fallback
- Secure credential storage using Expo Secure Store
- Session persistence

### Push Notifications

Automatic notifications for:
- Health check failures
- New user signups
- System errors
- Custom alerts

### Dark Mode

- Automatic dark/light mode detection
- Consistent theming across all screens
- Smooth transitions

## Technology Stack

- **Framework**: Expo SDK 52
- **Router**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Backend**: Supabase (shared with web app)
- **UI**: React Native with custom components
- **Icons**: MaterialCommunityIcons
- **Authentication**: expo-local-authentication
- **Notifications**: expo-notifications
- **WebView**: react-native-webview

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies from the monorepo root:

```bash
cd H:\Onedrive\PC-Rogier\Oud\2026-02-07\vibe-control-panel
pnpm install
```

2. Configure Supabase credentials:

Create a `.env` file in `apps/mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Add app assets:

Place the following images in `apps/mobile/assets/`:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `favicon.png` (48x48)
- `notification-icon.png` (96x96)

### Running the App

Start the development server:

```bash
cd apps/mobile
pnpm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

### Building for Production

#### iOS

```bash
eas build --platform ios
```

#### Android

```bash
eas build --platform android
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── preview.tsx    # Preview tab with WebView
│   │   ├── components.tsx # Components list
│   │   ├── crm.tsx        # CRM dashboard
│   │   ├── health.tsx     # Health monitoring
│   │   ├── terminal.tsx   # Terminal interface
│   │   └── _layout.tsx    # Tab layout configuration
│   ├── _layout.tsx        # Root layout with auth
│   └── index.tsx          # Entry redirect
├── components/            # Reusable components
│   └── AuthScreen.tsx     # Authentication screen
├── lib/                   # Utilities and services
│   ├── supabase.ts        # Supabase client
│   ├── theme.ts           # Theme and colors
│   ├── auth.ts            # Authentication helpers
│   └── notifications.ts   # Push notification handlers
├── assets/                # Images and static files
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── babel.config.js        # Babel configuration
```

## Configuration

### Authentication Setup

Enable/disable authentication:

```typescript
import { setAuthEnabled } from '@/lib/auth';

// Disable auth (useful for development)
await setAuthEnabled(false);

// Enable auth
await setAuthEnabled(true);
```

Set up a PIN:

```typescript
import { setPIN } from '@/lib/auth';

await setPIN('1234');
```

### Notification Configuration

Update the Expo project ID in `lib/notifications.ts`:

```typescript
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id',
});
```

### WebView URL Configuration

Change the preview URL in `app/(tabs)/preview.tsx`:

```typescript
const [url, setUrl] = useState('https://your-site.com');
```

## Shared Code

The mobile app shares code with the web app via the `@vibe/shared` package:

- Type definitions (Component, HealthCheck, SiteUser, etc.)
- Constants
- Supabase database types
- Vibe SDK protocol types

## Monorepo Integration

This mobile app is part of the Vibe Control Panel monorepo and integrates with:

- `@vibe/shared` - Shared types and utilities
- Supabase backend (same as web app)
- Vibe SDK (via PostMessage protocol)

## Development Tips

### Hot Reload

Expo supports fast refresh. Changes to most files will hot reload instantly.

### Debugging

- Use React Native Debugger
- Enable network inspection in dev menu
- Check Expo logs in terminal

### Testing on Physical Device

1. Install Expo Go from App Store/Play Store
2. Scan QR code from terminal
3. App will load on your device

### Common Issues

**Build errors**: Clear cache with `expo start -c`

**Dependency issues**: Run `pnpm install` from monorepo root

**WebView not loading**: Check the URL and network connection

**Push notifications not working**: Ensure you've configured the project ID

## API Reference

### Supabase Tables Used

- `components` - Project components
- `site_users` - CRM user data
- `site_sessions` - User sessions
- `health_checks` - System health
- `prompt_entries` - Terminal prompts

### PostMessage Protocol

Messages sent to/from WebView:

```typescript
interface VibeMessage {
  type: VibeMessageType;
  payload: Record<string, unknown>;
  source: 'vibe-sdk' | 'vibe-panel';
}
```

Message types:
- `VIBE_SDK_READY` - SDK initialized
- `VIBE_SET_MODE` - Configure SDK
- `VIBE_ELEMENT_SELECTED` - Element clicked
- `VIBE_HEALTH_REPORT` - Health data
- `VIBE_PING` / `VIBE_PONG` - Connectivity check

## Performance Optimization

- List virtualization with FlatList
- Optimized re-renders with React hooks
- Efficient Supabase queries with limits
- Image lazy loading
- Bundle size optimization via Metro

## Security Best Practices

- Credentials stored in Expo Secure Store
- No sensitive data in AsyncStorage
- Biometric auth for app access
- Supabase Row Level Security
- HTTPS-only connections

## Future Enhancements

- [ ] Offline mode with local caching
- [ ] Component preview in-app
- [ ] Real-time collaborative features
- [ ] Advanced analytics
- [ ] Custom notification preferences
- [ ] Export data functionality
- [ ] Multi-project support

## License

Private - Vibe Control Panel Project

## Support

For issues or questions, contact the development team.
