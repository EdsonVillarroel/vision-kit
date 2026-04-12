import React, { createContext, useContext, useEffect } from 'react';
import { adminTheme } from './themes';

interface ThemeContextType {
  theme: typeof adminTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-dark-primary', adminTheme.colors.darkPrimary);
    root.style.setProperty('--color-light-primary', adminTheme.colors.lightPrimary);
    root.style.setProperty('--color-primary', adminTheme.colors.primary);
    root.style.setProperty('--color-text-icons', adminTheme.colors.textIcons);
    root.style.setProperty('--color-primary-text', adminTheme.colors.primaryText);
    root.style.setProperty('--color-secondary-text', adminTheme.colors.secondaryText);
    root.style.setProperty('--color-accent', adminTheme.colors.accent);
    root.style.setProperty('--color-divider', adminTheme.colors.divider);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: adminTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
