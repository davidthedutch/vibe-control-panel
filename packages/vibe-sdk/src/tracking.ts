/**
 * @module tracking
 * @description CRM / Analytics tracking module for the Vibe SDK.
 *
 * Provides lightweight session tracking, page view recording, and custom
 * event tracking. Data is batched and sent via `navigator.sendBeacon` for
 * reliability (works even during page unload).
 *
 * The tracker does NOT send data to any remote endpoint by itself. Instead
 * it collects events and exposes them for the Control Panel to read via
 * postMessage. An optional `beaconUrl` can be provided to send data to a
 * server endpoint.
 */

import { generateId, debounce } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single tracked event. */
export interface TrackedEvent {
  /** Unique event identifier */
  id: string;
  /** Event name / type */
  name: string;
  /** Arbitrary payload data */
  data: Record<string, unknown>;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** URL where the event occurred */
  url: string;
  /** Session ID the event belongs to */
  sessionId: string;
}

/** A page view record. */
export interface PageView {
  id: string;
  url: string;
  title: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
}

/** Session metadata. */
export interface SessionData {
  /** Unique session identifier */
  sessionId: string;
  /** ISO 8601 timestamp when the session started */
  startedAt: string;
  /** ISO 8601 timestamp of last activity */
  lastActivityAt: string;
  /** Number of page views in this session */
  pageViewCount: number;
  /** Number of custom events in this session */
  eventCount: number;
  /** Whether the user is currently online */
  isOnline: boolean;
  /** User agent string */
  userAgent: string;
  /** Screen dimensions */
  screen: { width: number; height: number };
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Preferred language */
  language: string;
}

/** Configuration for the tracker. */
export interface TrackingConfig {
  /** Optional URL to send beacon data to */
  beaconUrl?: string;
  /** How often to flush the event batch (ms). Default: 10000 */
  flushInterval?: number;
  /** Maximum events to hold before an automatic flush. Default: 50 */
  maxBatchSize?: number;
}

// ---------------------------------------------------------------------------
// VibeTracking class
// ---------------------------------------------------------------------------

/**
 * Lightweight analytics tracker for the Vibe SDK.
 *
 * Usage:
 * ```ts
 * const tracking = new VibeTracking({ beaconUrl: '/api/events' });
 * tracking.start();
 * tracking.trackPageView(location.href, document.title);
 * tracking.trackEvent('button_click', { label: 'CTA' });
 * // ...
 * tracking.destroy();
 * ```
 */
export class VibeTracking {
  private config: Required<TrackingConfig>;
  private sessionId: string;
  private sessionStartedAt: string;
  private lastActivityAt: string;
  private pageViewCount = 0;
  private eventCount = 0;

  /** Accumulated page views waiting to be flushed. */
  private pageViews: PageView[] = [];
  /** Accumulated events waiting to be flushed. */
  private events: TrackedEvent[] = [];

  /** Timer for periodic flushing. */
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  /** Debounced activity tracker. */
  private _debouncedActivity: (() => void) & { cancel: () => void };

  // Bound handlers for clean removal
  private _onVisibilityChange: (() => void) | null = null;
  private _onBeforeUnload: (() => void) | null = null;
  private _onOnline: (() => void) | null = null;
  private _onOffline: (() => void) | null = null;
  private _onPopState: (() => void) | null = null;

  private started = false;

  /**
   * Creates a new tracking instance.
   *
   * @param config - Optional configuration
   */
  constructor(config: TrackingConfig = {}) {
    this.config = {
      beaconUrl: config.beaconUrl || '',
      flushInterval: config.flushInterval ?? 10_000,
      maxBatchSize: config.maxBatchSize ?? 50,
    };

    this.sessionId = generateId();
    this.sessionStartedAt = new Date().toISOString();
    this.lastActivityAt = this.sessionStartedAt;
    this._debouncedActivity = debounce(() => this._updateActivity(), 1000);
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Starts the tracking session. Installs page visibility, navigation,
   * and online/offline listeners.
   */
  start(): void {
    if (this.started) return;
    this.started = true;

    // Flush timer
    this.flushTimer = setInterval(() => this._flush(), this.config.flushInterval);

    // Visibility change (tab switch / minimise)
    this._onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        this._flush();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    // Before unload - last chance flush
    this._onBeforeUnload = () => this._flush();
    window.addEventListener('beforeunload', this._onBeforeUnload);

    // Online / offline status
    this._onOnline = () =>
      this.trackEvent('connectivity_change', { status: 'online' });
    this._onOffline = () =>
      this.trackEvent('connectivity_change', { status: 'offline' });
    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);

    // SPA navigation via History API
    this._onPopState = () => {
      this.trackPageView(location.href, document.title);
    };
    window.addEventListener('popstate', this._onPopState);

    // User activity (passive, debounced)
    document.addEventListener('click', this._debouncedActivity, { passive: true });
    document.addEventListener('keydown', this._debouncedActivity, { passive: true });
    document.addEventListener('scroll', this._debouncedActivity, { passive: true });
  }

