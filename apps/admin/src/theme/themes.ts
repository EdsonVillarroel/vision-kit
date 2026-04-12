export interface Theme {
  name: string;
  colors: {
    darkPrimary: string;
    lightPrimary: string;
    primary: string;
    textIcons: string;
    primaryText: string;
    secondaryText: string;
    accent: string;
    divider: string;
  };
}

// Tema de administración — indigo profesional
export const adminTheme: Theme = {
  name: 'Admin Indigo',
  colors: {
    darkPrimary: '#312e81',
    lightPrimary: '#e0e7ff',
    primary: '#4f46e5',
    textIcons: '#ffffff',
    primaryText: '#0f172a',
    secondaryText: '#64748b',
    accent: '#8b5cf6',
    divider: '#e2e8f0',
  },
};

export const availableThemes = {
  admin: adminTheme,
};

export type ThemeKey = keyof typeof availableThemes;
