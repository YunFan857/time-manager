"use client";

import { useState } from "react";
import DayTimeline from "@/components/DayTimeline";
import ScheduleForm from "@/components/ScheduleForm";
import IntentCard from "@/components/IntentCard";

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: "work" | "life" | "study" | "other";
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [intent, setIntent] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const addSchedule = (schedule: Omit<Schedule, "id">) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
    };
    setSchedules([...schedules, newSchedule]);
    setShowForm(false);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">📅 时间管理</h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </header>

      {/* 今日意图 */}
      <IntentCard intent={intent} setIntent={setIntent} />

      {/* 添加日程按钮 */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 mb-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        + 添加日程
      </button>

      {/* 添加日程表单 */}
      {showForm && (
        <ScheduleForm
          onAdd={addSchedule}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 今日安排 */}
      <DayTimeline schedules={schedules} onDelete={deleteSchedule} />
    </main>
  );
}