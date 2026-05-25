import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  gradient?: boolean;
}

export const StatCard = ({ title, value, unit, icon, trend, className = '', gradient = false }: StatCardProps) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') return val.toFixed(1);
    return val;
  };

  const bgGradient = gradient
    ? 'bg-gradient-to-br from-orange-400/10 to-red-400/10 dark:from-orange-400/5 dark:to-red-400/5'
    : 'bg-white/80 dark:bg-gray-800/80';

  return (
    <div className={`${bgGradient} rounded-3xl p-5 shadow-soft transition-all duration-300 card-hover ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-gray-100">
              {formatValue(value)}
            </span>
            {unit && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
            )}
          </div>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              trend.positive !== false ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              <span className="text-base">
                {trend.positive !== false ? '↓' : '↑'}
              </span>
              <span className="font-medium">{Math.abs(trend.value).toFixed(1)}</span>
              <span className="text-gray-500">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-2xl ml-3 opacity-60">{icon}</div>
        )}
      </div>
    </div>
  );
};