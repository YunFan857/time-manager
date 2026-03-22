"use client";

import { useState, useEffect } from "react";

interface IntentCardProps {
  intent: string;
  onSetIntent: (intent: string) => void;
}

export default function IntentCard({ intent, onSetIntent }: IntentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempIntent, setTempIntent] = useState(intent);

  useEffect(() => {
    setTempIntent(intent);
  }, [intent]);

  const handleSave = () => {
    onSetIntent(tempIntent.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempIntent(intent);
    setIsEditing(false);
  };

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎯</span>
        <span className="font-semibold text-amber-800">今日意图</span>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          今天最重要的事
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={tempIntent}
            onChange={(e) => setTempIntent(e.target.value)}
            className="w-full px-4 py-2.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80"
            placeholder="今天最重要的事是什么？"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors shadow-sm"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-1.5 bg-white text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors border"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer group min-h-[40px] flex items-center"
        >
          {intent ? (
            <p className="text-amber-900 text-lg font-medium group-hover:opacity-70 transition-opacity">
              「{intent}」
            </p>
          ) : (
            <p className="text-amber-400 group-hover:text-amber-600 transition-colors flex items-center gap-2">
              <span className="text-lg">✏️</span>
              <span>点击设置今日意图...</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}