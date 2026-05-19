import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
  noShadow?: boolean;
}

export const Card = ({ children, title, className = '', noPadding = false, noShadow = false }: CardProps) => {
  const shadowClass = noShadow ? '' : 'shadow-soft';

  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 rounded-3xl backdrop-blur-xl ${shadowClass} ${noPadding ? '' : 'p-6'} ${className}`}>
      {title && (
        <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold font-display text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};