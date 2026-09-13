import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { Button } from '../../../components/ui/Button';
import type { ExamType } from '../types';

export const MedicalRecordsList = () => {
  const { records, loading, error } = useMedicalRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<ExamType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState('');

  const getExamTypeLabel = (type: ExamType) => {
    const labels: Record<ExamType, string> = {
      routine: 'Examen de Rutina',
      emergency: 'Emergencia',
      followup: 'Seguimiento',
      'contact-lens': 'Lentes de Contacto'
    };
    return labels[type];
  };

  const getExamTypeColor = (type: ExamType) => {
    const colors: Record<ExamType, string> = {
      routine: 'bg-blue-100 text-blue-800',
      emergency: 'bg-red-100 text-red-800',
      followup: 'bg-green-100 text-green-800',
      'contact-lens': 'bg-purple-100 text-purple-800'
    };
    return colors[type];
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchQuery === '' ||
      record.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = examTypeFilter === 'all' || record.examType === examTypeFilter;
    const matchesDate = selectedDate === '' || record.date === selectedDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const thisMonthRecords = records.filter(record => {
    const date = new Date(record.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  if (loading && records.length === 0) {
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
          <h1 className="text-3xl font-bold text-theme-dark-primary tracking-tight">Historia clínica</h1>
          <p className="text-theme-secondary-text mt-1">Registros médicos y exámenes oftalmológicos</p>
        </div>
        <Link to="/medical-records/new" className="shrink-0">
          <Button className="!w-auto px-5">Nuevo examen</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 ring-1 ring-inset ring-red-600/20 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Total de exámenes</p>
          <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{records.length}</p>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Este mes</p>
          <p className="text-3xl font-bold tnum tracking-tight text-theme-primary-text">{thisMonthRecords.length}</p>
        </div>
        <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-sm font-medium text-theme-secondary-text mb-2">Exámenes de rutina</p>
          <p className="text-3xl font-bold tnum tracking-tight text-theme-primary">
            {records.filter(r => r.examType === 'routine').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Buscar paciente
            </label>
            <input
              type="text"
              placeholder="ID del paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25 placeholder:text-theme-secondary-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Tipo de examen
            </label>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value as ExamType | 'all')}
              className="w-full px-4 py-2 border border-theme-divider rounded-lg outline-none transition-[border-color,box-shadow] duration-150 focus:border-theme-primary focus-visible:ring-2 focus-visible:ring-theme-primary/25"
            >
              <option value="all">Todos los tipos</option>
              <option value="routine">Examen de Rutina</option>
              <option value="emergency">Emergencia</option>
              <option value="followup">Seguimiento</option>
              <option value="contact-lens">Lentes de Contacto</option>
            </select>
          </div>
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
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white ring-1 ring-black/[0.06] rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="divide-y divide-black/[0.05]">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-full bg-theme-light-primary/40 flex items-center justify-center mb-3 text-theme-secondary-text">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-theme-secondary-text">No se encontraron registros médicos</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="p-6 hover:bg-theme-light-primary/20 transition-colors duration-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-base font-semibold text-theme-dark-primary">
                        Paciente ID: {record.patientId}
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getExamTypeColor(record.examType)}`}>
                        {getExamTypeLabel(record.examType)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-theme-secondary-text">Fecha</p>
                        <p className="font-medium text-theme-primary-text tnum">
                          {new Date(record.date).toLocaleDateString('es-BO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-theme-secondary-text">OD Esfera</p>
                        <p className="font-medium text-theme-primary-text tnum">
                          {record.refraction.right.sphere >= 0 ? '+' : ''}
                          {record.refraction.right.sphere.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-theme-secondary-text">OI Esfera</p>
                        <p className="font-medium text-theme-primary-text tnum">
                          {record.refraction.left.sphere >= 0 ? '+' : ''}
                          {record.refraction.left.sphere.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-theme-secondary-text">Profesional</p>
                        <p className="font-medium text-theme-primary-text truncate">{record.practitioner.name}</p>
                      </div>
                      <div>
                        <p className="text-theme-secondary-text">Diagnóstico</p>
                        <p className="font-medium text-theme-primary-text truncate">
                          {record.diagnosis?.[0] || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/medical-records/${record.id}`}
                    className="shrink-0 text-theme-primary hover:text-theme-dark-primary ml-4 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded px-1"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
