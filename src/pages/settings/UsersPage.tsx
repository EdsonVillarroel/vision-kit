import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../features/auth/hooks/usePermissions';
import { userService } from '../../features/users/services/userService';
import type { User, UserRole } from '../../features/auth/types';
import { Button } from '../../components/ui/Button';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    role?: UserRole;
    status?: 'active' | 'inactive';
    search: string;
  }>({
    search: ''
  });

  // Verificar permisos
  useEffect(() => {
    if (!permissions.canViewUsers) {
      navigate('/');
    }
  }, [permissions, navigate]);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      const updatedUser = await userService.toggleStatus(userId);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await userService.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getRoleName = (role: UserRole) => {
    const roleNames = {
      admin: 'Administrador',
      manager: 'Gerente',
      optician: 'Óptico'
    };
    return roleNames[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      optician: 'bg-green-100 text-green-800'
    };
    return colors[role];
  };

  const filteredUsers = users.filter(user => {
    if (filter.role && user.role !== filter.role) return false;
    if (filter.status && user.status !== filter.status) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        {permissions.canCreateUser && (
          <Button onClick={() => navigate('/settings/users/new')}>
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email o ID..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={filter.role || ''}
              onChange={(e) => setFilter({ ...filter, role: (e.target.value as UserRole) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="optician">Óptico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: (e.target.value as 'active' | 'inactive') || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ search: '' })}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Usuarios</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="text-sm text-gray-600">Administradores</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
          <div className="text-sm text-gray-600">Gerentes</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {users.filter(u => u.role === 'manager').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
          <div className="text-sm text-gray-600">Ópticos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {users.filter(u => u.role === 'optician').length}
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {permissions.canEditUser && (
                          <button
                            onClick={() => navigate(`/settings/users/${user.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                        )}
                        {permissions.canEditUser && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {user.status === 'active' ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                        {permissions.canDeleteUser && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
