import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { useMedicalRecords } from '../../medical-records/hooks/useMedicalRecords';
import type { AppointmentStatus } from '../types';

export const AppointmentCalendarView = () => {
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { records, loading: recordsLoading } = useMedicalRecords();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Filter appointments for selected date
  const dateAppointments = appointments.filter(apt => apt.date === selectedDate);

  // Filter medical records for selected date
  const dateMedicalRecords = records.filter(record => record.date === selectedDate);

  // Get unique patient IDs from appointments
  const appointmentPatientIds = new Set(dateAppointments.map(apt => apt.patientId));

  // Get unique patient IDs from medical records
  const recordPatientIds = new Set(dateMedicalRecords.map(rec => rec.patientId));

  // Get patients who had both appointments and exams
  const patientsWithBoth = Array.from(appointmentPatientIds).filter(id => recordPatientIds.has(id));

  const loading = appointmentsLoading || recordsLoading;

  if (loading && appointments.length === 0 && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Calendario de Actividad</h2>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Citas del Día</p>
            <p className="text-2xl font-bold text-blue-900">{dateAppointments.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Exámenes Realizados</p>
            <p className="text-2xl font-bold text-green-900">{dateMedicalRecords.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Pacientes Atendidos</p>
            <p className="text-2xl font-bold text-purple-900">{patientsWithBoth.length}</p>
          </div>
        </div>

        {/* Content for selected date */}
        {dateAppointments.length === 0 && dateMedicalRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay citas ni exámenes registrados para esta fecha
          </div>
        ) : (
          <div className="space-y-6">
            {/* Appointments Section */}
            {dateAppointments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Citas Programadas ({dateAppointments.length})
                </h3>
                <div className="space-y-3">
                  {dateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
                              {appointment.time}
                            </span>
                            <span className="text-gray-600">
                              {appointment.patientName}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Profesional: {appointment.practitioner.name}
                          </p>
                        </div>
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Records Section */}
            {dateMedicalRecords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Exámenes Realizados ({dateMedicalRecords.length})
                </h3>
                <div className="space-y-3">
                  {dateMedicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
                              Paciente ID: {record.patientId}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {record.examType === 'routine' ? 'Examen de Rutina' : record.examType}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="mr-4">
                              OD: {record.refraction.right.sphere >= 0 ? '+' : ''}
                              {record.refraction.right.sphere.toFixed(2)}
                            </span>
                            <span>
                              OI: {record.refraction.left.sphere >= 0 ? '+' : ''}
                              {record.refraction.left.sphere.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Profesional: {record.practitioner.name}
                          </p>
                        </div>
                        <Link
                          to={`/medical-records/${record.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patients with both appointments and exams */}
            {patientsWithBoth.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  ✓ Pacientes que asistieron a su cita y completaron examen
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patientsWithBoth.map((patientId) => (
                    <Link
                      key={patientId}
                      to={`/patients/${patientId}`}
                      className="px-3 py-1 bg-white border border-green-300 text-green-800 rounded-full text-sm hover:bg-green-100 transition-colors"
                    >
                      ID: {patientId}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
