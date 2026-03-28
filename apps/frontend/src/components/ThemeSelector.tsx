import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeKey } from '../theme/themes';

export const ThemeSelector: React.FC = () => {
  const { themeKey, setTheme, availableThemes } = useTheme();

  const themeList: { key: ThemeKey; label: string; description: string }[] = [
    { key: 'default', label: 'Por Defecto', description: 'Tema marrón profesional' },
    { key: 'blue', label: 'Azul Profesional', description: 'Tema azul moderno' },
    { key: 'green', label: 'Verde Médico', description: 'Tema verde para salud' },
    { key: 'purple', label: 'Púrpura Moderno', description: 'Tema púrpura elegante' },
    { key: 'orange', label: 'Naranja Cálido', description: 'Tema naranja vibrante' },
    { key: 'dark', label: 'Modo Oscuro', description: 'Tema oscuro para la noche' },
  ];

  const getThemePreview = (key: ThemeKey) => {
    const theme = availableThemes[key];
    return (
      <div className="flex gap-1 mt-2">
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: theme.colors.darkPrimary }}
          title="Dark Primary"
        />
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: theme.colors.primary }}
          title="Primary"
        />
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: theme.colors.lightPrimary }}
          title="Light Primary"
        />
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: theme.colors.accent }}
          title="Accent"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleccionar Tema</h3>
        <p className="text-sm text-gray-600">
          Elige un tema de color para personalizar la apariencia de la aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeList.map((item) => (
          <button
            key={item.key}
            onClick={() => setTheme(item.key)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              themeKey === item.key
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{item.label}</h4>
              {themeKey === item.key && (
                <span className="text-blue-600 text-xl">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            {getThemePreview(item.key)}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Cómo usar los colores del tema</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p>Usa las clases de Tailwind con el prefijo <code className="px-1 py-0.5 bg-gray-200 rounded font-mono">theme-</code>:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="px-1 py-0.5 bg-gray-200 rounded font-mono text-xs">bg-theme-primary</code> - Color primario</li>
            <li><code className="px-1 py-0.5 bg-gray-200 rounded font-mono text-xs">text-theme-primary-text</code> - Texto primario</li>
            <li><code className="px-1 py-0.5 bg-gray-200 rounded font-mono text-xs">bg-theme-accent</code> - Color de acento</li>
            <li><code className="px-1 py-0.5 bg-gray-200 rounded font-mono text-xs">border-theme-divider</code> - Color de divisor</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Vista Previa del Tema Actual</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="font-medium text-gray-700 mb-1">Primario Oscuro</div>
            <div
              className="h-12 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: availableThemes[themeKey].colors.darkPrimary }}
            />
            <code className="text-xs text-gray-600">{availableThemes[themeKey].colors.darkPrimary}</code>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">Primario</div>
            <div
              className="h-12 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: availableThemes[themeKey].colors.primary }}
            />
            <code className="text-xs text-gray-600">{availableThemes[themeKey].colors.primary}</code>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">Primario Claro</div>
            <div
              className="h-12 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: availableThemes[themeKey].colors.lightPrimary }}
            />
            <code className="text-xs text-gray-600">{availableThemes[themeKey].colors.lightPrimary}</code>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">Acento</div>
            <div
              className="h-12 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: availableThemes[themeKey].colors.accent }}
            />
            <code className="text-xs text-gray-600">{availableThemes[themeKey].colors.accent}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
