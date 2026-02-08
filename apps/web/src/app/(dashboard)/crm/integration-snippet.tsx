'use client';

import { useState } from 'react';

interface IntegrationSnippetProps {
  projectId: string;
}

export default function IntegrationSnippet({ projectId }: IntegrationSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

  const snippet = `<!-- Vibe CRM Tracking Script -->
<script>
(function() {
  const VIBE_CONFIG = {
    projectId: '${projectId}',
    supabaseUrl: '${supabaseUrl}',
    supabaseKey: '${supabaseKey}'
  };

  let sessionId = null;
  let userId = null;
  let sessionStartTime = Date.now();

  // Initialize Supabase client
  const supabase = window.supabase?.createClient(
    VIBE_CONFIG.supabaseUrl,
    VIBE_CONFIG.supabaseKey
  );

  if (!supabase) {
    console.error('Supabase client not loaded. Please include Supabase JS SDK.');
    return;
  }

  // Get or create user ID
  function getUserId() {
    let uid = localStorage.getItem('vibe_user_id');
    if (!uid) {
      uid = 'anon_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('vibe_user_id', uid);
    }
    return uid;
  }

  // Track page view
  async function trackPageView() {
    try {
      const { data } = await supabase
        .from('user_events')
        .insert({
          session_id: sessionId,
          user_id: userId,
          project_id: VIBE_CONFIG.projectId,
          event_type: 'page_view',
          page_url: window.location.pathname,
          event_data: {
            referrer: document.referrer,
            title: document.title
          }
        })
        .select()
        .single();
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  }

  // Start session
  async function startSession() {
    userId = getUserId();

    try {
      // Create or get user
      const { data: existingUser } = await supabase
        .from('site_users')
        .select('id')
        .eq('external_id', userId)
        .eq('project_id', VIBE_CONFIG.projectId)
        .single();

      let dbUserId;
      if (existingUser) {
        dbUserId = existingUser.id;
      } else {
        const { data: newUser } = await supabase
          .from('site_users')
          .insert({
            project_id: VIBE_CONFIG.projectId,
            external_id: userId,
            segment: 'visitor'
          })
          .select('id')
          .single();
        dbUserId = newUser?.id;
      }

      // Create session
      const { data: session } = await supabase
        .from('site_sessions')
        .insert({
          user_id: dbUserId,
          project_id: VIBE_CONFIG.projectId,
          device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split('/')[0],
          is_online: true,
          current_page: window.location.pathname
        })
        .select()
        .single();

      sessionId = session?.id;
      userId = dbUserId;

      // Track initial page view
      await trackPageView();

      // Send heartbeat every 30 seconds
      setInterval(sendHeartbeat, 30000);
    } catch (err) {
      console.error('Error starting session:', err);
    }
  }

  // Send heartbeat to keep session alive
  async function sendHeartbeat() {
    if (!sessionId) return;

    try {
      await supabase
        .from('site_sessions')
        .update({
          last_activity_at: new Date().toISOString(),
          current_page: window.location.pathname
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Error sending heartbeat:', err);
    }
  }

  // End session
  async function endSession() {
    if (!sessionId) return;

    try {
      await supabase
        .from('site_sessions')
        .update({
          ended_at: new Date().toISOString(),
          is_online: false
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Error ending session:', err);
    }
  }

  // Track custom event
  window.vibeTrack = async function(eventType, eventData = {}) {
    if (!sessionId || !userId) return;

    try {
      await supabase
        .from('user_events')
        .insert({
          session_id: sessionId,
          user_id: userId,
          project_id: VIBE_CONFIG.projectId,
          event_type: eventType,
          page_url: window.location.pathname,
          event_data: eventData
        });
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  };

  // Identify user
  window.vibeIdentify = async function(userInfo) {
    if (!userId) return;

    try {
      await supabase
        .from('site_users')
        .update({
          email: userInfo.email,
          name: userInfo.name,
          segment: userInfo.segment || 'user',
          metadata: userInfo.metadata || {}
        })
        .eq('id', userId);
    } catch (err) {
      console.error('Error identifying user:', err);
    }
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
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageView();
    }
  }, 500);
})();
</script>

<!-- Include Supabase JS SDK (required) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`;

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
