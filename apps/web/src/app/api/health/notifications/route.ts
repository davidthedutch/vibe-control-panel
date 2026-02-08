import { NextResponse } from 'next/server';
import {
  loadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/health/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'count') {
      const count = await getUnreadCount();
      return NextResponse.json({ count });
    }

    const notifications = await loadNotifications();
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return NextResponse.json(
      {
        error: 'Failed to load notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;

    if (action === 'mark_read' && notificationId) {
      await markAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await markAllAsRead();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to update notifications:', error);
    return NextResponse.json(
      {
        error: 'Failed to update notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
