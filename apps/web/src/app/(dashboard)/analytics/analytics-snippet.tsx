'use client';

import { useState } from 'react';
import { Code, Copy, Check, Download, Eye, EyeOff } from 'lucide-react';

interface AnalyticsSnippetProps {
  projectId: string;
  projectName?: string;
}

export default function AnalyticsSnippet({ projectId, projectName = 'Your Project' }: AnalyticsSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<'vanilla' | 'react' | 'next' | 'vue'>('vanilla');

  // Generate mock API key for demo
  const apiKey = `vcp_${projectId.split('-')[0]}_${Math.random().toString(36).substring(7)}`;

  const snippets = {
    vanilla: `<!-- Vibe Analytics Tracking Script -->
<script>
  (function() {
    window.vibeAnalytics = {
      projectId: '${projectId}',
      apiKey: '${showApiKey ? apiKey : '••••••••••••••••'}',
      config: {
        autoTrack: true,
        trackPageviews: true,
        trackClicks: true,
        trackForms: true,
      }
    };

    var script = document.createElement('script');
    script.src = 'https://cdn.vibecontrol.app/analytics.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>

<!-- Track custom events -->
<script>
  // Wait for analytics to load
  window.addEventListener('load', function() {
    // Track a custom event
    vibeAnalytics.track('custom_event', {
      category: 'engagement',
      label: 'button_clicked',
      value: 1
    });

    // Track page view manually
    vibeAnalytics.trackPageview('/custom-page');

    // Identify user
    vibeAnalytics.identify({
      userId: 'user_123',
      email: 'user@example.com',
      name: 'John Doe'
    });
  });
</script>`,

    react: `// Install the Vibe Analytics SDK
// npm install @vibe-control/analytics

import { useEffect } from 'react';
import { VibeAnalytics } from '@vibe-control/analytics';

// Initialize analytics
const analytics = new VibeAnalytics({
  projectId: '${projectId}',
  apiKey: '${showApiKey ? apiKey : '••••••••••••••••'}',
  config: {
    autoTrack: true,
    trackPageviews: true,
    trackClicks: true,
    trackForms: true,
  }
});

function App() {
  useEffect(() => {
    // Track page view on mount
    analytics.trackPageview(window.location.pathname);
  }, []);

  const handleButtonClick = () => {
    // Track custom event
    analytics.track('button_clicked', {
      button: 'cta',
      location: 'hero'
    });
  };

  return (
    <div>
      <button onClick={handleButtonClick}>
        Click me
      </button>
    </div>
  );
}

export default App;`,

    next: `// app/providers.tsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { VibeAnalytics } from '@vibe-control/analytics';

const analytics = new VibeAnalytics({
  projectId: '${projectId}',
  apiKey: '${showApiKey ? apiKey : '••••••••••••••••'}',
  config: {
    autoTrack: true,
    trackPageviews: true,
    trackClicks: true,
    trackForms: true,
  }
});

const AnalyticsContext = createContext(analytics);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => useContext(AnalyticsContext);

// app/layout.tsx
import { AnalyticsProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}

// Usage in components
import { useAnalytics } from './providers';

export default function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.track('custom_event', { foo: 'bar' });
  };

  return <button onClick={handleClick}>Track Event</button>;
}`,

    vue: `<!-- Install the Vibe Analytics SDK -->
<!-- npm install @vibe-control/analytics -->

<!-- main.js or main.ts -->
<script>
import { createApp } from 'vue';
import App from './App.vue';
import { VibeAnalytics } from '@vibe-control/analytics';

const app = createApp(App);

// Create analytics instance
const analytics = new VibeAnalytics({
  projectId: '${projectId}',
  apiKey: '${showApiKey ? apiKey : '••••••••••••••••'}',
  config: {
    autoTrack: true,
    trackPageviews: true,
    trackClicks: true,
    trackForms: true,
  }
});

// Make it available globally
app.config.globalProperties.$analytics = analytics;

// Initialize
analytics.init();

app.mount('#app');
</script>

<!-- Usage in components -->
<template>
  <button @click="trackEvent">Click me</button>
</template>

<script setup>
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const analytics = instance?.appContext.config.globalProperties.$analytics;

const trackEvent = () => {
  analytics?.track('button_clicked', {
    component: 'MyComponent',
    action: 'click'
  });
};
</script>`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[selectedFramework]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([snippets[selectedFramework]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-analytics-${selectedFramework}.${selectedFramework === 'vanilla' ? 'html' : selectedFramework === 'react' ? 'jsx' : selectedFramework === 'next' ? 'tsx' : 'vue'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Analytics Tracking Code
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Integreer Vibe Analytics in je website
          </p>
        </div>
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showApiKey ? 'Verberg' : 'Toon'} API Key
        </button>
      </div>

      {/* Framework tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['vanilla', 'react', 'next', 'vue'] as const).map((fw) => (
          <button
            key={fw}
            onClick={() => setSelectedFramework(fw)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedFramework === fw
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {fw === 'vanilla'
              ? 'HTML/JS'
              : fw === 'next'
                ? 'Next.js'
                : fw.charAt(0).toUpperCase() + fw.slice(1)}
          </button>
        ))}
      </div>

      {/* Code snippet */}
      <div className="relative">
        <pre className="max-h-[500px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 dark:border-slate-700">
          <code>{snippets[selectedFramework]}</code>
        </pre>

        {/* Action buttons */}
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            onClick={handleDownload}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Kopieer naar klembord"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Installation instructions */}
      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Installatie Instructies
            </h4>
            <div className="mt-2 space-y-2 text-xs text-blue-800 dark:text-blue-200">
              {selectedFramework === 'vanilla' ? (
                <>
                  <p>1. Plak de tracking code in de &lt;head&gt; sectie van je HTML</p>
                  <p>2. De analytics SDK wordt automatisch geladen en begint met tracken</p>
                  <p>3. Custom events kunnen overal in je code getrackt worden</p>
                </>
              ) : (
                <>
                  <p>1. Installeer de Vibe Analytics SDK via npm of yarn</p>
                  <p>2. Initialiseer de analytics client met je project credentials</p>
                  <p>3. Track events met de track() methode</p>
                  <p>4. Pageviews worden automatisch getrackt (indien autoTrack: true)</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key info */}
      <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-200 p-1 dark:bg-amber-900/50">
            <svg className="h-4 w-4 text-amber-800 dark:text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Belangrijk
            </h4>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              Bewaar je API key veilig. Gebruik omgevingsvariabelen voor je credentials in productie.
              Voor client-side implementaties is de public key veilig om te delen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
