import { NextRequest, NextResponse } from 'next/server';
import { User, Session } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 获取 session_id
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json({ user: null });
    }

    const sessionId = sessionMatch[1];

    // 获取 D1 绑定
    // @ts-ignore - Cloudflare Pages 绑定
    const db: D1Database = request.env?.DB || globalThis.DB;
    
    if (!db) {
      return NextResponse.json({ user: null });
    }

    // 查找 Session
    const session = await db.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first<Session>();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    // 获取用户信息
    const user = await db.prepare(
      'SELECT id, email, name, avatar_url FROM users WHERE id = ?'
    ).bind(session.user_id).first<User>();

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    return NextResponse.json({ user: null });
  }
}