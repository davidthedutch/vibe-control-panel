import { HealthCheckResult, CheckResult } from './types';
import * as checks from './checks';

export async function runAllChecks(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  // Run all checks in parallel for better performance
  const checkPromises = [
    checks.checkTokenConsistency(),
    checks.checkManifestSync(),
    checks.checkBrokenImports(),
    checks.checkBrokenLinks(),
    checks.checkBrokenImages(),
    checks.checkConsoleErrors(),
    checks.checkAccessibility(),
    checks.checkPerformance(),
  ];

  const results = await Promise.all(checkPromises);

  // Convert results to HealthCheck format with IDs
  const healthChecks = results.map((result, index) => ({
    id: `check-${index + 1}`,
    ...result,
  }));

  // Calculate overall score (weighted average)
  const totalScore = healthChecks.reduce((sum, check) => sum + check.score, 0);
  const overallScore = Math.round(totalScore / healthChecks.length);

  return {
    checks: healthChecks,
    overallScore,
    timestamp,
  };
}

export async function runSingleCheck(checkType: string): Promise<CheckResult | null> {
  switch (checkType) {
    case 'token-consistency':
      return checks.checkTokenConsistency();
    case 'manifest-sync':
      return checks.checkManifestSync();
    case 'broken-imports':
      return checks.checkBrokenImports();
    case 'broken-links':
      return checks.checkBrokenLinks();
    case 'broken-images':
      return checks.checkBrokenImages();
    case 'console-errors':
      return checks.checkConsoleErrors();
    case 'accessibility':
      return checks.checkAccessibility();
    case 'performance':
      return checks.checkPerformance();
    default:
      return null;
  }
}
