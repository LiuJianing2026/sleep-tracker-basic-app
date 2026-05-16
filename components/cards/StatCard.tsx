import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export const StatCard = ({ title, value, unit, icon, trend, className = '' }: StatCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <p className={`text-sm mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↓' : '↑'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400 ml-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};