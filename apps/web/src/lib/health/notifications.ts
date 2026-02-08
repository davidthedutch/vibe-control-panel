import { HealthCheck } from './types';
import { promises as fs } from 'fs';
import path from 'path';

interface NotificationConfig {
  enabled: boolean;
  notifyOnFail: boolean;
  notifyOnWarn: boolean;
  notifyOnScoreDrops: boolean;
  scoreDropThreshold: number; // Notify if score drops by this amount
}

interface Notification {
  id: string;
  timestamp: string;
  type: 'fail' | 'warn' | 'score_drop';
  title: string;
  message: string;
  read: boolean;
}

const NOTIFICATIONS_FILE = path.join(process.cwd(), '.health-notifications.json');
const CONFIG_FILE = path.join(process.cwd(), '.health-config.json');

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  notifyOnFail: true,
  notifyOnWarn: true,
  notifyOnScoreDrops: true,
  scoreDropThreshold: 10,
};

export async function loadConfig(): Promise<NotificationConfig> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: NotificationConfig): Promise<void> {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export async function loadNotifications(): Promise<Notification[]> {
  try {
    const content = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return data.notifications || [];
  } catch {
    return [];
  }
}

export async function saveNotifications(notifications: Notification[]): Promise<void> {
  await fs.writeFile(
    NOTIFICATIONS_FILE,
    JSON.stringify({ notifications }, null, 2),
    'utf-8'
  );
}

export async function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
  const notifications = await loadNotifications();

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(newNotification);

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);

  await saveNotifications(trimmed);
}

export async function markAsRead(notificationId: string): Promise<void> {
  const notifications = await loadNotifications();
  const notification = notifications.find(n => n.id === notificationId);

  if (notification) {
    notification.read = true;
    await saveNotifications(notifications);
  }
}

export async function markAllAsRead(): Promise<void> {
  const notifications = await loadNotifications();
  notifications.forEach(n => n.read = true);
  await saveNotifications(notifications);
}

export async function checkAndNotify(
  checks: HealthCheck[],
  currentScore: number,
  previousScore?: number
): Promise<void> {
  const config = await loadConfig();

  if (!config.enabled) {
    return;
  }

  // Check for failures
  if (config.notifyOnFail) {
    const failures = checks.filter(c => c.status === 'fail');
    for (const check of failures) {
      await addNotification({
        type: 'fail',
        title: `Check Failed: ${check.name}`,
        message: check.details,
      });
    }
  }

  // Check for warnings
  if (config.notifyOnWarn) {
    const warnings = checks.filter(c => c.status === 'warn');
    for (const check of warnings) {
      await addNotification({
        type: 'warn',
        title: `Warning: ${check.name}`,
        message: check.details,
      });
    }
  }

  // Check for score drops
  if (config.notifyOnScoreDrops && previousScore !== undefined) {
    const drop = previousScore - currentScore;
    if (drop >= config.scoreDropThreshold) {
      await addNotification({
        type: 'score_drop',
        title: 'Health Score Dropped',
        message: `Score decreased from ${previousScore} to ${currentScore} (-${drop} points)`,
      });
    }
  }
}

export async function getUnreadCount(): Promise<number> {
  const notifications = await loadNotifications();
  return notifications.filter(n => !n.read).length;
}
