import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { verifyPIN, hasPIN, authenticateWithBiometric, isBiometricAvailable } from '@/lib/auth';
import { useThemeColors } from '@/lib/theme';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [pin, setPin] = useState('');
  const [showBiometric, setShowBiometric] = useState(true);
  const colors = useThemeColors();

  const handlePINSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    const hasStoredPin = await hasPIN();

    if (!hasStoredPin) {
      // This shouldn't happen in normal flow, but handle it gracefully
      Alert.alert('Error', 'No PIN configured. Please contact support.');
      return;
    }

    const isValid = await verifyPIN(pin);

    if (isValid) {
      onAuthenticated();
    } else {
      Alert.alert('Error', 'Incorrect PIN');
      setPin('');
    }
  };

  const handleBiometric = async () => {
    const available = await isBiometricAvailable();

    if (!available) {
      setShowBiometric(false);
      return;
    }

    const authenticated = await authenticateWithBiometric();

    if (authenticated) {
      onAuthenticated();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="shield-lock"
          size={80}
          color={colors.primary}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: colors.text }]}>
          Vibe Control Panel
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Unlock to continue
        </Text>

        {showBiometric && (
          <TouchableOpacity
            style={[styles.biometricButton, { borderColor: colors.border }]}
            onPress={handleBiometric}
          >
            <MaterialCommunityIcons
              name="fingerprint"
              size={40}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.pinContainer}>
          <TextInput
            style={[styles.pinInput, {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.surface
            }]}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter PIN"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={!showBiometric}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handlePINSubmit}
          >
            <Text style={[styles.submitButtonText, {
              color: colors.background
            }]}>
              Unlock
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  biometricButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    width: '100%',
    gap: 16,
  },
  pinInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
