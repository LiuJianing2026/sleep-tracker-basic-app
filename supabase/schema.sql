-- ============================================================
-- LeanSleep Tracker - Supabase 数据库表结构
-- 生成时间: 2026-05-17
-- ============================================================

-- ============================================================
-- 1. 用户目标设置表 (user_settings)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 目标设置字段
  start_weight DECIMAL(5,1) NOT NULL CHECK (start_weight > 0 AND start_weight <= 300),
  target_weight DECIMAL(5,1) NOT NULL CHECK (target_weight > 0 AND target_weight <= 300),
  start_date DATE NOT NULL,
  expected_weeks INTEGER NOT NULL CHECK (expected_weeks > 0),
  daily_calorie_target INTEGER NOT NULL CHECK (daily_calorie_target > 0),

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 约束：每个用户只能有一条目标设置
  CONSTRAINT user_settings_user_id_unique UNIQUE (user_id)
);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. 每日记录表 (daily_records)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 必填字段
  record_date DATE NOT NULL,
  weight DECIMAL(5,1) NOT NULL CHECK (weight > 0 AND weight <= 300),
  sleep_hours DECIMAL(4,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  diet_execution DECIMAL(5,1) NOT NULL CHECK (diet_execution >= 0 AND diet_execution <= 100),
  water INTEGER NOT NULL CHECK (water >= 0 AND water <= 10000),

  -- 可选字段
  exercise_type TEXT,
  exercise_duration INTEGER CHECK (exercise_duration > 0),
  note TEXT,
  photo_url TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 约束：每个用户每天只能有一条记录
  CONSTRAINT daily_records_user_date_unique UNIQUE (user_id, record_date)
);

-- 自动更新 updated_at
CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON daily_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. 索引优化
-- ============================================================

-- 加速按日期查询
CREATE INDEX IF NOT EXISTS idx_daily_records_record_date ON daily_records(record_date DESC);

-- 加速按用户查询
CREATE INDEX IF NOT EXISTS idx_daily_records_user_id ON daily_records(user_id);

-- 加速范围查询（用于图表）
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, record_date DESC);

-- ============================================================
-- 4. RLS 权限策略
-- ============================================================

-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- user_settings RLS 策略
-- ============================================================

-- 允许已认证用户读取自己的设置
CREATE POLICY "用户可以读取自己的目标设置"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许已认证用户插入自己的设置
CREATE POLICY "用户可以插入自己的目标设置"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户更新自己的设置
CREATE POLICY "用户可以更新自己的目标设置"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许已认证用户删除自己的设置
CREATE POLICY "用户可以删除自己的目标设置"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- daily_records RLS 策略
-- ============================================================

-- 允许已认证用户读取自己的记录
CREATE POLICY "用户可以读取自己的记录"
  ON daily_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许已认证用户插入自己的记录
CREATE POLICY "用户可以插入自己的记录"
  ON daily_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 允许已认证用户更新自己的记录
CREATE POLICY "用户可以更新自己的记录"
  ON daily_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许已认证用户删除自己的记录
CREATE POLICY "用户可以删除自己的记录"
  ON daily_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. 有用的视图（可选）
-- ============================================================

-- 体重记录简化视图
CREATE OR REPLACE VIEW weight_records AS
SELECT
  id,
  user_id,
  record_date AS date,
  weight,
  created_at
FROM daily_records
ORDER BY record_date DESC;

-- 睡眠记录简化视图
CREATE OR REPLACE VIEW sleep_records AS
SELECT
  id,
  user_id,
  record_date AS date,
  sleep_hours AS sleepHours,
  sleep_quality AS sleepQuality,
  created_at
FROM daily_records
ORDER BY record_date DESC;