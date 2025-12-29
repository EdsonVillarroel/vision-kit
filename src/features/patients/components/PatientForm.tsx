import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { Patient, PatientFormData } from '../types';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => Promise<Patient | void>;
  isEditing?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientFormData>({
    identificationId: patient?.identificationId || '',
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || 'male',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    city: patient?.city || '',
    state: patient?.state || '',
    zipCode: patient?.zipCode || '',
    insurance: patient?.insurance || undefined,
    emergencyContact: patient?.emergencyContact || {
      name: '',
      relationship: '',
      phone: ''
    },
    allergies: patient?.allergies || [],
    medicalConditions: patient?.medicalConditions || [],
    notes: patient?.notes || '',
    warningReason: patient?.warningReason || ''
  });

  const [hasInsurance, setHasInsurance] = useState(!!patient?.insurance);
  const [allergiesText, setAllergiesText] = useState(patient?.allergies?.join(', ') || '');
  const [conditionsText, setConditionsText] = useState(patient?.medicalConditions?.join(', ') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('insurance.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance!,
          [field]: value
        }
      }));
    } else if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData: PatientFormData = {
        ...formData,
        insurance: hasInsurance ? formData.insurance : undefined,
        allergies: allergiesText ? allergiesText.split(',').map(a => a.trim()).filter(Boolean) : [],
        medicalConditions: conditionsText ? conditionsText.split(',').map(c => c.trim()).filter(Boolean) : []
      };

      await onSubmit(submitData);
      navigate('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Género *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text"
              required
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Teléfono"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Input
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <Input
            label="Pais/Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <Input
            label="Código Postal"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Seguro Médico */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Seguro Médico</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasInsurance}
              onChange={(e) => {
                setHasInsurance(e.target.checked);
                if (!e.target.checked) {
                  setFormData(prev => ({ ...prev, insurance: undefined }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    insurance: { provider: '', policyNumber: '', groupNumber: '' }
                  }));
                }
              }}
              className="w-5 h-5 rounded-md accent-theme-primary cursor-pointer"
            />
            <span className="text-sm text-theme-primary-text">¿Tiene seguro médico?</span>
          </label>
        </div>
        {hasInsurance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Proveedor"
              name="insurance.provider"
              value={formData.insurance?.provider || ''}
              onChange={handleChange}
              required={hasInsurance}
            />
            <Input
              label="Número de Póliza"
              name="insurance.policyNumber"
              value={formData.insurance?.policyNumber || ''}
              onChange={handleChange}
              required={hasInsurance}
            />
            <Input
              label="Número de Grupo"
              name="insurance.groupNumber"
              value={formData.insurance?.groupNumber || ''}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      {/* Contacto de Emergencia */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Contacto de Emergencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombre"
            name="emergencyContact.name"
            value={formData.emergencyContact.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Relación"
            name="emergencyContact.relationship"
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            placeholder="Ej: Esposo, Hermana, Padre"
            required
          />
          <Input
            label="Teléfono"
            type="tel"
            name="emergencyContact.phone"
            value={formData.emergencyContact.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Información Médica */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Información Médica</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Alergias
            </label>
            <textarea
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="Separar por comas (ej: Penicilina, Aspirina)"
              className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text placeholder:text-theme-secondary-text min-h-[80px] resize-y"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Condiciones Médicas
            </label>
            <textarea
              value={conditionsText}
              onChange={(e) => setConditionsText(e.target.value)}
              placeholder="Separar por comas (ej: Diabetes, Hipertensión)"
              className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text placeholder:text-theme-secondary-text min-h-[80px] resize-y"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/patients')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar Paciente' : 'Crear Paciente'}
        </Button>
      </div>
    </form>
  );
};
