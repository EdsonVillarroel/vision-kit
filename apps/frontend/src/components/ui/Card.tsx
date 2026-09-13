import clsx from 'clsx';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  elevation = 'medium',
  interactive = false
}) => {
  const elevations = {
    low: 'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
    medium: 'shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]',
    high: 'shadow-[0_4px_12px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.04)]'
  };

  return (
    <div className={clsx(
      "bg-white ring-1 ring-black/[0.06] rounded-2xl p-8 transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
      elevations[elevation],
      interactive && "hover:shadow-[0_8px_24px_rgba(16,24,40,0.10),0_2px_6px_rgba(16,24,40,0.05)] hover:-translate-y-0.5 cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
};
