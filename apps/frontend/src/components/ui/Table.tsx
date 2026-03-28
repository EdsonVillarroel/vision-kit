import clsx from 'clsx';
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  interactive?: boolean;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      "bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-xl overflow-hidden border border-theme-divider/20 backdrop-blur-sm",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={clsx(
      "bg-gradient-to-r from-theme-dark-primary to-theme-primary text-theme-text-icons border-b-2 border-theme-accent/30",
      className
    )}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={clsx(
      "divide-y divide-theme-divider/30",
      className
    )}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  variant = 'default',
  interactive = true
}) => {
  const variants = {
    default: 'hover:bg-theme-light-primary/20',
    success: 'bg-green-50/50 hover:bg-green-50 border-l-4 border-green-500',
    warning: 'bg-yellow-50/50 hover:bg-yellow-50 border-l-4 border-yellow-500',
    error: 'bg-red-50/50 hover:bg-red-50 border-l-4 border-red-500'
  };

  return (
    <tr className={clsx(
      "transition-all duration-300",
      interactive && "hover:shadow-md hover:scale-[1.01] cursor-pointer",
      variants[variant],
      className
    )}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
  align = 'left'
}) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <th className={clsx(
      "px-6 py-4 text-xs font-bold uppercase tracking-wider",
      alignments[align],
      className
    )}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left'
}) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td className={clsx(
      "px-6 py-4 text-sm text-theme-primary-text",
      alignments[align],
      className
    )}>
      {children}
    </td>
  );
};

export const TableEmpty: React.FC<{ colSpan: number; message?: string }> = ({
  colSpan,
  message = "No hay datos disponibles"
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg className="w-16 h-16 text-theme-secondary-text opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-theme-secondary-text font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
};
