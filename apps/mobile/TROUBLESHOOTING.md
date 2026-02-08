# Troubleshooting Guide

Common issues and solutions for the Vibe Control Panel mobile app.

## Installation Issues

### "Module not found" errors

**Problem**: Dependencies not installed correctly.

**Solution**:
```bash
# From monorepo root
rm -rf node_modules
rm -rf apps/mobile/node_modules
pnpm install
```

### "Unable to resolve module @vibe/shared"

**Problem**: Workspace dependencies not linked.

**Solution**:
```bash
# Ensure pnpm-workspace.yaml is correct
cd apps/mobile
pnpm install
expo start -c
```

### TypeScript errors on first run

**Problem**: Type definitions not generated.

**Solution**:
```bash
pnpm type-check
expo start -c
```

---

## Runtime Issues

### App crashes on launch

**Check**:
1. Assets exist in `assets/` folder
2. Environment variables are set
3. No syntax errors in code

**Solution**:
```bash
expo start -c
# Check terminal for specific error
```

### "Network request failed"

**Problem**: Supabase connection failed.

**Check**:
1. `.env` file exists with correct values
2. Supabase project is active
3. API keys are valid
4. Internet connection works

**Test**:
```bash
# Check Supabase URL in browser
# Should show Supabase landing page
```

### WebView shows blank screen

**Problem**: Site not loading in WebView.

**Solutions**:
1. Check URL in `preview.tsx`
2. Ensure site is accessible
3. Try HTTPS instead of HTTP
4. Check CORS settings

**Debug**:
```typescript
// Add in preview.tsx
onError={(syntheticEvent) => {
  console.log('WebView error:', syntheticEvent.nativeEvent);
}}
```

### Authentication loop

**Problem**: Stuck at auth screen.

**Temporary fix**:
```typescript
// In lib/auth.ts
export async function isAuthEnabled(): Promise<boolean> {
  return false; // Disable temporarily
}
```

**Permanent fix**:
Set up PIN:
```typescript
import { setPIN } from '@/lib/auth';
await setPIN('1234');
```

---

## Development Issues

### Hot reload not working

**Solutions**:
1. Shake device → Reload
2. Press `r` in terminal
3. Restart dev server
4. Clear cache: `expo start -c`

### Changes not reflecting

**Try**:
```bash
# Clear all caches
expo start -c
rm -rf .expo
rm -rf node_modules/.cache
```

### iOS Simulator issues

**Common fixes**:
```bash
# Reset simulator
xcrun simctl erase all

# Reinstall app
rm -rf ios/build
expo ios
```

### Android Emulator issues

**Common fixes**:
1. Wipe emulator data
2. Restart emulator
3. Reinstall app
4. Check emulator has internet

---

## Build Issues

### EAS build fails

**Check**:
1. EAS CLI installed: `npm install -g eas-cli`
2. Logged in: `eas login`
3. Project configured: `eas build:configure`

**Common errors**:

**"Invalid credentials"**
```bash
eas login
# Re-enter credentials
```

**"Asset not found"**
- Ensure all assets exist in `assets/`
- Check `app.json` paths are correct

**"Build timeout"**
- Check build logs for specific error
- May need to upgrade EAS plan

### TypeScript compilation errors

**Solutions**:
```bash
# Check for errors
pnpm type-check

# Common fixes
rm -rf node_modules/@types
pnpm install
```

---

## Performance Issues

### App is slow

**Check**:
1. Lists use FlatList (not map)
2. Images are optimized
3. No console.logs in production
4. Minimize re-renders

**Profile**:
```bash
# Enable performance monitoring
# Shake device → Enable Performance Monitor
```

### High memory usage

**Solutions**:
1. Check for memory leaks
2. Unsubscribe from listeners
3. Clear unused images
4. Optimize list rendering

### Battery drain

**Check**:
1. Location services disabled
2. Background refresh limited
3. Polling intervals reasonable
4. Subscriptions properly cleaned up

