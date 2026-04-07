# Frontend Best Practices — Vision Kit

Buenas prácticas específicas para React 19 + Vite 7 + TailwindCSS v4.

---

## TailwindCSS v4 — Qué cambió respecto a v3

```css
/* v4: Import CSS-first, no tailwind.config.js requerido */
@import "tailwindcss";

/* v4: Definir custom theme via CSS */
@theme {
  --color-brand: oklch(0.5 0.2 250);
  --font-sans: 'Inter', sans-serif;
}

/* v4: Arbitrary values siguen igual */
className="w-[320px] top-[calc(100%-1rem)]"

/* v4: Opacity modifier con slash */
className="bg-blue-500/20 text-white/80"

/* v4: dark: prefix para modo oscuro */
className="bg-white dark:bg-gray-900"
```

**Lo que NO cambió:** Todas las utilidades de spacing, flexbox, grid, typography, etc. siguen igual.

---

## Variables CSS del proyecto — Tema

El archivo de tema define variables que responden a dark/light. Siempre preferir sobre colores de Tailwind:

```css
/* Definidas en apps/frontend/src/theme/themes.ts */
--theme-primary          /* Color principal del sistema */
--theme-dark-primary     /* Texto oscuro primario */
--theme-light-primary    /* Fondo claro de acento */
--theme-secondary-text   /* Texto secundario, placeholders */
--theme-divider          /* Bordes, separadores */
--theme-accent           /* Segundo color de acento */
--theme-text-icons       /* Texto/iconos sobre fondo primario */
--theme-bg               /* Fondo general de la app */
--theme-surface          /* Fondo de cards/panels */
```

Uso en Tailwind:
```tsx
className="text-theme-dark-primary bg-theme-surface border-theme-divider"
className="hover:text-theme-primary transition-colors duration-200"
```

---

## Performance — Lo que realmente importa en este proyecto

### Code splitting (ya implementado)
Todas las páginas son lazy. Para nuevas páginas, seguir el patrón en `routes/index.tsx`.

### Imágenes de productos
```tsx
// Lazy loading nativo para imágenes del catálogo
<img
  src={product.imageUrl}
  alt={product.name}
  loading="lazy"
  className="w-full h-48 object-cover rounded-lg"
/>

// Fallback si no hay imagen
<img
  src={product.imageUrl || '/placeholder-product.png'}
  onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
/>
```

### Debounce en búsquedas
```typescript
// Patrón ya usado en PatientSearch y CatalogPage
const [searchValue, setSearchValue] = useState('');
const [debouncedValue, setDebouncedValue] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(searchValue), 400);
  return () => clearTimeout(timer);
}, [searchValue]);

useEffect(() => {
  if (debouncedValue) searchPatients(debouncedValue);
}, [debouncedValue]);
```

### Listas grandes — virtualización
Para tablas con más de 100 filas, considerar virtualización:
```tsx
// Actualmente no se usa pero si las listas crecen:
// npm install @tanstack/react-virtual
```

---

## Manejo de errores

### Error Boundary (ya implementado en App.tsx)
Captura errores de renderizado. Para errores de API, usar try/catch en hooks.

### Patrón de error en hooks
```typescript
const [error, setError] = useState<string | null>(null);

// En la función async:
try {
  const data = await service.getAll();
  setData(data);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Error desconocido';
  setError(message);
  showSnackbar(message, 'error');
}
```

### Error display en páginas
```tsx
if (error) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Button variant="outline" onClick={retry} className="mt-4">
          Reintentar
        </Button>
      </div>
    </div>
  );
}
```

---

## Accesibilidad básica

```tsx
// Botones con acción destructiva
<button
  onClick={() => setDeleteId(item.id)}
  aria-label={`Eliminar ${item.name}`}
  className="text-red-600 hover:text-red-800"
>
  Eliminar
</button>

// Inputs siempre con label o aria-label
<Input
  label="Nombre del paciente"
  id="patient-name"
  // o si es inline:
  aria-label="Buscar pacientes"
/>

// Imágenes descriptivas
<img src={url} alt={`Foto de ${patient.name}`} />
// Imágenes decorativas
<img src={url} alt="" aria-hidden="true" />
```

---

## Estructura de carpetas — Cuándo crear qué

```
¿Nueva funcionalidad completa (CRUD propio)?
  → Nuevo feature en features/
  → Nueva página en pages/<feature>/
  → Nueva ruta en routes/index.tsx

¿Componente reutilizado en más de un feature?
  → components/ui/ si es parte del design system
  → components/ si es global pero no es design system

¿Componente solo usado en un feature?
  → features/<nombre>/components/

¿Tipo usado solo en un feature?
  → features/<nombre>/types/index.ts

¿Tipo compartido entre features?
  → Raramente necesario — evaluar si hay un feature común
```

---

## Convenciones de nombres

```typescript
// Archivos
PatientsList.tsx      // PascalCase para componentes
usePatients.tsx       // camelCase con 'use' prefix para hooks
patientService.ts     // camelCase para services
index.ts              // siempre minúsculas

// Componentes
export const PatientsList = () => { ... }  // Named export, no default

// Hooks
export const usePatients = () => { ... }

// Tipos
export interface Patient { ... }           // PascalCase con I prefix opcional
export type PatientStatus = '...' | '...' // PascalCase para tipos union

// Constantes
export const DEFAULT_PAGE_SIZE = 20;      // SCREAMING_SNAKE_CASE
```

---

## Variables de entorno (Vite)

```typescript
// Solo variables con prefijo VITE_ son accesibles en el frontend
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

// Tipado (en apps/frontend/src/vite-env.d.ts o similar):
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

---

## Checklist antes de hacer push

- [ ] `tsc --noEmit` sin errores (el hook lo ejecuta automáticamente)
- [ ] No hay `console.log` ni `debugger` en el código
- [ ] No hay `any` en TypeScript
- [ ] Imágenes tienen `alt` text
- [ ] Acciones destructivas usan `ConfirmModal`
- [ ] Estados de carga usan skeleton (páginas) o spinner inline (botones)
- [ ] Colores de tema usan CSS variables, no clases Tailwind hardcoded
- [ ] Nueva página agregada en `routes/index.tsx` con `React.lazy`
- [ ] Feature `index.ts` exporta los nuevos símbolos públicos
