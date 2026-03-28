# Vision Kit — Project Structure

> **MANTENIMIENTO:** Actualizar este archivo cada vez que se agregue/elimine/mueva:
> un feature, una página, una ruta, un componente, un módulo backend, o cualquier
> archivo estructural. Ver tabla de auto-actualización en `CLAUDE.md`.

## Monorepo

```
vision-kit/                         ← npm workspaces root
├── apps/
│   ├── frontend/                   ← @vision-kit/frontend
│   └── backend/                    ← @vision-kit/backend
├── docs/
│   ├── PROJECT_STRUCTURE.md        ← este archivo
│   ├── DATABASE_STRUCTURE.md       ← Prisma schema + ERD
│   └── API_ENDPOINTS.md            ← endpoints documentados
├── CLAUDE.md                       ← contexto rápido para Claude (auto-load)
└── package.json                    ← workspaces + scripts raíz
```

---

## Frontend — apps/frontend/

```
apps/frontend/
├── src/
│   ├── assets/
│   │
│   ├── components/                 ← Globales reutilizables
│   │   ├── Snackbar/
│   │   │   ├── SnackbarContext.tsx  ← Toast (success/error/info/warning)
│   │   │   └── index.ts
│   │   ├── ThemeSelector.tsx       ← Toggle dark/light
│   │   └── ui/                     ← Design system
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── StatCard.tsx
│   │       ├── Table.tsx
│   │       └── index.ts
│   │
│   ├── features/                   ← Módulos de negocio
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.tsx         ← login/logout/currentUser
│   │   │   │   └── usePermissions.tsx  ← verificar permisos por rol
│   │   │   ├── services/
│   │   │   │   └── authService.ts      ← mock → reemplazar con POST /auth/login
│   │   │   ├── types/
│   │   │   │   └── index.ts            ← UserRole, User, Permission, ROLE_PERMISSIONS
│   │   │   └── index.ts
│   │   │
│   │   ├── patients/
│   │   │   ├── components/
│   │   │   │   ├── PatientDetails.tsx
│   │   │   │   ├── PatientForm.tsx
│   │   │   │   ├── PatientSearch.tsx
│   │   │   │   ├── PatientStatusBadge.tsx
│   │   │   │   └── PatientsList.tsx
│   │   │   ├── hooks/usePatients.tsx
│   │   │   ├── services/patientService.ts   ← mock → /patients
│   │   │   ├── types/index.ts              ← Patient, PatientStatus
│   │   │   └── index.ts
│   │   │
│   │   ├── medical-records/
│   │   │   ├── components/
│   │   │   │   ├── MedicalRecordDetails.tsx
│   │   │   │   ├── MedicalRecordForm.tsx
│   │   │   │   └── MedicalRecordsList.tsx
│   │   │   ├── hooks/useMedicalRecords.tsx
│   │   │   ├── services/medicalRecordService.ts  ← mock → /medical-records
│   │   │   ├── types/index.ts   ← MedicalRecord, EyeMeasurement, VisualAcuity
│   │   │   └── index.ts
│   │   │
│   │   ├── clinical-exams/
│   │   │   ├── components/
│   │   │   │   ├── ClinicalExamForm.tsx
│   │   │   │   └── ClinicalExamsList.tsx
│   │   │   ├── hooks/useClinicalExams.tsx
│   │   │   ├── services/clinicalExamService.ts  ← mock → /clinical-exams
│   │   │   ├── types/index.ts   ← ClinicalExam, EyeMeasurement, PupillaryDistance
│   │   │   └── index.ts
│   │   │
│   │   ├── appointments/
│   │   │   ├── components/
│   │   │   │   ├── AppointmentCalendarView.tsx
│   │   │   │   └── AppointmentsList.tsx
│   │   │   ├── hooks/useAppointments.tsx
│   │   │   ├── services/appointmentService.ts  ← mock → /appointments
│   │   │   ├── types/index.ts   ← Appointment, AppointmentType, TimeSlot
│   │   │   └── index.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   ├── InventoryList.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── StockAdjustment.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/useInventory.tsx
│   │   │   ├── services/inventoryService.ts  ← mock → /inventory
│   │   │   ├── types/index.ts   ← Product, ProductCategory, StockMovement
│   │   │   └── index.ts
│   │   │
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   │   ├── SaleDetails.tsx
│   │   │   │   ├── SaleForm.tsx
│   │   │   │   └── SalesList.tsx
│   │   │   ├── hooks/useSales.tsx
│   │   │   ├── services/salesService.ts  ← mock → /sales
│   │   │   ├── types/index.ts   ← Sale, SaleItem, PaymentMethod, SalesSummary
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── services/userService.ts   ← mock → /users
│   │   │   ├── types/index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── layout/
│   │       ├── components/
│   │       │   ├── MainLayout.tsx        ← wrapper sidebar + contenido
│   │       │   └── Sidebar.tsx           ← menú lateral colapsable
│   │       ├── hooks/useSidebar.tsx
│   │       ├── types/index.ts
│   │       └── index.ts
│   │
│   ├── pages/                      ← Una página por ruta
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
│   │   │   ├── InventoryPage.tsx
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
│   │   │   ├── SalesPage.tsx           ← reportes
│   │   │   ├── NewSalePage.tsx
│   │   │   └── ViewSalePage.tsx
│   │   └── settings/
│   │       ├── ProfilePage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── UserFormPage.tsx
│   │       ├── ClinicPage.tsx
│   │       └── AppearancePage.tsx
│   │
│   ├── routes/index.tsx            ← Definición de todas las rutas
│   ├── theme/
│   │   ├── ThemeContext.tsx
│   │   ├── themes.ts               ← variables CSS por tema
│   │   └── index.ts
│   ├── App.tsx                     ← Root component (providers + router)
│   └── main.tsx
│
├── index.html
├── package.json                    ← @vision-kit/frontend
├── vite.config.ts                  ← base: '/vision-kit/'
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── postcss.config.js
```

