/**
 * @module tokens
 * @description Live design token update module for the Vibe SDK.
 *
 * Design tokens are implemented as CSS custom properties on the `:root`
 * element. This module lets the Control Panel update them in real-time
 * without requiring a rebuild, and maintains a change history so tokens
 * can be reverted individually or all at once.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A snapshot of a single token change for undo purposes. */
interface TokenHistoryEntry {
  /** CSS custom property name (including the `--` prefix) */
  name: string;
  /** The value before the change, or `null` if the property did not exist */
  previousValue: string | null;
  /** The new value that was applied */
  newValue: string;
  /** Timestamp when the change was made */
  timestamp: number;
}

// ---------------------------------------------------------------------------
// VibeTokens class
// ---------------------------------------------------------------------------

/**
 * Manages live CSS custom property updates on the document root.
 *
 * All mutations go through `:root` (`document.documentElement`) so they
 * cascade to the entire page, matching how most design-token systems work.
 *
 * Usage:
 * ```ts
 * const tokens = new VibeTokens();
 * tokens.updateToken('--color-primary', '#3b82f6');
 * tokens.updateTokensBatch([
 *   { name: '--spacing-md', value: '1rem' },
 *   { name: '--radius-lg', value: '12px' },
 * ]);
 * // Later...
 * tokens.revertTokens(); // restores all original values
 * ```
 */
export class VibeTokens {
  /** Ordered list of all changes made through this instance. */
  private history: TokenHistoryEntry[] = [];

  /** Cache of original values to avoid re-reading during batch reverts. */
  private originalValues: Map<string, string | null> = new Map();

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Updates a single CSS custom property on `:root`.
   *
   * @param name  - The custom property name. A `--` prefix is added automatically if missing.
   * @param value - The new value to set.
   */
  updateToken(name: string, value: string): void {
    const propName = ensurePrefix(name);
    const root = document.documentElement;
    const previous = root.style.getPropertyValue(propName) || this._getComputedValue(propName);

    // Store original value the first time we touch this property
    if (!this.originalValues.has(propName)) {
      this.originalValues.set(propName, previous || null);
    }

    root.style.setProperty(propName, value);

    this.history.push({
      name: propName,
      previousValue: previous || null,
      newValue: value,
      timestamp: Date.now(),
    });
  }

  /**
   * Updates multiple CSS custom properties on `:root` in a single pass.
   *
   * @param tokens - An array of `{ name, value }` pairs.
   */
  updateTokensBatch(tokens: Array<{ name: string; value: string }>): void {
    for (const { name, value } of tokens) {
      this.updateToken(name, value);
    }
  }

  /**
   * Returns a record of all CSS custom properties currently set on `:root`
   * (both inline and from stylesheets).
   *
   * @returns A plain object mapping property names to their current values.
   */
  getCurrentTokens(): Record<string, string> {
    const tokens: Record<string, string> = {};

    // 1. Gather from stylesheets
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          const rules = sheet.cssRules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
              for (let k = 0; k < rule.style.length; k++) {
                const prop = rule.style[k];
                if (prop.startsWith('--')) {
                  tokens[prop] = rule.style.getPropertyValue(prop).trim();
                }
              }
            }
          }
        } catch {
          // CORS: stylesheet from another origin - skip silently
        }
      }
    } catch {
      // Stylesheet access may throw in some environments
    }

    // 2. Override with inline styles (these take precedence)
    const rootStyle = document.documentElement.style;
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      if (prop.startsWith('--')) {
        tokens[prop] = rootStyle.getPropertyValue(prop).trim();
      }
    }

    return tokens;
  }

  /**
   * Reverts all token changes made through this instance back to their
   * original values. If a token did not exist before the SDK modified it,
   * the inline property is removed entirely.
   *
   * Optionally reverts only a single property.
   *
   * @param name - If provided, only revert this specific property.
   */
  revertTokens(name?: string): void {
    const root = document.documentElement;

    if (name) {
      const propName = ensurePrefix(name);
      const original = this.originalValues.get(propName);
      if (original === undefined) return; // never changed

      if (original === null) {
        root.style.removeProperty(propName);
      } else {
        root.style.setProperty(propName, original);
      }
      this.originalValues.delete(propName);
      this.history = this.history.filter((entry) => entry.name !== propName);
      return;
    }

    // Revert everything
    for (const [propName, original] of this.originalValues) {
      if (original === null) {
        root.style.removeProperty(propName);
      } else {
        root.style.setProperty(propName, original);
      }
    }
    this.originalValues.clear();
    this.history = [];
  }

  /**
   * Returns the full change history, ordered from oldest to newest.
   * Useful for displaying an undo stack in the Control Panel UI.
   */
  getHistory(): ReadonlyArray<Readonly<TokenHistoryEntry>> {
    return this.history;
  }

  /**
   * Undoes the most recent token change. Returns `true` if there was a
   * change to undo, or `false` if the history is empty.
   */
  undo(): boolean {
    const entry = this.history.pop();
    if (!entry) return false;

    const root = document.documentElement;

    if (entry.previousValue === null) {
      root.style.removeProperty(entry.name);
    } else {
      root.style.setProperty(entry.name, entry.previousValue);
    }

    // If this was the only change for this property, remove from originals map
    const stillInHistory = this.history.some((e) => e.name === entry.name);
    if (!stillInHistory) {
      this.originalValues.delete(entry.name);
    }

    return true;
  }

  /**
   * Cleans up internal state. Call this when the SDK is destroyed.
   */
  destroy(): void {
    this.history = [];
    this.originalValues.clear();
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /**
   * Reads a computed CSS custom property value from `:root`.
   * Falls back gracefully if `getComputedStyle` is unavailable.
   */
  private _getComputedValue(name: string): string | null {
    try {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || null;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ensures a CSS custom property name starts with `--`.
 */
function ensurePrefix(name: string): string {
  return name.startsWith('--') ? name : `--${name}`;
}
