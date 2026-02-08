import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

interface BrokenImport {
  file: string;
  line: number;
  importPath: string;
  reason: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveImport(importPath: string, fromFile: string): Promise<boolean> {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return true;
  }

  const dir = path.dirname(fromFile);
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];

  for (const ext of extensions) {
    const fullPath = path.resolve(dir, importPath + ext);
    if (await fileExists(fullPath)) {
      return true;
    }

    // Check for index files
    const indexPath = path.resolve(dir, importPath, 'index' + ext);
    if (await fileExists(indexPath)) {
      return true;
    }
  }

  return false;
}

async function scanFileForImports(filePath: string, baseDir: string): Promise<BrokenImport[]> {
  const broken: BrokenImport[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    const importRegex = /^import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"]([^'"]+)['"]/;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      let match = line.match(importRegex);
      if (!match) {
        match = line.match(requireRegex);
      }

      if (match) {
        const importPath = match[1];

        // Skip if it's an external package (not relative path)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue;
        }

        const exists = await resolveImport(importPath, filePath);
        if (!exists) {
          broken.push({
            file: path.relative(baseDir, filePath),
            line: i + 1,
            importPath,
            reason: 'File not found'
          });
        }
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }

  return broken;
}

async function scanDirectory(dir: string, results: BrokenImport[] = [], baseDir: string = dir): Promise<BrokenImport[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath, results, baseDir);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const brokenInFile = await scanFileForImports(fullPath, baseDir);
        results.push(...brokenInFile);
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }

  return results;
}

export async function checkBrokenImports(): Promise<CheckResult> {
  const srcDir = path.join(process.cwd(), 'src');

  try {
    const brokenImports = await scanDirectory(srcDir);
    const count = brokenImports.length;

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 5) {
      status = 'fail';
      score = 0;
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(50, 100 - count * 10);
    }

    // Count total imports scanned (approximate)
    const totalFiles = await countTsFiles(srcDir);
    const details = count === 0
      ? `${totalFiles} bestanden gecontroleerd, 0 kapot`
      : `${count} kapotte import${count !== 1 ? 's' : ''} gevonden`;

    const expanded = brokenImports.length > 0
      ? brokenImports.slice(0, 10).map(item =>
          `${item.file}:${item.line} - import '${item.importPath}'`
        ).join('\n') + (brokenImports.length > 10 ? `\n... en ${brokenImports.length - 10} meer` : '')
      : '';

    return {
      name: 'Kapotte Imports',
      type: 'broken-imports',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Kapotte Imports',
      type: 'broken-imports',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens scannen',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function countTsFiles(dir: string): Promise<number> {
  let count = 0;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          count += await countTsFiles(fullPath);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        count++;
      }
    }
  } catch {
    // Ignore
  }

  return count;
}
