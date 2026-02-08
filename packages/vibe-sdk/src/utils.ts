/**
 * @module utils
 * @description Utility functions used throughout the Vibe SDK.
 */

/**
 * Information extracted from a Vibe-annotated DOM component.
 */
export interface VibeComponentInfo {
  /** Unique identifier for the component instance */
  id: string;
  /** Human-readable component name (e.g. "Header", "ProductCard") */
  name: string | null;
  /** Source file path where the component is defined */
  file: string | null;
  /** Line number in the source file */
  line: number | null;
  /** The DOM element itself */
  element: HTMLElement;
}

/**
 * Walks up the DOM tree from the given element to find the nearest ancestor
 * (or the element itself) that has a `data-vibe-id` attribute.
 *
 * @param element - The starting DOM element
 * @returns The component info if found, or `null` if no Vibe component is an ancestor
 */
export function findVibeComponent(element: HTMLElement): VibeComponentInfo | null {
  let current: HTMLElement | null = element;

  while (current) {
    const vibeId = current.getAttribute('data-vibe-id');
    if (vibeId) {
      return {
        id: vibeId,
        name: current.getAttribute('data-vibe-name'),
        file: current.getAttribute('data-vibe-file'),
        line: parseLineNumber(current.getAttribute('data-vibe-line')),
        element: current,
      };
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Parses a line number string into a number, returning `null` if invalid.
 */
function parseLineNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Generates a unique identifier string.
 * Uses `crypto.randomUUID()` when available, with a fallback for older browsers.
 *
 * @returns A unique string identifier
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a debounced version of a function that delays invoking `fn` until
 * `ms` milliseconds have elapsed since the last time the debounced function
 * was called.
 *
 * @param fn - The function to debounce
 * @param ms - The debounce delay in milliseconds
 * @returns A debounced wrapper with a `.cancel()` method
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: unknown[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, ms);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled version of a function that invokes `fn` at most once
 * every `ms` milliseconds. Uses a trailing call to ensure the last invocation
 * is always processed.
 *
 * @param fn - The function to throttle
 * @param ms - The throttle interval in milliseconds
 * @returns A throttled wrapper with a `.cancel()` method
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = ms - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}
