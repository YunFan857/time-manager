-- Supabase 数据库 Schema for Time Manager
-- 在 Supabase Dashboard -> SQL Editor 中运行此脚本

-- 日程表
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每日意图表
CREATE TABLE IF NOT EXISTS daily_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 启用 RLS (Row Level Security)
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_intents ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能访问自己的数据
CREATE POLICY "Users can view own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intents" ON daily_intents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intents" ON daily_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intents" ON daily_intents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own intents" ON daily_intents
  FOR DELETE USING (auth.uid() = user_id);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON schedules(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_intents_user_date ON daily_intents(user_id, date);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER daily_intents_updated_at
  BEFORE UPDATE ON daily_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();