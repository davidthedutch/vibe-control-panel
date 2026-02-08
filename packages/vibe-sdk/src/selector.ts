/**
 * @module selector
 * @description Element selection module for the Vibe SDK.
 *
 * Provides hover overlays, click-to-select behaviour, and component
 * introspection for elements annotated with `data-vibe-*` attributes.
 *
 * All DOM modifications are confined to a dedicated overlay container so the
 * SDK never interferes with the host page's layout or styling.
 */

import type { EditableField, SelectedComponentInfo, VibeMode } from './protocol';
import { findVibeComponent, type VibeComponentInfo } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Callback invoked when a user selects (clicks) a Vibe component. */
export type SelectionCallback = (info: SelectedComponentInfo) => void;

/** Styles to visually distinguish interaction modes. */
interface OverlayTheme {
  borderColor: string;
  backgroundColor: string;
  labelBackground: string;
  labelColor: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERLAY_ID = '__vibe-sdk-overlay__';
const LABEL_ID = '__vibe-sdk-label__';
const OVERLAY_CONTAINER_ID = '__vibe-sdk-overlay-container__';

const THEMES: Record<VibeMode, OverlayTheme> = {
  preview: {
    borderColor: 'rgba(59,130,246,0.5)',
    backgroundColor: 'rgba(59,130,246,0.04)',
    labelBackground: 'rgba(59,130,246,0.9)',
    labelColor: '#fff',
  },
  select: {
    borderColor: 'rgba(59,130,246,0.8)',
    backgroundColor: 'rgba(59,130,246,0.08)',
    labelBackground: 'rgba(59,130,246,0.95)',
    labelColor: '#fff',
  },
  edit: {
    borderColor: 'rgba(234,88,12,0.8)',
    backgroundColor: 'rgba(234,88,12,0.08)',
    labelBackground: 'rgba(234,88,12,0.95)',
    labelColor: '#fff',
  },
};

// ---------------------------------------------------------------------------
// VibeSelector class
// ---------------------------------------------------------------------------

/**
 * Manages hover overlays and click-to-select for Vibe-annotated components.
 *
 * Usage:
 * ```ts
 * const selector = new VibeSelector('select', (info) => {
 *   console.log('Selected:', info);
 * });
 * selector.enable();
 * // later...
 * selector.disable();
 * selector.destroy();
 * ```
 */
export class VibeSelector {
  private mode: VibeMode;
  private onSelect: SelectionCallback;
  private enabled = false;

  // DOM references
  private container: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private label: HTMLDivElement | null = null;

  // Current state
  private currentComponent: VibeComponentInfo | null = null;
  private rafId: number | null = null;

  // Bound handlers (for clean removal)
  private handleMouseMove: (e: MouseEvent) => void;
  private handleClick: (e: MouseEvent) => void;
  private handleMouseLeave: () => void;
  private handleScroll: () => void;

  /**
   * Creates a new VibeSelector instance.
   *
   * @param mode - The initial interaction mode
   * @param onSelect - Callback fired when a component is selected
   */
  constructor(mode: VibeMode, onSelect: SelectionCallback) {
    this.mode = mode;
    this.onSelect = onSelect;

    // Bind handlers once
    this.handleMouseMove = this._onMouseMove.bind(this);
    this.handleClick = this._onClick.bind(this);
    this.handleMouseLeave = this._onMouseLeave.bind(this);
    this.handleScroll = this._onScroll.bind(this);
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Enable hover & click handling. */
  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this._ensureOverlayElements();
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('click', this.handleClick, { capture: true });
    document.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleScroll, { passive: true });
  }

