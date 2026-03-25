import { Schedule, DailyIntent } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabase";

const SCHEDULES_KEY = "time-manager-schedules";
const INTENTS_KEY = "time-manager-intents";

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 获取当前用户 ID
async function getUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============ 日程相关 ============

// 获取所有日程（localStorage）
function getSchedulesLocal(): Schedule[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

// 保存日程（localStorage）
function saveSchedulesLocal(schedules: Schedule[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

// 获取今日日程
export async function getTodaySchedules(): Promise<Schedule[]> {
  const today = getTodayString();
  
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      const { data, error } = await supabase!
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .order("start_time");
      
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          startTime: item.start_time,
          endTime: item.end_time,
          category: item.category,
          date: item.date,
        }));
      }
    }
  }
  
  // Fallback to localStorage
  return getSchedulesLocal().filter((s) => s.date === today);
}

// 同步版本（用于兼容）
export function getTodaySchedulesSync(): Schedule[] {
  return getSchedulesLocal().filter((s) => s.date === getTodayString());
}

// 添加日程
export async function addSchedule(schedule: Omit<Schedule, "id" | "date">): Promise<Schedule> {
  const today = getTodayString();
  
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      const { data, error } = await supabase!
        .from("schedules")
        .insert({
          user_id: userId,
          title: schedule.title,
          description: schedule.description,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          category: schedule.category,
          date: today,
        })
        .select()
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          startTime: data.start_time,
          endTime: data.end_time,
          category: data.category,
          date: data.date,
        };
      }
    }
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
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.date !== undefined) updateData.date = updates.date;
      
      const { error } = await supabase!
        .from("schedules")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId);
      
      if (!error) return;
    }
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
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      const { error } = await supabase!
        .from("schedules")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      
      if (!error) return;
    }
  }
  
  // Fallback to localStorage
  const schedules = getSchedulesLocal().filter((s) => s.id !== id);
  saveSchedulesLocal(schedules);
}

// ============ 今日意图相关 ============

// 获取意图（localStorage）
function getIntentsLocal(): DailyIntent[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(INTENTS_KEY);
  return data ? JSON.parse(data) : [];
}

// 保存意图（localStorage）
function saveIntentsLocal(intents: DailyIntent[]): void {
  localStorage.setItem(INTENTS_KEY, JSON.stringify(intents));
}

// 获取今日意图
export async function getTodayIntent(): Promise<string> {
  const today = getTodayString();
  
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      const { data, error } = await supabase!
        .from("daily_intents")
        .select("content")
        .eq("user_id", userId)
        .eq("date", today)
        .single();
      
      if (!error && data) {
        return data.content;
      }
    }
  }
  
  // Fallback to localStorage
  const intent = getIntentsLocal().find((i) => i.date === today);
  return intent?.content || "";
}

// 同步版本（用于兼容）
export function getTodayIntentSync(): string {
  const today = getTodayString();
  const intent = getIntentsLocal().find((i) => i.date === today);
  return intent?.content || "";
}

// 设置今日意图
export async function setTodayIntent(content: string): Promise<void> {
  const today = getTodayString();
  
  if (isSupabaseConfigured()) {
    const userId = await getUserId();
    if (userId) {
      // 使用 upsert 插入或更新
      const { error } = await supabase!
        .from("daily_intents")
        .upsert(
          {
            user_id: userId,
            date: today,
            content,
          },
          {
            onConflict: "user_id,date",
          }
        );
      
      if (!error) return;
    }
  }
  
  // Fallback to localStorage
  const intents = getIntentsLocal();
  const existingIndex = intents.findIndex((i) => i.date === today);
  
  if (existingIndex !== -1) {
    intents[existingIndex].content = content;
  } else {
    intents.push({ date: today, content });
  }
  
  saveIntentsLocal(intents);
}