  /**
   * Records a page view.
   *
   * @param url   - The page URL (defaults to current location)
   * @param title - The page title (defaults to document.title)
   */
  trackPageView(url?: string, title?: string): void {
    const pageView: PageView = {
      id: generateId(),
      url: url || location.href,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.pageViews.push(pageView);
    this.pageViewCount += 1;
    this._updateActivity();
    this._maybeFlush();
  }

  /**
   * Records a custom event.
   *
   * @param name - A descriptive event name (e.g. `"button_click"`)
   * @param data - Arbitrary key-value payload
   */
  trackEvent(name: string, data: Record<string, unknown> = {}): void {
    const event: TrackedEvent = {
      id: generateId(),
      name,
      data,
      timestamp: new Date().toISOString(),
      url: location.href,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    this.eventCount += 1;
    this._updateActivity();
    this._maybeFlush();
  }

  /**
   * Tracks the current session state. Returns the current session data
   * and records a `session_heartbeat` event.
   */
  trackSession(): SessionData {
    const session = this.getSessionData();
    this.trackEvent('session_heartbeat', {
      pageViewCount: session.pageViewCount,
      eventCount: session.eventCount,
      durationMs: Date.now() - new Date(session.startedAt).getTime(),
    });
    return session;
  }

  /**
   * Returns the current session metadata without recording an event.
   */
  getSessionData(): SessionData {
    return {
      sessionId: this.sessionId,
      startedAt: this.sessionStartedAt,
      lastActivityAt: this.lastActivityAt,
      pageViewCount: this.pageViewCount,
      eventCount: this.eventCount,
      isOnline: navigator.onLine,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language,
    };
  }

  /**
   * Returns all collected events and page views that have not yet been flushed.
   * Useful for the Control Panel to read data via postMessage without waiting
   * for a beacon flush.
   */
  getPendingData(): { pageViews: PageView[]; events: TrackedEvent[] } {
    return {
      pageViews: [...this.pageViews],
      events: [...this.events],
    };
  }

  /**
   * Tears down all listeners and flushes remaining data.
   * After calling `destroy()` the instance should not be reused.
   */
  destroy(): void {
    if (!this.started) return;
    this.started = false;

    // Final flush
    this._flush();

    // Clear timer
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Remove listeners
    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
    if (this._onBeforeUnload) {
      window.removeEventListener('beforeunload', this._onBeforeUnload);
    }
    if (this._onOnline) {
      window.removeEventListener('online', this._onOnline);
    }
    if (this._onOffline) {
      window.removeEventListener('offline', this._onOffline);
    }
    if (this._onPopState) {
      window.removeEventListener('popstate', this._onPopState);
    }

    document.removeEventListener('click', this._debouncedActivity);
    document.removeEventListener('keydown', this._debouncedActivity);
    document.removeEventListener('scroll', this._debouncedActivity);
    this._debouncedActivity.cancel();

    this.pageViews = [];
    this.events = [];
  }

  // -----------------------------------------------------------------------
  // Private methods
  // -----------------------------------------------------------------------

  /** Updates the last-activity timestamp. */
  private _updateActivity(): void {
    this.lastActivityAt = new Date().toISOString();
  }

  /** Flushes if batch size threshold is reached. */
  private _maybeFlush(): void {
    const total = this.pageViews.length + this.events.length;
    if (total >= this.config.maxBatchSize) {
      this._flush();
    }
  }

  /**
   * Sends all accumulated data via `navigator.sendBeacon` (if a beacon URL
   * is configured) and clears the internal buffers.
   */
  private _flush(): void {
    if (this.pageViews.length === 0 && this.events.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      events: this.events,
      flushedAt: new Date().toISOString(),
    };

    // Send via beacon if URL is configured
    if (this.config.beaconUrl) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(this.config.beaconUrl, blob);
      } catch {
        // Beacon may fail in some environments -- degrade gracefully
      }
    }

    // Clear buffers after sending
    this.pageViews = [];
    this.events = [];
  }
}
