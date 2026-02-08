import { NextResponse } from 'next/server';
import { supabase } from '@vibe/shared/lib/supabase';

export const dynamic = 'force-dynamic';

// Get robots.txt content
export async function GET() {
  try {
    const projectId = 'default';

    const { data: settings } = await supabase
      .from('project_settings')
      .select('settings')
      .eq('project_id', projectId)
      .single();

    const seoSettings = (settings?.settings as Record<string, unknown>)?.seo as Record<string, unknown> | undefined;
    const content = (seoSettings?.robots as string) || getDefaultRobotsTxt();

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to fetch robots.txt:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch robots.txt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Save robots.txt content
export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content' },
        { status: 400 }
      );
    }

    const projectId = 'default';

    // Get current settings
    const { data: currentSettings } = await supabase
      .from('project_settings')
      .select('settings')
      .eq('project_id', projectId)
      .single();

    const settings = (currentSettings?.settings as Record<string, unknown>) || {};
    const seoSettings = (settings.seo as Record<string, unknown>) || {};

    // Update SEO settings with new robots.txt
    const updatedSettings = {
      ...settings,
      seo: {
        ...seoSettings,
        robots: content,
      },
    };

    // Update settings
    await supabase
      .from('project_settings')
      .update({ settings: updatedSettings })
      .eq('project_id', projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save robots.txt:', error);
    return NextResponse.json(
      {
        error: 'Failed to save robots.txt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getDefaultRobotsTxt(): string {
  return `# Default robots.txt
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin
Disallow: /api
Disallow: /private

# Crawl-delay
Crawl-delay: 10

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml
`;
}
