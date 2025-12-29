import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo?: string;
}

export const ClinicPage: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ClinicInfo>({
    name: 'VisionKit Óptica',
    address: 'Av. Principal 123, Centro, Ciudad',
    phone: '555-1234',
    email: 'contacto@visionkit.com',
    website: 'www.visionkit.com',
    taxId: 'RFC123456789',
    logo: undefined
  });

  // Verificar permisos
  useEffect(() => {
    if (!permissions.canEditClinicInfo) {
      navigate('/');
    }
  }, [permissions, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular llamada al servicio
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Guardar en el servicio
      // await clinicService.update(formData);

      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar información:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Revertir cambios
    setFormData({
      name: 'VisionKit Óptica',
      address: 'Av. Principal 123, Centro, Ciudad',
      phone: '555-1234',
      email: 'contacto@visionkit.com',
      website: 'www.visionkit.com',
      taxId: 'RFC123456789',
      logo: undefined
    });
    setIsEditing(false);
  };

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
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
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
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              required
            />

            <Input
              id="email"
              type="email"
              label="Correo Electrónico"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              required
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
              required
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
            >
              Guardar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
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
            {formData.logo ? (
              <img
                src={formData.logo}
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
              <h4 className="font-medium text-gray-900">IVA (Impuesto al Valor Agregado)</h4>
              <p className="text-sm text-gray-600">Porcentaje de IVA aplicado a las ventas</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">16%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Moneda</h4>
              <p className="text-sm text-gray-600">Moneda utilizada en las transacciones</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-gray-900">MXN (Peso Mexicano)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Prefijo de Facturas</h4>
              <p className="text-sm text-gray-600">Prefijo para numeración de facturas</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-gray-900 font-mono">FACT-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios de Atención */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios de Atención</h3>
        <div className="space-y-3">
          {[
            { day: 'Lunes a Viernes', hours: '9:00 AM - 7:00 PM' },
            { day: 'Sábados', hours: '9:00 AM - 2:00 PM' },
            { day: 'Domingos', hours: 'Cerrado' }
          ].map((schedule, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{schedule.day}</span>
              <span className="text-gray-600">{schedule.hours}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" disabled>
          Editar Horarios
        </Button>
      </div>
    </div>
  );
};
