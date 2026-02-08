/**
 * @module @vibe/sdk
 * @description Vibe SDK -- Live preview, visual editing, and health monitoring
 * for vibe-coded websites.
 *
 * This package is designed to be embedded in a user's website during
 * development. It provides:
 *
 * - **Click-to-edit**: Select elements annotated with `data-vibe-*` attributes
 *   and send their metadata to the Vibe Control Panel.
 * - **Live design tokens**: Update CSS custom properties in real-time without
 *   rebuilding.
 * - **Health monitoring**: Capture errors, measure performance, detect broken
 *   assets and basic accessibility issues.
 * - **Analytics tracking**: Record page views, custom events, and session data.
 * - **PostMessage protocol**: Typed, validated communication between the SDK
 *   and the Control Panel.
 *
 * ## Quick Start
 *
 * ```ts
 * import { VibeSDK } from '@vibe/sdk';
 *
 * const sdk = new VibeSDK({
 *   mode: 'select',
 *   panelOrigin: 'http://localhost:3000',
 *   debug: true,
 * });
 *
 * sdk.init();
 * ```
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export { VibeSDK } from './core';
export type { VibeSDKConfig } from './core';

// ---------------------------------------------------------------------------
// Protocol
// ---------------------------------------------------------------------------

export {
  MESSAGE_TYPES,
  isVibeMessage,
  isMessageType,
  createSdkReadyMessage,
  createSetModeMessage,
  createElementSelectedMessage,
  createUpdateTokenMessage,
  createUpdateTokensBatchMessage,
  createUpdateTextMessage,
  createHighlightComponentMessage,
  createGetHealthMessage,
  createHealthReportMessage,
  createPingMessage,
  createPongMessage,
} from './protocol';

export type {
  VibeMode,
  MessageType,
  VibeMessage,
  VibeSdkReadyMessage,
  VibeSetModeMessage,
  VibeElementSelectedMessage,
  VibeUpdateTokenMessage,
  VibeUpdateTokensBatchMessage,
  VibeUpdateTextMessage,
  VibeHighlightComponentMessage,
  VibeGetHealthMessage,
  VibeHealthReportMessage,
  VibePingMessage,
  VibePongMessage,
  EditableField,
  SelectedComponentInfo,
  TokenUpdate,
  HealthReportData,
  CapturedError,
  PerformanceSnapshot,
  BrokenAsset,
  AccessibilityIssue,
} from './protocol';

// ---------------------------------------------------------------------------
// Selector
// ---------------------------------------------------------------------------

export { VibeSelector } from './selector';
export type { SelectionCallback } from './selector';

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export { VibeTokens } from './tokens';

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export { VibeHealth } from './health';

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------

export { VibeTracking } from './tracking';
export type { TrackedEvent, PageView, SessionData, TrackingConfig } from './tracking';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export {
  findVibeComponent,
  generateId,
  debounce,
  throttle,
} from './utils';

export type { VibeComponentInfo } from './utils';
