import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { generateId, setCookie, User } from '@/lib/db';

export const runtime = 'edge';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const { env } = getRequestContext();
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const siteUrl = 'https://time-manager.yunfanai.xyz';

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=oauth_not_configured', request.url));
    }

    // 1. 用 code 换取 token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${siteUrl}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error('Token exchange failed:', text);
      throw new Error('Failed to exchange token');
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // 2. 获取用户信息
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    // 3. 获取 D1 数据库
    const db = env.DB;
    
    if (!db) {
      console.error('D1 database not bound');
      return NextResponse.redirect(new URL('/?error=db_not_configured', request.url));
    }

    // 4. 查找或创建用户
    let user: User;
    
    // 先通过 Google ID 查找
    const existingByGoogleId = await db.prepare(
      'SELECT * FROM users WHERE google_id = ?'
    ).bind(googleUser.id).first<User>();

    if (existingByGoogleId) {
      // 更新用户信息
      await db.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(googleUser.name, googleUser.picture, existingByGoogleId.id).run();
      user = {
        ...existingByGoogleId,
        name: googleUser.name,
        avatar_url: googleUser.picture,
      };
    } else {
      // 通过邮箱查找
      const existingByEmail = await db.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(googleUser.email).first<User>();

      if (existingByEmail) {
        // 更新 Google ID
        await db.prepare(
          'UPDATE users SET google_id = ?, name = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(googleUser.id, googleUser.name, googleUser.picture, existingByEmail.id).run();
        user = {
          ...existingByEmail,
          google_id: googleUser.id,
          name: googleUser.name,
          avatar_url: googleUser.picture,
        };
      } else {
        // 创建新用户
        const newUserId = generateId();
        await db.prepare(
          'INSERT INTO users (id, email, name, avatar_url, google_id) VALUES (?, ?, ?, ?, ?)'
        ).bind(newUserId, googleUser.email, googleUser.name, googleUser.picture, googleUser.id).run();
        
        user = {
          id: newUserId,
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_id: googleUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    // 5. 创建 Session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 天

    await db.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt).run();

    // 6. 重定向回首页并设置 Cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('Set-Cookie', setCookie('session_id', sessionId, 7 * 24 * 60 * 60));
    
    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}