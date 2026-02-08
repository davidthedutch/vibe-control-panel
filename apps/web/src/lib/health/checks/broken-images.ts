import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageRef {
  file: string;
  line: number;
  src: string;
}

async function scanFileForImages(filePath: string, baseDir: string): Promise<ImageRef[]> {
  const images: ImageRef[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Regex for src attributes
    const srcRegex = /(?:src|srcSet)\s*=\s*["']([^"']+)["']/g;
    // Regex for markdown images
    const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    // Regex for background images in styles
    const bgImageRegex = /url\s*\(\s*["']?([^"')]+)["']?\s*\)/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Find src attributes
      const srcMatches = line.matchAll(srcRegex);
      for (const m of srcMatches) {
        const src = m[1];
        // Skip external URLs and data URIs
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          images.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            src
          });
        }
      }

      // Find markdown images
      const mdMatches = line.matchAll(mdImageRegex);
      for (const m of mdMatches) {
        const src = m[2];
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          images.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            src
          });
        }
      }

      // Find background images
      const bgMatches = line.matchAll(bgImageRegex);
      for (const m of bgMatches) {
        const src = m[1];
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          images.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            src
          });
        }
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }

  return images;
}

async function scanDirectory(dir: string, results: ImageRef[] = [], baseDir: string = dir): Promise<ImageRef[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath, results, baseDir);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?|css|scss|md|mdx)$/.test(entry.name)) {
        const imagesInFile = await scanFileForImages(fullPath, baseDir);
        results.push(...imagesInFile);
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }

  return results;
}

async function checkImageExists(src: string, fromFile: string): Promise<boolean> {
  // Handle absolute paths from public folder
  if (src.startsWith('/')) {
    const publicPath = path.join(process.cwd(), 'public', src);
    try {
      await fs.access(publicPath);
      return true;
    } catch {
      return false;
    }
  }

  // Handle relative paths
  const dir = path.dirname(path.join(process.cwd(), 'src', fromFile));
  const imagePath = path.resolve(dir, src);

  try {
    await fs.access(imagePath);
    return true;
  } catch {
    // Also try from public folder
    const publicPath = path.join(process.cwd(), 'public', src);
    try {
      await fs.access(publicPath);
      return true;
    } catch {
      return false;
    }
  }
}

export async function checkBrokenImages(): Promise<CheckResult> {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const allImages = await scanDirectory(srcDir);

    // Check each image
    const brokenImages: ImageRef[] = [];
    for (const img of allImages) {
      const exists = await checkImageExists(img.src, img.file);
      if (!exists) {
        brokenImages.push(img);
      }
    }

    const count = brokenImages.length;
    const total = allImages.length;
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
      ? `Alle ${total} afbeelding${total !== 1 ? 'en' : ''} gevonden`
      : `${count} ontbrekende afbeelding${count !== 1 ? 'en' : ''} van ${total}`;

    const expanded = brokenImages.length > 0
      ? brokenImages.slice(0, 10).map(item =>
          `${item.file}:${item.line} - ${item.src}`
        ).join('\n') + (brokenImages.length > 10 ? `\n... en ${brokenImages.length - 10} meer` : '')
      : '';

    return {
      name: 'Kapotte Afbeeldingen',
      type: 'broken-images',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Kapotte Afbeeldingen',
      type: 'broken-images',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens scannen',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
