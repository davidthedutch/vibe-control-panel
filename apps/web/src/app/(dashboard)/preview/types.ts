/**
 * Type definitions for the Preview tab
 * Extends and re-exports types from the SDK protocol
 */

import type {
  VibeMode,
  SelectedComponentInfo,
  EditableField,
  TokenUpdate,
  HealthReportData,
} from '@vibe/sdk';

// Re-export SDK types for convenience
export type {
  VibeMode,
  SelectedComponentInfo,
  EditableField,
  TokenUpdate,
  HealthReportData,
};

/**
 * Preview-specific types
 */

export type PreviewMode = 'preview' | 'select' | 'edit';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface DeviceSize {
  width: number;
  height: number;
}

export interface PreviewState {
  mode: PreviewMode;
  device: DeviceType;
  selectedComponent: SelectedComponentInfo | null;
  isSDKReady: boolean;
  showEditPanel: boolean;
}

export interface ColorStyle {
  label: string;
  property: string;
  value: string;
}

export interface SpacingStyle {
  label: string;
  property: string;
  value: string;
}

export interface ChangeRecord {
  type: 'text' | 'token' | 'style';
  target: string;
  before: string;
  after: string;
  timestamp: number;
}

export interface GeneratedPrompt {
  text: string;
  componentsAffected: string[];
  tokensUsed: string[];
  filesChanged: string[];
  changeCount: number;
}
