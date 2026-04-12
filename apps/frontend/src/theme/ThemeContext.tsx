import React, { createContext, useContext, useEffect, useState } from 'react';
import { availableThemes, type Theme, type ThemeKey } from './themes';

interface BrandColors {
  primaryColor?: string;
  accentColor?: string;
}

interface ThemeContextType {
  theme: Theme;
  themeKey: ThemeKey;
  setTheme: (themeKey: ThemeKey) => void;
  availableThemes: typeof availableThemes;
  setBrandColors: (colors: BrandColors) => void;
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

function adjustHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeKey;
    return savedTheme && availableThemes[savedTheme] ? savedTheme : 'default';
  });

  const [brandColors, setBrandColorsState] = useState<BrandColors>(() => {
    try {
      const saved = localStorage.getItem('brand-colors');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const theme = availableThemes[themeKey];

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--color-dark-primary', theme.colors.darkPrimary);
    root.style.setProperty('--color-light-primary', theme.colors.lightPrimary);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-text-icons', theme.colors.textIcons);
    root.style.setProperty('--color-primary-text', theme.colors.primaryText);
    root.style.setProperty('--color-secondary-text', theme.colors.secondaryText);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-divider', theme.colors.divider);

    if (brandColors.primaryColor) {
      root.style.setProperty('--color-primary', brandColors.primaryColor);
      root.style.setProperty('--color-dark-primary', adjustHex(brandColors.primaryColor, -40));
      root.style.setProperty('--color-light-primary', adjustHex(brandColors.primaryColor, 100));
    }
    if (brandColors.accentColor) {
      root.style.setProperty('--color-accent', brandColors.accentColor);
    }

    localStorage.setItem('app-theme', themeKey);
  }, [theme, themeKey, brandColors]);

  const handleSetTheme = (newThemeKey: ThemeKey) => {
    setThemeKey(newThemeKey);
  };

  const setBrandColors = (colors: BrandColors) => {
    setBrandColorsState(colors);
    localStorage.setItem('brand-colors', JSON.stringify(colors));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeKey,
        setTheme: handleSetTheme,
        availableThemes,
        setBrandColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
