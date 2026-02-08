import { NextResponse } from 'next/server';
import { supabase } from '@vibe/shared/lib/supabase';
import type { SeoIssue } from '@vibe/shared/types';

export const dynamic = 'force-dynamic';

// Crawl the site and update SEO data
export async function POST(request: Request) {
  try {
    const projectId = '00000000-0000-0000-0000-000000000001';

    // Get project URLs
    const { data: project } = await supabase
      .from('projects')
      .select('urls')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const baseUrl = project.urls?.development || 'http://localhost:3000';

    // Define pages to crawl
    const pagesToCrawl = [
      { path: '/', name: 'Home' },
      { path: '/features', name: 'Features' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/about', name: 'About' },
      { path: '/contact', name: 'Contact' },
      { path: '/blog', name: 'Blog' },
      { path: '/docs', name: 'Documentation' },
    ];

    const results = [];

    // Crawl each page
    for (const page of pagesToCrawl) {
      const url = `${baseUrl}${page.path}`;

      try {
        // Fetch the page
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Vibe-SEO-Crawler/1.0',
          },
        });

        if (!response.ok) {
          // Page doesn't exist or error
          continue;
        }

        const html = await response.text();

        // Extract SEO data
        const seoData = extractSeoData(html, page.path);

        // Calculate issues
        const issues = detectIssues(seoData);

        // Check if page already exists
        const { data: existing } = await supabase
          .from('seo_pages')
          .select('id')
          .eq('project_id', projectId)
          .eq('url', page.path)
          .single();

        if (existing) {
          // Update existing page
          await supabase
            .from('seo_pages')
            .update({
              title: seoData.title,
              description: seoData.description,
              h1: seoData.h1,
              canonical: seoData.canonical,
              og_image: seoData.ogImage,
              structured_data: seoData.structuredData,
              issues: issues,
              last_crawled: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Insert new page
          await supabase
            .from('seo_pages')
            .insert({
              project_id: projectId,
              url: page.path,
              title: seoData.title,
              description: seoData.description,
              h1: seoData.h1,
              canonical: seoData.canonical,
              og_image: seoData.ogImage,
              structured_data: seoData.structuredData,
              issues: issues,
              last_crawled: new Date().toISOString(),
            });
        }

        results.push({
          url: page.path,
          success: true,
          issues: issues.length,
        });
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
        results.push({
          url: page.path,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      crawled: results.length,
      results,
    });
  } catch (error) {
    console.error('Failed to crawl site:', error);
    return NextResponse.json(
      {
        error: 'Failed to crawl site',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Extract SEO data from HTML
function extractSeoData(html: string, url: string) {
  const data: {
    title: string | null;
    description: string | null;
    h1: string | null;
    canonical: string | null;
    ogImage: string | null;
    structuredData: Record<string, unknown> | null;
  } = {
    title: null,
    description: null,
    h1: null,
    canonical: null,
    ogImage: null,
    structuredData: null,
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descMatch) {
    data.description = descMatch[1].trim();
  }

  // Extract H1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    data.h1 = h1Match[1].trim().replace(/<[^>]+>/g, '');
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    data.canonical = canonicalMatch[1];
  }

  // Extract OG image
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    data.ogImage = ogImageMatch[1];
  }

  // Extract structured data (JSON-LD)
  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
  if (jsonLdMatch) {
    try {
      data.structuredData = JSON.parse(jsonLdMatch[1]);
    } catch (e) {
      // Invalid JSON-LD
    }
  }

  return data;
}

// Detect SEO issues
function detectIssues(data: {
  title?: string | null;
  description?: string | null;
  h1?: string | null;
  ogImage?: string | null;
}): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // Title checks
  if (!data.title || data.title.trim() === '') {
    issues.push({
      type: 'title_missing',
      severity: 'error',
      message: 'Title tag ontbreekt',
    });
  } else if (data.title.length > 60) {
    issues.push({
      type: 'title_too_long',
      severity: 'warning',
      message: `Title is ${data.title.length} karakters (aanbevolen: max 60)`,
    });
  } else if (data.title.length < 30) {
    issues.push({
      type: 'title_too_short',
      severity: 'info',
      message: 'Title zou langer kunnen zijn voor betere zichtbaarheid',
    });
  }

  // Description checks
  if (!data.description || data.description.trim() === '') {
    issues.push({
      type: 'description_missing',
      severity: 'error',
      message: 'Meta description ontbreekt',
    });
  } else if (data.description.length > 160) {
    issues.push({
      type: 'description_too_long',
      severity: 'warning',
      message: `Description is ${data.description.length} karakters (aanbevolen: 150-160)`,
    });
  } else if (data.description.length < 120) {
    issues.push({
      type: 'description_too_short',
      severity: 'info',
      message: `Description is ${data.description.length} karakters (ideaal: 150-160)`,
    });
  }

  // H1 checks
  if (!data.h1 || data.h1.trim() === '') {
    issues.push({
      type: 'h1_missing',
      severity: 'error',
      message: 'H1 heading ontbreekt',
    });
  }

  // OG Image check
  if (!data.ogImage) {
    issues.push({
      type: 'og_image_missing',
      severity: 'warning',
      message: 'OG image ontbreekt',
    });
  }

  return issues;
}
