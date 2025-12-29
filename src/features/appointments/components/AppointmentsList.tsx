import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { Button } from '../../../components/ui/Button';
import type { AppointmentStatus, AppointmentType } from '../types';

export const AppointmentsList = () => {
  const { appointments, loading, error, updateStatus } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels: Record<AppointmentStatus, string> = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      'no-show': 'No Asistió'
    };
    return labels[status];
  };

  const getTypeLabel = (type: AppointmentType) => {
    const labels: Record<AppointmentType, string> = {
      'eye-exam': 'Examen Visual',
      'contact-lens-fitting': 'Adaptación LC',
      'followup': 'Seguimiento',
      'emergency': 'Emergencia',
      'frame-selection': 'Selección Armazón',
      'adjustment': 'Ajuste'
    };
    return labels[type];
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesDate = selectedDate ? apt.date === selectedDate : true;
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const todayAppointments = appointments.filter(apt =>
    apt.date === new Date().toISOString().split('T')[0] &&
    (apt.status === 'scheduled' || apt.status === 'confirmed')
  );

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-600 mt-2">Gestión de citas y calendario</p>
        </div>
        <Link to="/appointments/new">
          <Button>
            ➕ Nueva Cita
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Citas de Hoy</p>
          <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Confirmadas</p>
          <p className="text-3xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">
            {appointments.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Completadas Este Mes</p>
          <p className="text-3xl font-bold text-blue-600">
            {appointments.filter(a => {
              if (a.status !== 'completed') return false;
              const date = new Date(a.date);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="scheduled">Programadas</option>
              <option value="confirmed">Confirmadas</option>
              <option value="in-progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="no-show">No Asistió</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron citas
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-sm text-gray-600">{appointment.time} - {appointment.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                      <div className="text-sm text-gray-600">{appointment.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{getTypeLabel(appointment.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appointment.practitioner.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Confirmar
                          </button>
                        )}
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'cancelled', 'Cancelada por el usuario')}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver
                        </Link>
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
