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
      className="bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      style={{ width: '400px', minHeight: '320px' }}
    >
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* 标题区域 */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1 font-display">{title}</h1>
          <p className="text-white/80 text-sm">{subtitle}</p>
          {period && (
            <p className="text-white/70 text-xs mt-2 font-medium">{period}</p>
          )}
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 transition-transform hover:scale-105">
              <p className="text-white/80 text-xs mb-1">{stat.label}</p>
              <p className="text-xl font-bold">
                {stat.value}
                {stat.unit && <span className="text-sm ml-1 font-normal">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* 一句话总结 */}
        {note && (
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm text-white/90">"{note}"</p>
          </div>
        )}

        {/* 底部水印 */}
        <div className="mt-5 pt-3 border-t border-white/20">
          <p className="text-xs text-white/60 text-center font-medium">LeanSleep Tracker</p>
        </div>
      </div>
    </div>
  );
};