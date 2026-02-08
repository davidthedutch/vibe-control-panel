'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Paintbrush, Type, Ruler, Loader2, Save } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface ColorToken {
  name: string;
  variable: string;
  value: string;
}

interface TypographyToken {
  name: string;
  variable: string;
  value: string;
}

interface SpacingToken {
  name: string;
  variable: string;
  value: string;
  px: number;
}

interface BorderRadiusToken {
  name: string;
  variable: string;
  value: string;
  px: number;
}

interface TokensData {
  colors: ColorToken[];
  fonts: TypographyToken[];
  fontSizes: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius?: BorderRadiusToken[];
}

const defaultColors: ColorToken[] = [
  { name: 'Primary', variable: '--color-primary', value: '#FF8C42' },
  { name: 'Primary hover', variable: '--color-primary-hover', value: '#FF7A2E' },
  { name: 'Secondary', variable: '--color-secondary', value: '#2A2D35' },
  { name: 'Accent', variable: '--color-accent', value: '#FF8C42' },
  { name: 'Success', variable: '--color-success', value: '#4ADE80' },
  { name: 'Warning', variable: '--color-warning', value: '#FFA94D' },
  { name: 'Error', variable: '--color-error', value: '#FF6B6B' },
  { name: 'Background', variable: '--color-bg', value: '#1A1D23' },
  { name: 'Surface', variable: '--color-surface', value: '#22252D' },
  { name: 'Text primary', variable: '--color-text-primary', value: '#F1F3F5' },
  { name: 'Text secondary', variable: '--color-text-secondary', value: '#9CA3AF' },
  { name: 'Border', variable: '--color-border', value: '#2F3339' },
];

const defaultFonts: TypographyToken[] = [
  { name: 'Heading', variable: '--font-heading', value: 'Poppins' },
  { name: 'Body', variable: '--font-body', value: 'Poppins' },
  { name: 'Mono', variable: '--font-mono', value: 'JetBrains Mono' },
];

const defaultFontSizes: TypographyToken[] = [
  { name: 'XS', variable: '--text-xs', value: '0.75rem' },
  { name: 'SM', variable: '--text-sm', value: '0.875rem' },
  { name: 'Base', variable: '--text-base', value: '1rem' },
  { name: 'LG', variable: '--text-lg', value: '1.125rem' },
  { name: 'XL', variable: '--text-xl', value: '1.25rem' },
  { name: '2XL', variable: '--text-2xl', value: '1.5rem' },
  { name: '3XL', variable: '--text-3xl', value: '1.875rem' },
  { name: '4XL', variable: '--text-4xl', value: '2.25rem' },
];

const defaultSpacing: SpacingToken[] = [
  { name: '2XS', variable: '--spacing-2xs', value: '0.5rem', px: 8 },
  { name: 'XS', variable: '--spacing-xs', value: '0.75rem', px: 12 },
  { name: 'SM', variable: '--spacing-sm', value: '1rem', px: 16 },
  { name: 'MD', variable: '--spacing-md', value: '1.5rem', px: 24 },
  { name: 'LG', variable: '--spacing-lg', value: '2rem', px: 32 },
  { name: 'XL', variable: '--spacing-xl', value: '2.5rem', px: 40 },
  { name: '2XL', variable: '--spacing-2xl', value: '3.5rem', px: 56 },
  { name: '3XL', variable: '--spacing-3xl', value: '5rem', px: 80 },
  { name: '4XL', variable: '--spacing-4xl', value: '7rem', px: 112 },
];

const defaultBorderRadius: BorderRadiusToken[] = [
  { name: 'SM', variable: '--radius-sm', value: '0.5rem', px: 8 },
  { name: 'MD', variable: '--radius-md', value: '1rem', px: 16 },
  { name: 'LG', variable: '--radius-lg', value: '1.25rem', px: 20 },
  { name: 'XL', variable: '--radius-xl', value: '1.5rem', px: 24 },
  { name: '2XL', variable: '--radius-2xl', value: '2rem', px: 32 },
  { name: 'Full', variable: '--radius-full', value: '9999px', px: 9999 },
];

