---
name: senior-frontend
description: Frontend expert for React 19 + Vite 7 + TailwindCSS v4 + TypeScript. Covers feature-based architecture, design system, hooks patterns, performance, and code quality. Use proactively for any frontend work in this project.
---

# Senior Frontend — Vision Kit

Expert en el stack frontend de este proyecto. Conoce la arquitectura, el design system y las convenciones establecidas.

## Stack — Lo que se usa y lo que NO

| ✅ Usa | ❌ No usa |
|--------|----------|
| React 19 | Next.js / SSR / Server Components |
| Vite 7 (SPA) | Webpack / Create React App |
| TailwindCSS v4 | TailwindCSS v3 (sintaxis diferente) |
| React Router DOM v7 | TanStack Router |
| CSS variables para temas | Styled Components / CSS Modules |
| Context API + hooks | Redux / Zustand / Jotai |
| `React.lazy` + `Suspense` | Loadable Components |

---

## Arquitectura feature-based

Cada feature vive en `apps/frontend/src/features/<nombre>/` con esta estructura:

```
<feature>/
├── components/    ← Solo JSX + lógica de presentación
├── hooks/         ← Estado + efectos + llamadas al service
├── services/      ← Funciones HTTP que llaman al backend
├── types/         ← Interfaces TypeScript del dominio
└── index.ts       ← Solo exporta lo público del módulo
```

**Regla crítica:** Los componentes nunca llaman al service directamente — siempre usan el hook. Los hooks encapsulan toda la lógica de estado y efectos.

```typescript
// ✅ Correcto
const { patients, loading, deletePatient } = usePatients();

// ❌ Incorrecto
const [patients, setPatients] = useState([]);
useEffect(() => { patientService.getAll().then(setPatients); }, []);
```

**Features existentes:** `auth`, `patients`, `medical-records`, `clinical-exams`, `appointments`, `inventory`, `sales`, `users`, `settings`, `layout`

---

## Design System — Componentes disponibles

Todos en `apps/frontend/src/components/ui/`. **Siempre usar estos antes de crear nuevos.**

### Button
```tsx
// Variantes disponibles
<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="outline">Ver detalle</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="warning">Advertencia</Button>
<Button isLoading={saving}>Guardando...</Button>
```

### ConfirmModal — Para TODA acción destructiva
```tsx
<ConfirmModal
  isOpen={!!deleteId}
  title="Eliminar paciente"
  message="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  variant="danger"          // 'danger' | 'warning' | 'default'
  isLoading={isDeleting}
  onConfirm={handleDelete}
  onCancel={() => setDeleteId(null)}
/>
```
**Nunca usar `window.confirm()` ni confirmación inline en filas.**

### Skeleton — Para estados de carga de páginas
```tsx
// Usar la variante que corresponda al contenido
<SkeletonPageWithStats statCount={4} />   // Página con stat cards
<SkeletonDetailCard />                     // Página de detalle (ver)
<SkeletonFormCard />                       // Página de formulario (crear/editar)
<SkeletonTableRows rows={8} />            // Solo tabla
```
**Nunca usar `animate-spin` en páginas completas.** Los spinners solo para acciones inline (botón loading, búsqueda en input).

### StatCard, Table, Badge, Input, Card
```tsx
import { Button, Input, StatCard, Table, TableHeader, TableBody,
         TableRow, TableHead, TableCell, TableEmpty,
         Badge, Card, Skeleton, ConfirmModal } from '../../../components/ui';
```

---

## Sistema de temas — CSS Variables

El proyecto tiene dark/light theme via CSS variables. **Nunca usar colores de Tailwind directamente** en elementos que deben responder al tema.

```css
/* ✅ Correcto — responde al tema */
className="text-theme-dark-primary border-theme-primary bg-theme-light-primary"
className="text-theme-secondary-text border-theme-divider"

/* ❌ Incorrecto — hardcoded, rompe el tema */
className="text-gray-900 border-blue-500 bg-blue-50"
```

**Variables disponibles:**
- `theme-primary` — color principal de acento
- `theme-dark-primary` — texto oscuro primario
- `theme-light-primary` — fondo claro de acento
- `theme-secondary-text` — texto secundario
- `theme-divider` — bordes/divisores
- `theme-accent` — color de acento secundario
- `theme-text-icons` — iconos y texto sobre fondo primario

**Spinners:** `border-4 border-theme-primary border-t-transparent` (grandes) / `border-2 border-theme-primary border-t-transparent` (pequeños)

---

## TailwindCSS v4 — Diferencias clave

