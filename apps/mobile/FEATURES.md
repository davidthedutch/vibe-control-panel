# Vibe Control Panel Mobile - Feature Documentation

## Overview

The Vibe Control Panel Mobile app provides full-featured access to your web project management system from any iOS or Android device. Built with React Native and Expo, it offers a native mobile experience with real-time updates and offline capabilities.

## Core Features

### 1. Preview Tab - Live Site WebView

**Description**: Embedded browser for viewing and interacting with your live site.

**Features**:
- Full WebView implementation with JavaScript enabled
- PostMessage bridge for bidirectional communication
- Real-time sync with Vibe SDK on the website
- Element selection highlighting
- Mode switching (mobile/tablet/desktop views)
- Connection status monitoring

**Use Cases**:
- Preview site changes on mobile
- Test responsive design
- Monitor user interactions
- Debug mobile-specific issues
- Quick access to production site

**Technical Details**:
- Uses react-native-webview
- Injected JavaScript for message handling
- Vibe SDK protocol integration
- Error handling and fallbacks

---

### 2. Components Tab - Component Management

**Description**: Browse, search, and monitor all project components.

**Features**:
- Complete component listing
- Real-time status indicators:
  - ✓ Working (green)
  - ⚠ In Progress (blue)
  - ✗ Broken (red)
  - ⏸ Planned (gray)
  - ⚠ Needs Review (purple)
  - ⏹ Deprecated (orange)
- Search by name, category, or type
- Component details:
  - File path
  - Description
  - Type (ui, layout, feature, page)
  - Category
  - Last updated timestamp
- Pull-to-refresh
- Offline caching

**Use Cases**:
- Quick component status check
- Find specific components
- Monitor component health
- Track component updates
- Identify broken components

**Technical Details**:
- FlatList for performance
- Supabase real-time subscriptions
- Optimized search with debouncing
- Status color coding system

---

### 3. CRM Tab - User Analytics

**Description**: Real-time user tracking and engagement metrics.

**Metrics Dashboard**:
- **Total Users**: Cumulative user count
- **Active Now**: Users active in last 5 minutes
- **New Today**: Users who signed up today
- **Total Sessions**: Cumulative session count

**User List Features**:
- Online status indicators (green dot)
- User segments:
  - Visitor (gray)
  - User (blue)
  - Premium (purple)
  - Churned (red)
- User details:
  - Name/Email
  - Last seen timestamp
  - Total session count
  - First seen date
- Real-time updates
- Pull-to-refresh

**Notifications**:
- New user signup alerts
- Premium upgrade notifications
- Churn risk warnings

**Use Cases**:
- Monitor user activity
- Track growth metrics
- Identify active users
- Segment analysis
- Real-time user monitoring

**Technical Details**:
- Supabase realtime subscriptions
- Automatic metric calculations
- Efficient date formatting
- Color-coded segments

---

### 4. Health Tab - System Monitoring

**Description**: Comprehensive health monitoring and alerting system.

**Overall Health Score**:
- 0-100 score display
- Color-coded indicator:
  - Green (80-100): Healthy
  - Orange (50-79): Warning
  - Red (0-49): Critical
- Large circular progress indicator

**Health Checks**:
- Individual check cards
- Status badges (pass/warn/fail)
- Score bars for each check
- Detailed check information
- Timestamp for each check
- Check history (last 5 per type)

**Check Types**:
- API response times
- Database connectivity
- Build status
- SEO scores
- Performance metrics
- Security checks
- Custom checks

**Notifications**:
- Immediate alerts for failures
- Warning threshold notifications
- Recovery notifications

**Use Cases**:
- Monitor system health
- Quickly identify issues
- Track performance trends
- Respond to incidents
- Verify deployments

**Technical Details**:
- Real-time health subscriptions
- Score aggregation algorithm
- Push notification integration
- Historical data tracking

---

### 5. Terminal Tab - Command Interface

**Description**: Interactive terminal for commands and prompt logging.

**Built-in Commands**:

```
clear           - Clear terminal history
help            - Show available commands
history         - Show last 10 prompts
status          - Show system statistics
```

**Features**:
- Timestamped entries
- Color-coded output:
  - Input (primary color)
  - Output (text color)
  - Errors (red)
- Monospace font
- Auto-scroll to bottom
- Multi-line input support
- Command history
- Prompt database logging

**Use Cases**:
- Log development prompts
- Check system status
- Review command history
- Quick system queries
- Development notes

**Technical Details**:
- Supabase prompt_entries table
- Local command processing
- Keyboard-aware view
- Optimized rendering

---

## Security Features

### Biometric Authentication

**Supported Methods**:
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)
- Face Recognition (Android)

**Features**:
- Hardware-backed security
- Fallback to PIN
- Session persistence
- Re-auth on app launch
- Configurable timeout

**Implementation**:
- expo-local-authentication
- Secure credential storage
- Platform-specific prompts

### PIN Code Security

**Features**:
- 4-6 digit PIN support
- Secure storage (Keychain/Keystore)
- Encrypted storage
- Failed attempt tracking
- PIN reset flow

**Use Cases**:
- Devices without biometrics
- Alternative auth method
- Quick access option

---

## Push Notifications

### Notification Types

**1. Health Check Failures**
```
Title: "Health Check Failed"
Body: "[check_type] check failed"
Data: { type: 'health_check', checkId: '...' }
```

