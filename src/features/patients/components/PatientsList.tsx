import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatCard } from '../../../components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { PatientStatusBadge } from './PatientStatusBadge';

export const PatientsList = () => {
  const { patients, loading, error, searchPatients, fetchPatients, deletePatient } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchPatients(searchQuery);
    } else {
      await fetchPatients();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme-primary border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-theme-dark-primary">Pacientes</h1>
          <p className="text-theme-secondary-text mt-2">Gestión de información de pacientes</p>
        </div>
        <Link to="/patients/new">
          <Button>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-red-400/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-lg p-6 border border-theme-divider/20">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, cédula, teléfono o email..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                fetchPatients();
              }}
            >
              Limpiar
            </Button>
          )}
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pacientes"
          value={patients.length}
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Clientes Frecuentes"
          value={patients.filter(p => p.status === 'frequent').length}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatCard
          title="Con Alertas"
          value={patients.filter(p => p.status === 'warning').length}
          variant="warning"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="Visitas Este Mes"
          value={patients.filter(p => {
            if (!p.lastVisit) return false;
            const lastVisit = new Date(p.lastVisit);
            const now = new Date();
            return lastVisit.getMonth() === now.getMonth() &&
                   lastVisit.getFullYear() === now.getFullYear();
          }).length}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Patients Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Paciente</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Visitas/Gastado</TableHead>
            <TableHead>Última Visita</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableEmpty colSpan={7} message="No se encontraron pacientes" />
          ) : (
            patients.map((patient) => {
              const rowVariant = patient.status === 'frequent'
                ? 'success'
                : patient.status === 'warning'
                ? 'warning'
                : 'default';

              return (
                <TableRow key={patient.id} variant={rowVariant}>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-theme-dark-primary">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-xs text-theme-secondary-text">
                        {calculateAge(patient.dateOfBirth)} años • {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono font-medium">
                      {patient.identificationId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PatientStatusBadge status={patient.status} size="sm" />
                    {patient.status === 'warning' && patient.warningReason && (
                      <div className="mt-1 text-xs text-yellow-700 max-w-xs truncate" title={patient.warningReason}>
                        {patient.warningReason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{patient.phone}</div>
                    <div className="text-xs text-theme-secondary-text">{patient.email || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{patient.visitCount} visitas</div>
                    <div className="text-xs text-theme-secondary-text">${patient.totalSpent.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-ES') : 'Sin visitas'}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-theme-primary hover:text-theme-dark-primary font-semibold transition-colors duration-300"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/patients/${patient.id}/edit`}
                        className="text-theme-accent hover:text-theme-primary font-semibold transition-colors duration-300"
                      >
                        Editar
                      </Link>
                      {deleteConfirm === patient.id ? (
                        <span className="inline-flex gap-2">
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-300"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-theme-secondary-text hover:text-theme-primary-text font-semibold transition-colors duration-300"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(patient.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
