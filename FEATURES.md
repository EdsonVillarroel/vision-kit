# 🏥 Vision Kit - Sistema de Gestión para Ópticas

Sistema completo de gestión para ópticas con arquitectura modular basada en features.

## 📁 Estructura de Features

```
src/features/
├── auth/                    # Autenticación y autorización
├── layout/                  # Layout y sidebar
├── patients/                # Gestión de pacientes
├── medical-records/         # Historia clínica y mediciones
├── appointments/            # Sistema de citas
├── inventory/              # Inventario de productos
└── sales/                  # Punto de venta
```

## 🎯 Features Implementadas

### 1️⃣ **Pacientes** (`src/features/patients/`)

Gestión completa de información de pacientes.

**Tipos:**
- `Patient`: Información completa del paciente
- `PatientFormData`: Datos para crear/editar
- `PatientFilters`: Filtros de búsqueda

**Datos incluidos:**
- Información personal (nombre, fecha de nacimiento, género)
- Contacto (teléfono, email, dirección)
- Seguro médico
- Contacto de emergencia
- Alergias y condiciones médicas
- Historial de visitas

**Servicios Mock:**
```typescript
patientService.getAll()
patientService.getById(id)
patientService.search(query)
patientService.create(data)
patientService.update(id, data)
patientService.delete(id)
```

---

### 2️⃣ **Historia Clínica y Mediciones** (`src/features/medical-records/`)

Registro detallado de exámenes oftalmológicos.

**Tipos:**
- `MedicalRecord`: Historial médico completo
- `EyeMeasurement`: Mediciones de refracción
- `VisualAcuity`: Agudeza visual
- `MedicalRecordFormData`: Datos del examen

**Datos registrados:**
- **Agudeza visual**: Sin corrección y corregida para cada ojo
- **Refracción**: Esfera, cilindro, eje, adición, prisma, PD
- **Prescripción**: Para lentes oftálmicos
  - Tipo de armazón (monofocal, bifocal, progresivo)
  - Material de lentes
  - Tratamientos (antirreflejante, UV, luz azul)
- **Presión intraocular**: Medición en mmHg
- **Salud ocular**: Examen de segmento anterior y posterior
- **Diagnóstico**: Lista de diagnósticos
- **Notas del optometrista**
- **Próxima visita recomendada**

**Servicios Mock:**
```typescript
medicalRecordService.getAll()
medicalRecordService.getByPatientId(patientId)
medicalRecordService.getById(id)
medicalRecordService.getLatestByPatientId(patientId)
medicalRecordService.create(data)
medicalRecordService.update(id, data)
medicalRecordService.delete(id)
```

---

### 3️⃣ **Inventario** (`src/features/inventory/`)

Control completo de productos y stock.

**Categorías de productos:**
- 👓 Armazones (frames)
- 🔬 Lentes oftálmicos (lenses)
- 😎 Gafas de sol (sunglasses)
- 👁️ Lentes de contacto (contact-lenses)
- 🧰 Accesorios (accessories)
- 💧 Soluciones (solutions)

**Tipos:**
- `Product`: Información completa del producto
- `StockMovement`: Movimientos de inventario
- `ProductCategory`: Categorías
- `ProductStatus`: Estado del stock

**Datos del producto:**
- SKU, nombre, categoría, marca, modelo
- Precios (costo, venta, descuentos)
- Stock (actual, mínimo, máximo)
- Especificaciones técnicas según categoría:
  - **Armazones**: Tipo, material, color, medidas
  - **Lentes**: Tipo, material, índice, tratamientos
  - **Lentes de contacto**: Curva base, diámetro, poder
- Proveedor
- Imágenes

**Servicios Mock:**
```typescript
inventoryService.getAllProducts()
inventoryService.getProductById(id)
inventoryService.searchProducts(query)
inventoryService.getProductsByCategory(category)
inventoryService.getLowStockProducts()
inventoryService.createProduct(data)
inventoryService.updateProduct(id, data)
inventoryService.deleteProduct(id)

// Movimientos de stock
inventoryService.adjustStock(productId, quantity, type, reason, performedBy, reference)
inventoryService.getStockMovements(productId?)
```

**Control de stock:**
- Entrada, salida y ajustes de inventario
- Historial de movimientos
- Alertas de stock bajo
- Rastreo de reabastecimiento

---

### 4️⃣ **Ventas** (`src/features/sales/`)

Sistema de punto de venta completo.

**Tipos:**
- `Sale`: Venta completa
- `SaleItem`: Item de venta
- `PaymentMethod`: Métodos de pago
- `SaleStatus`: Estado de la venta
- `SalesSummary`: Resúmenes y reportes

**Características:**
- Items múltiples por venta
- Cálculo automático de:
  - Subtotales
  - Descuentos (por item y global)
  - IVA (16%)
  - Total
- Métodos de pago:
  - Efectivo (cash)
  - Tarjeta (card)
  - Transferencia (transfer)
  - Cheque (check)
  - Mixto (mixed) - múltiples métodos
- Asociación con prescripción médica
- Garantías
- Control de estados (pendiente, completada, cancelada, reembolsada)

