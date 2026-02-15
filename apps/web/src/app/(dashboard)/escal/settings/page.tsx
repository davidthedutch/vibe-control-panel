'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  Bot,
  TrendingUp,
  Activity,
  Radio,
  Save,
  Loader2,
  Music,
  Settings,
  Clock,
  Shield,
  Flag,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useEscalSettings, type EscalSettings } from '@/lib/hooks/use-escal-data';

// ---------------------------------------------------------------------------
// Sub Navigation
// ---------------------------------------------------------------------------

const subNavItems = [
  { label: 'Dashboard', href: '/escal', icon: Activity },
  { label: 'Events', href: '/escal/events', icon: Calendar },
  { label: 'Users', href: '/escal/users', icon: Users },
  { label: 'Live', href: '/escal/live', icon: Radio },
  { label: 'Scrapers', href: '/escal/scrapers', icon: Bot },
  { label: 'Verificatie', href: '/escal/scrapers/verificatie', icon: ShieldCheck },
  { label: 'Analytics', href: '/escal/analytics', icon: TrendingUp },
];

function SubNav({ current }: { current: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {subNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = current === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-orange-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/escal/settings"
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          enabled ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input Field
// ---------------------------------------------------------------------------

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  description,
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  description?: string;
  suffix?: string;
}) {
  return (
    <div className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <label className="block">
        <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {suffix && (
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{suffix}</span>
          )}
        </div>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keywords Editor
// ---------------------------------------------------------------------------

function KeywordsEditor({
  keywords,
  onChange,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
}) {
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      onChange([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    onChange(keywords.filter((k) => k !== keyword));
  };

  return (
    <div className="py-4">
      <p className="font-medium text-slate-900 dark:text-slate-100">Moderation Keywords</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Messages containing these keywords will be auto-flagged for review
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="ml-1 rounded-full p-0.5 hover:bg-red-200 dark:hover:bg-red-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="Add keyword..."
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          onClick={addKeyword}
          className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buddy Intervals Editor
// ---------------------------------------------------------------------------

function BuddyIntervalsEditor({
  intervals,
  onChange,
}: {
  intervals: number[];
  onChange: (intervals: number[]) => void;
}) {
  const toggleInterval = (interval: number) => {
    if (intervals.includes(interval)) {
      onChange(intervals.filter((i) => i !== interval));
    } else {
      onChange([...intervals, interval].sort((a, b) => a - b));
    }
  };

  const availableIntervals = [5, 10, 15, 30, 45, 60, 90, 120];

  return (
    <div className="py-4 border-b border-slate-100 dark:border-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">Buddy Check Intervals</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Available check-in interval options for buddy pairs (in minutes)
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {availableIntervals.map((interval) => {
          const isEnabled = intervals.includes(interval);
          return (
            <button
              key={interval}
              onClick={() => toggleInterval(interval)}
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isEnabled
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {interval} min
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { settings, loading, saving, saveSettings } = useEscalSettings();
  const [localSettings, setLocalSettings] = useState<EscalSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local settings when loaded
  if (!localSettings && settings && !loading) {
    setLocalSettings(settings);
  }

  const updateSetting = <K extends keyof EscalSettings>(
    key: K,
    value: EscalSettings[K]
  ) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
  };

  const updateScraperInterval = (source: 'ra' | 'partyflock' | 'djguide', value: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      scraperIntervals: { ...localSettings.scraperIntervals, [source]: value },
    });
    setHasChanges(true);
  };

  const updateFeatureFlag = (flag: keyof EscalSettings['featureFlags'], value: boolean) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      featureFlags: { ...localSettings.featureFlags, [flag]: value },
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localSettings) return;
    const success = await saveSettings(localSettings);
    if (success) {
      setHasChanges(false);
    }
  };

  if (loading || !localSettings) {
    return (
      <div className="mx-auto max-w-7xl">
        <SubNav current="/escal/settings" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Music className="h-5 w-5" />
            </div>
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure scraper intervals, location settings, and feature flags
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Sub Navigation */}
      <SubNav current="/escal/settings" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scraper Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Bot className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Scraper Intervals
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure how often each scraper runs (cron expressions)
          </p>

          <div className="mt-4 space-y-4">
            <InputField
              label="Resident Advisor"
              value={localSettings.scraperIntervals.ra}
              onChange={(v) => updateScraperInterval('ra', v)}
              description="Cron expression for RA scraper"
            />
            <InputField
              label="Partyflock"
              value={localSettings.scraperIntervals.partyflock}
              onChange={(v) => updateScraperInterval('partyflock', v)}
              description="Cron expression for Partyflock scraper"
            />
            <InputField
              label="DJ Guide"
              value={localSettings.scraperIntervals.djguide}
              onChange={(v) => updateScraperInterval('djguide', v)}
              description="Cron expression for DJ Guide scraper"
            />
          </div>
        </div>

        {/* Location Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Location Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure location sharing and radius chat settings
          </p>

          <div className="mt-4 space-y-4">
            <InputField
              label="Location Expiration"
              value={localSettings.locationExpirationMinutes}
              onChange={(v) => updateSetting('locationExpirationMinutes', parseInt(v) || 60)}
              type="number"
              suffix="minutes"
              description="How long location shares remain active"
            />
            <InputField
              label="Radius Chat Distance"
              value={localSettings.radiusChatDistanceMeters}
              onChange={(v) => updateSetting('radiusChatDistanceMeters', parseInt(v) || 500)}
              type="number"
              suffix="meters"
              description="Maximum distance for radius chat messages"
            />
          </div>
        </div>

        {/* Buddy System Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Buddy System
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure buddy check-in interval options
          </p>

          <div className="mt-4">
            <BuddyIntervalsEditor
              intervals={localSettings.buddyCheckIntervals}
              onChange={(intervals) => updateSetting('buddyCheckIntervals', intervals)}
            />
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            Moderation
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure content moderation settings
          </p>

          <div className="mt-4">
            <KeywordsEditor
              keywords={localSettings.moderationKeywords}
              onChange={(keywords) => updateSetting('moderationKeywords', keywords)}
            />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <Flag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Feature Flags
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enable or disable features across the platform
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Toggle
                enabled={localSettings.featureFlags.liveLocations}
                onChange={(v) => updateFeatureFlag('liveLocations', v)}
                label="Live Locations"
                description="Allow users to share their live location"
              />
            </div>
            <div className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Toggle
                enabled={localSettings.featureFlags.radiusChat}
                onChange={(v) => updateFeatureFlag('radiusChat', v)}
                label="Radius Chat"
                description="Enable location-based chat within events"
              />
            </div>
            <div className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Toggle
                enabled={localSettings.featureFlags.buddySystem}
                onChange={(v) => updateFeatureFlag('buddySystem', v)}
                label="Buddy System"
                description="Enable buddy pairs with check-in reminders"
              />
            </div>
            <div className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Toggle
                enabled={localSettings.featureFlags.gamification}
                onChange={(v) => updateFeatureFlag('gamification', v)}
                label="Gamification"
                description="Enable XP, levels, badges, and achievements"
              />
            </div>
            <div className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Toggle
                enabled={localSettings.featureFlags.arena}
                onChange={(v) => updateFeatureFlag('arena', v)}
                label="Arena"
                description="Live event dashboard met timers, stappen, shazam, status en plattegrond"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 shadow-lg dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            You have unsaved changes
          </p>
        </div>
      )}
    </div>
  );
}
