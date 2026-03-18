"use client";

import { useState } from "react";

interface ScheduleFormProps {
  onAdd: (schedule: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    category: "work" | "life" | "study" | "other";
  }) => void;
  onCancel: () => void;
}

export default function ScheduleForm({ onAdd, onCancel }: ScheduleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<"work" | "life" | "study" | "other">("other");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    
    onAdd({
      title,
      description,
      startTime,
      endTime,
      category,
    });
    
    // 重置表单
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setCategory("other");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
      <h3 className="font-semibold">添加日程</h3>
      
      <div>
        <label className="block text-sm text-gray-600 mb-1">标题 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例如：团队会议"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">开始时间 *</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">结束时间 *</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">分类</label>
        <div className="flex gap-2">
          {[
            { value: "work", label: "工作" },
            { value: "life", label: "生活" },
            { value: "study", label: "学习" },
            { value: "other", label: "其他" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value as "work" | "life" | "study" | "other")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                category === opt.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">备注</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="补充说明（可选）"
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}