/**
 * Color utility functions for the Preview tab
 */

/**
 * Convert RGB color string to hexadecimal format
 * @param rgb - RGB color string (e.g., "rgb(255, 0, 0)")
 * @returns Hex color string (e.g., "#ff0000")
 */
export function rgbToHex(rgb: string): string {
  // If already hex, return as-is
  if (rgb.startsWith('#')) {
    return rgb;
  }

  // Match rgb() or rgba() format
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) {
    console.warn(`Invalid RGB color: ${rgb}`);
    return '#000000';
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  // Validate ranges
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    console.warn(`RGB values out of range: ${rgb}`);
    return '#000000';
  }

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert hexadecimal color to RGB format
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns RGB color string (e.g., "rgb(255, 0, 0)")
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Handle shorthand hex (e.g., "fff")
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (hex.length !== 6) {
    console.warn(`Invalid hex color: ${hex}`);
    return 'rgb(0, 0, 0)';
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Parse any color format and return hex
 * @param color - Color in any format (hex, rgb, rgba, named)
 * @returns Hex color string
 */
export function normalizeColor(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }
  if (color.startsWith('rgb')) {
    return rgbToHex(color);
  }
  // For named colors, we'd need a lookup table
  // For now, return as-is (browser will handle it)
  return color;
}

/**
 * Check if a color string is valid
 * @param color - Color string to validate
 * @returns True if valid
 */
export function isValidColor(color: string): boolean {
  // Hex format
  if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(color)) {
    return true;
  }

  // RGB format
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(color)) {
    return true;
  }

  // RGBA format
  if (/^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[\d.]+\s*\)$/.test(color)) {
    return true;
  }

  // HSL format (basic check)
  if (/^hsl\(/.test(color)) {
    return true;
  }

  return false;
}

/**
 * Lighten a hex color by a percentage
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const match = rgb.match(/\d+/g);
  if (!match) return hex;

  const [r, g, b] = match.map(Number);

  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return rgbToHex(`rgb(${newR}, ${newG}, ${newB})`);
}

/**
 * Darken a hex color by a percentage
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const match = rgb.match(/\d+/g);
  if (!match) return hex;

  const [r, g, b] = match.map(Number);

  const newR = Math.max(0, Math.floor(r - r * (percent / 100)));
  const newG = Math.max(0, Math.floor(g - g * (percent / 100)));
  const newB = Math.max(0, Math.floor(b - b * (percent / 100)));

  return rgbToHex(`rgb(${newR}, ${newG}, ${newB})`);
}

/**
 * Calculate relative luminance of a color
 * Used for contrast ratio calculations
 * @param hex - Hex color string
 * @returns Luminance value (0-1)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const match = rgb.match(/\d+/g);
  if (!match) return 0;

  const [r, g, b] = match.map((val) => {
    const v = Number(val) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if text color has sufficient contrast with background
 * @param textColor - Text color (hex)
 * @param bgColor - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 * @returns True if contrast meets WCAG requirements
 */
export function hasGoodContrast(
  textColor: string,
  bgColor: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  const requiredRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= requiredRatio;
}
