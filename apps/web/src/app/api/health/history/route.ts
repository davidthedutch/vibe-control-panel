import { NextResponse } from 'next/server';
import { getRecentHistory, generatePlaceholderHistory, loadHistory } from '@/lib/health/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const usePlaceholder = searchParams.get('placeholder') === 'true';

    if (usePlaceholder) {
      // For initial setup or demo, generate placeholder data
      const history = generatePlaceholderHistory(days);
      return NextResponse.json({ history });
    }

    // Load actual history
    let history = await getRecentHistory(days);

    // If no history exists, generate placeholder
    if (history.length === 0) {
      history = generatePlaceholderHistory(days);
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Failed to load history:', error);
    return NextResponse.json(
      {
        error: 'Failed to load history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
