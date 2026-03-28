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
    low: 'shadow-md',
    medium: 'shadow-xl',
    high: 'shadow-2xl'
  };

  return (
    <div className={clsx(
      "bg-gradient-to-br from-white to-theme-light-primary/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 transition-all duration-300",
      elevations[elevation],
      interactive && "hover:shadow-2xl hover:scale-[1.01] cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
};
