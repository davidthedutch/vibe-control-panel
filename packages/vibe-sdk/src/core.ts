/**
 * @module core
 * @description Core SDK class that orchestrates all Vibe SDK modules.
 *
 * The `VibeSDK` class is the single entry point for consumers. It initialises
 * the element selector, token manager, health monitor, and analytics tracker,
 * and manages the postMessage communication channel with the Control Panel.
 *
 * ```ts
 * const sdk = new VibeSDK({ mode: 'select', panelOrigin: 'http://localhost:3000' });
 * sdk.init();
 * // ... when done
 * sdk.destroy();
 * ```
 */

import {
  MESSAGE_TYPES,
  isVibeMessage,
  isMessageType,
  createSdkReadyMessage,
  createElementSelectedMessage,
  createHealthReportMessage,
  createPongMessage,
  type VibeMessage,
  type VibeMode,
  type SelectedComponentInfo,
} from './protocol';
import { VibeSelector } from './selector';
import { VibeTokens } from './tokens';
import { VibeHealth } from './health';
import { VibeTracking, type TrackingConfig } from './tracking';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** SDK version -- kept in sync with package.json by the build process. */
const SDK_VERSION = '0.1.0';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration options for the VibeSDK. */
export interface VibeSDKConfig {
  /**
   * The initial interaction mode.
   * - `"preview"` -- passive, no element selection
   * - `"select"` -- hover overlays, click-to-select
   * - `"edit"`   -- select + inline editing capabilities
   */
  mode: VibeMode;

  /**
   * The origin of the Control Panel window. Used to validate incoming
   * postMessage events and target outgoing messages. When omitted, all
   * origins are accepted (suitable for development only).
   *
   * @example "http://localhost:3000"
   */
  panelOrigin?: string;

  /**
   * Optional tracking / analytics configuration.
   * Pass `false` to disable the tracking module entirely.
   */
  tracking?: TrackingConfig | false;

  /**
   * When `true`, diagnostic messages are logged to `console.debug`.
   * Defaults to `false`.
   */
  debug?: boolean;
}

// ---------------------------------------------------------------------------
// VibeSDK class
// ---------------------------------------------------------------------------

/**
 * Main entry point for the Vibe SDK.
 *
 * Manages the lifecycle of all sub-modules and handles bidirectional
 * postMessage communication with the Vibe Control Panel.
 */
export class VibeSDK {
  // Configuration
  private config: VibeSDKConfig;
  private mode: VibeMode;
  private panelOrigin: string;

  // Sub-modules
  private selector: VibeSelector | null = null;
  private tokens: VibeTokens | null = null;
  private health: VibeHealth | null = null;
  private tracking: VibeTracking | null = null;

  // State
  private initialised = false;
  private destroyed = false;

  // Bound handler for clean removal
  private _onMessage: ((event: MessageEvent) => void) | null = null;

