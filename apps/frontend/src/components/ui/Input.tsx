import clsx from 'clsx';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'filled' | 'outlined';
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  variant = 'filled',
  helperText,
  ...props
}) => {
  const baseStyles = "w-full px-4 py-3 transition-[background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none text-theme-primary-text placeholder:text-theme-secondary-text";

  const filledStyles = "bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40";

  const outlinedStyles = "bg-transparent border border-theme-divider rounded-lg hover:border-theme-primary/50 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25";

  const errorStyles = variant === 'filled'
    ? "border-b-red-500 text-red-900 placeholder:text-red-300 focus:border-b-red-500"
    : "border-red-500 text-red-900 placeholder:text-red-300 focus:border-red-500";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-theme-primary-text mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          baseStyles,
          variant === 'filled' ? filledStyles : outlinedStyles,
          error && errorStyles,
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-theme-secondary-text">
          {helperText}
        </p>
      )}
    </div>
  );
};
