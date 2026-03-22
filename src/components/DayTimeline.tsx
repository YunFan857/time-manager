"use client";

import { Schedule, categoryConfig, Category } from "@/types";

interface DayTimelineProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

// 生成时间轴的小时刻度
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 6; h <= 23; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// 将时间字符串转换为分钟数
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 检查日程是否在某个时间槽内
function isScheduleInSlot(schedule: Schedule, slotHour: number): boolean {
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);
  const slotStart = slotHour * 60;
  const slotEnd = (slotHour + 1) * 60;
  
  return startMinutes < slotEnd && endMinutes > slotStart;
}

// 计算日程在时间轴上的位置和高度
function getScheduleStyle(schedule: Schedule, slotHour: number): React.CSSProperties {
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);
  const slotStart = slotHour * 60;
  const slotEnd = (slotHour + 1) * 60;
  
  const visibleStart = Math.max(startMinutes, slotStart);
  const visibleEnd = Math.min(endMinutes, slotEnd);
  
  const top = ((visibleStart - slotStart) / 60) * 60; // 每小时 60px 高
  const height = ((visibleEnd - visibleStart) / 60) * 60;
  
  return {
    top: `${top}px`,
    height: `${Math.max(height, 20)}px`,
  };
}

export default function DayTimeline({ schedules, onEdit, onDelete }: DayTimelineProps) {
  const timeSlots = generateTimeSlots();
  const sortedSchedules = [...schedules].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  if (schedules.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-lg">暂无日程安排</p>
        <p className="text-sm mt-2">点击上方按钮添加你的第一个日程</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📋</span>
        <span>今日安排</span>
        <span className="text-sm font-normal text-gray-400">
          ({schedules.length} 项)
        </span>
      </h2>
      
      {/* 时间轴视图 */}
      <div className="relative border rounded-lg overflow-hidden bg-white">
        {timeSlots.map((slot, index) => {
          const hour = parseInt(slot.split(":")[0]);
          const schedulesInSlot = sortedSchedules.filter((s) =>
            isScheduleInSlot(s, hour)
          );
          
          return (
            <div
              key={slot}
              className={`flex border-b last:border-b-0 ${
                index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
              }`}
              style={{ height: "60px" }}
            >
              {/* 时间标签 */}
              <div className="w-16 flex-shrink-0 text-xs text-gray-400 p-2 border-r bg-gray-50/80">
                {slot}
              </div>
              
              {/* 日程区域 */}
              <div className="flex-1 relative">
                {schedulesInSlot.map((schedule) => {
                  // 只在每个日程开始的时间槽渲染
                  const scheduleStartHour = parseInt(schedule.startTime.split(":")[0]);
                  if (hour !== scheduleStartHour) return null;
                  
                  const config = categoryConfig[schedule.category as Category];
                  
                  return (
                    <div
                      key={schedule.id}
                      className={`absolute left-2 right-2 ${config.bgColor} border rounded px-2 py-1 cursor-pointer hover:shadow-md transition-shadow group`}
                      style={getScheduleStyle(schedule, hour)}
                      onClick={() => onEdit(schedule)}
                    >
                      <div className="flex justify-between items-start h-full">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {schedule.title}
                          </div>
                          <div className={`text-xs ${config.color} opacity-70`}>
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(schedule.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs ml-2 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 空闲时段提示 */}
      <div className="text-center text-xs text-gray-400 mt-4">
        💡 点击日程可编辑，悬停可删除
      </div>
    </div>
  );
}