'use client';

import { DailyRecord } from '@/types';
import { VideoCard } from './VideoCard';

interface WeeklyCardProps {
  records: DailyRecord[];
  goals?: { startWeight: number; targetWeight: number } | null;
}

export const WeeklyCard = ({ records, goals }: WeeklyCardProps) => {
  // 获取本周数据
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const thisWeekRecords = records.filter(r => {
    const date = new Date(r.date);
    return date >= weekStart && date <= weekEnd;
  });

  // 计算本周统计
  const weekStartWeight = thisWeekRecords[0]?.weight || 0;
  const weekEndWeight = thisWeekRecords[thisWeekRecords.length - 1]?.weight || weekStartWeight;
  const weeklyLost = weekStartWeight > 0 ? Number((weekStartWeight - weekEndWeight).toFixed(1)) : 0;

  const avgSleep = thisWeekRecords.length > 0
    ? Number((thisWeekRecords.reduce((sum, r) => sum + r.sleepHours, 0) / thisWeekRecords.length).toFixed(1))
    : 0;

  const avgExecution = thisWeekRecords.length > 0
    ? Number((thisWeekRecords.reduce((sum, r) => sum + r.dietExecution, 0) / thisWeekRecords.length).toFixed(0))
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
        { label: '本周减重', value: weeklyLost, unit: 'kg' },
        { label: '记录天数', value: recordDays, unit: '天' },
        { label: '平均睡眠', value: avgSleep, unit: '小时' },
        { label: '执行率', value: avgExecution, unit: '%' },
      ]}
      note={latestNote}
    />
  );
};