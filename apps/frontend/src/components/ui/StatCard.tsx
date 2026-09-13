import clsx from 'clsx';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  trend,
  className
}) => {
  const variants = {
    default: { iconBg: 'bg-theme-light-primary/50', iconColor: 'text-theme-primary', textColor: 'text-theme-primary-text' },
    primary: { iconBg: 'bg-theme-light-primary/60', iconColor: 'text-theme-dark-primary', textColor: 'text-theme-primary-text' },
    success: { iconBg: 'bg-green-50', iconColor: 'text-green-600', textColor: 'text-theme-primary-text' },
    warning: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600', textColor: 'text-theme-primary-text' },
    info: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', textColor: 'text-theme-primary-text' }
  };

  const config = variants[variant];

  return (
    <div className={clsx(
      "bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">{title}</p>
          <p className={clsx(
            "text-3xl font-bold tnum tracking-tight",
            config.textColor
          )}>
            {value}
          </p>
          {trend && (
            <div className={clsx(
              "mt-2 flex items-center gap-1 text-sm font-semibold",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {trend.isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx(
            config.iconBg,
            config.iconColor,
            "p-2.5 rounded-xl shrink-0"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
