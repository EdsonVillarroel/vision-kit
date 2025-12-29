import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinicalExams } from '../hooks/useClinicalExams';
import { Button, Input, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui';

export const ClinicalExamsList = () => {
  const { exams, loading, error, searchExams, fetchExams, deleteExam } = useClinicalExams();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchExams(searchQuery);
    } else {
      await fetchExams();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme-primary border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExams = exams.filter(e => e.date.startsWith(thisMonth));
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisWeekExams = exams.filter(e => new Date(e.date) >= thisWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-theme-dark-primary">Exámenes Clínicos</h1>
          <p className="text-theme-secondary-text mt-2">Registro de exámenes visuales</p>
        </div>
        <Link to="/clinical-exams/new">
          <Button>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Examen
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Exámenes"
          value={exams.length}
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Este Mes"
          value={thisMonthExams.length}
          variant="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Esta Semana"
          value={thisWeekExams.length}
          variant="success"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Promedio Mensual"
          value={Math.round(exams.length / 12)}
          variant="info"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-white to-theme-light-primary/10 rounded-2xl shadow-lg p-6 border border-theme-divider/20">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por N° de boleta o paciente..."
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
                fetchExams();
              }}
            >
              Limpiar
            </Button>
          )}
        </form>
      </div>

      {/* Exams Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>N° Boleta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>OD Esfera</TableHead>
            <TableHead>OI Esfera</TableHead>
            <TableHead>Examinador</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {exams.length === 0 ? (
            <TableEmpty colSpan={7} message="No se encontraron exámenes clínicos" />
          ) : (
            exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>
                  <span className="font-mono font-semibold text-theme-primary">
                    {exam.examNumber}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(exam.date).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{exam.patientName}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-theme-secondary-text">
                    {exam.farVision.right.sphere > 0 ? '+' : ''}{exam.farVision.right.sphere.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-theme-secondary-text">
                    {exam.farVision.left.sphere > 0 ? '+' : ''}{exam.farVision.left.sphere.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  {exam.examinerName}
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/clinical-exams/${exam.id}`}
                      className="text-theme-primary hover:text-theme-dark-primary font-semibold transition-colors duration-300"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/clinical-exams/${exam.id}/edit`}
                      className="text-theme-accent hover:text-theme-primary font-semibold transition-colors duration-300"
                    >
                      Editar
                    </Link>
                    {deleteConfirm === exam.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          onClick={() => handleDelete(exam.id)}
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
                        onClick={() => setDeleteConfirm(exam.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-300"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
