'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area } from 'recharts';

interface WeightChartProps {
  data: { date: string; weight: number }[];
  weightUnit?: 'kg' | 'jin';
}

export const WeightChart = ({ data, weightUnit = 'kg' }: WeightChartProps) => {
  const formatWeight = (weight: number) => {
    return weightUnit === 'jin' ? (weight * 2).toFixed(1) : weight.toFixed(1);
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{formatDate(label)}</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {formatWeight(payload[0].value)} {weightUnit === 'jin' ? '斤' : 'kg'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-soft p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
      <h3 className="text-base font-semibold font-display text-gray-900 dark:text-gray-100 mb-6">体重趋势</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#ff6b6b"
            strokeWidth={3}
            dot={{ fill: '#ff6b6b', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#ff6b6b' }}
            fillOpacity={1}
            fill="url(#weightGradient)"
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#ff6b6b"
            strokeWidth={3}
            dot={{ fill: '#ff6b6b', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#ff6b6b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};