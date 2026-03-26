import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { DailyIntent, Session, generateId } from '@/lib/db';

export const runtime = 'edge';

// 获取今日意图
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ intent: null });
    }

    const sessionId = sessionMatch[1];
    
    const { env } = getRequestContext();
    const db = env.DB;
    
    if (!db) {
      return NextResponse.json({ intent: null });
    }

    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ intent: null });
    }

    const date = new Date().toISOString().split('T')[0];

    const intent = await db.prepare(
      'SELECT content FROM daily_intents WHERE user_id = ? AND date = ?'
    ).bind(session.user_id, date).first<{ content: string }>();

    return NextResponse.json({ intent: intent?.content || null });
  } catch (err) {
    console.error('Get intent error:', err);
    return NextResponse.json({ intent: null });
  }
}

// 设置今日意图
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = sessionMatch[1];
    
    const { env } = getRequestContext();
    const db = env.DB;
    
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
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const date = new Date().toISOString().split('T')[0];
    const intentId = generateId();

    // 使用 INSERT OR REPLACE (SQLite 语法)
    await db.prepare(`
      INSERT INTO daily_intents (id, user_id, content, date) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET content = excluded.content
    `).bind(intentId, session.user_id, content, date).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Set intent error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}