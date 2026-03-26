import { NextRequest, NextResponse } from 'next/server';
import { Schedule, Session, generateId } from '@/lib/db';

// 获取今日日程
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];
    
    // @ts-ignore
    const db: D1Database = request.env?.DB || globalThis.DB;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // 验证 Session
    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 获取日程
    const result = await db.prepare(
      'SELECT * FROM schedules WHERE user_id = ? AND date = ? ORDER BY start_time'
    ).bind(session.user_id, date).all<Schedule>();

    return NextResponse.json({ schedules: result.results || [] });
  } catch (err) {
    console.error('Get schedules error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 添加日程
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];
    
    // @ts-ignore
    const db: D1Database = request.env?.DB || globalThis.DB;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // 验证 Session
    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, category, date } = body;

    if (!title || !startTime || !endTime || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scheduleId = generateId();

    await db.prepare(
      'INSERT INTO schedules (id, user_id, title, description, start_time, end_time, category, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(scheduleId, session.user_id, title, description || null, startTime, endTime, category || 'work', date).run();

    return NextResponse.json({ 
      success: true, 
      schedule: { id: scheduleId, title, description, startTime, endTime, category, date } 
    });
  } catch (err) {
    console.error('Add schedule error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 更新日程
export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];
    
    // @ts-ignore
    const db: D1Database = request.env?.DB || globalThis.DB;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, startTime, endTime, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing schedule id' }, { status: 400 });
    }

    await db.prepare(
      'UPDATE schedules SET title = ?, description = ?, start_time = ?, end_time = ?, category = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?'
    ).bind(title, description || null, startTime, endTime, category || 'work', id, session.user_id).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update schedule error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 删除日程
export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];
    
    // @ts-ignore
    const db: D1Database = request.env?.DB || globalThis.DB;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing schedule id' }, { status: 400 });
    }

    await db.prepare(
      'DELETE FROM schedules WHERE id = ? AND user_id = ?'
    ).bind(id, session.user_id).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete schedule error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}