"use client";

import { useState } from "react";

interface IntentCardProps {
  intent: string;
  setIntent: (intent: string) => void;
}

export default function IntentCard({ intent, setIntent }: IntentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempIntent, setTempIntent] = useState(intent);

  const handleSave = () => {
    setIntent(tempIntent);
    setIsEditing(false);
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🎯</span>
        <span className="font-semibold text-orange-800">今日意图</span>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={tempIntent}
            onChange={(e) => setTempIntent(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="今天最重要的事是什么？"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => {
                setTempIntent(intent);
                setIsEditing(false);
              }}
              className="px-4 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setTempIntent(intent);
            setIsEditing(true);
          }}
          className="cursor-pointer group"
        >
          {intent ? (
            <p className="text-orange-900 group-hover:opacity-70 transition-opacity">
              {intent}
            </p>
          ) : (
            <p className="text-orange-400 group-hover:text-orange-600 transition-colors">
              点击设置今日意图...
            </p>
          )}
        </div>
      )}
    </div>
  );
}