---

## Backend — apps/backend/

```
apps/backend/
├── src/
│   ├── main.ts                     ← bootstrap, ValidationPipe, CORS, prefix 'api/v1'
│   ├── app.module.ts               ← importa todos los módulos
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts        ← @Global(), exporta PrismaService
│   │   └── prisma.service.ts       ← extends PrismaClient, connect/disconnect
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      ← POST /auth/login, GET /auth/me
│   │   ├── auth.service.ts         ← login con bcrypt + JWT
│   │   ├── jwt.strategy.ts         ← valida Bearer token
│   │   ├── jwt-auth.guard.ts       ← guard de autenticación
│   │   ├── roles.guard.ts          ← guard de autorización por rol
│   │   ├── roles.decorator.ts      ← @Roles('admin', 'manager')
│   │   └── dto/login.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts     ← GET/POST/PATCH/DELETE /users
│   │   ├── users.service.ts        ← CRUD, nunca expone password
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── patients/
│   │   ├── patients.module.ts
│   │   ├── patients.controller.ts  ← /patients + /patients/:id/medical-records|sales
│   │   ├── patients.service.ts     ← CRUD + search + getMedicalHistory + getSales
│   │   └── dto/
│   │       ├── create-patient.dto.ts   ← con insurance y emergencyContact anidados
│   │       └── update-patient.dto.ts   ← PartialType + status + warningReason
│   │
│   ├── appointments/
│   │   ├── appointments.module.ts
│   │   ├── appointments.controller.ts  ← /appointments + /appointments/slots
│   │   ├── appointments.service.ts     ← CRUD + calcEndTime + getAvailableSlots
│   │   └── dto/
│   │       ├── create-appointment.dto.ts
│   │       └── update-appointment.dto.ts  ← + status + cancellationReason
│   │
│   ├── medical-records/
│   │   ├── medical-records.module.ts
│   │   ├── medical-records.controller.ts  ← /medical-records?patientId=
│   │   ├── medical-records.service.ts     ← mapea DTO anidado → columnas flat Prisma
│   │   └── dto/create-medical-record.dto.ts
│   │
│   ├── clinical-exams/
│   │   ├── clinical-exams.module.ts
│   │   ├── clinical-exams.controller.ts   ← /clinical-exams?patientId=
│   │   ├── clinical-exams.service.ts      ← genera examNumber automático
│   │   └── dto/create-clinical-exam.dto.ts
│   │
│   ├── inventory/
│   │   ├── inventory.module.ts
│   │   ├── inventory.controller.ts   ← /inventory + /alerts + /:id/adjust + /:id/movements
│   │   ├── inventory.service.ts      ← recalcula ProductStatus al ajustar stock
│   │   └── dto/
│   │       ├── create-product.dto.ts   ← con specifications y supplier anidados
│   │       └── adjust-stock.dto.ts
│   │
│   ├── sales/
│   │   ├── sales.module.ts
│   │   ├── sales.controller.ts       ← /sales + /summary + /:id/status
│   │   ├── sales.service.ts          ← calcula subtotal/tax/total, snapshot producto
│   │   └── dto/create-sale.dto.ts    ← con SaleItemDto y PaymentDto anidados
│   │
│   └── settings/
│       ├── settings.module.ts
│       ├── settings.controller.ts    ← GET/PATCH /settings (singleton)
│       ├── settings.service.ts       ← upsert de registro único
│       └── dto/update-settings.dto.ts
│
├── prisma/
│   ├── schema.prisma               ← schema completo (ver DATABASE_STRUCTURE.md)
│   └── seed.ts                     ← 4 usuarios + clinic settings
│
├── nest-cli.json
├── tsconfig.json
├── package.json                    ← @vision-kit/backend
├── .env.example
└── .gitignore
```

---

## Rutas del frontend

