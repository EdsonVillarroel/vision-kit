# Sistema de Temas - VisionKit

Este directorio contiene el sistema de temas dinámico de la aplicación VisionKit.

## Estructura

```
theme/
├── themes.ts          # Definición de temas y colores
├── ThemeContext.tsx   # Context API para manejar el tema
├── index.ts          # Exportaciones principales
└── README.md         # Esta documentación
```

## Temas Disponibles

### 1. **Default** (Por defecto)
- Basado en tonos marrones profesionales
- Colores Material Design según especificación original

### 2. **Professional Blue**
- Tema azul corporativo
- Ideal para ambientes profesionales

### 3. **Medical Green**
- Tema verde médico
- Asociado con salud y bienestar

### 4. **Modern Purple**
- Tema púrpura moderno
- Elegante y contemporáneo

### 5. **Warm Orange**
- Tema naranja cálido
- Energético y acogedor

### 6. **Dark Mode**
- Tema oscuro
- Reduce fatiga visual en ambientes con poca luz

## Paleta de Colores

Cada tema incluye los siguientes colores:

| Color | Uso | Clase Tailwind |
|-------|-----|----------------|
| `darkPrimary` | Headers, navegación principal | `bg-theme-dark-primary` |
| `lightPrimary` | Fondos secundarios, cards | `bg-theme-light-primary` |
| `primary` | Elementos principales, botones | `bg-theme-primary` |
| `textIcons` | Texto sobre colores primarios | `text-theme-text-icons` |
| `primaryText` | Texto principal | `text-theme-primary-text` |
| `secondaryText` | Texto secundario | `text-theme-secondary-text` |
| `accent` | Llamadas a la acción | `bg-theme-accent` |
| `divider` | Separadores y bordes | `border-theme-divider` |

## Uso en Componentes

### 1. Obtener el tema actual

```tsx
import { useTheme } from '../theme/ThemeContext';

const MyComponent = () => {
  const { theme, themeKey, setTheme } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme.name}</p>
      <button onClick={() => setTheme('blue')}>
        Cambiar a azul
      </button>
    </div>
  );
};
```

### 2. Usar colores con Tailwind

```tsx
// Fondo con color primario
<div className="bg-theme-primary text-theme-text-icons">
  Contenido
</div>

// Botón con color de acento
<button className="bg-theme-accent text-theme-text-icons hover:opacity-90">
  Click aquí
</button>

// Card con borde divisor
<div className="border border-theme-divider bg-theme-light-primary">
  <h3 className="text-theme-primary-text">Título</h3>
  <p className="text-theme-secondary-text">Descripción</p>
</div>
```

### 3. Usar colores programáticamente

```tsx
import { useTheme } from '../theme/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();

  return (
    <div style={{ backgroundColor: theme.colors.primary }}>
      Contenido con color dinámico
    </div>
  );
};
```

## Agregar un Nuevo Tema

1. **Editar `themes.ts`**:

```typescript
export const myCustomTheme: Theme = {
  name: 'My Custom Theme',
  colors: {
    darkPrimary: '#123456',
    lightPrimary: '#ABCDEF',
    primary: '#456789',
    textIcons: '#FFFFFF',
    primaryText: '#000000',
    secondaryText: '#666666',
    accent: '#FF6600',
    divider: '#CCCCCC',
  },
};

// Agregar al objeto availableThemes
export const availableThemes = {
  default: defaultTheme,
  blue: blueTheme,
  // ... otros temas
  myCustom: myCustomTheme, // ← Agregar aquí
};
```

2. **Actualizar el selector de temas** en `components/ThemeSelector.tsx`:

```typescript
const themeList = [
  // ... temas existentes
  {
    key: 'myCustom',
    label: 'Mi Tema Personalizado',
    description: 'Descripción del tema'
  },
];
```

## Variables CSS

El sistema crea automáticamente variables CSS en el elemento raíz:

```css
:root {
  --color-dark-primary: #5D4037;
  --color-light-primary: #D7CCC8;
  --color-primary: #795548;
  --color-text-icons: #FFFFFF;
  --color-primary-text: #212121;
  --color-secondary-text: #757575;
  --color-accent: #607D8B;
  --color-divider: #BDBDBD;
}
```

Puedes usar estas variables directamente en CSS:

```css
.my-element {
  background-color: var(--color-primary);
  color: var(--color-text-icons);
}
```

## Persistencia

El tema seleccionado se guarda automáticamente en `localStorage` con la clave `app-theme`. Al recargar la página, el último tema seleccionado se restaura automáticamente.

## Mejores Prácticas

1. **Usa clases de Tailwind** cuando sea posible para mantener consistencia
2. **Evita hardcodear colores** - usa siempre los colores del tema
3. **Prueba todos los temas** al crear nuevos componentes
4. **Mantén el contraste** adecuado entre texto y fondo
5. **Documenta** cualquier nuevo uso de colores

## Ejemplos Completos

### Card con Tema

```tsx
const ThemedCard = ({ title, description }) => {
  return (
    <div className="border-l-4 border-theme-primary bg-theme-light-primary p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-theme-primary-text mb-2">
        {title}
      </h3>
      <p className="text-theme-secondary-text">
        {description}
      </p>
    </div>
  );
};
```

### Botón Primario

```tsx
const PrimaryButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-theme-primary text-theme-text-icons rounded-lg hover:bg-theme-dark-primary transition-colors"
    >
      {children}
    </button>
  );
};
```

### Header con Tema

```tsx
const Header = () => {
  return (
    <header className="bg-theme-dark-primary text-theme-text-icons p-4">
      <h1 className="text-2xl font-bold">VisionKit</h1>
      <p className="text-sm opacity-90">Sistema de Gestión Óptica</p>
    </header>
  );
};
```

## Solución de Problemas

### Los colores no se actualizan
- Verifica que el `ThemeProvider` esté en el nivel superior de tu app
- Asegúrate de que estás usando las clases `theme-*` correctamente
- Limpia el caché del navegador

### Tema no persiste
- Verifica que localStorage esté habilitado
- Revisa la consola para errores de permisos

### Colores incorrectos en producción
- Asegúrate de que Tailwind esté configurado correctamente
- Verifica que el `tailwind.config.js` incluya las rutas correctas