  /**
   * Creates a new VibeSDK instance.
   *
   * @param config - SDK configuration
   */
  constructor(config: VibeSDKConfig) {
    this.config = config;
    this.mode = config.mode;
    this.panelOrigin = config.panelOrigin || '*';
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Initialises all SDK modules and begins listening for postMessage events.
   *
   * This method is safe to call multiple times -- subsequent calls are
   * no-ops if the SDK is already initialised.
   */
  init(): void {
    if (this.initialised || this.destroyed) return;
    this.initialised = true;

    this._log('Initialising Vibe SDK v' + SDK_VERSION);

    try {
      // 1. Element selector
      this.selector = new VibeSelector(this.mode, (info) => this._onElementSelected(info));
      if (this.mode !== 'preview') {
        this.selector.enable();
      }

      // 2. Token manager
      this.tokens = new VibeTokens();

      // 3. Health monitor
      this.health = new VibeHealth();
      this.health.start();

      // 4. Analytics tracker
      if (this.config.tracking !== false) {
        this.tracking = new VibeTracking(
          typeof this.config.tracking === 'object' ? this.config.tracking : {},
        );
        this.tracking.start();
        this.tracking.trackPageView();
      }

      // 5. PostMessage listener
      this._onMessage = (event: MessageEvent) => this._handleMessage(event);
      window.addEventListener('message', this._onMessage);

      // 6. Announce readiness to the Control Panel
      this._send(createSdkReadyMessage(SDK_VERSION, this.mode));

      this._log('Vibe SDK initialised successfully');
    } catch (error) {
      // The SDK must never crash the host page
      this._logError('Failed to initialise Vibe SDK', error);
    }
  }

  /**
   * Tears down all modules and removes all event listeners.
   * After calling `destroy()` the instance should not be reused.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this._log('Destroying Vibe SDK');

    try {
      this.selector?.destroy();
      this.tokens?.destroy();
      this.health?.destroy();
      this.tracking?.destroy();

      if (this._onMessage) {
        window.removeEventListener('message', this._onMessage);
        this._onMessage = null;
      }
    } catch (error) {
      this._logError('Error during SDK teardown', error);
    }

    this.selector = null;
    this.tokens = null;
    this.health = null;
    this.tracking = null;
    this.initialised = false;
  }

  /**
   * Changes the interaction mode at runtime.
   *
   * @param mode - The new mode to switch to
   */
  setMode(mode: VibeMode): void {
    this._log(`Mode changed: ${this.mode} -> ${mode}`);
    this.mode = mode;

    if (!this.selector) return;

    this.selector.setMode(mode);

    if (mode === 'preview') {
      this.selector.disable();
    } else {
      this.selector.enable();
    }
  }

  /**
   * Returns the current interaction mode.
   */
  getMode(): VibeMode {
    return this.mode;
  }

  /**
   * Returns the `VibeTokens` instance for programmatic token manipulation.
   * Returns `null` if the SDK has not been initialised.
   */
  getTokens(): VibeTokens | null {
    return this.tokens;
  }

  /**
   * Returns the `VibeHealth` instance for programmatic health inspection.
   * Returns `null` if the SDK has not been initialised.
   */
  getHealth(): VibeHealth | null {
    return this.health;
  }

  /**
   * Returns the `VibeTracking` instance for programmatic analytics access.
   * Returns `null` if the SDK has not been initialised or tracking is disabled.
   */
  getTracking(): VibeTracking | null {
    return this.tracking;
  }

  /**
   * Returns the `VibeSelector` instance for programmatic selector control.
   * Returns `null` if the SDK has not been initialised.
   */
  getSelector(): VibeSelector | null {
    return this.selector;
  }

  // -----------------------------------------------------------------------
  // PostMessage handling
  // -----------------------------------------------------------------------

  /**
   * Sends a message to the Control Panel via postMessage.
   * If the SDK is embedded in an iframe, targets `window.parent`.
   * Otherwise targets `window.opener` (popup scenario).
   *
   * @param message - A valid VibeMessage object
   */
  private _send(message: VibeMessage): void {
    try {
      const target = window.parent !== window ? window.parent : window.opener;
      if (!target) {
        this._log('No parent/opener window found -- message not sent');
        return;
      }
      target.postMessage(message, this.panelOrigin);
      this._log(`Sent: ${message.type}`);
    } catch (error) {
      this._logError('Failed to send postMessage', error);
    }
  }

  /**
   * Handles an incoming postMessage event.
   * Validates origin, message structure, and routes to the appropriate handler.
   */
  private _handleMessage(event: MessageEvent): void {
    // Origin check (skip if panelOrigin is wildcard)
    if (this.panelOrigin !== '*' && event.origin !== this.panelOrigin) {
      return;
    }

    if (!isVibeMessage(event.data)) {
      return; // Not a Vibe message -- ignore
    }

    const message = event.data;
    this._log(`Received: ${message.type}`);

    try {
      // Route by message type
      if (isMessageType(message, MESSAGE_TYPES.SET_MODE)) {
        this.setMode(message.payload.mode);
      } else if (isMessageType(message, MESSAGE_TYPES.UPDATE_TOKEN)) {
        this.tokens?.updateToken(message.payload.name, message.payload.value);
      } else if (isMessageType(message, MESSAGE_TYPES.UPDATE_TOKENS_BATCH)) {
        this.tokens?.updateTokensBatch(message.payload.tokens);
      } else if (isMessageType(message, MESSAGE_TYPES.UPDATE_TEXT)) {
        this._handleUpdateText(message.payload.vibeId, message.payload.fieldId, message.payload.value);
      } else if (isMessageType(message, MESSAGE_TYPES.HIGHLIGHT_COMPONENT)) {
        this.selector?.highlightComponent(message.payload.vibeId, message.payload.highlight);
      } else if (isMessageType(message, MESSAGE_TYPES.GET_HEALTH)) {
        this._handleGetHealth();
      } else if (isMessageType(message, MESSAGE_TYPES.PING)) {
        this._send(createPongMessage(message.payload.sentAt));
      }
    } catch (error) {
      this._logError(`Error handling message ${message.type}`, error);
    }
  }

  // -----------------------------------------------------------------------
  // Message handlers
  // -----------------------------------------------------------------------

  /**
   * Called when a Vibe component is selected via the element selector.
   * Sends the component info to the Control Panel.
   */
  private _onElementSelected(info: SelectedComponentInfo): void {
    this._send(createElementSelectedMessage(info));

    // Also track as an analytics event
    this.tracking?.trackEvent('component_selected', {
      vibeId: info.vibeId,
      name: info.name,
      file: info.file,
    });
  }

  /**
   * Handles an `UPDATE_TEXT` message by finding the target component
   * and field, then updating its text content.
   */
  private _handleUpdateText(vibeId: string, fieldId: string, value: string): void {
    try {
      const component = document.querySelector<HTMLElement>(
        `[data-vibe-id="${CSS.escape(vibeId)}"]`,
      );
      if (!component) {
        this._log(`Component not found: ${vibeId}`);
        return;
      }

      const field = component.querySelector<HTMLElement>(
        `[data-vibe-field="${CSS.escape(fieldId)}"]`,
      );
      if (!field) {
        this._log(`Field not found: ${fieldId} in component ${vibeId}`);
        return;
      }

      field.textContent = value;
    } catch (error) {
      this._logError('Failed to update text', error);
    }
  }

  /**
   * Handles a `GET_HEALTH` request by generating a report and sending
   * it back to the Control Panel.
   */
  private _handleGetHealth(): void {
    if (!this.health) return;

    const report = this.health.generateHealthReport();
    this._send(createHealthReportMessage(report));
  }

  // -----------------------------------------------------------------------
  // Logging
  // -----------------------------------------------------------------------

  /** Logs a debug message (only when `debug: true` is set). */
  private _log(message: string): void {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.debug(`[VibeSDK] ${message}`);
    }
  }

  /** Logs an error message (always, but catches internal failures). */
  private _logError(message: string, error: unknown): void {
    try {
      // eslint-disable-next-line no-console
      console.warn(`[VibeSDK] ${message}`, error);
    } catch {
      // Absolutely never throw from logging
    }
  }
}
