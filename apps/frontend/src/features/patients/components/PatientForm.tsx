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

  const [formData, setFormData] = useState<PatientFormData>({
    identificationId: patient?.identificationId || '',
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender,
    phone: patient?.phone || '',
    email: patient?.email || '',
    emergencyContact: patient?.emergencyContact || {
      name: '',
      relationship: '',
      phone: ''
    },
    allergies: patient?.allergies || [],
    medicalConditions: patient?.medicalConditions || [],
    notes: patient?.notes || ''
    // warningReason NO se envía en alta/edición: es un campo de estado que se
    // gestiona por separado (PATCH). El backend rechaza props fuera del DTO.
  });

  const [allergiesText, setAllergiesText] = useState(patient?.allergies?.join(', ') || '');
  const [conditionsText, setConditionsText] = useState(patient?.medicalConditions?.join(', ') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
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

    try {
      const ec = formData.emergencyContact;
      const hasEmergencyContact = !!ec && [ec.name, ec.relationship, ec.phone].some((v) => v?.trim());

      const submitData: PatientFormData = {
        ...formData,
        // Campos con validadores de formato: cadena vacia -> undefined
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        emergencyContact: hasEmergencyContact ? ec : undefined,
        allergies: allergiesText ? allergiesText.split(',').map(a => a.trim()).filter(Boolean) : [],
        medicalConditions: conditionsText ? conditionsText.split(',').map(c => c.trim()).filter(Boolean) : []
      };

      await onSubmit(submitData);
      navigate('/patients');
    } catch {
      // El error de la API se muestra como snackbar desde el hook; se mantiene
      // al usuario en el formulario sin navegar.
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
          <p className="text-sm text-gray-500 mt-1">Solo el nombre y apellido son obligatorios.</p>
        </div>
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
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-theme-primary-text mb-2">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-theme-light-primary/30 border-0 border-b-2 border-theme-divider rounded-t-lg focus:border-b-theme-primary focus:bg-theme-light-primary/40 hover:bg-theme-light-primary/40 transition-all duration-300 outline-none text-theme-primary-text"
            >
              <option value="">Sin especificar</option>
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
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Contacto de Emergencia</h2>
          <p className="text-sm text-gray-500 mt-1">Opcional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombre"
            name="emergencyContact.name"
            value={formData.emergencyContact?.name || ''}
            onChange={handleChange}
          />
          <Input
            label="Relación"
            name="emergencyContact.relationship"
            value={formData.emergencyContact?.relationship || ''}
            onChange={handleChange}
            placeholder="Ej: Esposo, Hermana, Padre"
          />
          <Input
            label="Teléfono"
            type="tel"
            name="emergencyContact.phone"
            value={formData.emergencyContact?.phone || ''}
            onChange={handleChange}
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
