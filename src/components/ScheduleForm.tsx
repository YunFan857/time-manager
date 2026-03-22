"use client";

import { useState, useEffect } from "react";
import { Schedule, Category, categoryConfig } from "@/types";

interface ScheduleFormProps {
  schedule?: Schedule | null; // 传入则为编辑模式
  onSave: (schedule: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: Category;
  }) => void;
  onCancel: () => void;
}

const categories: Category[] = ["work", "life", "study", "other"];

export default function ScheduleForm({ schedule, onSave, onCancel }: ScheduleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [error, setError] = useState("");

  // 编辑模式时填充数据
  useEffect(() => {
    if (schedule) {
      setTitle(schedule.title);
      setDescription(schedule.description || "");
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      setCategory(schedule.category);
    } else {
      // 新建模式，设置默认时间为当前时间的整点
      const now = new Date();
      const currentHour = now.getHours();
      setStartTime(`${currentHour.toString().padStart(2, "0")}:00`);
      setEndTime(`${(currentHour + 1).toString().padStart(2, "0")}:00`);
    }
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("请输入标题");
      return;
    }
    
    if (!startTime || !endTime) {
      setError("请选择开始和结束时间");
      return;
    }
    
    if (startTime >= endTime) {
      setError("结束时间必须晚于开始时间");
      return;
    }
    
    setError("");
    onSave({
      title: title.trim(),
      description: description.trim(),
      startTime,
      endTime,
      category,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {schedule ? "✏️ 编辑日程" : "➕ 添加日程"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例如：团队会议"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">开始时间 *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">结束时间 *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                    category === cat
                      ? "ring-2 ring-offset-1 ring-blue-500 shadow-sm"
                      : "hover:shadow-sm"
                  } ${config.bgColor} ${config.color}`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">备注</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="补充说明（可选）"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {schedule ? "保存修改" : "添加日程"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}