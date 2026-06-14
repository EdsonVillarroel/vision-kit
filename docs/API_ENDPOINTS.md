# Vision Kit — API Endpoints

> **Propósito:** Documentación exhaustiva de todos los endpoints REST del backend.
> Incluye rutas, métodos HTTP, parámetros, body esperado y ejemplos de respuesta.
> Es la referencia principal para integrar el frontend con el backend.
>
> **Etapa de lectura:** Consultar bajo demanda al agregar, modificar o consumir endpoints.
> También útil al revisar contratos de API durante code review.
>
> **MANTENIMIENTO:** Actualizar este archivo cada vez que se agregue/modifique/elimine
> un endpoint en cualquier controller del backend. Actualizar también el contador
> "Total endpoints" al final y en `CLAUDE.md`. Los ejemplos de body deben mantenerse
> sincronizados con los DTOs en `apps/backend/src/*/dto/`.

Base URL: `http://localhost:3000/api/v1`

Todos los endpoints (excepto `/auth/login`) requieren el header:
```
Authorization: Bearer <token>
```

---

## Auth

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `POST` | `/auth/login` | Público | Login y obtención de token JWT |
| `GET` | `/auth/me` | Todos | Obtener usuario autenticado actual |
| `POST` | `/auth/refresh` | Todos | Renovar access token (requiere JWT válido) |

### POST `/auth/login`
```json
// Body
{ "email": "admin@visionkit.com", "password": "123456" }

// Response 200
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "admin@visionkit.com",
    "name": "Admin Principal",
    "role": "admin",
    "status": "active"
  }
}
```

---

## Users

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/users` | super_admin, admin, manager | Listar todos los usuarios |
| `GET` | `/users/:id` | super_admin, admin, manager | Obtener usuario por ID |
| `POST` | `/users` | super_admin, admin | Crear nuevo usuario (no permite rol super_admin) |
| `PATCH` | `/users/:id` | super_admin, admin | Actualizar usuario |
| `DELETE` | `/users/:id` | super_admin, admin | Eliminar usuario |

### POST / PATCH `/users`
```json
// Body (POST — todos requeridos, PATCH — todos opcionales)
{
  "email": "nuevo@visionkit.com",
  "password": "123456",
  "name": "Nombre Completo",
  "role": "optician",            // "admin" | "manager" | "optician"
  "phone": "+52 55 0000 0000",
  "avatar": "url-opcional"
}
// PATCH también acepta: "status": "active" | "inactive"
```

---

## Patients

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/patients` | Todos | Listar pacientes (con búsqueda) |
| `GET` | `/patients/:id` | Todos | Obtener paciente por ID |
| `POST` | `/patients` | Todos | Crear paciente |
| `PATCH` | `/patients/:id` | Todos | Actualizar paciente |
| `DELETE` | `/patients/:id` | admin, manager | Eliminar paciente |
| `GET` | `/patients/:id/medical-records` | Todos | Historial médico del paciente |
| `GET` | `/patients/:id/sales` | Todos | Ventas del paciente |

### Query params — GET `/patients`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `search` | string | Busca en nombre, apellido, cédula, teléfono, email |

### POST `/patients`
```json
{
  "identificationId": "1234567890",
  "firstName": "Juan",
  "lastName": "Pérez",
  "dateOfBirth": "1990-05-15",
  "gender": "male",              // "male" | "female" | "other"
  "phone": "+52 55 1234 5678",
  "email": "juan@email.com",
  "address": "Av. Principal 123",
  "city": "Ciudad de México",
  "state": "CDMX",
  "zipCode": "06600",
  "allergies": ["Penicilina"],
  "medicalConditions": ["Diabetes"],
  "notes": "Paciente con historial...",
  "emergencyContact": {
    "name": "María Pérez",
    "relationship": "Esposa",
    "phone": "+52 55 9876 5432"
  },
  "insurance": {                 // opcional
    "provider": "IMSS",
    "policyNumber": "ABC123",
    "groupNumber": "GRP001"
  }
}
```

### PATCH `/patients/:id`
Mismos campos que POST pero todos opcionales. También acepta:
```json
{
  "status": "warning",           // "frequent" | "normal" | "warning"
  "warningReason": "Motivo del aviso"
}
```

