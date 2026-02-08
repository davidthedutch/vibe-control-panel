import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import { registerForPushNotifications } from '@/lib/notifications';
import { isAuthEnabled, authenticateWithBiometric, isBiometricAvailable } from '@/lib/auth';
import AuthScreen from '@/components/AuthScreen';
import { useThemeColors } from '@/lib/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    async function prepare() {
      try {
        // Register for push notifications
        await registerForPushNotifications();

        // Check if auth is required
        const authRequired = await isAuthEnabled();

        if (authRequired) {
          const biometricAvailable = await isBiometricAvailable();

          if (biometricAvailable) {
            const authenticated = await authenticateWithBiometric();
            setIsAuthenticated(authenticated);
          } else {
            // Will show PIN screen
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setIsAuthenticated(true); // Allow access on error
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