  /** Disable hover & click handling and clear the overlay. */
  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick, { capture: true });
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleScroll);
    this.clearOverlay();
  }

  /** Change the interaction mode (affects overlay colours). */
  setMode(mode: VibeMode): void {
    this.mode = mode;
    // Re-draw the overlay if one is currently visible
    if (this.currentComponent) {
      this._positionOverlay(this.currentComponent);
    }
  }

  /**
   * Programmatically highlight a component by its `data-vibe-id`.
   *
   * @param vibeId - The component's unique ID
   * @param highlight - `true` to show, `false` to clear
   */
  highlightComponent(vibeId: string, highlight: boolean): void {
    if (!highlight) {
      this.clearOverlay();
      return;
    }

    const el = document.querySelector<HTMLElement>(`[data-vibe-id="${CSS.escape(vibeId)}"]`);
    if (!el) return;

    const info = findVibeComponent(el);
    if (info) {
      this._ensureOverlayElements();
      this._positionOverlay(info);
    }
  }

  /** Remove the overlay from the viewport. */
  clearOverlay(): void {
    this.currentComponent = null;
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    if (this.label) {
      this.label.style.display = 'none';
    }
  }

  /**
   * Tear down all DOM elements and event listeners created by this instance.
   * After calling `destroy()` the instance should not be reused.
   */
  destroy(): void {
    this.disable();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.overlay = null;
    this.label = null;
  }

  // -----------------------------------------------------------------------
  // Static helpers
  // -----------------------------------------------------------------------

  /**
   * Extracts full component info including editable fields and computed styles
   * for the given Vibe component element.
   *
   * @param component - Basic component info from `findVibeComponent`
   * @returns A `SelectedComponentInfo` payload ready for the protocol message
   */
  static getComponentInfo(component: VibeComponentInfo): SelectedComponentInfo {
    const el = component.element;
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);

    return {
      vibeId: component.id,
      name: component.name,
      file: component.file,
      line: component.line,
      tagName: el.tagName.toLowerCase(),
      rect: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      },
      editableFields: VibeSelector.getEditableFields(el),
      computedStyles: {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        padding: styles.padding,
        margin: styles.margin,
        borderRadius: styles.borderRadius,
        display: styles.display,
        position: styles.position,
      },
    };
  }

  /**
   * Finds all `[data-vibe-field]` descendants within a component element.
   *
   * @param root - The root element of the component
   * @returns An array of editable field metadata
   */
  static getEditableFields(root: HTMLElement): EditableField[] {
    const fields: EditableField[] = [];
    const elements = root.querySelectorAll<HTMLElement>('[data-vibe-field]');

    elements.forEach((el) => {
      const fieldId = el.getAttribute('data-vibe-field');
      if (!fieldId) return;

      fields.push({
        fieldId,
        fieldType: el.getAttribute('data-vibe-field-type') || 'text',
        currentValue: el.textContent?.trim() || '',
        element: el.tagName.toLowerCase(),
      });
    });

    return fields;
  }

  // -----------------------------------------------------------------------
  // Private methods
  // -----------------------------------------------------------------------

  /** Lazily creates the overlay container and its child elements. */
  private _ensureOverlayElements(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = OVERLAY_CONTAINER_ID;
    this.container.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';

    this.overlay = document.createElement('div');
    this.overlay.id = OVERLAY_ID;
    this.overlay.style.cssText =
      'position:fixed;display:none;pointer-events:none;box-sizing:border-box;' +
      'border:2px solid transparent;transition:all 0.1s ease-out;z-index:2147483646;';

    this.label = document.createElement('div');
    this.label.id = LABEL_ID;
    this.label.style.cssText =
      'position:fixed;display:none;pointer-events:none;font-family:system-ui,-apple-system,sans-serif;' +
      'font-size:11px;line-height:1;padding:3px 8px;border-radius:3px;white-space:nowrap;' +
      'z-index:2147483647;font-weight:500;letter-spacing:0.02em;';

    this.container.appendChild(this.overlay);
    this.container.appendChild(this.label);
    document.body.appendChild(this.container);
  }

  /** Positions the overlay and label around the given component. */
  private _positionOverlay(component: VibeComponentInfo): void {
    if (!this.overlay || !this.label) return;

    const rect = component.element.getBoundingClientRect();
    const theme = THEMES[this.mode];

    // Overlay
    this.overlay.style.display = 'block';
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
    this.overlay.style.borderColor = theme.borderColor;
    this.overlay.style.backgroundColor = theme.backgroundColor;

    // Label
    const labelText = component.name || component.id;
    this.label.textContent = labelText;
    this.label.style.display = 'block';
    this.label.style.backgroundColor = theme.labelBackground;
    this.label.style.color = theme.labelColor;

    // Position label above the overlay; clamp to viewport edges
    const labelTop = rect.top - 22;
    this.label.style.top = `${labelTop < 2 ? rect.top + 2 : labelTop}px`;
    this.label.style.left = `${Math.max(2, rect.left)}px`;
  }

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------

  private _onMouseMove(e: MouseEvent): void {
    if (this.mode === 'preview') return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore our own overlay elements
    if (this.container?.contains(target)) return;

    const component = findVibeComponent(target);

    if (!component) {
      this.clearOverlay();
      return;
    }

    // Avoid redundant redraws
    if (this.currentComponent?.id === component.id) return;

    this.currentComponent = component;

    // Use rAF for smooth overlay positioning
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.currentComponent) {
        this._positionOverlay(this.currentComponent);
      }
    });
  }

  private _onClick(e: MouseEvent): void {
    if (this.mode === 'preview') return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore clicks on our overlay
    if (this.container?.contains(target)) return;

    const component = findVibeComponent(target);
    if (!component) return;

    // Prevent the host page from receiving the click
    e.preventDefault();
    e.stopPropagation();

    const info = VibeSelector.getComponentInfo(component);
    this.onSelect(info);
  }

  private _onMouseLeave(): void {
    this.clearOverlay();
  }

  private _onScroll(): void {
    // Reposition overlay on scroll/resize
    if (this.currentComponent) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        if (this.currentComponent) {
          this._positionOverlay(this.currentComponent);
        }
      });
    }
  }
}
