import clsx from 'clsx';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
    error: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
    info: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
    primary: 'bg-gradient-to-r from-theme-light-primary to-theme-light-primary/60 text-theme-dark-primary border-theme-primary/30'
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full border transition-all duration-300 hover:scale-105',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};
