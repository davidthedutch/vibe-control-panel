import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// POST /api/crm/track — Receive tracking events from external sites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, ...payload } = body;

    if (!projectId || !action) {
      return NextResponse.json(
        { error: 'Missing projectId or action' },
        { status: 400 }
      );
    }

    // Verify project exists
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid project' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'session_start': {
        const { externalId, device, browser, currentPage } = payload;

        // Get or create user
        let userId: string;
        const { data: existingUser } = await supabaseAdmin
          .from('site_users')
          .select('id')
          .eq('external_id', externalId)
          .eq('project_id', projectId)
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data: newUser } = await supabaseAdmin
            .from('site_users')
            .insert({
              project_id: projectId,
              external_id: externalId,
              segment: 'visitor',
            })
            .select('id')
            .single();

          if (!newUser) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
          }
          userId = newUser.id;
        }

        // Create session
        const { data: session } = await supabaseAdmin
          .from('site_sessions')
          .insert({
            user_id: userId,
            project_id: projectId,
            device: device || 'desktop',
            browser: browser || 'unknown',
            is_online: true,
            current_page: currentPage || '/',
          })
          .select('id')
          .single();

        return NextResponse.json({
          sessionId: session?.id,
          userId,
        });
      }

      case 'page_view': {
        const { sessionId, userId: uid, pageUrl, eventData } = payload;

        if (!sessionId || !uid) {
          return NextResponse.json({ error: 'Missing sessionId or userId' }, { status: 400 });
        }

        await supabaseAdmin.from('user_events').insert({
          session_id: sessionId,
          user_id: uid,
          project_id: projectId,
          event_type: 'page_view',
          page_url: pageUrl || '/',
          event_data: eventData || {},
        });

        return NextResponse.json({ success: true });
      }

      case 'event': {
        const { sessionId, userId: uid, eventType, pageUrl, eventData } = payload;

        if (!sessionId || !uid || !eventType) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await supabaseAdmin.from('user_events').insert({
          session_id: sessionId,
          user_id: uid,
          project_id: projectId,
          event_type: eventType,
          page_url: pageUrl || '/',
          event_data: eventData || {},
        });

        return NextResponse.json({ success: true });
      }

      case 'heartbeat': {
        const { sessionId, currentPage } = payload;

        if (!sessionId) {
          return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        await supabaseAdmin
          .from('site_sessions')
          .update({
            last_activity_at: new Date().toISOString(),
            current_page: currentPage,
          })
          .eq('id', sessionId);

        return NextResponse.json({ success: true });
      }

      case 'session_end': {
        const { sessionId } = payload;

        if (!sessionId) {
          return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        await supabaseAdmin
          .from('site_sessions')
          .update({
            ended_at: new Date().toISOString(),
            is_online: false,
          })
          .eq('id', sessionId);

        return NextResponse.json({ success: true });
      }

      case 'identify': {
        const { userId: uid, email, name, segment, metadata } = payload;

        if (!uid) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        await supabaseAdmin
          .from('site_users')
          .update({
            email: email || undefined,
            name: name || undefined,
            segment: segment || 'user',
            metadata: metadata || {},
          })
          .eq('id', uid);

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[CRM Track API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
