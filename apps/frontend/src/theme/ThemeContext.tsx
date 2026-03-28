import React, { createContext, useContext, useEffect, useState } from 'react';
import { availableThemes, type Theme, type ThemeKey } from './themes';

interface ThemeContextType {
  theme: Theme;
  themeKey: ThemeKey;
  setTheme: (themeKey: ThemeKey) => void;
  availableThemes: typeof availableThemes;
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

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Cargar tema guardado en localStorage o usar el tema por defecto
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeKey;
    return savedTheme && availableThemes[savedTheme] ? savedTheme : 'default';
  });

  const theme = availableThemes[themeKey];

  // Aplicar variables CSS al documento
  useEffect(() => {
    const root = document.documentElement;

    // Aplicar colores del tema como variables CSS
    root.style.setProperty('--color-dark-primary', theme.colors.darkPrimary);
    root.style.setProperty('--color-light-primary', theme.colors.lightPrimary);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-text-icons', theme.colors.textIcons);
    root.style.setProperty('--color-primary-text', theme.colors.primaryText);
    root.style.setProperty('--color-secondary-text', theme.colors.secondaryText);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-divider', theme.colors.divider);

    // Guardar tema en localStorage
    localStorage.setItem('app-theme', themeKey);
  }, [theme, themeKey]);

  const handleSetTheme = (newThemeKey: ThemeKey) => {
    setThemeKey(newThemeKey);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeKey,
        setTheme: handleSetTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
