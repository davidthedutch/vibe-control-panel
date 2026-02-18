import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  project: {
    name: 'Vibe Control Panel',
    description: 'Een dashboard voor het beheren van vibe-coded websites. Biedt inzicht in componenten, features, design tokens, SEO en meer.',
    status: 'in_development',
    urls: {
      production: 'https://vibe-control-panel-web.vercel.app',
      staging: '',
      development: 'http://localhost:3000',
    },
    techStack: {
      framework: 'Next.js 15',
      styling: 'Tailwind CSS 4',
      database: 'Supabase',
      auth: 'Clerk',
      deployment: 'Vercel',
    },
  },
  tokens: {},
  policies: [],
  integrations: {},
  secrets: [],
};

// GET /api/settings - Fetch all project settings
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId') || 'default';

    const { data, error } = await supabaseAdmin
      .from('project_settings')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(data.settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// POST /api/settings - Save project settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = 'default', settings } = body;

    const { data, error } = await supabaseAdmin
      .from('project_settings')
      .upsert({
        project_id: projectId,
        settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update specific setting section
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = 'default', section, data: sectionData } = body;

    // First, get existing settings
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('project_settings')
      .select('settings')
      .eq('project_id', projectId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Merge the section data
    const updatedSettings = {
      ...(existing?.settings || {}),
      [section]: sectionData,
    };

    // Save back
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('project_settings')
      .upsert({
        project_id: projectId,
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
