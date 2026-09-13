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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-theme-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-dark-primary tracking-tight">Citas</h1>
          <p className="text-theme-secondary-text mt-1">Gestión de citas y calendario</p>
        </div>
        <Link to="/appointments/new" className="shrink-0">
          <Button className="!w-auto px-5">Nueva cita</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 ring-1 ring-inset ring-red-600/20 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Citas de hoy</p>
          <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{todayAppointments.length}</p>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Confirmadas</p>
          <p className="text-3xl font-bold tnum tracking-tight text-green-600">
            {appointments.filter(a => a.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Pendientes</p>
          <p className="text-3xl font-bold tnum tracking-tight text-amber-600">
            {appointments.filter(a => a.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Completadas este mes</p>
          <p className="text-3xl font-bold tnum tracking-tight text-theme-primary">
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
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="w-full px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
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
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-light-primary/20 border-b border-black/[0.06]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Fecha/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Profesional</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-theme-secondary-text uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-theme-light-primary/40 flex items-center justify-center text-theme-secondary-text">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-theme-secondary-text">No se encontraron citas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-theme-light-primary/20 transition-colors duration-100">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-theme-primary-text tnum">
                        {new Date(appointment.date).toLocaleDateString('es-BO')}
                      </div>
                      <div className="text-sm text-theme-secondary-text tnum">{appointment.time} - {appointment.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-theme-primary-text">{appointment.patientName}</div>
                      <div className="text-sm text-theme-secondary-text">{appointment.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-primary-text">{getTypeLabel(appointment.type)}</td>
                    <td className="px-6 py-4 text-sm text-theme-secondary-text">{appointment.practitioner.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded px-1"
                          >
                            Confirmar
                          </button>
                        )}
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'cancelled', 'Cancelada por el usuario')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded px-1"
                          >
                            Cancelar
                          </button>
                        )}
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="text-theme-primary hover:text-theme-dark-primary text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded px-1"
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
