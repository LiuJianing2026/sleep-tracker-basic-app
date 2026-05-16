'use client';

interface VideoCardProps {
  title: string;
  subtitle: string;
  stats: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  note?: string;
  period?: string;
}

export const VideoCard = ({ title, subtitle, stats, note, period }: VideoCardProps) => {
  return (
    <div
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
      style={{ width: '400px', minHeight: '300px' }}
    >
      {/* 标题区域 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-blue-100 text-sm">{subtitle}</p>
        {period && (
          <p className="text-blue-200 text-xs mt-1">{period}</p>
        )}
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/20 rounded-lg p-3">
            <p className="text-blue-100 text-xs mb-1">{stat.label}</p>
            <p className="text-xl font-bold">
              {stat.value}
              {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* 一句话总结 */}
      {note && (
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-sm text-blue-50">{note}</p>
        </div>
      )}

      {/* 底部水印 */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-blue-200 text-center">LeanSleep Tracker</p>
      </div>
    </div>
  );
};