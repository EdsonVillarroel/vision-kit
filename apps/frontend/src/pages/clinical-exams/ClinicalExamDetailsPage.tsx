import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clinicalExamService } from '../../features/clinical-exams/services/clinicalExamService';
import type { ClinicalExam } from '../../features/clinical-exams/types';
import { Button, Card } from '../../components/ui';

export const ClinicalExamDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ClinicalExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clinicalExamService.getById(id);
        setExam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar examen');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme-primary border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-xl border border-red-400/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error || 'Examen no encontrado'}</span>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-theme-dark-primary">Examen Clínico</h1>
          <p className="text-theme-secondary-text mt-2">N° Boleta: {exam.examNumber}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/clinical-exams/${exam.id}/edit`}>
            <Button variant="secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => navigate('/clinical-exams')}>
            Volver
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <Card>
          <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Paciente</p>
              <p className="text-theme-primary-text text-lg font-semibold">{exam.patientName}</p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Fecha</p>
              <p className="text-theme-primary-text text-lg font-semibold">
                {new Date(exam.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Examinador</p>
              <p className="text-theme-primary-text text-lg font-semibold">{exam.examinerName}</p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">N° de Boleta</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">{exam.examNumber}</p>
            </div>
          </div>
        </Card>

        {/* Visión de Lejos */}
        <Card>
          <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Visión de Lejos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-theme-divider">
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Ojo</th>
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Esférico</th>
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Cilíndrico</th>
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Eje</th>
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Prisma</th>
                  <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Base</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-theme-divider">
                  <td className="py-4 px-4 font-semibold text-theme-primary">Derecho</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.right.sphere)}</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.right.cylinder)}</td>
                  <td className="py-4 px-4 font-mono">{exam.farVision.right.axis}°</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.right.prism)}</td>
                  <td className="py-4 px-4">{exam.farVision.right.base || '-'}</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-theme-primary">Izquierdo</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.left.sphere)}</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.left.cylinder)}</td>
                  <td className="py-4 px-4 font-mono">{exam.farVision.left.axis}°</td>
                  <td className="py-4 px-4 font-mono">{formatValue(exam.farVision.left.prism)}</td>
                  <td className="py-4 px-4">{exam.farVision.left.base || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Visión de Cerca */}
        {exam.nearVision && (
          <Card>
            <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Visión de Cerca</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-theme-divider">
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Ojo</th>
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Esférico</th>
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Cilíndrico</th>
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Eje</th>
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Prisma</th>
                    <th className="text-left py-3 px-4 text-theme-secondary-text font-semibold">Base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-theme-divider">
                    <td className="py-4 px-4 font-semibold text-theme-primary">Derecho</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.right.sphere)}</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.right.cylinder)}</td>
                    <td className="py-4 px-4 font-mono">{exam.nearVision.right.axis}°</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.right.prism)}</td>
                    <td className="py-4 px-4">{exam.nearVision.right.base || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-theme-primary">Izquierdo</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.left.sphere)}</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.left.cylinder)}</td>
                    <td className="py-4 px-4 font-mono">{exam.nearVision.left.axis}°</td>
                    <td className="py-4 px-4 font-mono">{formatValue(exam.nearVision.left.prism)}</td>
                    <td className="py-4 px-4">{exam.nearVision.left.base || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Distancias Pupilares */}
        <Card>
          <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Distancias Pupilares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Distancia Derecha</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">
                {exam.pupillaryDistance.right.toFixed(2)} mm
              </p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Distancia Izquierda</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">
                {exam.pupillaryDistance.left.toFixed(2)} mm
              </p>
            </div>
          </div>
        </Card>

        {/* Medidas del Armazón */}
        <Card>
          <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Medidas del Armazón</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Altura</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">
                {exam.frameMeasurements.height.toFixed(2)} mm
              </p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Derecha</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">
                {exam.frameMeasurements.right.toFixed(2)} mm
              </p>
            </div>
            <div>
              <p className="text-theme-secondary-text font-medium mb-1">Izquierda</p>
              <p className="text-theme-primary-text text-lg font-semibold font-mono">
                {exam.frameMeasurements.left.toFixed(2)} mm
              </p>
            </div>
          </div>
        </Card>

        {/* Observaciones */}
        {exam.observations && (
          <Card>
            <h2 className="text-2xl font-bold text-theme-dark-primary mb-6">Observaciones</h2>
            <p className="text-theme-primary-text whitespace-pre-wrap">{exam.observations}</p>
          </Card>
        )}
      </div>
    </div>
  );
};