---

## Appointments

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/appointments` | Todos | Listar citas (con filtros) |
| `GET` | `/appointments/slots` | Todos | Slots disponibles por día/optometrista |
| `GET` | `/appointments/:id` | Todos | Obtener cita por ID |
| `POST` | `/appointments` | Todos | Crear cita |
| `PATCH` | `/appointments/:id` | Todos | Actualizar cita / cambiar estado |
| `DELETE` | `/appointments/:id` | admin, manager | Eliminar cita |

### Query params — GET `/appointments`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `date` | ISO date | Filtrar por fecha exacta (YYYY-MM-DD) |
| `status` | string | `scheduled\|confirmed\|in_progress\|completed\|cancelled\|no_show` |
| `practitionerId` | uuid | Filtrar por optometrista |

### Query params — GET `/appointments/slots`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `date` | ISO date | Fecha del día a consultar |
| `practitionerId` | uuid | ID del optometrista |

```json
// Response /slots
[
  { "time": "09:00", "available": true },
  { "time": "09:30", "available": false },
  ...
]
```

### POST `/appointments`
```json
{
  "patientId": "uuid",
  "practitionerId": "uuid",
  "date": "2026-03-20",
  "time": "10:00",
  "duration": 30,                // minutos, default: 30
  "type": "eye_exam",            // "eye_exam" | "contact_lens_fitting" | "followup" | "emergency" | "frame_selection" | "adjustment"
  "reason": "Revisión anual",
  "notes": "Paciente usa lentes desde 2020",
  "medicalRecordId": "uuid"      // opcional
}
```

### PATCH `/appointments/:id`
```json
{
  "status": "confirmed",         // "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
  "cancellationReason": "El paciente canceló"  // opcional, solo para cancelled
}
```

---

## Medical Records

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/medical-records` | Todos | Listar historiales |
| `GET` | `/medical-records/:id` | Todos | Obtener historial por ID |
| `POST` | `/medical-records` | Todos | Crear historial médico |
| `PATCH` | `/medical-records/:id` | Todos | Actualizar historial |
| `DELETE` | `/medical-records/:id` | admin, manager | Eliminar historial |

### Query params — GET `/medical-records`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `patientId` | uuid | Filtrar por paciente |

### POST `/medical-records`
```json
{
  "patientId": "uuid",
  "date": "2026-03-15",
  "examType": "routine",          // "routine" | "emergency" | "followup" | "contact_lens"
  "visualAcuity": {
    "right": { "uncorrected": "20/100", "corrected": "20/20" },
    "left":  { "uncorrected": "20/80",  "corrected": "20/20" }
  },
  "refraction": {
    "right": { "sphere": -2.50, "cylinder": -0.75, "axis": 180, "add": null, "pd": 32 },
    "left":  { "sphere": -2.00, "cylinder": -0.50, "axis": 175, "add": null, "pd": 32 }
  },
  "prescription": {               // opcional
    "right": { "sphere": -2.50, "cylinder": -0.75, "axis": 180, "pd": 32 },
    "left":  { "sphere": -2.00, "cylinder": -0.50, "axis": 175, "pd": 32 }
  },
  "intraocularPressure": {        // opcional
    "right": 14,
    "left": 13
  },
  "diagnosis": ["Miopía", "Astigmatismo leve"],
  "notes": "Se recomienda uso de lentes de tiempo completo",
  "nextVisitRecommended": "2027-03-15"
}
```

---

