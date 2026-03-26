"use client";

import { useState, useEffect, useCallback } from "react";
import DayTimeline from "@/components/DayTimeline";
import ScheduleForm from "@/components/ScheduleForm";
import IntentCard from "@/components/IntentCard";
import Toast from "@/components/Toast";
import Auth from "@/components/Auth";
import { Schedule, Category } from "@/types";
import {
  getTodaySchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule as deleteScheduleFromStorage,
  getTodayIntent,
  setTodayIntent,
  checkAuth,
  logout,
} from "@/lib/storage";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [intent, setIntent] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 检查认证状态
  const checkAuthStatus = useCallback(async () => {
    const result = await checkAuth();
    setIsAuthenticated(result.authenticated);
    setUser(result.user || null);
  }, []);

  // 初始化加载数据
  useEffect(() => {
    async function init() {
      await checkAuthStatus();
      await loadData();
    }
    init();
  }, [checkAuthStatus]);

  // 加载数据
  const loadData = async () => {
    try {
      const [schedulesData, intentData] = await Promise.all([
        getTodaySchedules(),
        getTodayIntent(),
      ]);
      setSchedules(schedulesData);
      setIntent(intentData);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 显示 toast
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  }, []);

  // 刷新日程数据
  const refreshSchedules = useCallback(async () => {
    const data = await getTodaySchedules();
    setSchedules(data);
  }, []);

  // 添加日程
  const handleAddSchedule = async (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: Category;
  }) => {
    await addSchedule(data);
    await refreshSchedules();
    setShowForm(false);
    showToast("日程已添加");
  };

  // 更新日程
  const handleUpdateSchedule = async (data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: Category;
  }) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, data);
      await refreshSchedules();
      setEditingSchedule(null);
      showToast("日程已更新");
    }
  };

  // 删除日程
  const handleDeleteSchedule = async (id: string) => {
    if (confirm("确定要删除这个日程吗？")) {
      await deleteScheduleFromStorage(id);
      await refreshSchedules();
      showToast("日程已删除", "info");
    }
  };

  // 设置今日意图
  const handleSetIntent = async (content: string) => {
    await setTodayIntent(content);
    setIntent(content);
    if (content) {
      showToast("今日意图已设置");
    }
  };

  // 退出登录
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
    showToast("已退出登录", "info");
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
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">📅 时间管理</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        
        {/* 用户状态 */}
        <div className="text-right">
          {isAuthenticated && user ? (
            <div className="text-sm">
              <div className="flex items-center gap-2 justify-end">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt="avatar" 
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-gray-600">{user.name || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline text-xs mt-1"
              >
                退出登录
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              登录同步
            </button>
          )}
        </div>
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

      {/* 认证弹窗 */}
      {showAuth && (
        <Auth onAuthChange={() => {
          setShowAuth(false);
          checkAuthStatus();
          loadData();
        }} />
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