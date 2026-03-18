"use client";

import { Schedule } from "@/app/page";

interface DayTimelineProps {
  schedules: Schedule[];
  onDelete: (id: string) => void;
}

const categoryColors = {
  work: "bg-blue-100 text-blue-800 border-blue-300",
  life: "bg-green-100 text-green-800 border-green-300",
  study: "bg-purple-100 text-purple-800 border-purple-300",
  other: "bg-gray-100 text-gray-800 border-gray-300",
};

const categoryLabels = {
  work: "工作",
  life: "生活",
  study: "学习",
  other: "其他",
};

export default function DayTimeline({ schedules, onDelete }: DayTimelineProps) {
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>暂无日程安排</p>
        <p className="text-sm mt-2">点击上方按钮添加你的第一个日程</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">📋 今日安排</h2>
      {sortedSchedules.map((schedule) => (
        <div
          key={schedule.id}
          className={`p-4 rounded-lg border ${categoryColors[schedule.category]} relative group`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium">{schedule.title}</div>
              <div className="text-sm opacity-70 mt-1">
                {schedule.startTime} - {schedule.endTime}
              </div>
              {schedule.description && (
                <div className="text-sm mt-2 opacity-80">{schedule.description}</div>
              )}
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-white/50">
              {categoryLabels[schedule.category]}
            </span>
          </div>
          <button
            onClick={() => onDelete(schedule.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}