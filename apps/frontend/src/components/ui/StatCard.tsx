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
    default: {
      bg: 'bg-gradient-to-br from-white to-theme-light-primary/20',
      border: 'border-theme-divider/30',
      iconBg: 'bg-theme-primary',
      textColor: 'text-theme-primary',
      accentBorder: ''
    },
    primary: {
      bg: 'bg-gradient-to-br from-theme-light-primary/40 to-theme-light-primary/20',
      border: 'border-theme-primary/30',
      iconBg: 'bg-gradient-to-br from-theme-primary to-theme-dark-primary',
      textColor: 'text-theme-dark-primary',
      accentBorder: 'border-l-4 border-theme-primary'
    },
    success: {
      bg: 'bg-gradient-to-br from-green-50 to-white',
      border: 'border-green-200',
      iconBg: 'bg-gradient-to-br from-green-600 to-green-700',
      textColor: 'text-green-700',
      accentBorder: 'border-l-4 border-green-500'
    },
    warning: {
      bg: 'bg-gradient-to-br from-yellow-50 to-white',
      border: 'border-yellow-200',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-700',
      accentBorder: 'border-l-4 border-yellow-500'
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-50 to-white',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-600 to-blue-700',
      textColor: 'text-blue-700',
      accentBorder: 'border-l-4 border-blue-500'
    }
  };

  const config = variants[variant];

  return (
    <div className={clsx(
      config.bg,
      config.border,
      config.accentBorder,
      "border rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">{title}</p>
          <p className={clsx(
            "text-3xl font-bold",
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
            "p-3 rounded-xl shadow-lg text-white"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
