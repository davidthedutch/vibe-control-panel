import { NextResponse } from 'next/server';
import { getSeoPages } from '@vibe/shared/lib/api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Generate sitemap from SEO pages
export async function POST() {
  try {
    const projectId = '00000000-0000-0000-0000-000000000001';
    const settingsProjectId = 'default';

    // Get project to fetch base URL
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('urls')
      .eq('id', projectId)
      .single();

    const baseUrl = project?.urls?.production || project?.urls?.development || 'https://example.com';

    // Fetch all SEO pages
    const { data: pages } = await getSeoPages(projectId);

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages found to generate sitemap' },
        { status: 400 }
      );
    }

    // Generate sitemap XML
    const sitemap = generateSitemapXml(baseUrl, pages);

    // Get current settings
    const { data: currentSettings } = await supabaseAdmin
      .from('project_settings')
      .select('settings')
      .eq('project_id', settingsProjectId)
      .single();

    const settings = (currentSettings?.settings as Record<string, unknown>) || {};
    const seoSettings = (settings.seo as Record<string, unknown>) || {};

    // Update SEO settings with new sitemap
    const updatedSettings = {
      ...settings,
      seo: {
        ...seoSettings,
        sitemap: sitemap,
      },
    };

    // Update settings
    await supabaseAdmin
      .from('project_settings')
      .update({ settings: updatedSettings })
      .eq('project_id', settingsProjectId);

    return NextResponse.json({
      success: true,
      content: sitemap,
      pages: pages.length,
    });
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate sitemap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateSitemapXml(
  baseUrl: string,
  pages: Array<{ url: string; lastCrawled: string }>
): string {
  const now = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  pages.forEach(page => {
    const fullUrl = `${baseUrl}${page.url}`;
    const lastmod = page.lastCrawled ? page.lastCrawled.split('T')[0] : now;
    const priority = page.url === '/' ? '1.0' : '0.8';

    xml += '  <url>\n';
    xml += `    <loc>${fullUrl}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}
