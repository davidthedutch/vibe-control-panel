'use client';

import { useState } from 'react';

interface IntegrationSnippetProps {
  projectId: string;
}

export default function IntegrationSnippet({ projectId }: IntegrationSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? 'https://vibe-control-panel-web.vercel.app'
    : 'http://localhost:3000';

  const snippet = `<!-- Vibe CRM Tracking Script -->
<script>
(function() {
  const VIBE_CONFIG = {
    projectId: '${projectId}',
    apiUrl: '${apiBase}/api/crm/track'
  };

  let sessionId = null;
  let userId = null;

  // Get or create anonymous user ID
  function getUserId() {
    let uid = localStorage.getItem('vibe_user_id');
    if (!uid) {
      uid = 'anon_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('vibe_user_id', uid);
    }
    return uid;
  }

  // Send tracking request to API
  async function track(action, data) {
    try {
      const res = await fetch(VIBE_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          projectId: VIBE_CONFIG.projectId,
          ...data
        })
      });
      return await res.json();
    } catch (err) {
      console.error('Vibe tracking error:', err);
      return null;
    }
  }

  // Track page view
  async function trackPageView() {
    if (!sessionId || !userId) return;
    await track('page_view', {
      sessionId: sessionId,
      userId: userId,
      pageUrl: window.location.pathname,
      eventData: {
        referrer: document.referrer,
        title: document.title
      }
    });
  }

  // Start session
  async function startSession() {
    const externalId = getUserId();

    const result = await track('session_start', {
      externalId: externalId,
      device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent.split('/')[0],
      currentPage: window.location.pathname
    });

    if (result) {
      sessionId = result.sessionId;
      userId = result.userId;
      await trackPageView();
      setInterval(sendHeartbeat, 30000);
    }
  }

  // Send heartbeat
  async function sendHeartbeat() {
    if (!sessionId) return;
    await track('heartbeat', {
      sessionId: sessionId,
      currentPage: window.location.pathname
    });
  }

  // End session
  async function endSession() {
    if (!sessionId) return;
    navigator.sendBeacon(VIBE_CONFIG.apiUrl, JSON.stringify({
      action: 'session_end',
      projectId: VIBE_CONFIG.projectId,
      sessionId: sessionId
    }));
  }

  // Track custom event
  window.vibeTrack = async function(eventType, eventData) {
    if (!sessionId || !userId) return;
    await track('event', {
      sessionId: sessionId,
      userId: userId,
      eventType: eventType,
      pageUrl: window.location.pathname,
      eventData: eventData || {}
    });
  };

  // Identify user
  window.vibeIdentify = async function(userInfo) {
    if (!userId) return;
    await track('identify', {
      userId: userId,
      email: userInfo.email,
      name: userInfo.name,
      segment: userInfo.segment || 'user',
      metadata: userInfo.metadata || {}
    });
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSession);
  } else {
    startSession();
  }

  // End session on page unload
  window.addEventListener('beforeunload', endSession);

  // Track page changes for SPAs
  let lastPath = window.location.pathname;
  setInterval(function() {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageView();
    }
  }, 500);
})();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        Integratie Code
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsOpen(false)}>
      <div
        className="relative w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tracking Integratie</h2>
              <p className="mt-1 text-sm text-gray-500">
                Plaats deze code in de {'<head>'} van je website om tracking in te schakelen
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="px-6 py-4">
          <div className="relative">
            <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
              <code>{snippet}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute right-6 top-6 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
            >
              {copied ? 'Gekopieerd!' : 'Kopieer'}
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="mt-4 space-y-3 rounded-lg bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">Gebruik:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>1.</strong> Plaats de code in de {'<head>'} van elke pagina die je wilt tracken
              </p>
              <p>
                <strong>2.</strong> Gebruik <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">window.vibeTrack('event_name', data)</code> om custom events te tracken
              </p>
              <p>
                <strong>3.</strong> Gebruik <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs">window.vibeIdentify({'{'} email, name {'}'})</code> om gebruikers te identificeren
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
