import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceSecondary: '#e0e0e0',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#000000',
    border: '#e0e0e0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    tabBar: '#ffffff',
    tabBarInactive: '#999999',
  },
  dark: {
    background: '#000000',
    surface: '#1a1a1a',
    surfaceSecondary: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#999999',
    primary: '#ffffff',
    border: '#333333',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    tabBar: '#1a1a1a',
    tabBarInactive: '#666666',
  },
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return colors[colorScheme === 'dark' ? 'dark' : 'light'];
}
