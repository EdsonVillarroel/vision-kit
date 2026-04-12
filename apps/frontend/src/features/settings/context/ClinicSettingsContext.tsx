import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '../../../theme/ThemeContext';
import { settingsService, type ClinicSettings } from '../services/settingsService';

interface ClinicSettingsContextType {
  settings: ClinicSettings | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const ClinicSettingsContext = createContext<ClinicSettingsContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useClinicSettings = () => {
  const ctx = useContext(ClinicSettingsContext);
  if (!ctx) throw new Error('useClinicSettings must be used within ClinicSettingsProvider');
  return ctx;
};

export const ClinicSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { setBrandColors } = useTheme();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.get();
      setSettings(data);
      setBrandColors({
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
      });
    } catch {
      // settings are non-critical — app continues without them
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setSettings(null);
      setBrandColors({});
      localStorage.removeItem('brand-colors');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <ClinicSettingsContext.Provider value={{ settings, isLoading, refresh: fetchSettings }}>
      {children}
    </ClinicSettingsContext.Provider>
  );
};
