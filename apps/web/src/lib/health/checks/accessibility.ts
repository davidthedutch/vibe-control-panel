import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

interface AccessibilityIssue {
  file: string;
  line: number;
  issue: string;
  element: string;
}

async function scanFileForA11yIssues(filePath: string, baseDir: string): Promise<AccessibilityIssue[]> {
  const issues: AccessibilityIssue[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for img without alt
      if (/<img\s/.test(line) && !/alt\s*=/.test(line)) {
        issues.push({
          file: path.relative(baseDir, filePath),
          line: i + 1,
          issue: 'Missing alt attribute',
          element: 'img'
        });
      }

      // Check for Image component without alt
      if (/<Image\s/.test(line) && !/alt\s*=/.test(line)) {
        issues.push({
          file: path.relative(baseDir, filePath),
          line: i + 1,
          issue: 'Missing alt attribute',
          element: 'Image'
        });
      }

      // Check for button without aria-label or text content
      if (/<button\s/.test(line) && !/<button[^>]*>[\s\S]*?\w/.test(line) && !/aria-label\s*=/.test(line)) {
        // This is a simplistic check - might have false positives
        const hasClosingTag = line.includes('</button>');
        if (hasClosingTag && !/>\s*\w/.test(line)) {
          issues.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            issue: 'Button without text or aria-label',
            element: 'button'
          });
        }
      }

      // Check for links without text
      if (/<a\s/.test(line) && line.includes('</a>') && !/>[\s\S]*?\w[\s\S]*?<\/a>/.test(line) && !/aria-label\s*=/.test(line)) {
        issues.push({
          file: path.relative(baseDir, filePath),
          line: i + 1,
          issue: 'Link without text or aria-label',
          element: 'a'
        });
      }

      // Check for input without label or aria-label
      if (/<input\s/.test(line) && !/aria-label\s*=/.test(line) && !/id\s*=/.test(line)) {
        // This is simplistic - might have false positives
        issues.push({
          file: path.relative(baseDir, filePath),
          line: i + 1,
          issue: 'Input without label or aria-label',
          element: 'input'
        });
      }

      // Check for onClick on non-interactive elements without role
      if (/onClick\s*=/.test(line) && /<div\s/.test(line) && !/role\s*=/.test(line)) {
        issues.push({
          file: path.relative(baseDir, filePath),
          line: i + 1,
          issue: 'onClick on div without role',
          element: 'div'
        });
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }

  return issues;
}

async function scanDirectory(dir: string, results: AccessibilityIssue[] = [], baseDir: string = dir): Promise<AccessibilityIssue[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath, results, baseDir);
        }
      } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
        const issuesInFile = await scanFileForA11yIssues(fullPath, baseDir);
        results.push(...issuesInFile);
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }

  return results;
}

export async function checkAccessibility(): Promise<CheckResult> {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const issues = await scanDirectory(srcDir);
    const count = issues.length;

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 10) {
      status = 'fail';
      score = Math.max(30, 100 - count * 3);
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(60, 100 - count * 5);
    }

    const details = count === 0
      ? 'Geen toegankelijkheidsproblemen gevonden'
      : `${count} potentiële probleme${count !== 1 ? 'n' : ''} gevonden`;

    const expanded = issues.length > 0
      ? issues.slice(0, 10).map(item =>
          `${item.file}:${item.line} - ${item.element}: ${item.issue}`
        ).join('\n') + (issues.length > 10 ? `\n... en ${issues.length - 10} meer` : '')
      : '';

    return {
      name: 'Toegankelijkheid',
      type: 'accessibility',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Toegankelijkheid',
      type: 'accessibility',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens scannen',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
