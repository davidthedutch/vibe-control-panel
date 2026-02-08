import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

interface Link {
  file: string;
  line: number;
  url: string;
  status?: number;
}

async function scanFileForLinks(filePath: string, baseDir: string): Promise<Link[]> {
  const links: Link[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Regex for href attributes
    const hrefRegex = /href\s*=\s*["']([^"']+)["']/g;
    // Regex for markdown links
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Find href attributes
      let match;
      const hrefMatches = line.matchAll(hrefRegex);
      for (const m of hrefMatches) {
        const url = m[1];
        // Only check internal links and skip mailto, tel, etc
        if (url.startsWith('/') && !url.startsWith('//')) {
          links.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            url
          });
        }
      }

      // Find markdown links
      const mdMatches = line.matchAll(mdLinkRegex);
      for (const m of mdMatches) {
        const url = m[2];
        if (url.startsWith('/') && !url.startsWith('//')) {
          links.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            url
          });
        }
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }

  return links;
}

async function scanDirectory(dir: string, results: Link[] = [], baseDir: string = dir): Promise<Link[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath, results, baseDir);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?|md|mdx)$/.test(entry.name)) {
        const linksInFile = await scanFileForLinks(fullPath, baseDir);
        results.push(...linksInFile);
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }

  return results;
}

async function checkLinkExists(url: string): Promise<boolean> {
  // For Next.js app router, convert route to file path
  const appDir = path.join(process.cwd(), 'src', 'app');
  const pagesDir = path.join(process.cwd(), 'src', 'pages');

  // Remove query params and hash
  const cleanUrl = url.split('?')[0].split('#')[0];

  // Check app router
  const appPaths = [
    path.join(appDir, cleanUrl, 'page.tsx'),
    path.join(appDir, cleanUrl, 'page.jsx'),
    path.join(appDir, cleanUrl, 'page.ts'),
    path.join(appDir, cleanUrl, 'page.js'),
    path.join(appDir, cleanUrl + '.tsx'),
    path.join(appDir, cleanUrl + '.jsx'),
  ];

  for (const p of appPaths) {
    try {
      await fs.access(p);
      return true;
    } catch {
      // Continue
    }
  }

  // Check pages router
  const pagesPaths = [
    path.join(pagesDir, cleanUrl + '.tsx'),
    path.join(pagesDir, cleanUrl + '.jsx'),
    path.join(pagesDir, cleanUrl, 'index.tsx'),
    path.join(pagesDir, cleanUrl, 'index.jsx'),
  ];

  for (const p of pagesPaths) {
    try {
      await fs.access(p);
      return true;
    } catch {
      // Continue
    }
  }

  // Check public folder
  const publicPath = path.join(process.cwd(), 'public', cleanUrl);
  try {
    await fs.access(publicPath);
    return true;
  } catch {
    // Continue
  }

  return false;
}

export async function checkBrokenLinks(): Promise<CheckResult> {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const allLinks = await scanDirectory(srcDir);

    // Deduplicate links
    const uniqueUrls = [...new Set(allLinks.map(l => l.url))];

    // Check each unique link
    const brokenLinks: Link[] = [];
    for (const url of uniqueUrls) {
      const exists = await checkLinkExists(url);
      if (!exists) {
        const linkInstance = allLinks.find(l => l.url === url);
        if (linkInstance) {
          brokenLinks.push(linkInstance);
        }
      }
    }

    const count = brokenLinks.length;
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 5) {
      status = 'fail';
      score = Math.max(0, 100 - count * 10);
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(60, 100 - count * 10);
    }

    const details = count === 0
      ? `${uniqueUrls.length} links gecontroleerd, 0 kapot`
      : `${count} kapotte link${count !== 1 ? 's' : ''} gevonden`;

    const expanded = brokenLinks.length > 0
      ? brokenLinks.slice(0, 10).map(item =>
          `${item.file}:${item.line} - ${item.url}`
        ).join('\n') + (brokenLinks.length > 10 ? `\n... en ${brokenLinks.length - 10} meer` : '')
      : '';

    return {
      name: 'Kapotte Links',
      type: 'broken-links',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Kapotte Links',
      type: 'broken-links',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens scannen',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
