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
      "bg-white ring-1 ring-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden",
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
      "bg-theme-light-primary/20 border-b border-black/[0.06]",
      className
    )}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={clsx(
      "divide-y divide-black/[0.05]",
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
  interactive = false
}) => {
  const variants = {
    default: 'hover:bg-theme-light-primary/20',
    success: 'bg-green-50/40 hover:bg-green-50 border-l-2 border-green-500',
    warning: 'bg-amber-50/40 hover:bg-amber-50 border-l-2 border-amber-500',
    error: 'bg-red-50/40 hover:bg-red-50 border-l-2 border-red-500'
  };

  return (
    <tr className={clsx(
      "transition-colors duration-100",
      interactive && "cursor-pointer",
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
      "px-6 py-3 text-xs font-semibold uppercase tracking-wide text-theme-secondary-text",
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
