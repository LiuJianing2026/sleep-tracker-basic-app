'use client';

import { VideoCard } from './VideoCard';

interface MonthlyCardProps {
  records: any[];  // Supabase 返回的 daily_records 数据
  goals?: { start_weight: number; target_weight: number } | null;
}

export const MonthlyCard = ({ records, goals }: MonthlyCardProps) => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const thisMonthRecords = records.filter(r => {
    const date = new Date(r.record_date);
    return date >= monthStart && date <= monthEnd;
  });

  // 计算月度统计
  const monthStartWeight = thisMonthRecords[0]?.weight || 0;
  const monthEndWeight = thisMonthRecords[thisMonthRecords.length - 1]?.weight || monthStartWeight;
  const monthlyLost = monthStartWeight > 0 ? Number((monthStartWeight - monthEndWeight).toFixed(1)) : 0;

  const avgSleep = thisMonthRecords.length > 0
    ? Number((thisMonthRecords.reduce((sum, r) => sum + r.sleep_hours, 0) / thisMonthRecords.length).toFixed(1))
    : 0;

  const avgExecution = thisMonthRecords.length > 0
    ? Number((thisMonthRecords.reduce((sum, r) => sum + r.diet_execution, 0) / thisMonthRecords.length).toFixed(0))
    : 0;

  const recordDays = thisMonthRecords.length;

  const latestNote = records[records.length - 1]?.note || '继续加油！';

  const period = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  return (
    <VideoCard
      title="减脂月报"
      subtitle="本月减脂进度"
      period={period}
      stats={[
        { label: '本月减重', value: monthlyLost, unit: 'kg' },
        { label: '记录天数', value: recordDays, unit: '天' },
        { label: '平均睡眠', value: avgSleep, unit: '小时' },
        { label: '执行率', value: avgExecution, unit: '%' },
      ]}
      note={latestNote}
    />
  );
};