const defaultTokensData: TokensData = {
  colors: defaultColors,
  fonts: defaultFonts,
  fontSizes: defaultFontSizes,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
};

export default function TokenEditor() {
  const { data, loading, save, saving } = useSettings<TokensData>('tokens', defaultTokensData);
  const [colors, setColors] = useState<ColorToken[]>(defaultColors);
  const [fonts, setFonts] = useState<TypographyToken[]>(defaultFonts);
  const [fontSizes, setFontSizes] = useState<TypographyToken[]>(defaultFontSizes);
  const [spacing, setSpacing] = useState<SpacingToken[]>(defaultSpacing);
  const [borderRadius, setBorderRadius] = useState<BorderRadiusToken[]>(defaultBorderRadius);
  const [saved, setSaved] = useState(false);

  // Sync data from API to local state
  useEffect(() => {
    if (data) {
      setColors(data.colors || defaultColors);
      setFonts(data.fonts || defaultFonts);
      setFontSizes(data.fontSizes || defaultFontSizes);
      setSpacing(data.spacing || defaultSpacing);
      setBorderRadius(data.borderRadius || defaultBorderRadius);
    }
  }, [data]);

  function handleColorChange(index: number, newValue: string) {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, value: newValue } : c))
    );
  }

  async function handleSave() {
    try {
      await save({ colors, fonts, fontSizes, spacing, borderRadius });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      alert('Failed to save tokens. Please try again.');
    }
  }

  function handleExport() {
    const tokens = {
      colors: Object.fromEntries(colors.map((c) => [c.variable, c.value])),
      typography: {
        fonts: Object.fromEntries(fonts.map((f) => [f.variable, f.value])),
        sizes: Object.fromEntries(fontSizes.map((f) => [f.variable, f.value])),
      },
      spacing: Object.fromEntries(spacing.map((s) => [s.variable, s.value])),
      borderRadius: Object.fromEntries(borderRadius.map((r) => [r.variable, r.value])),
    };
    const blob = new Blob([JSON.stringify(tokens, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DESIGN_TOKENS.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.colors) {
            const imported = Object.entries(data.colors).map(([variable, value]) => ({
              name: variable.replace('--color-', '').replace(/-/g, ' '),
              variable,
              value: value as string,
            }));
            setColors(imported);
          }
          if (data.typography?.fonts) {
            const importedFonts = Object.entries(data.typography.fonts).map(([variable, value]) => ({
              name: variable.replace('--font-', '').replace(/-/g, ' '),
              variable,
              value: value as string,
            }));
            setFonts(importedFonts);
          }
          if (data.typography?.sizes) {
            const importedSizes = Object.entries(data.typography.sizes).map(([variable, value]) => ({
              name: variable.replace('--text-', '').toUpperCase(),
              variable,
              value: value as string,
            }));
            setFontSizes(importedSizes);
          }
          if (data.spacing) {
            const importedSpacing = Object.entries(data.spacing).map(([variable, value]) => {
              const remValue = value as string;
              const px = parseFloat(remValue) * 16;
              return {
                name: variable.replace('--spacing-', '').toUpperCase(),
                variable,
                value: remValue,
                px,
              };
            });
            setSpacing(importedSpacing);
          }
          if (data.borderRadius) {
            const importedRadius = Object.entries(data.borderRadius).map(([variable, value]) => {
              const remValue = value as string;
              const px = remValue === '9999px' ? 9999 : parseFloat(remValue) * 16;
              return {
                name: variable.replace('--radius-', '').toUpperCase(),
                variable,
                value: remValue,
                px,
              };
            });
            setBorderRadius(importedRadius);
          }
        } catch (error) {
          console.error('Failed to import tokens:', error);
          alert('Failed to import tokens. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Import / Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Upload className="h-4 w-4" />
            Import tokens
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export tokens
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4" />
              Opgeslagen!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Opslaan
            </>
          )}
        </button>
      </div>

      {/* Colors */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Paintbrush className="h-5 w-5 text-slate-400" />
          Kleuren
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color, index) => (
            <div
              key={color.variable}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"
            >
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={color.value}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div
                  className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 shadow-sm dark:border-slate-600"
                  style={{ backgroundColor: color.value }}
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                  {color.name}
                </p>
                <p className="truncate font-mono text-xs text-slate-400">{color.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Typografie
        </h3>

        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Font families
          </h4>
          {fonts.map((font) => (
            <div
              key={font.variable}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {font.name}
                </p>
                <p className="font-mono text-xs text-slate-400">{font.variable}</p>
              </div>
              <span
                className="text-sm text-slate-800 dark:text-slate-100"
                style={{ fontFamily: font.value }}
              >
                {font.value}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Font sizes
          </h4>
          {fontSizes.map((size) => (
            <div
              key={size.variable}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {size.name}
                </span>
                <span className="font-mono text-xs text-slate-400">{size.value}</span>
              </div>
              <span
                className="text-slate-800 dark:text-slate-100"
                style={{ fontSize: size.value }}
              >
                Aa Bb Cc
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Ruler className="h-5 w-5 text-slate-400" />
          Spacing
        </h3>
        <div className="space-y-3">
          {spacing.map((s) => (
            <div
              key={s.variable}
              className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {s.name}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <div
                  className="h-4 rounded bg-indigo-400 dark:bg-indigo-500"
                  style={{ width: `${s.px}px` }}
                />
                <span className="font-mono text-xs text-slate-400">
                  {s.value} ({s.px}px)
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Paintbrush className="h-5 w-5 text-slate-400" />
          Border Radius
        </h3>
        <div className="space-y-3">
          {borderRadius.map((r) => (
            <div
              key={r.variable}
              className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="w-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {r.name}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <div
                  className="h-16 w-16 bg-gradient-to-br from-orange-400 to-orange-500"
                  style={{ borderRadius: r.value }}
                />
                <span className="font-mono text-xs text-slate-400">
                  {r.value} {r.px !== 9999 && `(${r.px}px)`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Preview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Type className="h-5 w-5 text-slate-400" />
          Live Preview
        </h3>
        <div className="space-y-6">
          {/* Color preview */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Color Palette
            </h4>
            <div className="flex flex-wrap gap-2">
              {colors.slice(0, 7).map((color) => (
                <div
                  key={color.variable}
                  className="flex h-20 w-20 items-end justify-center rounded-lg p-2 shadow-sm"
                  style={{ backgroundColor: color.value }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        parseInt(color.value.slice(1, 3), 16) > 128
                          ? '#000000'
                          : '#FFFFFF',
                    }}
                  >
                    {color.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography preview */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Typography Scale
            </h4>
            <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              {fontSizes.slice().reverse().map((size) => (
                <div
                  key={size.variable}
                  className="text-slate-800 dark:text-slate-100"
                  style={{ fontSize: size.value, fontFamily: fonts[0]?.value }}
                >
                  The quick brown fox jumps - {size.name}
                </div>
              ))}
            </div>
          </div>

          {/* Component preview */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Component Example
            </h4>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
              <button
                className="rounded-lg px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors"
                style={{ backgroundColor: colors[0]?.value }}
              >
                Primary Button
              </button>
              <p
                className="mt-4 text-slate-600 dark:text-slate-300"
                style={{
                  fontSize: fontSizes[2]?.value,
                  fontFamily: fonts[1]?.value,
                }}
              >
                This is a preview of how your design tokens look in actual components. The
                button uses your primary color, and this text uses your body font.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
