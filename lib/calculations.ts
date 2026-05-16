import { DailyRecord, UserGoals, Stats } from '@/types';

/**
 * 计算当前体重（最新记录的体重）
 */
export const getCurrentWeight = (records: DailyRecord[]): number => {
  if (records.length === 0) return 0;
  return records[records.length - 1].weight;
};

/**
 * 计算累计减重（起始体重 - 当前体重）
 */
export const getTotalLost = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || records.length === 0) return 0;
  return goals.startWeight - getCurrentWeight(records);
};

/**
 * 计算距离目标（当前体重 - 目标体重）
 */
export const getRemaining = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || records.length === 0) return 0;
  return getCurrentWeight(records) - goals.targetWeight;
};

/**
 * 计算近7日平均体重
 */
export const getWeeklyAvgWeight = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.weight, 0);
  return Number((sum / recent7.length).toFixed(1));
};

/**
 * 计算本周减重（本周第一天 - 本周最后一天）
 */
export const getWeeklyLost = (records: DailyRecord[]): number => {
  if (records.length < 2) return 0;

  // 获取本周数据
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // 周日为一周开始
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekRecords = records.filter(r => new Date(r.date) >= weekStart);

  if (thisWeekRecords.length < 2) return 0;
  return Number((thisWeekRecords[0].weight - thisWeekRecords[thisWeekRecords.length - 1].weight).toFixed(1));
};

/**
 * 计算平均睡眠时长（近7天）
 */
export const getAvgSleep = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.sleepHours, 0);
  return Number((sum / recent7.length).toFixed(1));
};

/**
 * 计算平均饮食执行率（近7天）
 */
export const getAvgDietExecution = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.dietExecution, 0);
  return Number((sum / recent7.length).toFixed(1));
};

/**
 * 计算连续记录天数
 */
export const getStreakDays = (records: DailyRecord[]): number => {
  if (records.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = recordDate;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * 计算预计达标日期
 * 根据平均每周减重速度推算
 */
export const getEstimatedReachDate = (records: DailyRecord[], goals: UserGoals | null): string => {
  if (!goals || records.length < 7) return '数据不足';

  const currentWeight = getCurrentWeight(records);
  const remaining = currentWeight - goals.targetWeight;

  if (remaining <= 0) return '已达标！';

  // 计算过去4周的平均减重速度
  const recentRecords = records.slice(-28);
  if (recentRecords.length < 2) return '数据不足';

  const weeklyLoss = (recentRecords[0].weight - recentRecords[recentRecords.length - 1].weight) / 4;

  if (weeklyLoss <= 0) return '无法预测';

  const weeksNeeded = Math.ceil(remaining / weeklyLoss);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);

  return targetDate.toLocaleDateString('zh-CN');
};

/**
 * 计算所有统计数据
 */
export const calculateStats = (records: DailyRecord[], goals: UserGoals | null): Stats => {
  return {
    currentWeight: getCurrentWeight(records),
    totalLost: getTotalLost(records, goals),
    remaining: getRemaining(records, goals),
    weeklyAvgWeight: getWeeklyAvgWeight(records),
    weeklyLost: getWeeklyLost(records),
    avgSleep: getAvgSleep(records),
    avgDietExecution: getAvgDietExecution(records),
    streakDays: getStreakDays(records),
    estimatedReachDate: getEstimatedReachDate(records, goals),
  };
};

/**
 * 计算减重进度百分比
 */
export const getProgressPercent = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || goals.startWeight === goals.targetWeight) return 0;

  const totalToLose = goals.startWeight - goals.targetWeight;
  const lost = getTotalLost(records, goals);

  const percent = (lost / totalToLose) * 100;
  return Math.max(0, Math.min(100, percent));
};