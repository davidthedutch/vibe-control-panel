'use client';

import { useState, useEffect } from 'react';
import { Database, Globe, Bug, BarChart3, CreditCard, Mail, ExternalLink, Loader2, Save, Settings } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  url: string;
  accentColor: string;
  config?: {
    apiKey?: string;
    projectId?: string;
    webhookUrl?: string;
    [key: string]: string | undefined;
  };
}

interface IntegrationsData {
  integrations: Integration[];
}

const defaultIntegrations: Integration[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, auth en realtime functionaliteit.',
    icon: <Database className="h-6 w-6" />,
    connected: true,
    url: 'https://supabase.com',
    accentColor: 'bg-emerald-500',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Hosting, deployments en edge functies.',
    icon: <Globe className="h-6 w-6" />,
    connected: true,
    url: 'https://vercel.com',
    accentColor: 'bg-slate-800 dark:bg-white',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Error tracking en performance monitoring.',
    icon: <Bug className="h-6 w-6" />,
    connected: false,
    url: 'https://sentry.io',
    accentColor: 'bg-purple-600',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    description: 'Product analytics en feature flags.',
    icon: <BarChart3 className="h-6 w-6" />,
    connected: false,
    url: 'https://posthog.com',
    accentColor: 'bg-orange-500',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Betalingen, subscriptions en facturatie.',
    icon: <CreditCard className="h-6 w-6" />,
    connected: false,
    url: 'https://stripe.com',
    accentColor: 'bg-indigo-600',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Transactionele e-mails en e-mail templates.',
    icon: <Mail className="h-6 w-6" />,
    connected: false,
    url: 'https://resend.com',
    accentColor: 'bg-sky-500',
  },
];

export default function Integrations() {
  const defaultData: IntegrationsData = { integrations: defaultIntegrations };
  const { data, loading, save, saving } = useSettings<IntegrationsData>('integrations', defaultData);
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);
  const [saved, setSaved] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);

  // Sync data from API to local state
  useEffect(() => {
    if (data?.integrations) {
      setIntegrations(data.integrations);
    }
  }, [data]);

  async function handleSave() {
    try {
      await save({ integrations });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save integrations:', error);
      alert('Failed to save integrations. Please try again.');
    }
  }

  function toggleConnection(id: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
  }

  function updateConfig(id: string, key: string, value: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, config: { ...i.config, [key]: value } }
          : i
      )
    );
  }

  const connectedCount = integrations.filter((i) => i.connected).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {connectedCount}
          </span>{' '}
          van {integrations.length} integraties verbonden
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4" />
              Opgeslagen!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Opslaan
            </>
          )}
        </button>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800 ${
              integration.connected
                ? 'border-slate-200 dark:border-slate-700'
                : 'border-slate-100 dark:border-slate-700/50'
            }`}
          >
            {/* Accent bar */}
            <div className={`absolute left-0 top-0 h-1 w-full ${integration.accentColor}`} />

            <div className="flex items-start justify-between">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  integration.connected
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {integration.icon}
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    integration.connected
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    integration.connected
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {integration.connected ? 'Verbonden' : 'Niet verbonden'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {integration.name}
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {integration.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => toggleConnection(integration.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  integration.connected
                    ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {integration.connected ? 'Ontkoppelen' : 'Verbinden'}
              </button>
              <button
                onClick={() => setConfiguring(configuring === integration.id ? null : integration.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label={`Configure ${integration.name}`}
              >
                <Settings className="h-4 w-4" />
              </button>
              <a
                href={integration.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label={`Open ${integration.name} website`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Configuration Panel */}
            {configuring === integration.id && (
              <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Configuration
                </h5>
                {integration.id === 'supabase' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Project URL
                      </label>
                      <input
                        type="url"
                        value={integration.config?.projectId || ''}
                        onChange={(e) => updateConfig(integration.id, 'projectId', e.target.value)}
                        placeholder="https://xxxxx.supabase.co"
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Anon Key
                      </label>
                      <input
                        type="password"
                        value={integration.config?.apiKey || ''}
                        onChange={(e) => updateConfig(integration.id, 'apiKey', e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                    </div>
                  </>
                )}
                {integration.id === 'vercel' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Team ID
                      </label>
                      <input
                        type="text"
                        value={integration.config?.projectId || ''}
                        onChange={(e) => updateConfig(integration.id, 'projectId', e.target.value)}
                        placeholder="team_xxxxxxxxxxxxx"
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        API Token
                      </label>
                      <input
                        type="password"
                        value={integration.config?.apiKey || ''}
                        onChange={(e) => updateConfig(integration.id, 'apiKey', e.target.value)}
                        placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                    </div>
                  </>
                )}
                {integration.id === 'sentry' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        DSN
                      </label>
                      <input
                        type="text"
                        value={integration.config?.apiKey || ''}
                        onChange={(e) => updateConfig(integration.id, 'apiKey', e.target.value)}
                        placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                    </div>
                  </>
                )}
                {(integration.id === 'posthog' || integration.id === 'stripe' || integration.id === 'resend') && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={integration.config?.apiKey || ''}
                      onChange={(e) => updateConfig(integration.id, 'apiKey', e.target.value)}
                      placeholder="Enter API key"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
