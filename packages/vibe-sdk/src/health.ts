/**
 * @module health
 * @description Health data collection module for the Vibe SDK.
 *
 * Passively monitors the host page for errors, performance regressions,
 * broken assets, and basic accessibility issues. The collected data is
 * reported to the Control Panel on demand via the `VIBE_HEALTH_REPORT`
 * message.
 *
 * Design principles:
 * - Non-invasive: only reads data, never modifies the host page
 * - Performance-conscious: uses passive listeners, avoids synchronous layouts
 * - Fault-tolerant: internal failures are silently caught so the host page
 *   is never affected
 */

import type {
  AccessibilityIssue,
  BrokenAsset,
  CapturedError,
  HealthReportData,
  PerformanceSnapshot,
} from './protocol';

// ---------------------------------------------------------------------------
// VibeHealth class
// ---------------------------------------------------------------------------

/**
 * Collects health metrics from the host page.
 *
 * Usage:
 * ```ts
 * const health = new VibeHealth();
 * health.start();
 * // ...later...
 * const report = health.generateHealthReport();
 * health.destroy();
 * ```
 */
export class VibeHealth {
  /** Captured console & window errors. */
  private errors: CapturedError[] = [];

  /** Maximum number of errors to retain (prevents unbounded memory growth). */
  private maxErrors = 200;

  /** Reference to the original `console.error` so we can restore it. */
  private originalConsoleError: typeof console.error | null = null;

  // Bound handler references for clean removal
  private _onError: ((event: ErrorEvent) => void) | null = null;
  private _onUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;

  private started = false;

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Starts error capturing. Installs global listeners for `window.onerror`,
   * `unhandledrejection`, and wraps `console.error`.
   */
  start(): void {
    if (this.started) return;
    this.started = true;

    this._captureConsoleErrors();
    this._captureWindowErrors();
  }

  /**
   * Generates a comprehensive health report from the current page state.
   * This is a snapshot -- the returned data will not update after creation.
   *
   * @returns A `HealthReportData` payload
   */
  generateHealthReport(): HealthReportData {
    return {
      errors: [...this.errors],
      performance: this.getPerformanceMetrics(),
      brokenImages: this.getBrokenImages(),
      brokenLinks: this.getBrokenLinks(),
      accessibilityIssues: this.getAccessibilityIssues(),
      timestamp: Date.now(),
    };
  }

  /**
   * Removes all listeners and restores original `console.error`.
   * After calling `destroy()` the instance should not be reused.
   */
  destroy(): void {
    this.started = false;

    // Restore console.error
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
      this.originalConsoleError = null;
    }

