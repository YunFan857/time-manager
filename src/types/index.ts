export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: "work" | "life" | "study" | "other";
  date: string; // YYYY-MM-DD 格式，用于按日期筛选
}

export interface DailyIntent {
  content: string;
  date: string; // YYYY-MM-DD 格式
}

export type Category = "work" | "life" | "study" | "other";

export const categoryConfig: Record<Category, { label: string; color: string; bgColor: string }> = {
  work: { label: "工作", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  life: { label: "生活", color: "text-green-700", bgColor: "bg-green-50 border-green-200" },
  study: { label: "学习", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  other: { label: "其他", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" },
};