## Clinical Exams

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/clinical-exams` | Todos | Listar exámenes clínicos |
| `GET` | `/clinical-exams/:id` | Todos | Obtener examen por ID |
| `POST` | `/clinical-exams` | Todos | Crear examen clínico |
| `PATCH` | `/clinical-exams/:id` | Todos | Actualizar examen |
| `DELETE` | `/clinical-exams/:id` | admin, manager | Eliminar examen |

### Query params — GET `/clinical-exams`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `patientId` | uuid | Filtrar por paciente |

### POST `/clinical-exams`
```json
{
  "patientId": "uuid",
  "date": "2026-03-15",
  "medicalRecordId": "uuid",       // opcional — vincula con historial
  "farVision": {
    "right": { "sphere": -2.50, "cylinder": -0.75, "axis": 180, "prism": 0, "base": "" },
    "left":  { "sphere": -2.00, "cylinder": -0.50, "axis": 175, "prism": 0, "base": "" }
  },
  "nearVision": {                  // opcional
    "right": { "sphere": -2.00, "cylinder": -0.75, "axis": 180 },
    "left":  { "sphere": -1.75, "cylinder": -0.50, "axis": 175 }
  },
  "pupillaryDistance": {
    "right": 32.0,
    "left": 32.0,
    "nearRight": 30.5,             // opcional
    "nearLeft": 30.5               // opcional
  },
  "frameMeasurements": {
    "height": 36.0,
    "right": 28.5,
    "left": 28.5
  },
  "lensDataRight": "AR + UV",
  "lensDataLeft": "AR + UV",
  "observations": "Paciente tolera bien la corrección"
}
```

---

## Inventory

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/inventory` | Todos | Listar productos (con filtros) |
| `GET` | `/inventory/alerts` | Todos | Productos con stock bajo o agotado |
| `GET` | `/inventory/:id` | Todos | Obtener producto por ID |
| `GET` | `/inventory/:id/movements` | Todos | Movimientos de stock del producto |
| `POST` | `/inventory` | admin, manager | Crear producto |
| `PATCH` | `/inventory/:id` | admin, manager | Actualizar producto |
| `POST` | `/inventory/:id/adjust` | admin, manager | Ajustar stock (entrada/salida/ajuste) |
| `DELETE` | `/inventory/:id` | admin, manager | Eliminar producto |

### Query params — GET `/inventory`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `category` | string | `frames\|lenses\|sunglasses\|contact_lenses\|accessories\|solutions` |
| `status` | string | `in_stock\|low_stock\|out_of_stock\|discontinued` |
| `search` | string | Busca en nombre, SKU, marca |

### POST `/inventory`
```json
{
  "sku": "ARM-001",
  "name": "Ray-Ban Aviator Clásico",
  "category": "frames",          // "frames" | "lenses" | "sunglasses" | "contact_lenses" | "accessories" | "solutions"
  "brand": "Ray-Ban",
  "model": "RB3025",
  "costPrice": 850.00,
  "sellingPrice": 1500.00,
  "discount": 10,                // porcentaje, opcional
  "stock": 15,
  "minStock": 3,
  "maxStock": 30,
  "images": ["url1", "url2"],
  "specifications": {
    "frameType": "full-rim",     // "full-rim" | "semi-rimless" | "rimless"
    "material": "Metal",
    "color": "Dorado",
    "lensSize": 58.0,
    "bridge": 14.0,
    "temple": 135.0
  },
  "supplier": {
    "name": "Luxottica México",
    "contact": "Luis Torres",
    "email": "luis@luxottica.mx",
    "phone": "+52 55 5555 5555"
  }
}
```

### POST `/inventory/:id/adjust`
```json
{
  "type": "in",                  // "in" | "out" | "adjustment"
  "quantity": 10,
  "reason": "Compra a proveedor",
  "reference": "OC-2026-001",
  "notes": "Lote llegó en buen estado"
}
```

---

