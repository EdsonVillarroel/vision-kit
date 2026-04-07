# React 19 Patterns — Vision Kit

Patrones de React específicos para este proyecto (SPA con React Router DOM v7, sin SSR).

---

## Custom Hooks — El patrón central del proyecto

Cada feature tiene su hook en `hooks/`. Este es el contrato:

```typescript
// hooks/usePatients.tsx
export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      setError('Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const deletePatient = async (id: string) => {
    await patientService.delete(id);
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  return { patients, loading, error, fetchPatients, deletePatient };
};
```

**Regla:** Si el hook devuelve más de 8 valores, dividirlo en hooks más específicos.

---

## Context API — Solo para estado verdaderamente global

En este proyecto solo hay dos contextos:
- `AuthContext` — usuario autenticado, JWT, `updateUser()`
- `ThemeContext` — dark/light toggle
- `SnackbarContext` — notificaciones globales

```typescript
// ✅ Correcto — consumir con hook específico
const { user, updateUser } = useAuth();
const { showSnackbar } = useSnackbar();

// ❌ Incorrecto — no crear contextos para estado local de un feature
```

---

## Estado local vs Estado en hook

```typescript
// Estado LOCAL del componente (UI state)
const [isOpen, setIsOpen] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Estado en HOOK (domain/server state)
const { patients, loading, error } = usePatients();

// Regla: si otro componente necesita el estado → moverlo al hook
// Regla: si es solo UI (modal abierto, hover, etc.) → useState local
```

---

## Manejo de efectos secundarios

```typescript
// ✅ fetchData en useCallback para estabilidad
const fetchData = useCallback(async () => {
  // ...
}, [dependency1, dependency2]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Cleanup para subscriptions/timers
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), 400);
  return () => clearTimeout(timer);
}, [value]);

// ❌ No crear funciones async directamente en useEffect
useEffect(async () => { /* INCORRECTO */ }, []);
// ✅ Correcto
useEffect(() => { fetchData(); }, [fetchData]);
```

---

## Lazy loading y Suspense

Ya configurado en `routes/index.tsx`. Para nuevas páginas:

```typescript
// routes/index.tsx — agregar nueva página así:
const NewFeaturePage = lazy(() =>
  import('../pages/feature/NewFeaturePage').then(m => ({ default: m.NewFeaturePage }))
);

// El PageLoader en el Suspense ya maneja el fallback
```

---

## Optimistic updates — Para mejor UX

```typescript
const deletePatient = async (id: string) => {
  // Actualizar UI inmediatamente
  setPatients(prev => prev.filter(p => p.id !== id));
  try {
    await patientService.delete(id);
  } catch {
    // Revertir si falla
    fetchPatients();
    showSnackbar('Error al eliminar', 'error');
  }
};
```

---

## useTransition — Para filtros y búsquedas costosas

```typescript
const [isPending, startTransition] = useTransition();
const [filter, setFilter] = useState('');

const handleFilterChange = (value: string) => {
  setFilter(value); // input responde inmediatamente
  startTransition(() => {
    setFilteredItems(items.filter(i => i.name.includes(value)));
  });
};

// isPending: true mientras la transición está en proceso
return <div className={isPending ? 'opacity-50' : ''}>{/* lista */}</div>;
```

---

## Formularios sin librería externa

Este proyecto no usa React Hook Form ni Formik. Patrón estándar:

```typescript
const [formData, setFormData] = useState<PatientFormData>({
  name: '',
  email: '',
  phone: '',
});
const [errors, setErrors] = useState<Partial<PatientFormData>>({});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (errors[name as keyof PatientFormData]) {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }
};

const validate = (): boolean => {
  const newErrors: Partial<PatientFormData> = {};
  if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
  if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email inválido';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  // ...
};
```

---

## Patrón de servicios — HTTP calls

```typescript
// services/patientService.ts
import { api } from '../../../lib/api';
import { Patient, CreatePatientDto } from '../types';

export const patientService = {
  getAll: (params?: { search?: string }) =>
    api.get<Patient[]>('/patients', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then(r => r.data),

  create: (data: CreatePatientDto) =>
    api.post<Patient>('/patients', data).then(r => r.data),

  update: (id: string, data: Partial<CreatePatientDto>) =>
    api.patch<Patient>(`/patients/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/patients/${id}`),
};
```

---

## Tipado de eventos

```typescript
// Inputs
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOption(e.target.value)}
onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}

// Forms
onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); }}

// Clicks con datos
onClick={() => handleDelete(item.id)}
onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
```

---

## Anti-patrones a evitar

```typescript
// ❌ useEffect innecesario para derivar estado
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
// ✅ Calcular directamente
const fullName = `${firstName} ${lastName}`;

// ❌ useState para datos derivados
const [totalAmount, setTotalAmount] = useState(0);
useEffect(() => setTotalAmount(items.reduce((s, i) => s + i.price, 0)), [items]);
// ✅ Calcular con useMemo (si es costoso) o directamente
const totalAmount = items.reduce((s, i) => s + i.price, 0);

// ❌ Prop drilling más de 2 niveles → mover al hook o contexto
// ❌ Componentes de más de 200 líneas → dividir en subcomponentes
// ❌ any en TypeScript → tipar correctamente
// ❌ window.confirm → usar ConfirmModal
// ❌ console.log en producción → eliminar antes de commit
```
