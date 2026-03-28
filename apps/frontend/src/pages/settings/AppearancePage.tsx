import React from 'react';
import { ThemeSelector } from '../../components/ThemeSelector';

export const AppearancePage: React.FC = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>
        <p className="text-gray-600 mt-1">
          Personaliza el tema de colores de la aplicación
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ThemeSelector />
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ejemplo de Uso en Componentes</h3>

        <div className="space-y-4">
          <div className="p-4 bg-theme-light-primary border border-theme-divider rounded-lg">
            <h4 className="font-semibold text-theme-primary-text mb-2">Tarjeta con Colores del Tema</h4>
            <p className="text-theme-secondary-text mb-3">
              Este es un ejemplo de cómo se ven los colores del tema en una tarjeta.
            </p>
            <button className="px-4 py-2 bg-theme-primary text-theme-text-icons rounded-lg hover:bg-theme-dark-primary transition-colors">
              Botón Primario
            </button>
            <button className="ml-2 px-4 py-2 bg-theme-accent text-theme-text-icons rounded-lg hover:opacity-90 transition-opacity">
              Botón Acento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-l-4 border-theme-primary bg-white rounded shadow-sm">
              <h5 className="font-semibold text-theme-primary mb-2">Color Primario</h5>
              <p className="text-sm text-theme-secondary-text">
                Usado para elementos principales y navegación
              </p>
            </div>
            <div className="p-4 border-l-4 border-theme-accent bg-white rounded shadow-sm">
              <h5 className="font-semibold text-theme-accent mb-2">Color de Acento</h5>
              <p className="text-sm text-theme-secondary-text">
                Usado para llamadas a la acción y elementos destacados
              </p>
            </div>
          </div>

          <div className="bg-theme-dark-primary text-theme-text-icons p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Primario Oscuro</h5>
            <p className="text-sm opacity-90">
              Perfecto para headers, barras de navegación y elementos de alto contraste
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Nota para Desarrolladores</h4>
        <p className="text-sm text-yellow-700">
          Los temas se guardan automáticamente en localStorage. Para usar los colores del tema en tus componentes,
          utiliza las clases de Tailwind con el prefijo <code className="px-1 bg-yellow-100 rounded">theme-</code>.
          Ejemplo: <code className="px-1 bg-yellow-100 rounded">bg-theme-primary</code>,
          <code className="px-1 bg-yellow-100 rounded ml-1">text-theme-primary-text</code>, etc.
        </p>
      </div>
    </div>
  );
};
