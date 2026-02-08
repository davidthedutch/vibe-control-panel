/**
 * @module protocol
 * @description PostMessage protocol definitions for communication between
 * the Vibe SDK (embedded in the user's website) and the Vibe Control Panel.
 *
 * All messages follow a standard envelope format with a `type` discriminant,
 * a unique `id`, a `timestamp`, and a type-specific `payload`.
 */

// ---------------------------------------------------------------------------
// Interaction modes
// ---------------------------------------------------------------------------

/** The interaction mode the SDK can be set to. */
export type VibeMode = 'preview' | 'select' | 'edit';

// ---------------------------------------------------------------------------
// Message type constants
// ---------------------------------------------------------------------------

export const MESSAGE_TYPES = {
  /** SDK has loaded and is ready to receive commands */
  SDK_READY: 'VIBE_SDK_READY',
  /** Control Panel instructs SDK to change interaction mode */
  SET_MODE: 'VIBE_SET_MODE',
  /** SDK reports an element was selected (click-to-edit) */
  ELEMENT_SELECTED: 'VIBE_ELEMENT_SELECTED',
  /** Control Panel instructs SDK to update a single design token */
  UPDATE_TOKEN: 'VIBE_UPDATE_TOKEN',
  /** Control Panel instructs SDK to update multiple design tokens at once */
  UPDATE_TOKENS_BATCH: 'VIBE_UPDATE_TOKENS_BATCH',
  /** Control Panel instructs SDK to update text content in the DOM */
  UPDATE_TEXT: 'VIBE_UPDATE_TEXT',
  /** Control Panel instructs SDK to highlight a specific component */
  HIGHLIGHT_COMPONENT: 'VIBE_HIGHLIGHT_COMPONENT',
  /** Control Panel requests a health report from the SDK */
  GET_HEALTH: 'VIBE_GET_HEALTH',
  /** SDK responds with the health report */
  HEALTH_REPORT: 'VIBE_HEALTH_REPORT',
  /** Control Panel pings SDK to check connectivity */
  PING: 'VIBE_PING',
  /** SDK responds to a ping */
  PONG: 'VIBE_PONG',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

/** Editable field metadata extracted from `[data-vibe-field]` elements. */
export interface EditableField {
  fieldId: string;
  fieldType: string;
  currentValue: string;
  element?: string; // tag name
}

/** Component information sent when an element is selected. */
export interface SelectedComponentInfo {
  vibeId: string;
  name: string | null;
  file: string | null;
  line: number | null;
  tagName: string;
  rect: { top: number; left: number; width: number; height: number };
  editableFields: EditableField[];
  computedStyles: Record<string, string>;
}

/** A single design token key/value pair. */
export interface TokenUpdate {
  name: string;
  value: string;
}

/** Performance & health report data. */
export interface HealthReportData {
  errors: CapturedError[];
  performance: PerformanceSnapshot;
  brokenImages: BrokenAsset[];
  brokenLinks: BrokenAsset[];
  accessibilityIssues: AccessibilityIssue[];
  timestamp: number;
}

export interface CapturedError {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: number;
}

export interface PerformanceSnapshot {
  navigationTiming: Record<string, number>;
  resourceCount: number;
  lcp: number | null;
  cls: number | null;
  domContentLoaded: number;
  fullyLoaded: number;
}

export interface BrokenAsset {
  src: string;
  element: string;
  alt?: string;
}

export interface AccessibilityIssue {
  type: string;
  message: string;
  element: string;
  selector: string;
}

// ---------------------------------------------------------------------------
// Message shapes
// ---------------------------------------------------------------------------

interface VibeMessageBase {
  id: string;
  timestamp: number;
}

export interface VibeSdkReadyMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.SDK_READY;
  payload: { version: string; mode: VibeMode };
}

export interface VibeSetModeMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.SET_MODE;
  payload: { mode: VibeMode };
}

export interface VibeElementSelectedMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.ELEMENT_SELECTED;
  payload: SelectedComponentInfo;
}

export interface VibeUpdateTokenMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.UPDATE_TOKEN;
  payload: TokenUpdate;
}

export interface VibeUpdateTokensBatchMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.UPDATE_TOKENS_BATCH;
  payload: { tokens: TokenUpdate[] };
}

export interface VibeUpdateTextMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.UPDATE_TEXT;
  payload: { vibeId: string; fieldId: string; value: string };
}

export interface VibeHighlightComponentMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.HIGHLIGHT_COMPONENT;
  payload: { vibeId: string; highlight: boolean };
}

export interface VibeGetHealthMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.GET_HEALTH;
  payload: Record<string, never>;
}

export interface VibeHealthReportMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.HEALTH_REPORT;
  payload: HealthReportData;
}

export interface VibePingMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.PING;
  payload: { sentAt: number };
}

export interface VibePongMessage extends VibeMessageBase {
  type: typeof MESSAGE_TYPES.PONG;
  payload: { sentAt: number; receivedAt: number };
}

/** Union of every possible Vibe message. */
export type VibeMessage =
  | VibeSdkReadyMessage
  | VibeSetModeMessage
  | VibeElementSelectedMessage
  | VibeUpdateTokenMessage
  | VibeUpdateTokensBatchMessage
  | VibeUpdateTextMessage
  | VibeHighlightComponentMessage
  | VibeGetHealthMessage
  | VibeHealthReportMessage
  | VibePingMessage
  | VibePongMessage;

// ---------------------------------------------------------------------------
// Message constructors
// ---------------------------------------------------------------------------

let _idCounter = 0;

/** Generate a short unique message ID. */
function messageId(): string {
  _idCounter += 1;
  return `vibe-${Date.now()}-${_idCounter}`;
}

