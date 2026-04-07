# Vision Kit — Project Structure

> **Propósito:** Árbol completo del monorepo con descripción de cada app, feature, página,
> ruta y módulo. Es la guía de orientación para entender dónde vive cada pieza del sistema.
>
> **Etapa de lectura:** Consultar al inicio de tareas que involucren navegación entre archivos,
> creación de nuevos módulos/features, o cuando se necesite ubicar un componente o servicio.
>
> **MANTENIMIENTO:** Actualizar cuando se agregue/elimine/mueva un feature, página, ruta, componente,
> módulo backend o archivo estructural. Eliminar secciones que ya no reflejen el código real.

---

## Monorepo

```
vision-kit/                         ← npm workspaces root
├── apps/
│   ├── frontend/                   ← @vision-kit/frontend  (panel interno, puerto 5173)
│   ├── backend/                    ← @vision-kit/backend   (NestJS API, puerto 3000)
│   └── landing/                    ← @vision-kit/landing   (portal público, puerto 5174)
├── docs/
│   ├── PROJECT_STRUCTURE.md        ← este archivo
│   ├── DATABASE_STRUCTURE.md       ← Prisma schema + ERD
│   └── API_ENDPOINTS.md            ← endpoints documentados
├── CLAUDE.md                       ← contexto maestro (auto-load)
├── DECISIONS.md                    ← decisiones de arquitectura con su razón
├── Tools.md                        ← tareas completadas + pendientes por sesión
└── package.json                    ← workspaces + scripts raíz
```

---

