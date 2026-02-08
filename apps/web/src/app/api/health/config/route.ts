import { NextResponse } from 'next/server';
import { loadConfig, saveConfig } from '@/lib/health/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await loadConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to load config:', error);
    return NextResponse.json(
      {
        error: 'Failed to load config',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const config = await request.json();
    await saveConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save config:', error);
    return NextResponse.json(
      {
        error: 'Failed to save config',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
