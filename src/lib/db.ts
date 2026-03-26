// 数据库相关类型和工具函数

// 用户表结构
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

// Session 表结构
export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

// 日程表结构
export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// 今日意图表结构
export interface DailyIntent {
  id: string;
  user_id: string;
  content: string;
  date: string;
  created_at: string;
}

// 生成 UUID
export function generateId(): string {
  return crypto.randomUUID();
}

// Cookie 设置
export function setCookie(name: string, value: string, maxAge: number = 7 * 24 * 60 * 60): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}