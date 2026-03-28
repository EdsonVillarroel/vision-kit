import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { userService } from '../../features/users/services/userService';
import type { UserRole } from '../../features/auth/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'optician' as UserRole,
    phone: '',
    password: ''
  });

  // Verificar permisos
  useEffect(() => {
    if (!permissions.canCreateUser && !isEditing) {
      navigate('/settings/users');
    }
    if (!permissions.canEditUser && isEditing) {
      navigate('/settings/users');
    }
  }, [permissions, navigate, isEditing]);

  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      const loadUser = async () => {
        setIsLoading(true);
        try {
          const user = await userService.getById(id);
          if (!user) {
            setError('Usuario no encontrado');
            return;
          }
          setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            password: ''
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      loadUser();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.name || !formData.email) {
      setError('El nombre y el email son obligatorios');
      return;
    }

    if (!isEditing && !formData.password) {
      setError('La contraseña es obligatoria para usuarios nuevos');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await userService.update(id, formData);
      } else {
        await userService.create(formData);
      }
      navigate('/settings/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Actualiza la información del usuario' : 'Crea un nuevo usuario en el sistema'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            id="name"
            label="Nombre Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ej: Juan Pérez"
          />

          <Input
            id="email"
            type="email"
            label="Correo Electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="juan@example.com"
          />

          <Input
            id="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="555-0000"
          />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="optician">Óptico</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {formData.role === 'admin' && 'Acceso completo al sistema'}
              {formData.role === 'manager' && 'Puede ver reportes, cancelar ventas y crear usuarios ópticos'}
              {formData.role === 'optician' && 'Puede crear ventas y gestionar pacientes'}
            </p>
          </div>

          {!isEditing && (
            <Input
              id="password"
              type="password"
              label="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              helperText="Mínimo 6 caracteres"
            />
          )}

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Para cambiar la contraseña de este usuario, contacta al administrador del sistema.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/settings/users')}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