```css
/* v4: CSS-first, las utilidades están en @layer */
@import "tailwindcss";

/* v4: Custom theme via CSS variables, no tailwind.config.js */
@theme {
  --color-primary: oklch(0.5 0.2 250);
}

/* v4: Variantes de hover/focus con / como separador */
className="bg-theme-primary/20 hover:bg-theme-primary/40"
```

**No existe `purge` config en v4.** El tree-shaking es automático.

---

## React 19 — Patrones importantes

### useTransition para operaciones lentas
```tsx
const [isPending, startTransition] = useTransition();

const handleSearch = (query: string) => {
  startTransition(() => {
    setFilteredItems(items.filter(i => i.name.includes(query)));
  });
};
```

### React.lazy + Suspense — Ya configurado en routes/index.tsx
```tsx
// ✅ Patrón establecido — seguirlo para cualquier nueva página
const NewPage = lazy(() => import('../pages/feature/NewPage').then(m => ({ default: m.NewPage })));
```

### useCallback/useMemo — Solo cuando hay problema real de perf
```tsx
// Solo memoizar handlers que se pasan a listas grandes o efectos
const handleDelete = useCallback(async (id: string) => {
  await service.delete(id);
}, []); // deps vacías = función estable
```

---

## TypeScript — Convenciones del proyecto

```typescript
// ✅ Interfaces para tipos de dominio (en types/index.ts del feature)
export interface Patient {
  id: string;
  name: string;
  email?: string;        // opcional con ?
  dateOfBirth: string;  // ISO string, no Date
}

// ✅ Tipos para uniones y utilidades
export type PatientStatus = 'active' | 'inactive' | 'archived';

// ✅ Respuesta de API siempre tipada
const response = await api.get<Patient[]>('/patients');

// ❌ Nunca usar any
// ❌ No crear tipos en el componente — van en types/index.ts
```

---

## Rutas — React Router DOM v7

```tsx
import { useNavigate, useParams, Link } from 'react-router-dom';

// Navegar programáticamente
const navigate = useNavigate();
navigate(`/patients/${id}`);
navigate(-1); // back

// Parámetros de URL
const { id } = useParams<{ id: string }>();
```

---

## Cliente HTTP — api.ts

```typescript
// apps/frontend/src/lib/api.ts — cliente con JWT automático
import { api } from '../../../lib/api';

// GET con query params
const patients = await api.get<Patient[]>('/patients', { params: { search: query } });

// POST
const created = await api.post<Patient>('/patients', data);

// PATCH
const updated = await api.patch<Patient>(`/patients/${id}`, data);

// DELETE
await api.delete(`/patients/${id}`);
```

---

## Snackbar — Notificaciones al usuario

```tsx
import { useSnackbar } from '../../../components/Snackbar';

const { showSnackbar } = useSnackbar();

showSnackbar('Paciente guardado exitosamente', 'success');
showSnackbar('Error al guardar el paciente', 'error');
showSnackbar('Cambios pendientes de guardado', 'warning');
showSnackbar('Información actualizada', 'info');
```

---

## Patrones de páginas

### Página de lista (con stats + tabla)
```tsx
export const MyListPage = () => {
  const { items, loading, error, deleteItem } = useMyFeature();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  if (loading && items.length === 0) return <SkeletonPageWithStats statCount={3} />;
  if (error) return <div className="text-red-500">{error}</div>;

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteItem(deleteId);
      setDeleteId(null);
      showSnackbar('Eliminado exitosamente', 'success');
    } catch {
      showSnackbar('Error al eliminar', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* stats, tabla... */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Confirmar eliminación"
        message="¿Seguro que deseas eliminar este elemento?"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
```

### Página de formulario (crear/editar)
```tsx
export const MyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createItem, updateItem, getById, loading } = useMyFeature();

  if (loading) return <SkeletonFormCard />;

  const handleSubmit = async (data: MyFormData) => {
    try {
      if (isEdit) await updateItem(id!, data);
      else await createItem(data);
      navigate(-1);
    } catch (err) {
      // error handling
    }
  };
  // ...
};
```

---

## Code Review Checklist

- [ ] Componentes usan hooks, no llaman al service directamente
- [ ] Acción destructiva usa `ConfirmModal`, no `window.confirm`
- [ ] Estado de carga de página usa skeleton, no spinner genérico
- [ ] Colores de UI usan variables de tema, no clases de Tailwind hardcoded
- [ ] Spinner usa `border-theme-primary border-t-transparent`
- [ ] Tipos del dominio están en `types/index.ts` del feature
- [ ] No hay `any` en TypeScript
- [ ] Nueva página está en `routes/index.tsx` con `React.lazy`
- [ ] Notificaciones de éxito/error usan `useSnackbar`
- [ ] Export público del feature actualizado en `index.ts`
