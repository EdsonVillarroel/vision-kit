import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
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
  const baseStyles = "w-full py-3 px-6 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 relative overflow-hidden";

  const variants = {
    primary: "bg-theme-primary hover:bg-theme-dark-primary text-theme-text-icons shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
    secondary: "bg-theme-light-primary text-theme-primary border-2 border-theme-primary/20 hover:bg-theme-primary hover:text-theme-text-icons shadow-sm hover:shadow-lg hover:border-theme-primary active:scale-[0.98]",
    ghost: "bg-transparent text-theme-primary hover:bg-theme-light-primary active:scale-[0.98]",
    outline: "bg-transparent border-2 border-theme-primary/30 text-theme-primary hover:bg-theme-light-primary hover:border-theme-primary active:scale-[0.98]"
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
