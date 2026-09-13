import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'warning';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyles = "w-full py-3 px-6 rounded-full font-semibold text-sm tracking-wide transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 select-none active:scale-[0.97]";

  const variants = {
    primary: "bg-theme-primary hover:bg-theme-dark-primary text-theme-text-icons shadow-sm hover:shadow-md",
    secondary: "bg-theme-light-primary text-theme-primary border border-theme-primary/20 hover:bg-theme-primary hover:text-theme-text-icons hover:border-theme-primary",
    ghost: "bg-transparent text-theme-primary hover:bg-theme-light-primary",
    outline: "bg-transparent border border-theme-primary/30 text-theme-primary hover:bg-theme-light-primary hover:border-theme-primary",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus-visible:ring-red-500/40",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md focus-visible:ring-amber-500/40",
  };

  return (
    <button 
      className={clsx(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
