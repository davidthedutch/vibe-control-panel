import { NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/health/runner';
import { saveHistory, getRecentHistory } from '@/lib/health/storage';
import { checkAndNotify } from '@/lib/health/notifications';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Get previous score for comparison
    const history = await getRecentHistory(1);
    const previousScore = history.length > 0 ? history[history.length - 1].score : undefined;

    // Run all health checks
    const result = await runAllChecks();

    // Save the score to history
    await saveHistory(result.overallScore);

    // Check and create notifications
    await checkAndNotify(result.checks, result.overallScore, previousScore);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await runAllChecks();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
