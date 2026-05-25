'use client';

import { VideoCard } from './VideoCard';
import { formatWeight } from '@/lib/calculations';

interface WeeklyCardProps {
  records: any[];  // Supabase 返回的 daily_records 数据
  goals?: { start_weight: number; target_weight: number } | null;
  weightUnit?: 'kg' | 'jin';
}

export const WeeklyCard = ({ records, goals, weightUnit = 'kg' }: WeeklyCardProps) => {
  // 获取本周数据（周一到周日）
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const thisWeekRecords = records.filter(r => {
    const date = new Date(r.record_date);
    return date >= weekStart && date <= weekEnd;
  });

  // 计算本周统计（使用有效体重）
  const getEffectiveWeight = (record: any): number => {
    return record.morning_weight || record.evening_weight || record.weight || 0;
  };

  const weekStartWeight = thisWeekRecords.length > 0 ? getEffectiveWeight(thisWeekRecords[0]) : 0;
  const weekEndWeight = thisWeekRecords.length > 0 ? getEffectiveWeight(thisWeekRecords[thisWeekRecords.length - 1]) : weekStartWeight;
  const weeklyLost = weekStartWeight > 0 ? Number((weekStartWeight - weekEndWeight).toFixed(1)) : 0;

  const avgSleep = thisWeekRecords.length > 0
    ? Number((thisWeekRecords.reduce((sum, r) => sum + r.sleep_hours, 0) / thisWeekRecords.length).toFixed(1))
    : 0;

  const avgExecution = thisWeekRecords.length > 0
    ? Number((thisWeekRecords.reduce((sum, r) => sum + r.diet_execution, 0) / thisWeekRecords.length).toFixed(0))
    : 0;

  const recordDays = thisWeekRecords.length;

  // 获取最新一条记录的总结
  const latestNote = records[records.length - 1]?.note || '继续加油！';

  const period = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;

  return (
    <VideoCard
      title="减脂周报"
      subtitle="本周减脂进度"
      period={period}
      stats={[
        { label: '本周减重', value: weeklyLost > 0 ? formatWeight(weeklyLost, weightUnit) : 0, unit: weightUnit === 'kg' ? 'kg' : '斤' },
        { label: '记录天数', value: recordDays, unit: '天' },
        { label: '平均睡眠', value: avgSleep, unit: '小时' },
        { label: '执行率', value: avgExecution, unit: '%' },
      ]}
      note={latestNote}
    />
  );
};