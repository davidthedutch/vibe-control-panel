import { CheckResult } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

interface ManifestIssue {
  component: string;
  issue: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function checkManifestSync(): Promise<CheckResult> {
  const manifestPath = path.join(process.cwd(), 'SITE_MANIFEST.json');
  const componentsDir = path.join(process.cwd(), 'src', 'components');

  try {
    // Check if manifest exists
    const manifestExists = await fileExists(manifestPath);
    if (!manifestExists) {
      return {
        name: 'Manifest Sync',
        type: 'manifest-sync',
        status: 'warn',
        score: 50,
        details: 'SITE_MANIFEST.json niet gevonden',
        expanded: 'Maak een SITE_MANIFEST.json bestand in de root van het project'
      };
    }

    // Read manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const issues: ManifestIssue[] = [];
    let componentsFound = 0;

    // Check if manifest has components array
    if (!manifest.components || !Array.isArray(manifest.components)) {
      return {
        name: 'Manifest Sync',
        type: 'manifest-sync',
        status: 'warn',
        score: 50,
        details: 'Manifest heeft geen components array',
        expanded: 'Voeg een "components" array toe aan SITE_MANIFEST.json'
      };
    }

    // Check each component in manifest
    for (const component of manifest.components) {
      const componentName = component.name || component.id || component;
      if (typeof componentName !== 'string') continue;

      componentsFound++;

      // Check if component file exists
      const possiblePaths = [
        path.join(componentsDir, `${componentName}.tsx`),
        path.join(componentsDir, `${componentName}.jsx`),
        path.join(componentsDir, componentName, 'index.tsx'),
        path.join(componentsDir, componentName, 'index.jsx'),
        path.join(componentsDir, componentName.toLowerCase() + '.tsx'),
        path.join(componentsDir, componentName.toLowerCase() + '.jsx'),
      ];

      let found = false;
      for (const p of possiblePaths) {
        if (await fileExists(p)) {
          found = true;
          break;
        }
      }

      if (!found) {
        issues.push({
          component: componentName,
          issue: 'Component file not found in src/components/'
        });
      }
    }

    const count = issues.length;
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 3) {
      status = 'fail';
      score = Math.max(20, 100 - count * 15);
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(60, 100 - count * 10);
    }

    const details = count === 0
      ? `Alle ${componentsFound} component${componentsFound !== 1 ? 'en' : ''} gevonden`
      : `${count} component${count !== 1 ? 'en' : ''} niet gevonden van ${componentsFound}`;

    const expanded = issues.length > 0
      ? issues.map(item => `${item.component}: ${item.issue}`).join('\n')
      : 'Alle componenten in SITE_MANIFEST.json komen overeen met bestanden in src/components/';

    return {
      name: 'Manifest Sync',
      type: 'manifest-sync',
      status,
      score,
      details,
      expanded
    };
  } catch (error) {
    return {
      name: 'Manifest Sync',
      type: 'manifest-sync',
      status: 'fail',
      score: 0,
      details: 'Fout tijdens controleren',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