## Frontend — apps/frontend/

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx       ← class component, wrappea toda la app en App.tsx
│   │   ├── ThemeSelector.tsx       ← toggle dark/light
│   │   ├── Snackbar/
│   │   │   ├── SnackbarContext.tsx  ← toast global (success/error/info/warning)
│   │   │   └── index.ts
│   │   └── ui/                     ← design system
│   │       ├── Badge.tsx
│   │       ├── Button.tsx          ← variantes: primary, secondary, outline, danger, warning
│   │       ├── Card.tsx
│   │       ├── ConfirmModal.tsx    ← modal de confirmación (danger/warning/default)
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx        ← 7 variantes de loading skeleton
│   │       ├── StatCard.tsx
│   │       ├── Table.tsx
│   │       └── index.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/         ← LoginForm, LoginPage
│   │   │   ├── hooks/              ← useAuth (login/logout/currentUser/updateUser), usePermissions
│   │   │   ├── services/           ← authService → POST /auth/login, GET /auth/me
│   │   │   ├── types/              ← UserRole, User, Permission, ROLE_PERMISSIONS
│   │   │   └── index.ts
│   │   │
│   │   ├── patients/
│   │   │   ├── components/         ← PatientDetails, PatientForm, PatientSearch, PatientStatusBadge, PatientsList
│   │   │   ├── hooks/              ← usePatients
│   │   │   ├── services/           ← patientService → /patients
│   │   │   ├── types/              ← Patient, PatientStatus
│   │   │   └── index.ts
│   │   │
│   │   ├── medical-records/
│   │   │   ├── components/         ← MedicalRecordDetails, MedicalRecordForm, MedicalRecordsList
│   │   │   ├── hooks/              ← useMedicalRecords
│   │   │   ├── services/           ← medicalRecordService → /medical-records
│   │   │   ├── types/              ← MedicalRecord, EyeMeasurement, VisualAcuity
│   │   │   └── index.ts
│   │   │
│   │   ├── clinical-exams/
│   │   │   ├── components/         ← ClinicalExamForm, ClinicalExamsList
│   │   │   ├── hooks/              ← useClinicalExams
│   │   │   ├── services/           ← clinicalExamService → /clinical-exams
│   │   │   ├── types/              ← ClinicalExam, EyeMeasurement, PupillaryDistance
│   │   │   └── index.ts
│   │   │
│   │   ├── appointments/
│   │   │   ├── components/         ← AppointmentCalendarView, AppointmentsList
│   │   │   ├── hooks/              ← useAppointments
│   │   │   ├── services/           ← appointmentService → /appointments
│   │   │   ├── types/              ← Appointment, AppointmentType, TimeSlot
│   │   │   └── index.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── components/         ← InventoryList, ProductDetails, ProductForm, StockAdjustment
│   │   │   ├── hooks/              ← useInventory
│   │   │   ├── services/           ← inventoryService → /inventory
│   │   │   ├── types/              ← Product, ProductCategory, StockMovement
│   │   │   └── index.ts
│   │   │
│   │   ├── sales/
│   │   │   ├── components/         ← SaleDetails, SaleForm, SalesList
│   │   │   ├── hooks/              ← useSales, useSalesSummary
│   │   │   ├── services/           ← salesService → /sales
│   │   │   ├── types/              ← Sale, SaleItem, PaymentMethod, SalesSummary
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── services/           ← userService → /users
│   │   │   ├── types/              ← UserFormData
│   │   │   └── index.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── services/           ← settingsService → /settings
│   │   │   └── types/              ← BusinessHours, DaySchedule
│   │   │
│   │   └── layout/
│   │       ├── components/         ← MainLayout, Sidebar
│   │       ├── hooks/              ← useSidebar
│   │       ├── types/              ← NavItem
│   │       └── index.ts
│   │
│   ├── lib/
│   │   ├── api.ts                  ← cliente HTTP con JWT Bearer automático
│   │   └── uploadService.ts        ← upload avatar y product-images a Supabase Storage
│   │
│   ├── pages/
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── patients/
│   │   │   ├── PatientsPage.tsx
│   │   │   ├── NewPatientPage.tsx
│   │   │   ├── ViewPatientPage.tsx
│   │   │   └── EditPatientPage.tsx
│   │   ├── appointments/AppointmentsPage.tsx
│   │   ├── medical-records/
│   │   │   ├── MedicalRecordsPage.tsx
│   │   │   ├── NewMedicalRecordPage.tsx
│   │   │   ├── ViewMedicalRecordPage.tsx
│   │   │   └── EditMedicalRecordPage.tsx
│   │   ├── clinical-exams/
│   │   │   ├── ClinicalExamsListPage.tsx
│   │   │   ├── NewClinicalExamPage.tsx
│   │   │   ├── ClinicalExamDetailsPage.tsx
│   │   │   └── EditClinicalExamPage.tsx
│   │   ├── inventory/
│   │   │   ├── InventoryListPage.tsx
│   │   │   ├── InventoryPage.tsx       ← stats generales
│   │   │   ├── FramesPage.tsx
│   │   │   ├── LensesPage.tsx
│   │   │   ├── StockControlPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── NewProductPage.tsx
│   │   │   ├── ViewProductPage.tsx
│   │   │   ├── EditProductPage.tsx
│   │   │   └── AdjustStockPage.tsx
│   │   ├── sales/
│   │   │   ├── SalesListPage.tsx
│   │   │   ├── SalesPage.tsx           ← reportes + filtros
│   │   │   ├── NewSalePage.tsx
│   │   │   └── ViewSalePage.tsx
│   │   └── settings/
│   │       ├── ProfilePage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── UserFormPage.tsx
│   │       ├── ClinicPage.tsx
│   │       └── AppearancePage.tsx
│   │
│   ├── routes/index.tsx            ← todas las rutas con React.lazy + Suspense
│   ├── theme/
│   │   ├── ThemeContext.tsx
│   │   ├── themes.ts               ← variables CSS por tema (dark/light)
│   │   └── index.ts
│   ├── App.tsx                     ← root: ErrorBoundary + providers + router
│   └── main.tsx
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Landing — apps/landing/

Portal público de Visión 20/20 HD. Consume la Public API del backend (sin JWT).

```
apps/landing/
├── src/
│   ├── lib/api.ts                  ← publicApi: getCatalog, getProduct, getClinicInfo, createBooking
│   ├── pages/
│   │   ├── HomePage.tsx            ← link-in-bio: logo, categorías, WhatsApp, redes
│   │   ├── CatalogPage.tsx         ← grid paginado + chips categoría + búsqueda debounce
│   │   ├── ProductPage.tsx         ← galería con dots, specs, CTA WhatsApp + reserva
│   │   └── BookingPage.tsx         ← formulario completo → POST /public/bookings
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

**Variable de entorno:** `VITE_API_URL` (default: `http://localhost:3000/api/v1`)

