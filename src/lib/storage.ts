import { Schedule, DailyIntent } from "@/types";

const SCHEDULES_KEY = "time-manager-schedules";
const INTENTS_KEY = "time-manager-intents";

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ============ 认证相关 ============

// 检查是否已登录
export async function checkAuth(): Promise<{ authenticated: boolean; user?: { id: string; email: string; name: string | null; avatar_url: string | null } }> {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    return { authenticated: !!data.user, user: data.user };
  } catch {
    return { authenticated: false };
  }
}

// Google 登录
export function googleLogin(): void {
  window.location.href = '/api/auth/google';
}

// 登出
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

// ============ 日程相关 ============

// localStorage 相关函数（用于未登录状态）
function getSchedulesLocal(): Schedule[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveSchedulesLocal(schedules: Schedule[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

// 获取今日日程
export async function getTodaySchedules(): Promise<Schedule[]> {
  const today = getTodayString();
  
  try {
    const res = await fetch(`/api/schedules?date=${today}`);
    if (res.ok) {
      const data = await res.json();
      return data.schedules.map((item: { id: string; title: string; description: string | null; start_time: string; end_time: string; category: string; date: string }) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startTime: item.start_time,
        endTime: item.end_time,
        category: item.category,
        date: item.date,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch schedules:', err);
  }
  
  // Fallback to localStorage
  return getSchedulesLocal().filter((s) => s.date === today);
}

// 添加日程
export async function addSchedule(schedule: Omit<Schedule, "id" | "date">): Promise<Schedule> {
  const today = getTodayString();
  
  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...schedule, date: today }),
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.schedule;
    }
  } catch (err) {
    console.error('Failed to add schedule:', err);
  }
  
  // Fallback to localStorage
  const schedules = getSchedulesLocal();
  const newSchedule: Schedule = {
    ...schedule,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: today,
  };
  schedules.push(newSchedule);
  saveSchedulesLocal(schedules);
  return newSchedule;
}

// 更新日程
export async function updateSchedule(id: string, updates: Partial<Schedule>): Promise<void> {
  try {
    const res = await fetch('/api/schedules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    
    if (res.ok) return;
  } catch (err) {
    console.error('Failed to update schedule:', err);
  }
  
  // Fallback to localStorage
  const schedules = getSchedulesLocal();
  const index = schedules.findIndex((s) => s.id === id);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    saveSchedulesLocal(schedules);
  }
}

// 删除日程
export async function deleteSchedule(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (err) {
    console.error('Failed to delete schedule:', err);
  }
  
  // Fallback to localStorage
  const schedules = getSchedulesLocal().filter((s) => s.id !== id);
  saveSchedulesLocal(schedules);
}

// ============ 今日意图相关 ============

function getIntentsLocal(): DailyIntent[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(INTENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveIntentsLocal(intents: DailyIntent[]): void {
  localStorage.setItem(INTENTS_KEY, JSON.stringify(intents));
}

// 获取今日意图
export async function getTodayIntent(): Promise<string> {
  const today = getTodayString();
  
  try {
    const res = await fetch('/api/intents');
    if (res.ok) {
      const data = await res.json();
      return data.intent || "";
    }
  } catch (err) {
    console.error('Failed to get intent:', err);
  }
  
  // Fallback to localStorage
  const intent = getIntentsLocal().find((i) => i.date === today);
  return intent?.content || "";
}

// 设置今日意图
export async function setTodayIntent(content: string): Promise<void> {
  try {
    const res = await fetch('/api/intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    
    if (res.ok) return;
  } catch (err) {
    console.error('Failed to set intent:', err);
  }
  
  // Fallback to localStorage
  const today = getTodayString();
  const intents = getIntentsLocal();
  const existingIndex = intents.findIndex((i) => i.date === today);
  
  if (existingIndex !== -1) {
    intents[existingIndex].content = content;
  } else {
    intents.push({ date: today, content });
  }
  
  saveIntentsLocal(intents);
}