export interface Theme {
  name: string;
  colors: {
    // Primary colors
    darkPrimary: string;
    lightPrimary: string;
    primary: string;

    // Text colors
    textIcons: string;
    primaryText: string;
    secondaryText: string;

    // Accent and divider
    accent: string;
    divider: string;
  };
}

// Tema basado en los colores Material Design proporcionados
export const defaultTheme: Theme = {
  name: 'Default',
  colors: {
    darkPrimary: '#5D4037',    // Dark brown
    lightPrimary: '#D7CCC8',   // Light brown/beige
    primary: '#795548',         // Medium brown
    textIcons: '#FFFFFF',       // White
    primaryText: '#212121',     // Almost black
    secondaryText: '#757575',   // Gray
    accent: '#607D8B',          // Blue gray
    divider: '#BDBDBD',         // Light gray
  },
};

// Tema alternativo 1: Azul profesional
export const blueTheme: Theme = {
  name: 'Professional Blue',
  colors: {
    darkPrimary: '#1565C0',
    lightPrimary: '#BBDEFB',
    primary: '#2196F3',
    textIcons: '#FFFFFF',
    primaryText: '#212121',
    secondaryText: '#757575',
    accent: '#FF5722',
    divider: '#BDBDBD',
  },
};

// Tema alternativo 2: Verde médico
export const greenTheme: Theme = {
  name: 'Medical Green',
  colors: {
    darkPrimary: '#388E3C',
    lightPrimary: '#C8E6C9',
    primary: '#4CAF50',
    textIcons: '#FFFFFF',
    primaryText: '#212121',
    secondaryText: '#757575',
    accent: '#FFC107',
    divider: '#BDBDBD',
  },
};

// Tema alternativo 3: Púrpura moderno
export const purpleTheme: Theme = {
  name: 'Modern Purple',
  colors: {
    darkPrimary: '#512DA8',
    lightPrimary: '#D1C4E9',
    primary: '#673AB7',
    textIcons: '#FFFFFF',
    primaryText: '#212121',
    secondaryText: '#757575',
    accent: '#FF4081',
    divider: '#BDBDBD',
  },
};

// Tema alternativo 4: Naranja cálido
export const orangeTheme: Theme = {
  name: 'Warm Orange',
  colors: {
    darkPrimary: '#E64A19',
    lightPrimary: '#FFCCBC',
    primary: '#FF5722',
    textIcons: '#FFFFFF',
    primaryText: '#212121',
    secondaryText: '#757575',
    accent: '#009688',
    divider: '#BDBDBD',
  },
};

// Tema oscuro
export const darkTheme: Theme = {
  name: 'Dark Mode',
  colors: {
    darkPrimary: '#000000',
    lightPrimary: '#424242',
    primary: '#212121',
    textIcons: '#FFFFFF',
    primaryText: '#FFFFFF',
    secondaryText: '#B0B0B0',
    accent: '#2196F3',
    divider: '#424242',
  },
};

// Exportar todos los temas disponibles
export const availableThemes = {
  default: defaultTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  orange: orangeTheme,
  dark: darkTheme,
};

export type ThemeKey = keyof typeof availableThemes;
