import React, { createContext, useContext, useState, useCallback } from 'react';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info', duration: number = 4000) => {
    const id = `snackbar-${Date.now()}-${Math.random()}`;
    const newSnackbar: SnackbarMessage = { id, message, type, duration };

    setSnackbars((prev) => [...prev, newSnackbar]);

    // Auto-dismiss después del duration
    setTimeout(() => {
      setSnackbars((prev) => prev.filter((s) => s.id !== id));
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error', 5000);
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const handleDismiss = (id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {/* Snackbar Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {snackbars.map((snackbar) => (
          <Snackbar
            key={snackbar.id}
            message={snackbar.message}
            type={snackbar.type}
            onDismiss={() => handleDismiss(snackbar.id)}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

// Componente Snackbar individual
interface SnackbarProps {
  message: string;
  type: SnackbarType;
  onDismiss: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onDismiss }) => {
  const config = {
    success: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      bgGradient: 'bg-gradient-to-r from-green-600 to-green-700',
      iconBg: 'bg-green-500',
      borderColor: 'border-green-400',
    },
    error: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      bgGradient: 'bg-gradient-to-r from-red-600 to-red-700',
      iconBg: 'bg-red-500',
      borderColor: 'border-red-400',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgGradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-400',
      borderColor: 'border-yellow-300',
    },
    info: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'bg-gradient-to-r from-theme-primary to-theme-dark-primary',
      iconBg: 'bg-theme-accent',
      borderColor: 'border-theme-accent',
    },
  };

  const { icon, bgGradient, iconBg, borderColor } = config[type];

  return (
    <div
      className={`${bgGradient} text-white rounded-2xl shadow-2xl min-w-[320px] max-w-md animate-slideIn backdrop-blur-sm border border-white/20 overflow-hidden`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`${iconBg} rounded-xl p-2 shadow-lg`}>
          {icon}
        </div>
        <p className="font-semibold text-sm flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="ml-2 hover:bg-white/20 active:bg-white/30 rounded-xl p-2 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div className={`h-full ${borderColor} bg-white/40 animate-shrink`}></div>
      </div>
    </div>
  );
};
