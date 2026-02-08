export type CheckStatus = 'pass' | 'warn' | 'fail';

export interface HealthCheck {
  id: string;
  name: string;
  type: string;
  status: CheckStatus;
  score: number;
  details: string;
  expanded: string;
}

export interface CheckResult {
  name: string;
  type: string;
  status: CheckStatus;
  score: number;
  details: string;
  expanded: string;
}

export interface HealthCheckResult {
  checks: HealthCheck[];
  overallScore: number;
  timestamp: string;
}

export interface HistoryPoint {
  date: string;
  score: number;
  timestamp: string;
}
