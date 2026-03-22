"use client";

import { useState, useEffect, useCallback } from "react";
import DayTimeline from "@/components/DayTimeline";
import ScheduleForm from "@/components/ScheduleForm";
import IntentCard from "@/components/IntentCard";
import Toast from "@/components/Toast";
import { Schedule, Category } from "@/types";
import {
  getTodaySchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule as deleteScheduleFromStorage,
  getTodayIntent,
  setTodayIntent,
} from "@/lib/storage";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [intent, setIntent] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载数据
  useEffect(() => {
    setSchedules(getTodaySchedules());
    setIntent(getTodayIntent());
    setIsLoading(false);
  }, []);

  // 显示 toast
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  }, []);

  // 添加日程
  const handleAddSchedule = (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: Category;
  }) => {
    addSchedule(data);
    setSchedules(getTodaySchedules());
    setShowForm(false);
    showToast("日程已添加");
  };

  // 更新日程
  const handleUpdateSchedule = (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: Category;
  }) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, data);
      setSchedules(getTodaySchedules());
      setEditingSchedule(null);
      showToast("日程已更新");
    }
  };

  // 删除日程
  const handleDeleteSchedule = (id: string) => {
    if (confirm("确定要删除这个日程吗？")) {
      deleteScheduleFromStorage(id);
      setSchedules(getTodaySchedules());
      showToast("日程已删除", "info");
    }
  };

  // 设置今日意图
  const handleSetIntent = (content: string) => {
    setTodayIntent(content);
    setIntent(content);
    if (content) {
      showToast("今日意图已设置");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      {/* 页头 */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">📅 时间管理</h1>
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
      <IntentCard intent={intent} onSetIntent={handleSetIntent} />

      {/* 添加日程按钮 */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 mb-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        <span>添加日程</span>
      </button>

      {/* 今日安排 */}
      <DayTimeline
        schedules={schedules}
        onEdit={(schedule) => setEditingSchedule(schedule)}
        onDelete={handleDeleteSchedule}
      />

      {/* 添加日程表单 */}
      {showForm && (
        <ScheduleForm
          onSave={handleAddSchedule}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 编辑日程表单 */}
      {editingSchedule && (
        <ScheduleForm
          schedule={editingSchedule}
          onSave={handleUpdateSchedule}
          onCancel={() => setEditingSchedule(null)}
        />
      )}

      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}