/**
 * Creates a `VIBE_SDK_READY` message.
 * Sent by the SDK to the Control Panel when it has finished initialising.
 */
export function createSdkReadyMessage(version: string, mode: VibeMode): VibeSdkReadyMessage {
  return {
    type: MESSAGE_TYPES.SDK_READY,
    id: messageId(),
    timestamp: Date.now(),
    payload: { version, mode },
  };
}

/**
 * Creates a `VIBE_SET_MODE` message.
 * Sent by the Control Panel to change the SDK interaction mode.
 */
export function createSetModeMessage(mode: VibeMode): VibeSetModeMessage {
  return {
    type: MESSAGE_TYPES.SET_MODE,
    id: messageId(),
    timestamp: Date.now(),
    payload: { mode },
  };
}

/**
 * Creates a `VIBE_ELEMENT_SELECTED` message.
 * Sent by the SDK when the user clicks a component in select/edit mode.
 */
export function createElementSelectedMessage(
  info: SelectedComponentInfo,
): VibeElementSelectedMessage {
  return {
    type: MESSAGE_TYPES.ELEMENT_SELECTED,
    id: messageId(),
    timestamp: Date.now(),
    payload: info,
  };
}

/**
 * Creates a `VIBE_UPDATE_TOKEN` message.
 * Sent by the Control Panel to update a single CSS custom property.
 */
export function createUpdateTokenMessage(name: string, value: string): VibeUpdateTokenMessage {
  return {
    type: MESSAGE_TYPES.UPDATE_TOKEN,
    id: messageId(),
    timestamp: Date.now(),
    payload: { name, value },
  };
}

/**
 * Creates a `VIBE_UPDATE_TOKENS_BATCH` message.
 * Sent by the Control Panel to update multiple CSS custom properties at once.
 */
export function createUpdateTokensBatchMessage(
  tokens: TokenUpdate[],
): VibeUpdateTokensBatchMessage {
  return {
    type: MESSAGE_TYPES.UPDATE_TOKENS_BATCH,
    id: messageId(),
    timestamp: Date.now(),
    payload: { tokens },
  };
}

/**
 * Creates a `VIBE_UPDATE_TEXT` message.
 * Sent by the Control Panel to update text content inside a component.
 */
export function createUpdateTextMessage(
  vibeId: string,
  fieldId: string,
  value: string,
): VibeUpdateTextMessage {
  return {
    type: MESSAGE_TYPES.UPDATE_TEXT,
    id: messageId(),
    timestamp: Date.now(),
    payload: { vibeId, fieldId, value },
  };
}

/**
 * Creates a `VIBE_HIGHLIGHT_COMPONENT` message.
 * Sent by the Control Panel to highlight or un-highlight a component.
 */
export function createHighlightComponentMessage(
  vibeId: string,
  highlight: boolean,
): VibeHighlightComponentMessage {
  return {
    type: MESSAGE_TYPES.HIGHLIGHT_COMPONENT,
    id: messageId(),
    timestamp: Date.now(),
    payload: { vibeId, highlight },
  };
}

/**
 * Creates a `VIBE_GET_HEALTH` message.
 * Sent by the Control Panel to request a health report.
 */
export function createGetHealthMessage(): VibeGetHealthMessage {
  return {
    type: MESSAGE_TYPES.GET_HEALTH,
    id: messageId(),
    timestamp: Date.now(),
    payload: {},
  };
}

/**
 * Creates a `VIBE_HEALTH_REPORT` message.
 * Sent by the SDK in response to a `VIBE_GET_HEALTH` request.
 */
export function createHealthReportMessage(data: HealthReportData): VibeHealthReportMessage {
  return {
    type: MESSAGE_TYPES.HEALTH_REPORT,
    id: messageId(),
    timestamp: Date.now(),
    payload: data,
  };
}

/**
 * Creates a `VIBE_PING` message.
 * Sent by the Control Panel to check if the SDK is responsive.
 */
export function createPingMessage(): VibePingMessage {
  return {
    type: MESSAGE_TYPES.PING,
    id: messageId(),
    timestamp: Date.now(),
    payload: { sentAt: Date.now() },
  };
}

/**
 * Creates a `VIBE_PONG` message.
 * Sent by the SDK in response to a `VIBE_PING`.
 */
export function createPongMessage(sentAt: number): VibePongMessage {
  return {
    type: MESSAGE_TYPES.PONG,
    id: messageId(),
    timestamp: Date.now(),
    payload: { sentAt, receivedAt: Date.now() },
  };
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const VALID_TYPES = new Set<string>(Object.values(MESSAGE_TYPES));

/**
 * Type guard that checks whether an unknown value is a valid `VibeMessage`.
 * Validates the envelope structure (type, id, timestamp, payload) without
 * deep-checking each payload shape, which is left to individual handlers.
 *
 * @param data - The value to validate (typically from `event.data`)
 * @returns `true` if the value conforms to the VibeMessage envelope
 */
export function isVibeMessage(data: unknown): data is VibeMessage {
  if (data === null || typeof data !== 'object') return false;

  const msg = data as Record<string, unknown>;

  if (typeof msg.type !== 'string' || !VALID_TYPES.has(msg.type)) return false;
  if (typeof msg.id !== 'string' || msg.id.length === 0) return false;
  if (typeof msg.timestamp !== 'number' || !Number.isFinite(msg.timestamp)) return false;
  if (msg.payload === null || typeof msg.payload !== 'object') return false;

  return true;
}

/**
 * Validates that a message is a specific type.
 *
 * @param data - The message to check
 * @param type - The expected message type
 * @returns `true` if the message matches the expected type
 */
export function isMessageType<T extends MessageType>(
  data: VibeMessage,
  type: T,
): data is Extract<VibeMessage, { type: T }> {
  return data.type === type;
}
