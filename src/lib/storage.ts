import { Schedule, DailyIntent } from "@/types";

const SCHEDULES_KEY = "time-manager-schedules";
const INTENTS_KEY = "time-manager-intents";

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// 日程相关
export function getSchedules(): Schedule[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SCHEDULES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSchedules(schedules: Schedule[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export function getTodaySchedules(): Schedule[] {
  const today = getTodayString();
  return getSchedules().filter((s) => s.date === today);
}

export function addSchedule(schedule: Omit<Schedule, "id" | "date">): Schedule {
  const schedules = getSchedules();
  const newSchedule: Schedule = {
    ...schedule,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: getTodayString(),
  };
  schedules.push(newSchedule);
  saveSchedules(schedules);
  return newSchedule;
}

export function updateSchedule(id: string, updates: Partial<Schedule>): void {
  const schedules = getSchedules();
  const index = schedules.findIndex((s) => s.id === id);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    saveSchedules(schedules);
  }
}

export function deleteSchedule(id: string): void {
  const schedules = getSchedules().filter((s) => s.id !== id);
  saveSchedules(schedules);
}

// 今日意图相关
export function getIntents(): DailyIntent[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(INTENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveIntents(intents: DailyIntent[]): void {
  localStorage.setItem(INTENTS_KEY, JSON.stringify(intents));
}

export function getTodayIntent(): string {
  const today = getTodayString();
  const intents = getIntents();
  const intent = intents.find((i) => i.date === today);
  return intent?.content || "";
}

export function setTodayIntent(content: string): void {
  const today = getTodayString();
  const intents = getIntents();
  const existingIndex = intents.findIndex((i) => i.date === today);
  
  if (existingIndex !== -1) {
    intents[existingIndex].content = content;
  } else {
    intents.push({ date: today, content });
  }
  
  saveIntents(intents);
}