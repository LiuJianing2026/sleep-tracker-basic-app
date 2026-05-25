import { DailyRecord, UserGoals, Stats } from '@/types';

export const formatWeight = (weight: number, unit: 'kg' | 'jin'): string => {
  if (unit === 'jin') {
    return (weight * 2).toFixed(1);
  }
  return weight.toFixed(1);
};

export const parseWeightInput = (input: string, unit: 'kg' | 'jin'): number => {
  const value = parseFloat(input);
  if (unit === 'jin') {
    return value * 0.5;
  }
  return value;
};

const getEffectiveWeight = (record: DailyRecord): number | null => {
  if (record.morning_weight !== undefined && record.morning_weight !== null && record.morning_weight > 0) {
    return record.morning_weight;
  }
  if (record.evening_weight !== undefined && record.evening_weight !== null && record.evening_weight > 0) {
    return record.evening_weight;
  }
  return null;
};

export const getCurrentWeight = (records: DailyRecord[]): number => {
  if (records.length === 0) return 0;
  const reversed = [...records].reverse();
  for (const r of reversed) {
    const weight = getEffectiveWeight(r);
    if (weight !== null) return weight;
  }
  return 0;
};

export const getTotalLost = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || records.length === 0) return 0;
  const value = goals.startWeight - getCurrentWeight(records);
  return Number(value.toFixed(1));
};

export const getRemaining = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || records.length === 0) return 0;
  const value = getCurrentWeight(records) - goals.targetWeight;
  return Number(value.toFixed(1));
};

export const getWeeklyAvgWeight = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  const validRecords = recent7.filter(r => getEffectiveWeight(r) !== null);
  if (validRecords.length === 0) return 0;
  const sum = validRecords.reduce((acc, r) => acc + (getEffectiveWeight(r) || 0), 0);
  return Number((sum / validRecords.length).toFixed(1));
};

export const getWeeklyLost = (records: DailyRecord[]): number => {
  if (records.length < 2) return 0;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartKey = weekStart.toISOString().split('T')[0];
  const weekEndKey = weekEnd.toISOString().split('T')[0];

  const thisWeekRecords = records
    .filter(r => {
      const recordDate = r.date;
      return recordDate >= weekStartKey && recordDate <= weekEndKey;
    })
    .filter(r => getEffectiveWeight(r) !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (thisWeekRecords.length < 2) return 0;

  const firstWeight = getEffectiveWeight(thisWeekRecords[0]) || 0;
  const lastWeight = getEffectiveWeight(thisWeekRecords[thisWeekRecords.length - 1]) || 0;
  return Number((firstWeight - lastWeight).toFixed(1));
};

export const getAvgSleep = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.sleepHours, 0);
  return Number((sum / recent7.length).toFixed(1));
};

export const getAvgDietExecution = (records: DailyRecord[]): number => {
  const recent7 = records.slice(-7);
  if (recent7.length === 0) return 0;
  const sum = recent7.reduce((acc, r) => acc + r.dietExecution, 0);
  return Number((sum / recent7.length).toFixed(1));
};

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

export const getEstimatedReachDate = (records: DailyRecord[], goals: UserGoals | null): string => {
  if (!goals || records.length < 7) return '数据不足';

  const currentWeight = getCurrentWeight(records);
  const remaining = currentWeight - goals.targetWeight;

  if (remaining <= 0) return '已达标！';

  const recentRecords = records.slice(-28);
  const validRecords = recentRecords.filter(r => getEffectiveWeight(r) !== null);
  if (validRecords.length < 2) return '数据不足';

  const firstWeight = getEffectiveWeight(validRecords[0]) || 0;
  const lastWeight = getEffectiveWeight(validRecords[validRecords.length - 1]) || 0;
  const weeklyLoss = (firstWeight - lastWeight) / 4;

  if (weeklyLoss <= 0) return '无法预测';

  const weeksNeeded = Math.ceil(remaining / weeklyLoss);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksNeeded * 7);

  return targetDate.toLocaleDateString('zh-CN');
};

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

export const getProgressPercent = (records: DailyRecord[], goals: UserGoals | null): number => {
  if (!goals || goals.startWeight === goals.targetWeight) return 0;

  const totalToLose = goals.startWeight - goals.targetWeight;
  const lost = getTotalLost(records, goals);

  const percent = (lost / totalToLose) * 100;
  return Math.max(0, Math.min(100, percent));
};