**Servicios Mock:**
```typescript
salesService.getAll()
salesService.getById(id)
salesService.getByPatientId(patientId)
salesService.create(data)
salesService.cancel(id, reason)
salesService.refund(id, reason)
salesService.getSummary(dateFrom?, dateTo?)
```

**Reportes incluyen:**
- Total de ventas e ingresos
- Ticket promedio
- Top productos vendidos
- Ventas por método de pago
- Ventas por día

---

### 5️⃣ **Citas** (`src/features/appointments/`)

Sistema de agendamiento de citas.

**Tipos de citas:**
- Examen visual (eye-exam)
- Adaptación de lentes de contacto (contact-lens-fitting)
- Seguimiento (followup)
- Emergencia (emergency)
- Selección de armazón (frame-selection)
- Ajuste (adjustment)

**Estados:**
- Programada (scheduled)
- Confirmada (confirmed)
- En progreso (in-progress)
- Completada (completed)
- Cancelada (cancelled)
- No asistió (no-show)

**Características:**
- Calendario de disponibilidad
- Slots de tiempo configurables (30 min por defecto)
- Horario de trabajo (9:00 AM - 6:00 PM)
- Duración personalizada por cita
- Recordatorios
- Asociación con historia clínica al completar
- Gestión de profesionales

**Servicios Mock:**
```typescript
appointmentService.getAll()
appointmentService.getById(id)
appointmentService.getByPatientId(patientId)
appointmentService.getByDate(date, practitionerId?)
appointmentService.getUpcoming(limit?)
appointmentService.getAvailableSlots(date, practitionerId, duration?)
appointmentService.create(data, createdBy)
appointmentService.update(id, data)
appointmentService.updateStatus(id, status, reason?)
appointmentService.delete(id)
appointmentService.sendReminder(id)
```

---

## 🎨 Menú del Sidebar

El menú está organizado por módulos funcionales:

```
📊 Dashboard
👥 Pacientes
  ├─ 📋 Lista de Pacientes
  └─ ➕ Nuevo Paciente

📅 Citas
  ├─ 🗓️ Calendario
  ├─ ➕ Nueva Cita
  └─ ⏰ Pendientes

🏥 Historia Clínica
  ├─ 📄 Historiales
  └─ 👁️ Nuevo Examen

💰 Ventas
  ├─ 📊 Ventas
  ├─ 🛒 Nueva Venta
  └─ 📈 Reportes

📦 Inventario
  ├─ 🔍 Productos
  ├─ 👓 Armazones
  ├─ 🔬 Lentes
  ├─ 📊 Control de Stock
  └─ ⚠️ Alertas

⚙️ Configuración
  ├─ 👤 Perfil
  ├─ 👥 Usuarios
  └─ 🏢 Datos de Óptica
```

---

## 🔗 Relaciones entre Features

```
Patient (Paciente)
  ├─→ MedicalRecord (Historia Clínica)
  ├─→ Appointment (Citas)
  └─→ Sale (Ventas)

MedicalRecord
  └─→ Sale (puede generar venta de lentes)

Appointment
  └─→ MedicalRecord (al completar examen)

Sale
  ├─→ Patient (cliente)
  ├─→ Product (items vendidos)
  └─→ MedicalRecord (prescripción asociada)

Product
  ├─→ Sale (ventas)
  └─→ StockMovement (movimientos)
```

---

## 🚀 Próximos Pasos para Integrar APIs

Cada servicio mock está estructurado para ser reemplazado fácilmente por llamadas API reales:

### 1. Crear un API client base:

```typescript
// src/lib/api.ts
export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  // ... put, delete, etc.
};
```

### 2. Actualizar cada servicio:

```typescript
// Ejemplo: src/features/patients/services/patientService.ts
export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    return api.get('/patients');
  },

  getById: async (id: string): Promise<Patient | null> => {
    return api.get(`/patients/${id}`);
  },

  // etc...
};
```

### 3. Variables de entorno:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📊 Datos Mock Incluidos

Cada feature incluye datos de ejemplo:
- **3 pacientes** con información completa
- **3 historias clínicas** con mediciones reales
- **6 productos** de diferentes categorías
- **3 ventas** completadas
- **4 citas** (pasadas y futuras)

---

## ✅ Buenas Prácticas Implementadas

1. **Arquitectura Modular**: Cada feature es independiente
2. **Tipado fuerte**: TypeScript en toda la aplicación
3. **Separación de responsabilidades**: types, services, components, hooks
4. **Servicios reutilizables**: Fácil de conectar con APIs
5. **Datos realistas**: Mock data representa casos reales de óptica
6. **Escalabilidad**: Estructura lista para crecer

---

## 🔧 Tecnologías

- **React 19** + TypeScript
- **Vite** para build
- **Tailwind CSS** para estilos
- **Context API** para estado global
- Arquitectura **Feature-based**

---

## 📝 Notas

- Todos los precios están en pesos mexicanos
- IVA configurado al 16%
- Horarios de 9:00 AM - 6:00 PM
- Slots de citas de 30 minutos
- Stock mínimo configurado por producto