    // Remove window listeners
    if (this._onError) {
      window.removeEventListener('error', this._onError);
      this._onError = null;
    }
    if (this._onUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this._onUnhandledRejection);
      this._onUnhandledRejection = null;
    }

    this.errors = [];
  }

  // -----------------------------------------------------------------------
  // Error capturing
  // -----------------------------------------------------------------------

  /**
   * Wraps `console.error` to capture logged errors while still forwarding
   * them to the original implementation.
   */
  private _captureConsoleErrors(): void {
    try {
      this.originalConsoleError = console.error.bind(console);
      const self = this;

      console.error = function (...args: unknown[]) {
        try {
          const message = args
            .map((a) => {
              if (a instanceof Error) return `${a.name}: ${a.message}`;
              if (typeof a === 'string') return a;
              try {
                return JSON.stringify(a);
              } catch {
                return String(a);
              }
            })
            .join(' ');

          self._pushError({
            message,
            source: 'console.error',
            timestamp: Date.now(),
          });
        } catch {
          // Swallow -- never break the host page
        }

        // Forward to original
        if (self.originalConsoleError) {
          self.originalConsoleError.apply(console, args);
        }
      };
    } catch {
      // Could not wrap console.error -- continue without it
    }
  }

  /**
   * Installs listeners for `window.onerror` and `unhandledrejection`.
   */
  private _captureWindowErrors(): void {
    this._onError = (event: ErrorEvent) => {
      try {
        this._pushError({
          message: event.message || 'Unknown error',
          source: event.filename || undefined,
          lineno: event.lineno || undefined,
          colno: event.colno || undefined,
          stack: event.error?.stack || undefined,
          timestamp: Date.now(),
        });
      } catch {
        // Swallow
      }
    };

    this._onUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason;
        const message =
          reason instanceof Error
            ? `Unhandled Promise Rejection: ${reason.message}`
            : `Unhandled Promise Rejection: ${String(reason)}`;

        this._pushError({
          message,
          stack: reason instanceof Error ? reason.stack : undefined,
          source: 'unhandledrejection',
          timestamp: Date.now(),
        });
      } catch {
        // Swallow
      }
    };

    window.addEventListener('error', this._onError);
    window.addEventListener('unhandledrejection', this._onUnhandledRejection);
  }

  // -----------------------------------------------------------------------
  // Performance
  // -----------------------------------------------------------------------

  /**
   * Reads current performance metrics from the browser's Performance API.
   *
   * @returns A `PerformanceSnapshot` object
   */
  getPerformanceMetrics(): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      navigationTiming: {},
      resourceCount: 0,
      lcp: null,
      cls: null,
      domContentLoaded: 0,
      fullyLoaded: 0,
    };

    try {
      // Navigation timing
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        snapshot.navigationTiming = {
          dns: nav.domainLookupEnd - nav.domainLookupStart,
          tcp: nav.connectEnd - nav.connectStart,
          ttfb: nav.responseStart - nav.requestStart,
          download: nav.responseEnd - nav.responseStart,
          domInteractive: nav.domInteractive - nav.startTime,
          domComplete: nav.domComplete - nav.startTime,
          loadEvent: nav.loadEventEnd - nav.startTime,
        };
        snapshot.domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
        snapshot.fullyLoaded = nav.loadEventEnd - nav.startTime;
      }

      // Resource count
      snapshot.resourceCount = performance.getEntriesByType('resource').length;

      // LCP (Largest Contentful Paint) -- read from PerformanceObserver entries
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        snapshot.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // CLS (Cumulative Layout Shift) -- read from layout-shift entries
      const layoutShifts = performance.getEntriesByType('layout-shift') as Array<
        PerformanceEntry & { hadRecentInput?: boolean; value?: number }
      >;
      if (layoutShifts.length > 0) {
        snapshot.cls = layoutShifts
          .filter((entry) => !entry.hadRecentInput)
          .reduce((sum, entry) => sum + (entry.value || 0), 0);
      }
    } catch {
      // Performance API may not be fully available in all environments
    }

    return snapshot;
  }

  // -----------------------------------------------------------------------
  // Broken assets
  // -----------------------------------------------------------------------

  /**
   * Scans all `<img>` elements in the document for images that failed to load.
   *
   * @returns An array of `BrokenAsset` records
   */
  getBrokenImages(): BrokenAsset[] {
    const broken: BrokenAsset[] = [];

    try {
      const images = document.querySelectorAll<HTMLImageElement>('img');
      images.forEach((img) => {
        // naturalWidth === 0 indicates the image didn't load successfully
        // Also check for explicit error states
        const isBroken =
          (!img.complete && img.src) ||
          (img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'));

        if (isBroken) {
          broken.push({
            src: img.src || img.getAttribute('src') || '(empty)',
            element: this._getSelector(img),
            alt: img.alt || undefined,
          });
        }
      });
    } catch {
      // DOM traversal may fail in edge cases
    }

    return broken;
  }

  /**
   * Scans all `<a>` elements for broken or empty href values.
   *
   * Detected issues:
   * - Missing `href` attribute entirely
   * - Empty `href` (`""`)
   * - Hash-only `href` (`"#"`)
   * - JavaScript void links (`javascript:void(0)`)
   *
   * @returns An array of `BrokenAsset` records
   */
  getBrokenLinks(): BrokenAsset[] {
    const broken: BrokenAsset[] = [];

    try {
      const links = document.querySelectorAll<HTMLAnchorElement>('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');

        const isBroken =
          href === null ||
          href === '' ||
          href === '#' ||
          href.startsWith('javascript:');

        if (isBroken) {
          broken.push({
            src: href ?? '(no href)',
            element: this._getSelector(link),
          });
        }
      });
    } catch {
      // DOM traversal may fail in edge cases
    }

    return broken;
  }

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------

  /**
   * Performs basic accessibility checks on the current page.
   *
   * Checks performed:
   * 1. Images without `alt` attributes
   * 2. Interactive elements without accessible names (buttons, inputs)
   * 3. Heading hierarchy issues (e.g. `<h1>` followed directly by `<h3>`)
   * 4. Form inputs without associated labels
   * 5. Missing document language attribute
   *
   * @returns An array of `AccessibilityIssue` records
   */
  getAccessibilityIssues(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    try {
      // 1. Images without alt text
      document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        if (!img.hasAttribute('alt')) {
          issues.push({
            type: 'missing-alt',
            message: 'Image is missing an alt attribute',
            element: img.tagName.toLowerCase(),
            selector: this._getSelector(img),
          });
        }
      });

      // 2. Buttons without accessible names
      document.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
        const hasText = (btn.textContent?.trim().length ?? 0) > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');
        const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
        const hasTitle = btn.hasAttribute('title');

        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
          issues.push({
            type: 'missing-button-label',
            message: 'Button has no accessible name (text, aria-label, or title)',
            element: 'button',
            selector: this._getSelector(btn),
          });
        }
      });

      // 3. Form inputs without labels
      document
        .querySelectorAll<HTMLInputElement>('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')
        .forEach((input) => {
          const id = input.id;
          const hasLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) !== null : false;
          const hasAriaLabel = input.hasAttribute('aria-label');
          const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
          const hasTitle = input.hasAttribute('title');
          const hasPlaceholder = input.hasAttribute('placeholder');
          const isWrappedByLabel = input.closest('label') !== null;

          if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasPlaceholder && !isWrappedByLabel) {
            issues.push({
              type: 'missing-input-label',
              message: 'Input element has no associated label or aria-label',
              element: 'input',
              selector: this._getSelector(input),
            });
          }
        });

      // 4. Heading hierarchy
      const headings = document.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1), 10);
        if (previousLevel > 0 && level > previousLevel + 1) {
          issues.push({
            type: 'heading-skip',
            message: `Heading level skipped from h${previousLevel} to h${level}`,
            element: heading.tagName.toLowerCase(),
            selector: this._getSelector(heading),
          });
        }
        previousLevel = level;
      });

      // 5. Missing document language
      const htmlLang = document.documentElement.getAttribute('lang');
      if (!htmlLang || htmlLang.trim() === '') {
        issues.push({
          type: 'missing-lang',
          message: 'Document is missing a lang attribute on the <html> element',
          element: 'html',
          selector: 'html',
        });
      }
    } catch {
      // Accessibility scanning may fail in edge cases
    }

    return issues;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /** Adds an error to the captured list, enforcing the max-errors cap. */
  private _pushError(error: CapturedError): void {
    if (this.errors.length >= this.maxErrors) {
      // Drop the oldest entry
      this.errors.shift();
    }
    this.errors.push(error);
  }

  /**
   * Generates a simple CSS selector for an element (best-effort, non-unique).
   * Used for human-readable identification, not querySelector targeting.
   */
  private _getSelector(el: Element): string {
    try {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';

      return `${tag}${id}${classes}`;
    } catch {
      return el.tagName?.toLowerCase() || 'unknown';
    }
  }
}
