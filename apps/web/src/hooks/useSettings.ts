import { useState, useEffect, useCallback } from 'react';

interface UseSettingsReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  save: (data: T) => Promise<void>;
  saving: boolean;
}

export function useSettings<T>(
  section: string,
  defaultValue: T
): UseSettingsReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings?projectId=default');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const allSettings = await response.json();
        setData(allSettings[section] || defaultValue);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [section, defaultValue]);

  // Save settings
  const save = useCallback(
    async (newData: T) => {
      setSaving(true);
      setError(null);

      try {
        const response = await fetch('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'default',
            section,
            data: newData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save settings');
        }

        setData(newData);
      } catch (err) {
        console.error('Error saving settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [section]
  );

  return { data, loading, error, save, saving };
}