**2. New Users**
```
Title: "New User"
Body: "[user_name] just signed up!"
Data: { type: 'new_user', userId: '...' }
```

**3. System Errors**
```
Title: "Error Detected"
Body: [error_message]
Data: { type: 'error', errorId: '...' }
```

### Configuration

- Expo push token system
- Project ID configuration
- Channel setup (Android)
- Permission handling
- Notification preferences

---

## Dark Mode Support

**Features**:
- Automatic system detection
- Smooth transitions
- Consistent theming
- Custom color schemes
- High contrast support

**Color Themes**:

**Light Mode**:
- Background: White
- Surface: Light gray
- Text: Black
- Accents: Custom colors

**Dark Mode**:
- Background: Black
- Surface: Dark gray
- Text: White
- Accents: Custom colors

**Implementation**:
- useColorScheme hook
- Dynamic style application
- Theme context
- Color constants

---

## Real-time Features

### Supabase Subscriptions

**Active Subscriptions**:
1. Components table changes
2. Site users (new signups)
3. Health checks (failures)
4. Sessions (online status)

**Benefits**:
- Instant updates
- No polling required
- Reduced battery usage
- Efficient data transfer

### WebView Communication

**PostMessage Protocol**:
```typescript
{
  type: 'VIBE_SDK_READY',
  payload: { ... },
  source: 'vibe-sdk' | 'vibe-panel'
}
```

**Message Types**:
- SDK ready notifications
- Element selections
- Mode changes
- Health reports
- Ping/pong connectivity

---

## Performance Optimizations

### List Virtualization

- FlatList for long lists
- Windowed rendering
- Optimized item heights
- Key extraction
- Memo components

### Network Efficiency

- Request batching
- Efficient queries
- Pagination support
- Result limiting
- Caching strategies

### Memory Management

- Image optimization
- Component unmounting
- Subscription cleanup
- State management
- Garbage collection

---

## Offline Support (Future)

**Planned Features**:
- Local data caching
- Offline queue
- Sync on reconnect
- Conflict resolution
- Background sync

---

## Accessibility

**Features**:
- Screen reader support
- Dynamic text sizing
- High contrast mode
- Keyboard navigation
- Focus indicators
- Semantic HTML

---

## Platform-Specific Features

### iOS

- Face ID integration
- Haptic feedback
- iOS design patterns
- SF Symbols support
- App Store optimization

### Android

- Material Design 3
- Fingerprint auth
- Notification channels
- Adaptive icons
- Play Store optimization

---

## Integration Points

### Supabase Backend

**Tables Used**:
- components
- site_users
- site_sessions
- health_checks
- prompt_entries
- projects

**Authentication**:
- Secure token storage
- Auto-refresh
- Session persistence

### Vibe SDK

**Protocol**:
- PostMessage API
- Event subscriptions
- State synchronization
- Command execution

### Shared Package

**Imports**:
- Type definitions
- Constants
- Utilities
- Database types

---

## Development Features

### Hot Reload

- Fast refresh
- State preservation
- Error overlay
- Quick iteration

### Debugging

- React DevTools
- Network inspector
- Console logging
- Error boundaries
- Crash reporting

### Testing

- Component tests
- Integration tests
- E2E tests
- Performance tests
- Accessibility tests

---

## Deployment

### Development Builds

- Internal distribution
- TestFlight (iOS)
- Internal testing (Android)
- OTA updates

### Production Builds

- App Store (iOS)
- Play Store (Android)
- Release channels
- Staged rollouts
- A/B testing

---

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Custom dashboards
   - Export functionality
   - Trend analysis

2. **Multi-Project Support**
   - Project switching
   - Consolidated view
   - Cross-project search

3. **Collaboration**
   - Team chat
   - Shared notes
   - Activity feed

4. **Advanced Monitoring**
   - Performance profiling
   - Error tracking
   - User recordings

5. **Customization**
   - Theme editor
   - Layout options
   - Widget system

---

## API Documentation

### Authentication API

```typescript
// Check if biometric is available
await isBiometricAvailable(): Promise<boolean>

// Authenticate with biometrics
await authenticateWithBiometric(): Promise<boolean>

// Set PIN
await setPIN(pin: string): Promise<void>

// Verify PIN
await verifyPIN(pin: string): Promise<boolean>
```

### Notification API

```typescript
// Register for notifications
await registerForPushNotifications(): Promise<string | null>

// Send local notification
await sendLocalNotification(title: string, body: string, data?: any)

// Schedule specific notifications
await scheduleHealthCheckNotification(message: string)
await scheduleNewUserNotification(userName: string)
await scheduleErrorNotification(error: string)
```

### Theme API

```typescript
// Get current theme colors
const colors = useThemeColors()

// Available color properties
colors.background
colors.surface
colors.text
colors.primary
colors.success
colors.warning
colors.error
```

---

## Best Practices

### Performance

- Use FlatList for lists
- Implement pagination
- Optimize images
- Minimize re-renders
- Profile regularly

### Security

- Store credentials securely
- Validate all inputs
- Use HTTPS only
- Implement auth checks
- Regular updates

### UX

- Loading states
- Error handling
- Empty states
- Feedback messages
- Smooth animations

---

## Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

---

Last Updated: 2026-02-08
Version: 1.0.0
