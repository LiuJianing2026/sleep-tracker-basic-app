'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SleepChartProps {
  data: { date: string; sleepHours: number }[];
}

export const SleepChart = ({ data }: SleepChartProps) => {
  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-medium text-gray-500 mb-4">睡眠时长</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 12]}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value} 小时`, '睡眠时长']}
          />
          <Bar dataKey="sleepHours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};