## Sales

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/sales` | Todos | Listar ventas (con filtros) |
| `GET` | `/sales/summary` | admin, manager | Resumen de ventas por rango de fechas |
| `GET` | `/sales/metrics` | admin, super_admin | Métricas: totales, series por día, top vendedores, mix de pagos — requiere plan con feature `commissions` |
| `GET` | `/sales/:id` | Todos | Obtener venta por ID |
| `POST` | `/sales` | Todos | Crear nueva venta |
| `PATCH` | `/sales/:id/status` | Todos | Cambiar estado de venta |

### Query params — GET `/sales`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | `pending\|completed\|cancelled\|refunded` |
| `patientId` | uuid | Filtrar por paciente |
| `from` | ISO date | Fecha inicio (YYYY-MM-DD) |
| `to` | ISO date | Fecha fin (YYYY-MM-DD) |

### Query params — GET `/sales/summary`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio (requerida) |
| `to` | ISO date | Fecha fin (requerida) |

### Query params — GET `/sales/metrics`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio (default: hoy - 30d) |
| `to` | ISO date | Fecha fin (default: hoy) |

Respuesta incluye: `totals` (salesCount, grossAmount, netAmount, avgTicket), `byDay` (serie temporal), `topSellers` (ranking), `byPaymentMethod` (mix de medios de pago), `byCategory` (categorías de producto).

Errores:
- `402 FeatureNotInPlan` — el plan actual no incluye `commissions`.

### POST `/sales`
```json
{
  "patientId": "uuid",
  "medicalRecordId": "uuid",    // opcional — receta asociada
  "date": "2026-03-15",
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "unitPrice": 1500.00,
      "discount": 10            // porcentaje, opcional
    },
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 450.00
    }
  ],
  "discount": 5,                // descuento global en %, opcional
  "tax": 0.13,                  // IVA Bolivia (13%)
  "paymentMethod": "card",      // "cash" | "card" | "transfer" | "check" | "mixed"
  "payments": [                 // requerido si paymentMethod = "mixed"
    { "method": "cash", "amount": 500.00 },
    { "method": "card", "amount": 1000.00, "reference": "****1234" }
  ],
  "prescriptionRequired": true,
  "notes": "Lentes con tratamiento AR",
  "warrantyExpiryDate": "2027-03-15",
  "warrantyTerms": "Garantía de 1 año contra defectos de fabricación"
}
```

### PATCH `/sales/:id/status`
```json
{
  "status": "cancelled",        // "pending" | "completed" | "cancelled" | "refunded"
  "reason": "El cliente cambió de opinión"
}
```

---

## Commissions

> Reportes de comisiones por vendedor. Todos los endpoints requieren plan con feature `commissions` (Óptica Pro y Cadena).
> Devuelven `402 FeatureNotInPlan` en planes sin el flag.

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/commissions` | admin, super_admin | Reporte agrupado por vendedor en un rango |
| `GET` | `/commissions/leaderboard` | admin, super_admin | Top vendedores por monto total vendido |
| `GET` | `/commissions/summary/:userId` | admin, super_admin | Detalle de ventas y comisiones de un vendedor |

### Query params — GET `/commissions`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio (default: hoy - 30d) |
| `to` | ISO date | Fecha fin (default: hoy) |
| `userId` | uuid | Filtrar por un vendedor específico (opcional) |

Respuesta: array de `{ userId, name, commissionRate, salesCount, grossBase, commissionAmount }`.

### Query params — GET `/commissions/leaderboard`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio (default: hoy - 30d) |
| `to` | ISO date | Fecha fin (default: hoy) |
| `limit` | number | Máximo 50 (default: 10) |

Respuesta: array ordenado desc por `totalSold`, con `{ userId, name, salesCount, totalSold }`.

### Query params — GET `/commissions/summary/:userId`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio (default: hoy - 30d) |
| `to` | ISO date | Fecha fin (default: hoy) |

Respuesta: resumen con totales del vendedor + listado de ventas (fecha, número, monto, comisión).

Errores:
- `402 FeatureNotInPlan` — el plan actual no incluye `commissions`.
- `404` — el `userId` no existe dentro del tenant.

---