| Path | Página | Descripción |
|------|--------|-------------|
| `/` | redirect | → `/dashboard` |
| `/dashboard` | DashboardPage | Métricas y resumen |
| `/patients` | PatientsPage | Lista |
| `/patients/new` | NewPatientPage | Crear |
| `/patients/:id` | ViewPatientPage | Ver |
| `/patients/:id/edit` | EditPatientPage | Editar |
| `/appointments` | AppointmentsPage | Agenda / calendario |
| `/medical-records` | MedicalRecordsPage | Lista |
| `/medical-records/new` | NewMedicalRecordPage | Crear |
| `/medical-records/:id` | ViewMedicalRecordPage | Ver |
| `/medical-records/:id/edit` | EditMedicalRecordPage | Editar |
| `/clinical-exams` | ClinicalExamsListPage | Lista |
| `/clinical-exams/new` | NewClinicalExamPage | Crear |
| `/clinical-exams/:id` | ClinicalExamDetailsPage | Ver |
| `/clinical-exams/:id/edit` | EditClinicalExamPage | Editar |
| `/sales` | SalesListPage | Lista |
| `/sales/new` | NewSalePage | Nueva venta (POS) |
| `/sales/reports` | SalesPage | Reportes |
| `/sales/:id` | ViewSalePage | Ver venta |
| `/inventory` | InventoryListPage | Lista general |
| `/inventory/new` | NewProductPage | Crear producto |
| `/inventory/frames` | FramesPage | Filtro armazones |
| `/inventory/lenses` | LensesPage | Filtro lentes |
| `/inventory/stock` | StockControlPage | Control de stock |
| `/inventory/alerts` | AlertsPage | Alertas stock bajo |
| `/inventory/:id` | ViewProductPage | Ver producto |
| `/inventory/:id/edit` | EditProductPage | Editar |
| `/inventory/:id/adjust` | AdjustStockPage | Ajustar stock |
| `/settings/profile` | ProfilePage | Mi perfil |
| `/settings/users` | UsersPage | Gestión de usuarios |
| `/settings/users/new` | UserFormPage | Crear usuario |
| `/settings/users/:id/edit` | UserFormPage | Editar usuario |
| `/settings/clinic` | ClinicPage | Datos de la óptica |
| `/settings/appearance` | AppearancePage | Tema dark/light |

---

## Roles y permisos

| Permiso | admin | manager | optician |
|---------|:-----:|:-------:|:--------:|
| Ver ventas | ✅ | ✅ | ✅ |
| Crear ventas | ✅ | ✅ | ✅ |
| Ver reportes | ✅ | ✅ | ❌ |
| Ver/crear pacientes | ✅ | ✅ | ✅ |
| Eliminar pacientes | ✅ | ✅ | ❌ |
| Ver inventario | ✅ | ✅ | ✅ |
| Crear/editar inventario | ✅ | ✅ | ❌ |
| Ver historiales | ✅ | ✅ | ✅ |
| Crear historiales | ✅ | ✅ | ✅ |
| Ver/crear usuarios | ✅ | ✅ | ❌ |
| Eliminar/editar usuarios | ✅ | ❌ | ❌ |
| Cambiar configuración | ✅ | ❌ | ❌ |

---

## Convenciones de código

### Frontend
- Archivos: PascalCase para `.tsx`, camelCase para `.ts`
- Cada feature exporta solo lo público desde `index.ts`
- Tipos siempre en `types/index.ts` del feature
- Los hooks encapsulan estado + llamadas al service
- Los componentes solo consumen hooks, nunca llaman services directamente
- Tema: CSS variables `--color-*` con TailwindCSS

### Backend
- DTOs con `class-validator`: `@IsString()`, `@IsOptional()`, etc.
- Updates usan `PartialType` de `@nestjs/mapped-types`
- Nunca exponer `password` en respuestas — usar `select` de Prisma
- `JwtAuthGuard` en todos los controllers; `RolesGuard` + `@Roles()` solo cuando se necesita rol específico
- Al ajustar stock: recalcular `ProductStatus` automáticamente
- Snapshots en `SaleItem`: guardar `productName` y `productSku` al momento de venta

### Cómo agregar un nuevo feature

**Frontend:**
1. Crear `apps/frontend/src/features/<nombre>/` con la estructura estándar
2. Agregar tipos en `types/index.ts`
3. Crear el service (mock primero, luego conectar al backend)
4. Crear hook que use el service
5. Crear componentes que usen el hook
6. Crear páginas en `apps/frontend/src/pages/<nombre>/`
7. Agregar rutas en `apps/frontend/src/routes/index.tsx`
8. Agregar al sidebar en `apps/frontend/src/features/layout/components/Sidebar.tsx`

**Backend:**
1. Crear `apps/backend/src/<nombre>/` con module, controller, service, dto/
2. Crear DTOs con validación
3. Implementar service con Prisma
4. Implementar controller con guards
5. Importar el módulo en `apps/backend/src/app.module.ts`
6. Si hay nuevas tablas: agregar al `prisma/schema.prisma` y ejecutar `npm run db:migrate`