---

## Backend — apps/backend/

```
apps/backend/
├── src/
│   ├── main.ts                     ← bootstrap, ValidationPipe, helmet, CORS, prefix 'api/v1'
│   ├── app.module.ts               ← importa todos los módulos + ThrottlerModule global
│   ├── prisma/                     ← PrismaModule @Global(), PrismaService
│   ├── auth/                       ← POST /auth/login, GET /auth/me, JWT strategy, guards, decorators
│   ├── users/                      ← GET/POST/PATCH/DELETE /users, PATCH /users/:id/password
│   ├── patients/                   ← /patients CRUD + /patients/:id/medical-records|sales
│   ├── appointments/               ← /appointments CRUD + /appointments/slots
│   ├── medical-records/            ← /medical-records CRUD, mapea DTO → columnas flat
│   ├── clinical-exams/             ← /clinical-exams CRUD, genera examNumber automático
│   ├── inventory/                  ← /inventory CRUD + /alerts + /:id/adjust + /:id/movements
│   ├── sales/                      ← /sales CRUD + /summary + /:id/status (con stock revert)
│   ├── settings/                   ← GET/PATCH /settings (singleton ClinicSettings)
│   ├── upload/                     ← POST /upload/avatar/:userId + /upload/product-image/:productId
│   └── public/                     ← GET /public/catalog|clinic, POST /public/bookings (sin JWT)
│
├── prisma/
│   ├── schema.prisma               ← fuente de verdad del schema
│   └── seed.ts                     ← 4 usuarios + clinic settings + 5 pacientes + 8 productos + citas
│
└── package.json
```

---

## Rutas del frontend (panel interno)

| Path | Página |
|------|--------|
| `/` | → `/dashboard` |
| `/dashboard` | DashboardPage |
| `/patients` | PatientsPage |
| `/patients/new` | NewPatientPage |
| `/patients/:id` | ViewPatientPage |
| `/patients/:id/edit` | EditPatientPage |
| `/appointments` | AppointmentsPage |
| `/medical-records` | MedicalRecordsPage |
| `/medical-records/new` | NewMedicalRecordPage |
| `/medical-records/:id` | ViewMedicalRecordPage |
| `/medical-records/:id/edit` | EditMedicalRecordPage |
| `/clinical-exams` | ClinicalExamsListPage |
| `/clinical-exams/new` | NewClinicalExamPage |
| `/clinical-exams/:id` | ClinicalExamDetailsPage |
| `/clinical-exams/:id/edit` | EditClinicalExamPage |
| `/sales` | SalesListPage |
| `/sales/new` | NewSalePage |
| `/sales/reports` | SalesPage |
| `/sales/:id` | ViewSalePage |
| `/inventory` | InventoryListPage |
| `/inventory/new` | NewProductPage |
| `/inventory/frames` | FramesPage |
| `/inventory/lenses` | LensesPage |
| `/inventory/stock` | StockControlPage |
| `/inventory/alerts` | AlertsPage |
| `/inventory/:id` | ViewProductPage |
| `/inventory/:id/edit` | EditProductPage |
| `/inventory/:id/adjust` | AdjustStockPage |
| `/settings/profile` | ProfilePage |
| `/settings/users` | UsersPage |
| `/settings/users/new` | UserFormPage |
| `/settings/users/:id/edit` | UserFormPage |
| `/settings/clinic` | ClinicPage |
| `/settings/appearance` | AppearancePage |

---

## Roles y permisos

| Permiso | admin | manager | optician |
|---------|:-----:|:-------:|:--------:|
| Ver/crear ventas | ✅ | ✅ | ✅ |
| Ver reportes de ventas | ✅ | ✅ | ❌ |
| Ver/crear pacientes | ✅ | ✅ | ✅ |
| Eliminar pacientes | ✅ | ✅ | ❌ |
| Ver inventario | ✅ | ✅ | ✅ |
| Crear/editar inventario | ✅ | ✅ | ❌ |
| Ver historiales / exámenes | ✅ | ✅ | ✅ |
| Gestionar usuarios | ✅ | 👁️ ver | ❌ |
| Configuración clínica | ✅ | ❌ | ❌ |
