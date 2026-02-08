import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

// Regex patterns for hardcoded values
const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,6}\b/g;
const RGB_COLOR_REGEX = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;
const RGBA_COLOR_REGEX = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;
const PIXEL_REGEX = /:\s*\d+px\b/g;

interface HardcodedValue {
  file: string;
  line: number;
  value: string;
  type: 'color' | 'size';
}

async function scanDirectory(dir: string, results: HardcodedValue[] = [], baseDir: string = dir): Promise<HardcodedValue[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath, results, baseDir);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?|css|scss)$/.test(entry.name)) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            // Skip comments and imports
            if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.includes('import')) {
              return;
            }

            // Find hex colors
            const hexMatches = line.match(HEX_COLOR_REGEX);
            if (hexMatches) {
              hexMatches.forEach(match => {
                results.push({
                  file: path.relative(baseDir, fullPath),
                  line: index + 1,
                  value: match,
                  type: 'color'
                });
              });
            }

            // Find RGB colors
            const rgbMatches = line.match(RGB_COLOR_REGEX);
            if (rgbMatches) {
              rgbMatches.forEach(match => {
                results.push({
                  file: path.relative(baseDir, fullPath),
                  line: index + 1,
                  value: match,
                  type: 'color'
                });
              });
            }

            // Find RGBA colors
            const rgbaMatches = line.match(RGBA_COLOR_REGEX);
            if (rgbaMatches) {
              rgbaMatches.forEach(match => {
                results.push({
                  file: path.relative(baseDir, fullPath),
                  line: index + 1,
                  value: match,
                  type: 'color'
                });
              });
            }
          });
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }

  return results;
}

export async function checkTokenConsistency(): Promise<CheckResult> {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const hardcodedValues = await scanDirectory(srcDir);

    // Filter out common false positives
    const filtered = hardcodedValues.filter(item => {
      // Allow #fff, #000, transparent colors commonly used
      if (item.value === '#fff' || item.value === '#000' || item.value === '#ffffff' || item.value === '#000000') {
        return false;
      }
      return true;
    });

    const count = filtered.length;
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 10) {
      status = 'fail';
      score = Math.max(0, 100 - count * 5);
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(60, 100 - count * 5);
    }

    const details = count === 0
      ? 'Geen hardcoded waarden gevonden'
      : `${count} hardcoded waarde${count !== 1 ? 'n' : ''} gevonden`;

    const expanded = filtered.length > 0
      ? filtered.slice(0, 10).map(item =>
          `${item.file}:${item.line} - ${item.value}`
        ).join('\n') + (filtered.length > 10 ? `\n... en ${filtered.length - 10} meer` : '')
      : '';

    return {
      name: 'Token Consistentie',
      type: 'token-consistency',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Token Consistentie',
      type: 'token-consistency',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens scannen',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
