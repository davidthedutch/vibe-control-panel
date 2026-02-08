import { NextResponse } from 'next/server';
import { supabase } from '@vibe/shared/lib/supabase';

export const dynamic = 'force-dynamic';

// Get sitemap content
export async function GET() {
  try {
    const projectId = 'default';

    const { data: settings } = await supabase
      .from('project_settings')
      .select('settings')
      .eq('project_id', projectId)
      .single();

    const seoSettings = (settings?.settings as Record<string, unknown>)?.seo as Record<string, unknown> | undefined;
    const content = (seoSettings?.sitemap as string) || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to fetch sitemap:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sitemap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
