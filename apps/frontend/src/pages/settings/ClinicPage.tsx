import React, { useEffect, useState } from 'react';
import { SkeletonFormCard } from '../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { settingsService, DEFAULT_BUSINESS_HOURS } from '../../features/settings/services/settingsService';
import type { ClinicSettings, BusinessHours } from '../../features/settings/services/settingsService';
import { useSnackbar } from '../../components/Snackbar';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

export const ClinicPage: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { showSuccess, showError } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [original, setOriginal] = useState<ClinicSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
  });

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);

  useEffect(() => {
    if (!permissions.canEditClinicInfo) {
      navigate('/');
    }
  }, [permissions, navigate]);

  useEffect(() => {
    settingsService.get().then((data) => {
      setOriginal(data);
      setFormData({
        name: data.name ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        website: data.website ?? '',
        taxId: data.rfc ?? '',
      });
      if (data.businessHours) setBusinessHours(data.businessHours as BusinessHours);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await settingsService.update({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        rfc: formData.taxId,
      });
      setOriginal(updated);
      setIsEditing(false);
      showSuccess('Información actualizada exitosamente');
    } catch (error) {
      showError('Error al actualizar información');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      const updated = await settingsService.update({ businessHours });
      setOriginal(updated);
      setIsEditingHours(false);
      showSuccess('Horarios actualizados exitosamente');
    } catch (error) {
      showError('Error al actualizar horarios');
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: original?.name ?? '',
      address: original?.address ?? '',
      phone: original?.phone ?? '',
      email: original?.email ?? '',
      website: original?.website ?? '',
      taxId: original?.rfc ?? '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SkeletonFormCard fields={6} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la Clínica</h1>
        <p className="text-gray-600 mt-1">
          Administra la información general de tu óptica
        </p>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Input
            id="name"
            label="Nombre de la Clínica"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            required
          />

          <Input
            id="address"
            label="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            disabled={!isEditing}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />

            <Input
              id="email"
              type="email"
              label="Correo Electrónico"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="website"
              label="Sitio Web"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              placeholder="www.example.com"
            />

            <Input
              id="taxId"
              label="RFC / ID Fiscal"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button onClick={handleSave} isLoading={isSaving}>
              Guardar Cambios
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo de la Clínica</h3>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {original?.logo ? (
              <img
                src={original.logo}
                alt="Logo de la clínica"
                className="w-24 h-24 object-contain border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-3xl font-bold">VK</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Sube el logo de tu clínica. Se recomienda una imagen de 200x200 píxeles.
            </p>
            <Button variant="outline" disabled>
              Subir Logo
            </Button>
          </div>
        </div>
      </div>

      {/* Configuración de Facturación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Facturación</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">IVA</h4>
              <p className="text-sm text-gray-600">Porcentaje de IVA aplicado a las ventas</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {original?.taxRate != null ? `${original.taxRate}%` : '16%'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Moneda</h4>
              <p className="text-sm text-gray-600">Moneda utilizada en las transacciones</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-gray-900">
                {original?.currency ?? 'MXN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios de Atención */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
          {!isEditingHours && (
            <Button variant="outline" onClick={() => setIsEditingHours(true)}>
              Editar Horarios
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {Object.entries(businessHours).map(([day, schedule]) => (
            <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900 w-28 flex-shrink-0">{DAY_LABELS[day] ?? day}</span>
              {isEditingHours ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={schedule.open}
                    disabled={schedule.closed}
                    onChange={(e) => setBusinessHours(prev => ({
                      ...prev,
                      [day]: { ...prev[day], open: e.target.value },
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <span className="text-gray-500 text-sm">—</span>
                  <input
                    type="time"
                    value={schedule.close}
                    disabled={schedule.closed}
                    onChange={(e) => setBusinessHours(prev => ({
                      ...prev,
                      [day]: { ...prev[day], close: e.target.value },
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <label className="flex items-center gap-1 ml-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.closed}
                      onChange={(e) => setBusinessHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], closed: e.target.checked },
                      }))}
                      className="rounded"
                    />
                    Cerrado
                  </label>
                </div>
              ) : (
                <span className="text-gray-600 text-sm">
                  {schedule.closed ? 'Cerrado' : `${schedule.open} — ${schedule.close}`}
                </span>
              )}
            </div>
          ))}
        </div>

        {isEditingHours && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <Button onClick={handleSaveHours} isLoading={isSavingHours}>
              Guardar Horarios
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBusinessHours(original?.businessHours ?? DEFAULT_BUSINESS_HOURS);
                setIsEditingHours(false);
              }}
              disabled={isSavingHours}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
