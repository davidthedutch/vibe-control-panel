'use client';

import { useState } from 'react';
import { X, Sparkles, Save, Type, Palette, Maximize2 } from 'lucide-react';
import type { SelectedComponentInfo, EditableField } from '@vibe/sdk';
import { rgbToHex } from '../utils/colors';

interface EditPanelProps {
  selectedComponent: SelectedComponentInfo | null;
  onClose: () => void;
  onUpdateText: (fieldId: string, value: string) => void;
  onUpdateToken: (name: string, value: string) => void;
  onAISuggestion: () => void;
  onSave: () => void;
}

export default function EditPanel({
  selectedComponent,
  onClose,
  onUpdateText,
  onUpdateToken,
  onAISuggestion,
  onSave,
}: EditPanelProps) {
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({});

  if (!selectedComponent) {
    return (
      <div className="flex h-full w-80 flex-col items-center justify-center gap-4 border-l border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <Edit3Icon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Select a component to edit
        </p>
      </div>
    );
  }

  const handleTextChange = (field: EditableField, value: string) => {
    setTextValues({ ...textValues, [field.fieldId]: value });
    onUpdateText(field.fieldId, value);
  };

  const handleColorChange = (tokenName: string, value: string) => {
    setTokenValues({ ...tokenValues, [tokenName]: value });
    onUpdateToken(tokenName, value);
  };

  // Extract color-related styles from computed styles
  const getColorStyles = () => {
    const colors: Array<{ label: string; property: string; value: string }> = [];
    const styles = selectedComponent.computedStyles;

    if (styles.color) colors.push({ label: 'Text Color', property: 'color', value: styles.color });
    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)')
      colors.push({ label: 'Background', property: 'backgroundColor', value: styles.backgroundColor });
    if (styles.borderColor && styles.borderColor !== 'rgb(0, 0, 0)')
      colors.push({ label: 'Border Color', property: 'borderColor', value: styles.borderColor });

    return colors;
  };

  const getSpacingStyles = () => {
    const spacing: Array<{ label: string; property: string; value: string }> = [];
    const styles = selectedComponent.computedStyles;

    ['padding', 'margin'].forEach((prop) => {
      const value = styles[prop];
      if (value) spacing.push({ label: prop.charAt(0).toUpperCase() + prop.slice(1), property: prop, value });
    });

    return spacing;
  };

  const colorStyles = getColorStyles();
  const spacingStyles = getSpacingStyles();

  return (
    <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {selectedComponent.name || selectedComponent.tagName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedComponent.file || 'Unknown file'}
            {selectedComponent.line && `:${selectedComponent.line}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Editable Text Fields */}
        {selectedComponent.editableFields.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Type className="h-4 w-4" />
              <span>Text Fields</span>
            </div>
            <div className="space-y-3">
              {selectedComponent.editableFields.map((field) => (
                <div key={field.fieldId}>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    {field.fieldType}
                  </label>
                  <input
                    type="text"
                    value={textValues[field.fieldId] ?? field.currentValue}
                    onChange={(e) => handleTextChange(field, e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Picker */}
        {colorStyles.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Palette className="h-4 w-4" />
              <span>Colors</span>
            </div>
            <div className="space-y-3">
              {colorStyles.map((style) => (
                <div key={style.property}>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    {style.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={rgbToHex(tokenValues[style.property] ?? style.value)}
                      onChange={(e) => handleColorChange(style.property, e.target.value)}
                      className="h-10 w-16 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
                    />
                    <input
                      type="text"
                      value={tokenValues[style.property] ?? style.value}
                      onChange={(e) => handleColorChange(style.property, e.target.value)}
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacing Controls */}
        {spacingStyles.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Maximize2 className="h-4 w-4" />
              <span>Spacing</span>
            </div>
            <div className="space-y-3">
              {spacingStyles.map((style) => (
                <div key={style.property}>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    {style.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="64"
                      step="4"
                      value={parseInt(style.value) || 0}
                      onChange={(e) => onUpdateToken(style.property, `${e.target.value}px`)}
                      className="flex-1"
                    />
                    <span className="w-16 text-right text-sm text-slate-600 dark:text-slate-400">
                      {style.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Font Selector */}
        {selectedComponent.computedStyles.fontFamily && (
          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Font Family
            </label>
            <select
              value={selectedComponent.computedStyles.fontFamily}
              onChange={(e) => onUpdateToken('fontFamily', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="system-ui">System UI</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </select>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <button
          onClick={onAISuggestion}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-amber-600"
        >
          <Sparkles className="h-4 w-4" />
          AI Suggestion
        </button>
        <button
          onClick={onSave}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}


// Placeholder icon component
function Edit3Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
