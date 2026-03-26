import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { clearCookie } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 从 Cookie 获取 session_id
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session_id=([^;]+)/);
    
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      
      const { env } = getRequestContext();
      const db = env.DB;
      
      if (db) {
        // 删除 Session
        await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
      }
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearCookie('session_id'));
    
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearCookie('session_id'));
    return response;
  }
}