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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historia Clínica</h1>
          <p className="text-gray-600 mt-2">Registros médicos y exámenes oftalmológicos</p>
        </div>
        <Link to="/medical-records/new">
          <Button>
            ➕ Nuevo Examen
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Exámenes</p>
          <p className="text-3xl font-bold text-gray-900">{records.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Este Mes</p>
          <p className="text-3xl font-bold text-gray-900">{thisMonthRecords.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Exámenes de Rutina</p>
          <p className="text-3xl font-bold text-blue-600">
            {records.filter(r => r.examType === 'routine').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Paciente
            </label>
            <input
              type="text"
              placeholder="ID del paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Examen
            </label>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value as ExamType | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="routine">Examen de Rutina</option>
              <option value="emergency">Emergencia</option>
              <option value="followup">Seguimiento</option>
              <option value="contact-lens">Lentes de Contacto</option>
            </select>
          </div>
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
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No se encontraron registros médicos
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Paciente ID: {record.patientId}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getExamTypeColor(record.examType)}`}>
                        {getExamTypeLabel(record.examType)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Fecha</p>
                        <p className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">OD Esfera</p>
                        <p className="font-medium text-gray-900">
                          {record.refraction.right.sphere >= 0 ? '+' : ''}
                          {record.refraction.right.sphere.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">OI Esfera</p>
                        <p className="font-medium text-gray-900">
                          {record.refraction.left.sphere >= 0 ? '+' : ''}
                          {record.refraction.left.sphere.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Profesional</p>
                        <p className="font-medium text-gray-900">{record.practitioner.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Diagnóstico</p>
                        <p className="font-medium text-gray-900">
                          {record.diagnosis?.[0] || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/medical-records/${record.id}`}
                    className="text-blue-600 hover:text-blue-800 ml-4 text-sm font-medium"
                  >
                    Ver Detalles →
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
