# Vite + React SPA — Optimización y Build

Guía de optimización para la SPA de Vision Kit (Vite 7, no Next.js).

---

## Configuración de Vite relevante

```typescript
// apps/frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vision-kit/',          // ← base path para GitHub Pages
  build: {
    rollupOptions: {
      output: {
        // Separar vendors del código de la app
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
```

---

## Code splitting — Estrategia del proyecto

El code splitting ya está implementado en `routes/index.tsx` con `React.lazy`. Cómo analizar el bundle:

```bash
# Ver tamaño del bundle
cd apps/frontend && npm run build
# Vite muestra el tamaño de cada chunk en el output

# Para análisis visual:
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts — agregar visualizer para análisis puntual
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true, gzipSize: true }) // solo para análisis, no en prod
]
```

---

## HMR (Hot Module Replacement)

Vite usa HMR nativo. Si el HMR deja de funcionar:

```bash
# Limpiar caché de Vite
rm -rf apps/frontend/.vite
npm run frontend
```

**Causa común:** Módulos con efectos secundarios en el nivel superior rompen el HMR.

```typescript
// ❌ Rompe HMR — efecto secundario en top-level
const socket = new WebSocket('ws://...');
export const useSocket = () => socket;

// ✅ Correcto — inicializar dentro de hook/componente
export const useSocket = () => {
  const socket = useRef<WebSocket | null>(null);
  useEffect(() => { socket.current = new WebSocket('ws://...'); }, []);
  return socket;
};
```

---

## Variables de entorno por ambiente

```bash
# apps/frontend/.env.local (desarrollo, no se commitea)
VITE_API_URL=http://localhost:3000/api/v1

# apps/frontend/.env.production (si se usa build de producción)
VITE_API_URL=https://api.tudominio.com/api/v1
```

Vite carga automáticamente `.env.local` en dev y `.env.production` en `npm run build`.

---

## Optimización de imágenes

```tsx
// Imágenes estáticas en public/ → URL directa
<img src="/logo.png" alt="Logo" />

// Imágenes importadas → Vite las procesa con hash
import logoUrl from '../assets/logo.png';
<img src={logoUrl} alt="Logo" />

// Para imágenes de Supabase Storage (product-images bucket)
// Son URLs públicas de CDN — ya están optimizadas

// Para thumbnails — pasar width como query param a Supabase
const thumbnailUrl = `${imageUrl}?width=200&quality=75`;
```

---

## Performance en listas y tablas

```tsx
// Lista de 50-200 items — OK sin virtualizar
{patients.map(p => <PatientRow key={p.id} patient={p} />)}

// Si la lista crece a 500+ items — agregar virtualización
// npm install @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Bundle size — Qué evitar importar

```typescript
// ❌ Import completo de lodash (70kb)
import _ from 'lodash';

// ✅ Import específico (solo la función)
import debounce from 'lodash/debounce';
// o mejor: implementar debounce con useEffect (sin dependencia)

// ❌ date-fns completo
import * as dateFns from 'date-fns';

// ✅ Solo lo necesario
import { format, parseISO } from 'date-fns';
```

---

## Build de producción

```bash
# Desde la raíz del monorepo
npm run build:frontend

# Solo frontend
cd apps/frontend && npm run build

# Preview del build
cd apps/frontend && npm run preview
```

**Output:** `apps/frontend/dist/` — archivos estáticos listos para deploy.

---

## Debugging en desarrollo

```bash
# Logs del servidor Vite
npm run frontend 2>&1 | tee vite.log

# Source maps en build (para debug en producción)
# vite.config.ts:
build: { sourcemap: true }

# Inspeccionar el bundle
npx vite-bundle-visualizer apps/frontend
```