## Settings

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/settings` | Todos | Obtener configuración de la óptica |
| `PATCH` | `/settings` | admin | Actualizar configuración |

---

## Subscriptions

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| `GET` | `/subscriptions/current` | Todos | Suscripción activa del tenant: plan, límites y uso actual |

### Respuesta — GET `/subscriptions/current`
```json
{
  "subscription": {
    "id": "uuid",
    "status": "active",
    "startedAt": "2026-04-01T00:00:00Z",
    "expiresAt": null
  },
  "plan": {
    "id": "uuid",
    "slug": "optica-pro-mensual",
    "name": "Óptica Pro (Mensual)",
    "price": "549.00",
    "currency": "BOB",
    "billingPeriod": "monthly",
    "features": {
      "public_portal": true,
      "email_reminders": true,
      "whatsapp_reminders": true,
      "whatsapp_included_messages": 500,
      "workshop_module": true,
      "commissions": true,
      "advanced_reports": true,
      "max_sales_per_month": 2000,
      "max_branches": 1
    }
  },
  "limits": {
    "patients": 5000,
    "products": 2000,
    "users": 6,
    "storageMb": 10000,
    "salesPerMonth": 2000
  },
  "usage": {
    "patients": 387,
    "products": 145,
    "users": 4,
    "salesThisMonth": 218
  }
}
```
> `-1` en cualquier campo de `limits` = ilimitado.

### Cuotas del plan (aplicadas por `PlanQuotaGuard`)
Los endpoints `POST /patients`, `POST /inventory` y `POST /sales` devuelven **HTTP 402** cuando se excede el límite del plan:
```json
{
  "statusCode": 402,
  "error": "PlanQuotaExceeded",
  "resource": "patients",
  "current": 500,
  "limit": 500,
  "planSlug": "consultorio-mensual",
  "planName": "Consultorio (Mensual)",
  "message": "Alcanzaste el límite de 500 del plan Consultorio (Mensual). Actualizá tu plan para continuar."
}
```

---

## Public API (sin JWT)

> Rutas públicas para el portal de la óptica. No requieren autenticación.
> El `tenantSlug` identifica la óptica (ej: `vision-2020-hd`).
> Rate limiting estricto en `POST /public/:tenantSlug/bookings`: 2 req/10s · 3 req/min.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/public/:tenantSlug/catalog` | Catálogo paginado de productos en stock |
| `GET` | `/public/:tenantSlug/catalog/:id` | Detalle de un producto |
| `GET` | `/public/:tenantSlug/clinic` | Información pública de la óptica |
| `POST` | `/public/:tenantSlug/bookings` | Solicitar reserva de cita online |

### Query params — GET `/public/:tenantSlug/catalog`
| Param | Tipo | Descripción |
|-------|------|-------------|
| `category` | string | `frames \| lenses \| sunglasses \| contact-lenses \| accessories \| solutions` |
| `search` | string | Buscar por nombre, marca o SKU |
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 20, max: 50) |

### POST `/public/:tenantSlug/bookings`
```json
{
  "name": "Ana López",
  "phone": "+591 70000000",
  "email": "ana@email.com",       // opcional
  "serviceType": "eye_exam",      // "eye_exam" | "frame_fitting" | "contact_lens" | "repair" | "other"
  "preferredDate": "2026-05-01",
  "preferredTime": "10:00",       // opcional
  "notes": "Primera consulta"     // opcional
}
```

### PATCH `/settings`
```json
{
  "name": "Visión 20/20 HD",
  "rfc": "1234567890",
  "address": "Av. Arce Nº 2345",
  "city": "La Paz",
  "state": "La Paz",
  "zipCode": "0000",
  "phone": "+591 2 244 1234",
  "email": "contacto@vision2020hd.com",
  "website": "https://vision2020hd.com",
  "logo": "https://cdn.../logo.png",
  "taxRate": 0.13,
  "currency": "BOB"
}
```

---

## Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| `200` | OK |
| `201` | Creado exitosamente |
| `400` | Bad Request — body inválido / validación fallida |
| `401` | Unauthorized — token inválido o expirado |
| `403` | Forbidden — rol sin permisos para esta acción |
| `404` | Not Found — recurso no encontrado |
| `409` | Conflict — email duplicado, SKU duplicado, etc. |
| `500` | Internal Server Error |

---

## Estructura de respuesta de error

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than 6 characters"],
  "error": "Bad Request"
}
```

---

## Resumen de todos los endpoints

```
POST   /auth/login
GET    /auth/me

GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id

GET    /patients
GET    /patients/:id
POST   /patients
PATCH  /patients/:id
DELETE /patients/:id
GET    /patients/:id/medical-records
GET    /patients/:id/sales

GET    /appointments
GET    /appointments/slots
GET    /appointments/:id
POST   /appointments
PATCH  /appointments/:id
DELETE /appointments/:id

GET    /medical-records
GET    /medical-records/:id
POST   /medical-records
PATCH  /medical-records/:id
DELETE /medical-records/:id

GET    /clinical-exams
GET    /clinical-exams/:id
POST   /clinical-exams
PATCH  /clinical-exams/:id
DELETE /clinical-exams/:id

GET    /inventory
GET    /inventory/alerts
GET    /inventory/:id
GET    /inventory/:id/movements
POST   /inventory
PATCH  /inventory/:id
POST   /inventory/:id/adjust
DELETE /inventory/:id

