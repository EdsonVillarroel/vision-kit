import { useEffect, useState } from 'react';
import { ThemeSelector } from '../../components/ThemeSelector';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useClinicSettings } from '../../features/settings/context/ClinicSettingsContext';
import { settingsService } from '../../features/settings/services/settingsService';
import { useTheme } from '../../theme/ThemeContext';
import { useSnackbar } from '../../components/Snackbar';

export const AppearancePage: React.FC = () => {
  const { user } = useAuth();
  const { settings, refresh } = useClinicSettings();
  const { theme } = useTheme();
  const { showSnackbar } = useSnackbar();

  const canEditBranding = user?.role === 'super_admin' || user?.role === 'admin';

  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [accentColor, setAccentColor] = useState(theme.colors.accent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrimaryColor(settings?.primaryColor ?? theme.colors.primary);
    setAccentColor(settings?.accentColor ?? theme.colors.accent);
  }, [settings, theme]);

  const handleSaveBrandColors = async () => {
    setSaving(true);
    try {
      await settingsService.update({ primaryColor, accentColor });
      await refresh();
      showSnackbar('Colores de marca guardados', 'success');
    } catch {
      showSnackbar('Error al guardar los colores', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetBrandColors = async () => {
    setSaving(true);
    try {
      await settingsService.update({ primaryColor: undefined, accentColor: undefined });
      await refresh();
      showSnackbar('Colores de marca restablecidos', 'success');
    } catch {
      showSnackbar('Error al restablecer los colores', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary-text">Apariencia</h1>
        <p className="text-theme-secondary-text mt-1">Personaliza el tema de colores de la aplicación</p>
      </div>

      {/* Selector de tema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ThemeSelector />
      </div>

      {/* Colores de marca — solo admin/super_admin */}
      {canEditBranding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-theme-primary-text">Colores de Marca</h3>
            <p className="text-sm text-theme-secondary-text mt-1">
              Estos colores se aplican sobre el tema seleccionado y se sincronizan con todos los usuarios del tenant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-primary-text">
                Color Primario de Marca
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-theme-secondary-text">{primaryColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-theme-primary-text">
                Color de Acento
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-theme-secondary-text">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-100 p-4 bg-gray-50 mb-5">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Vista previa</p>
            <div className="flex items-center gap-3">
              <button
                style={{ backgroundColor: primaryColor }}
                className="px-4 py-2 text-white text-sm rounded-lg font-medium shadow-sm"
              >
                Botón Primario
              </button>
              <button
                style={{ backgroundColor: accentColor }}
                className="px-4 py-2 text-white text-sm rounded-lg font-medium shadow-sm"
              >
                Acento
              </button>
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-6 h-6 rounded-full shadow-sm"
              />
              <div
                style={{ backgroundColor: accentColor }}
                className="w-6 h-6 rounded-full shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBrandColors}
              disabled={saving}
              className="px-5 py-2 bg-theme-primary text-theme-text-icons text-sm font-medium rounded-lg hover:bg-theme-dark-primary transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar colores'}
            </button>
            {(settings?.primaryColor || settings?.accentColor) && (
              <button
                onClick={handleResetBrandColors}
                disabled={saving}
                className="px-5 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Restablecer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ejemplo de colores activos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-theme-primary-text mb-4">Vista de Colores Activos</h3>
        <div className="space-y-4">
          <div className="p-4 bg-theme-light-primary border border-theme-divider rounded-lg">
            <h4 className="font-semibold text-theme-primary-text mb-2">Tarjeta con Colores del Tema</h4>
            <p className="text-theme-secondary-text mb-3 text-sm">
              Así se ven los colores activos en los componentes de la interfaz.
            </p>
            <button className="px-4 py-2 bg-theme-primary text-theme-text-icons rounded-lg hover:bg-theme-dark-primary transition-colors text-sm">
              Botón Primario
            </button>
            <button className="ml-2 px-4 py-2 bg-theme-accent text-theme-text-icons rounded-lg hover:opacity-90 transition-opacity text-sm">
              Botón Acento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border-l-4 border-theme-primary bg-white rounded shadow-sm">
              <p className="text-xs font-semibold text-theme-primary uppercase tracking-wide">Primario</p>
            </div>
            <div className="p-3 border-l-4 border-theme-dark-primary bg-white rounded shadow-sm">
              <p className="text-xs font-semibold text-theme-dark-primary uppercase tracking-wide">Primario oscuro</p>
            </div>
            <div className="p-3 border-l-4 border-theme-accent bg-white rounded shadow-sm">
              <p className="text-xs font-semibold text-theme-accent uppercase tracking-wide">Acento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
