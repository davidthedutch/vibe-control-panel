import { promises as fs } from 'fs';
import path from 'path';
import { HistoryPoint, HealthCheckResult } from './types';

const HISTORY_FILE = path.join(process.cwd(), '.health-history.json');
const MAX_HISTORY_DAYS = 90; // Keep 90 days of history

interface StoredHistory {
  history: HistoryPoint[];
  lastUpdated: string;
}

export async function loadHistory(): Promise<HistoryPoint[]> {
  try {
    const content = await fs.readFile(HISTORY_FILE, 'utf-8');
    const data: StoredHistory = JSON.parse(content);
    return data.history || [];
  } catch {
    // File doesn't exist or is invalid, return empty history
    return [];
  }
}

export async function saveHistory(score: number): Promise<void> {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0]; // YYYY-MM-DD

  try {
    const history = await loadHistory();

    // Check if we already have an entry for today
    const todayIndex = history.findIndex(h => h.date === date);

    if (todayIndex >= 0) {
      // Update today's score
      history[todayIndex] = { date, score, timestamp };
    } else {
      // Add new entry
      history.push({ date, score, timestamp });
    }

    // Sort by date
    history.sort((a, b) => a.date.localeCompare(b.date));

    // Keep only last MAX_HISTORY_DAYS days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const filtered = history.filter(h => h.date >= cutoffDateStr);

    const data: StoredHistory = {
      history: filtered,
      lastUpdated: timestamp,
    };

    await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save health history:', error);
    throw error;
  }
}

export async function getRecentHistory(days: number = 30): Promise<HistoryPoint[]> {
  const history = await loadHistory();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  return history.filter(h => h.date >= cutoffDateStr);
}

export async function clearHistory(): Promise<void> {
  try {
    await fs.unlink(HISTORY_FILE);
  } catch {
    // File doesn't exist, nothing to do
  }
}

// Generate placeholder history data for initial setup
export function generatePlaceholderHistory(days: number = 30): HistoryPoint[] {
  const history: HistoryPoint[] = [];
  const baseScore = 70;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate a somewhat realistic score progression
    const variation = Math.sin(i * 0.3) * 10 + Math.random() * 8;
    const score = Math.max(45, Math.min(100, Math.round(baseScore + variation)));

    history.push({
      date: date.toISOString().split('T')[0],
      score,
      timestamp: date.toISOString(),
    });
  }

  return history;
}