GET    /sales
GET    /sales/summary
GET    /sales/metrics
GET    /sales/:id
POST   /sales
PATCH  /sales/:id/status

GET    /commissions
GET    /commissions/leaderboard
GET    /commissions/summary/:userId

GET    /settings
PATCH  /settings

GET    /public/:tenantSlug/catalog
GET    /public/:tenantSlug/catalog/:id
GET    /public/:tenantSlug/clinic
POST   /public/:tenantSlug/bookings
```

**Total: 51 tenant + public endpoints** (47 tenant + 4 public)
> Nota: 47 tenant = 43 base + 1 `/sales/metrics` + 3 `/commissions/*`.

---

## Platform Auth

> Rutas para platform admins. Usan strategy `jwt-platform` — tokens con `type: 'platform'` en payload.
> No comparten autenticación con los tenant users.

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/platform/auth/login` | Público | Login para platform admins |
| `GET` | `/platform/auth/me` | PlatformAuthGuard | Obtener platform admin autenticado |
| `POST` | `/platform/auth/refresh` | PlatformAuthGuard | Renovar access token |

### POST `/platform/auth/login`
```json
// Body
{ "email": "platform@visionkit.com", "password": "123456" }

// Response 200
{
  "access_token": "eyJhbGci...",
  "admin": {
    "id": "uuid",
    "email": "platform@visionkit.com",
    "name": "Platform Admin",
    "status": "active"
  }
}

// Response 401 — credenciales inválidas o admin inactivo
```

---

## Platform Management

> Rutas de gestión de la plataforma SaaS. Requieren `PlatformAuthGuard` (token platform).
> Base path: `/platform`

### Stats

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/platform/stats` | Estadísticas globales: tenants, MRR, usuarios, pacientes |

### Tenants

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/platform/tenants` | Listar todos los tenants con suscripción y conteos |
| `POST` | `/platform/tenants` | Provisionar nuevo tenant (transacción: tenant + suscripción + super_admin) |
| `GET` | `/platform/tenants/:id` | Detalle de un tenant |
| `PATCH` | `/platform/tenants/:id` | Actualizar datos del tenant |
| `PATCH` | `/platform/tenants/:id/suspend` | Suspender tenant |
| `PATCH` | `/platform/tenants/:id/activate` | Activar tenant suspendido |

### Plans

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/platform/plans` | Listar planes con conteo de suscriptores |
| `POST` | `/platform/plans` | Crear nuevo plan de suscripción |
| `PATCH` | `/platform/plans/:id` | Actualizar plan |

### Subscriptions

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/platform/subscriptions` | Listar todas las suscripciones |
| `PATCH` | `/platform/subscriptions/:id` | Actualizar suscripción (plan, estado, fechas, notas) |

### POST `/platform/tenants`
```json
// Body
{
  "name": "Óptica Visión Clara",
  "slug": "vision-clara",
  "primaryColor": "#6366f1",
  "planId": "uuid-del-plan",
  "superAdminEmail": "admin@visionclara.com",
  "superAdminName": "Carlos Méndez",
  "superAdminPassword": "password123"
}

// Response 201
{
  "tenant": { "id": "uuid", "name": "Óptica Visión Clara", "slug": "vision-clara", "status": "active" },
  "subscription": { "id": "uuid", "status": "active", "planId": "uuid" },
  "superAdmin": { "id": "uuid", "email": "admin@visionclara.com", "role": "super_admin" }
}

// Response 409 — slug o email ya en uso
```

### PATCH `/platform/subscriptions/:id`
```json
// Body (todos opcionales)
{
  "planId": "nuevo-plan-uuid",
  "status": "active",
  "expiresAt": "2026-12-31T00:00:00.000Z",
  "paymentNotes": "Pago recibido vía QR el 2026-04-01"
}
```

**Total nuevos endpoints sesión 5: 12 (platform management)**

**Total global: 68 endpoints**
- 43 tenant base
- 1 `/subscriptions/current`
- 1 `/sales/metrics` (requiere feature `commissions`)
- 3 `/commissions/*` (requiere feature `commissions`)
- 4 public
- 3 platform-auth
- 13 platform-management
