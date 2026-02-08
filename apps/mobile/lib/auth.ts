import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'vibe-auth-enabled';
const PIN_KEY = 'vibe-auth-pin';

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Vibe Control Panel',
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use PIN',
    });
    return result.success;
  } catch (error) {
    console.error('Biometric auth error:', error);
    return false;
  }
}

export async function isAuthEnabled(): Promise<boolean> {
  const enabled = await SecureStore.getItemAsync(AUTH_KEY);
  return enabled === 'true';
}

export async function setAuthEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(AUTH_KEY, enabled ? 'true' : 'false');
}

export async function setPIN(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const storedPin = await SecureStore.getItemAsync(PIN_KEY);
  return pin === storedPin;
}

export async function hasPIN(): Promise<boolean> {
  const pin = await SecureStore.getItemAsync(PIN_KEY);
  return pin !== null;
}
