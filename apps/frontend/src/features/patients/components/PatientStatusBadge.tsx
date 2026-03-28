import type { PatientStatus } from '../types';

interface PatientStatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PatientStatusBadge = ({ status, size = 'md', showIcon = true }: PatientStatusBadgeProps) => {
  const config = {
    frequent: {
      label: 'Cliente Frecuente',
      icon: '⭐',
      className: 'bg-green-100 text-green-800 border-green-300',
      dotClassName: 'bg-green-500'
    },
    warning: {
      label: 'Alerta',
      icon: '⚠️',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      dotClassName: 'bg-yellow-500'
    },
    normal: {
      label: 'Normal',
      icon: '👤',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      dotClassName: 'bg-gray-500'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const { label, icon, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${className} ${sizeClasses[size]}`}>
      {showIcon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

export const PatientStatusDot = ({ status }: { status: PatientStatus }) => {
  const config = {
    frequent: 'bg-green-500',
    warning: 'bg-yellow-500',
    normal: 'bg-gray-400'
  };

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${config[status]}`} />
  );
};
