import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Update with your Expo project ID
    });
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

export async function scheduleHealthCheckNotification(message: string) {
  await sendLocalNotification(
    'Health Check Failed',
    message,
    { type: 'health_check' }
  );
}

export async function scheduleNewUserNotification(userName: string) {
  await sendLocalNotification(
    'New User',
    `${userName || 'A new user'} just signed up!`,
    { type: 'new_user' }
  );
}

export async function scheduleErrorNotification(error: string) {
  await sendLocalNotification(
    'Error Detected',
    error,
    { type: 'error' }
  );
}
