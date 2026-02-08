import { NextResponse } from 'next/server';
import { getSeoPages, updateSeoPage } from '@vibe/shared/lib/api';
import type { SeoPage, SeoIssue } from '@vibe/shared/types';

export const dynamic = 'force-dynamic';

// Get all SEO pages
export async function GET() {
  try {
    // Use the first project for demo purposes
    const projectId = '00000000-0000-0000-0000-000000000001';

    const { data: pages, error } = await getSeoPages(projectId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SEO pages', message: error },
        { status: 500 }
      );
    }

    // Calculate score for each page
    const pagesWithScores = (pages || []).map(page => ({
      ...page,
      score: calculatePageScore(page),
    }));

    return NextResponse.json({ pages: pagesWithScores });
  } catch (error) {
    console.error('Failed to fetch SEO pages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch SEO pages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Update a specific page
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { pageId, title, description, h1, canonical, ogImage, structuredData } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'Missing pageId' },
        { status: 400 }
      );
    }

    const updates: Partial<SeoPage> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (h1 !== undefined) updates.h1 = h1;
    if (canonical !== undefined) updates.canonical = canonical;
    if (ogImage !== undefined) updates.ogImage = ogImage;
    if (structuredData !== undefined) updates.structuredData = structuredData;

    // Recalculate issues after update
    const issues = detectIssues({
      title: updates.title,
      description: updates.description,
      h1: updates.h1,
      ogImage: updates.ogImage,
    });
    updates.issues = issues;

    const { data: updatedPage, error } = await updateSeoPage(pageId, updates);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update page', message: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        ...updatedPage,
        score: calculatePageScore(updatedPage!),
      },
    });
  } catch (error) {
    console.error('Failed to update SEO page:', error);
    return NextResponse.json(
      {
        error: 'Failed to update SEO page',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate page score
function calculatePageScore(page: SeoPage): number {
  let score = 100;
  const issues = page.issues || [];

  // Deduct points based on issues
  issues.forEach(issue => {
    if (issue.severity === 'error') score -= 20;
    else if (issue.severity === 'warning') score -= 10;
    else if (issue.severity === 'info') score -= 5;
  });

  return Math.max(0, score);
}

// Helper function to detect SEO issues
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