---

## Platform-Specific Issues

### iOS

**Face ID not working**
- Check `Info.plist` has usage description
- Verify permission granted in Settings

**Build fails on iOS**
- Update Xcode to latest
- Clear derived data
- Update CocoaPods: `pod install`

**App rejected by App Store**
- Check app privacy policy
- Add required usage descriptions
- Test on real device
- Follow Apple guidelines

### Android

**Fingerprint not working**
- Check permissions in `app.json`
- Test on real device (not emulator)
- Verify device has fingerprint enrolled

**Build fails on Android**
- Update Android Studio
- Clear gradle cache
- Check JDK version

**App rejected by Play Store**
- Add privacy policy link
- Declare permissions usage
- Test on multiple devices
- Follow Google guidelines

---

## Database Issues

### Supabase queries failing

**Check**:
1. Table names correct
2. RLS policies configured
3. API key valid
4. Network connection

**Debug**:
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

### Real-time not working

**Check**:
1. Realtime enabled in Supabase
2. Subscriptions properly set up
3. Channel names unique
4. Cleanup on unmount

**Test**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'components'
    }, (payload) => {
      console.log('Change received:', payload);
    })
    .subscribe();

  return () => channel.unsubscribe();
}, []);
```

---

## Notification Issues

### Not receiving notifications

**Check**:
1. Permissions granted
2. Project ID configured in `notifications.ts`
3. Device connected to internet
4. Notifications enabled in device settings

**Test**:
```typescript
import { sendLocalNotification } from '@/lib/notifications';

// Test notification
await sendLocalNotification('Test', 'This is a test');
```

**iOS specific**:
- Check notification settings in iOS Settings
- May need real device (not simulator)

**Android specific**:
- Check notification channel created
- Verify icon exists

---

## Expo Go Limitations

Some features don't work in Expo Go:

1. Custom native modules
2. Push notifications (production)
3. Some authentication methods
4. Background tasks

**Solution**: Use development build
```bash
eas build --profile development
```

---

## Getting Help

### Check logs

**Terminal logs**:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

**Expo logs**:
- Visible in terminal running `expo start`
- Check for red errors

### Enable debug mode

```typescript
// Add at top of _layout.tsx
if (__DEV__) {
  console.log('Development mode enabled');
}
```

### Network debugging

**iOS**: Safari → Develop → [Device] → [App]

**Android**: Chrome → `chrome://inspect`

### Common error patterns

**"undefined is not an object"**
- Check for null/undefined values
- Add optional chaining: `obj?.property`

**"Maximum update depth exceeded"**
- Check for infinite loops in useEffect
- Verify dependency arrays

**"Can't find variable"**
- Import missing
- Typo in variable name
- Scope issue

---

## Reporting Issues

When reporting issues, include:

1. **Error message**: Full error from console
2. **Steps to reproduce**: How to trigger issue
3. **Environment**:
   - Device/Simulator
   - OS version
   - Expo SDK version
   - Node version
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If visual issue

---

## Prevention Tips

### Before deploying

- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on different screen sizes
- [ ] Verify all assets load
- [ ] Check performance
- [ ] Test offline behavior
- [ ] Verify notifications
- [ ] Test authentication
- [ ] Review error boundaries
- [ ] Check memory usage

### Regular maintenance

- [ ] Update dependencies monthly
- [ ] Review and fix warnings
- [ ] Monitor crash reports
- [ ] Check analytics
- [ ] Update documentation
- [ ] Review security
- [ ] Optimize performance
- [ ] Update tests

---

## Still stuck?

1. Search [Expo Forums](https://forums.expo.dev)
2. Check [React Native Issues](https://github.com/facebook/react-native/issues)
3. Review [Supabase Docs](https://supabase.com/docs)
4. Ask in project Discord/Slack
5. File a detailed issue on GitHub

---

Last Updated: 2026-02-08
