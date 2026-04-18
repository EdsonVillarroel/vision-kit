# Vision Kit — Plan de Negocio y Estrategia de Suscripciones

> **Fecha:** 2026-04-17
> **Scope:** estrategia go-to-market, pricing, packaging y roadmap 3-6 meses para el SaaS multi-tenant Vision Kit dirigido a ópticas en Bolivia.
> **Arquitectura asumida:** multi-tenant (cada óptica = 1 tenant aislado por `tenant_id` + RLS). El plan Cadena añade multi-sucursal *dentro* de un único tenant — no confundir ambos conceptos.

---

## 0. Estado actual (hechos, no narrativa)

- Monorepo con 4 apps (`frontend`, `admin`, `landing`, `backend`). Multi-tenant con `tenant_id` + RLS. Portal público `/:tenantSlug` ya funciona.
- Modelo `SubscriptionPlan` en [apps/backend/prisma/schema.prisma](../apps/backend/prisma/schema.prisma) ya trae los campos duros para enforcement de cuotas: `maxUsers`, `maxPatients`, `maxProducts`, `maxStorageMb`, y un `features: Json` libre para flags. **No se necesita migración para empezar a diferenciar planes**, solo poblar el JSON y cablear guards.
- [apps/backend/prisma/seed.ts](../apps/backend/prisma/seed.ts) aún está hardcodeado con datos mexicanos (CURP, `+52`, `MXN`, `taxRate 0.16`). Para Bolivia hay que bolivianizar el seed: NIT/CI, `+591`, `BOB`, IT 3% o factura electrónica SIN (régimen vigente). **Esto es un bloqueador de demo real, no solo cosmético.**
- [apps/backend/src/platform/platform.service.ts](../apps/backend/src/platform/platform.service.ts) ya tiene CRUD de planes y suscripciones desde el admin panel — la plomería existe, lo que falta es enforcement en runtime y copy/packaging comercial.

---

## 1. Análisis y mejoras del plan de negocio

### 1.1 Propuesta de valor por segmento

El error clásico en LATAM B2B es vender "un software de gestión". Vende **resultados medibles en el lenguaje del óptico**:

| Segmento | Perfil | Dolor principal | Propuesta de valor específica |
|---|---|---|---|
| **Micro óptica (1-2 personas)** | Óptico-dueño, factura Bs 15k-40k/mes, usa cuaderno o Excel | Se le olvidan citas, no recuerda quién debe, no tiene presencia web | "Tu óptica en Google y WhatsApp en 10 minutos. Nunca más pierdas una cita." Foco: landing pública + recordatorios + agenda. |
| **Óptica mediana (3-8 empleados, 1 local)** | Admin + 2-3 ópticos, factura Bs 60k-200k/mes | Control de inventario, comisiones por óptico, historial clínico disperso | "Control total de inventario y ventas. Sabé qué vende cada óptico y qué se está agotando antes de que pase." |
| **Cadena (2-5 sucursales)** | Gerente general, equipo administrativo | Consolidar reportes, transferencias entre sucursales, estandarizar precios | "Una sola vista de todas tus sucursales. Transferí stock, consolidá ventas, estandarizá precios." |

**Mensaje único para todos los segmentos:** "Vision Kit es el único software hecho para ópticas de Bolivia, en español, con soporte local y factura electrónica lista para el SIN." Ese "hecho para ópticas bolivianas" es lo que Odoo no puede clonar rápido.

### 1.2 Canales de adquisición realistas para Bolivia

Prioridad ordenada por CAC esperado (de más barato a más caro):

1. **Referidos con incentivo cruzado** (CAC ~Bs 0-300). Por cada óptica que refiera, 1 mes gratis al que refiere + 20% descuento 3 meses al nuevo. Las ópticas en Bolivia se conocen entre sí — La Paz, Santa Cruz y Cochabamba son mercados pequeños y endogámicos.
2. **Alianzas con distribuidores de lentes** (CAC ~Bs 200-500 vía revshare). Essilor, Johnson & Johnson, distribuidores locales como "Óptica del Valle" o mayoristas de La Paz. Ofrecé comisión 15% primer año por cada cliente que te pasen. Ellos quieren que sus ópticas profesionalicen porque venden más volumen.
3. **WhatsApp Business outbound segmentado** (CAC ~Bs 500-1,000). Construí una lista de 500 ópticas bolivianas (Google Maps + Instagram + Páginas Amarillas). Mensaje corto: "Hola, vimos su óptica en [X]. Les armamos una página web gratis con catálogo y reserva de citas. ¿Les mostramos en 10 min?" El gancho es la **landing pública gratis** como lead magnet.
4. **Instagram ads local** (CAC ~Bs 800-1,500). Segmentar por interés "óptica/optometría" en La Paz, Santa Cruz, Cochabamba, El Alto, Sucre. Creatividades: antes/después del caos del cuaderno al panel limpio.
5. **Ferias y eventos ópticos** (CAC ~Bs 1,500-3,000 pero LTV alto). Congreso Boliviano de Optometría, ExpoSalud. Stand barato, demo en vivo, 2-3 contratos anuales cierran el costo.
6. **Contenido SEO en español** (CAC largo plazo). "Cómo abrir una óptica en Bolivia", "Plantilla de historial clínico óptico", "Formato de receta oftalmológica PDF". Todo contenido debe terminar en CTA a Vision Kit.

**No invertir en** Google Ads genéricos (caro, competencia con Odoo), ni LinkedIn (las ópticas bolivianas no compran ahí).

### 1.3 Pricing psicológico

Tres movimientos concretos:

- **Ancla con el plan más caro visible pero poco vendido.** El "Cadena" a Bs 1,199/mes hace que "Óptica Pro" a Bs 549 parezca razonable. Clásico decoy pricing.
- **Trial > Freemium.** Bolivia es mercado de baja conversión freemium. **14 días trial con todas las funciones**, sin tarjeta (pide datos de contacto y NIT). Después: downgrade forzado a Free limitado o pago. Freemium sí tiene sentido como **tier "Escaparate"** (solo landing pública + agenda simple) porque eso es lead magnet, no producto principal.
- **Descuento anual agresivo: 20% off** (equivalente a 2.4 meses gratis). Mejora cashflow, baja churn, permite invertir ese cash en ads. Mostrar siempre el precio mensual como "Bs 439/mes *facturado anual*" vs. "Bs 549/mes".
- **Bundling de onboarding:** "Migración de datos desde Excel + 2 horas de capacitación Zoom" como add-on pago Bs 500 una vez — o **gratis si pagan anual**. Reduce fricción de cambio.
- **Precios terminados en 9 o 5**, no redondos. "Bs 549" convierte más que "Bs 550" aunque sea absurdo — probado en LATAM SMB.

### 1.4 Add-ons / upsells (revenue adicional sin inflar el plan base)

| Add-on | Precio sugerido | Segmento objetivo |
|---|---|---|
| **WhatsApp Business API (recordatorios automáticos)** | Bs 99/mes + Bs 0.30 por mensaje | Todos los planes pagos |
| **SMS recordatorios** (fallback sin internet en paciente) | Bs 49/mes + Bs 0.50/SMS | Mediana/Cadena |
| **Dominio personalizado** (tuoptica.com en vez de /tuoptica en visionkit.com) | Bs 79/mes | Mediana/Cadena |
| **Sucursal adicional** | Bs 150/mes por sucursal extra | Cadena |
| **Usuario adicional** sobre cuota del plan | Bs 49/mes por usuario | Todos |
| **Reportes avanzados PRO** (cohortes, comisiones por óptico, análisis de margen por SKU) | Bs 99/mes | Mediana/Cadena |
| **Integración factura electrónica SIN** (siat.impuestos.gob.bo) | Bs 149/mes | Todos (obligatorio para la mayoría) |
| **Backups diarios con retención 90 días** | Bs 59/mes | Mediana/Cadena |
| **API access + webhooks** | Bs 199/mes | Cadena / integradores |
| **Migración desde Excel/Odoo** (one-shot) | Bs 499 única vez | Todos en onboarding |

El colchón de ingresos reales está en WhatsApp API + Factura electrónica SIN. Son obligatorios de facto, no "nice to have".

### 1.5 Features diferenciadoras (aún no construidas, pero encajan)

Ordenadas por **impacto comercial / esfuerzo** (las primeras son las que debe construir primero):

1. **Receta digital con QR compartible** — el paciente recibe un link/PDF con su graduación y puede compartirlo con cualquier laboratorio. Excelente viralidad: cada receta emitida lleva "Generado con Vision Kit" al pie. **Esfuerzo bajo** (ya existe el módulo de exámenes clínicos).
2. **Factura electrónica SIN integrada** — integración con Sistema de Facturación Electrónica del Servicio de Impuestos Nacionales. Es **casi obligatorio** para ópticas formales en Bolivia. Alto esfuerzo regulatorio pero mata a Odoo genérico.
3. **Módulo de taller/montaje con tracking** — cuando un paciente pide lentes con graduación, los recibe del laboratorio, los monta, los entrega. Estados: "pedido al lab / recibido / montado / listo para entrega / entregado". Con notificación automática al paciente por WhatsApp. Esto **no existe en ningún CRM genérico** y las ópticas lo piden a gritos.
4. **Programa de fidelidad con puntos** — 1 Bs gastado = 1 punto, 500 puntos = Bs 50 de descuento. Genera datos de recompra y aumenta LTV del paciente final (no del tenant, pero el tenant paga más porque ve el valor).
5. **Recordatorio automático de revisión anual** — 11 meses después del último examen, Vision Kit envía WhatsApp al paciente. Métrica estrella que el óptico puede mostrar al dueño: "te trajimos X pacientes de vuelta".
6. **Integración con aseguradoras bolivianas** (Bisa Seguros, La Boliviana Ciacruz, Alianza). Autorización previa y cobro directo. Esfuerzo alto, pero es barrera de entrada brutal para competencia.
7. **Catálogo virtual con probador AR** (face.js / FaceAPI, usa cámara del teléfono del paciente). Sube una foto, prueba armazones. No es trivial pero existen librerías open source. **Marketing gold** — video en Instagram vendiéndolo.
8. **Módulo de comisiones por óptico** — cierre de mes automático con cuánto le toca a cada vendedor/optómetra. Esto soluciona peleas internas reales.
9. **Reporte de low-stock con reorden sugerido** — cruza ventas de últimos 90 días con stock actual y sugiere pedido al proveedor. Un clic genera WhatsApp o email al distribuidor.

### 1.6 Métricas SaaS que el fundador debe trackear

Estas métricas deben vivir en [apps/admin](../apps/admin) (panel de platform admin) porque las mira el fundador, no los tenants.

| Métrica | Definición operativa | Dónde calcular |
|---|---|---|
| **MRR** (Monthly Recurring Revenue) | Suma de `plan.price` de suscripciones `active` normalizado a mensual (anual / 12) | Query sobre `subscriptions` + `subscription_plans`. Ya existe infraestructura en `platform.service.ts`. |
| **ARR** | MRR × 12 | Derivado |
| **New MRR / Expansion MRR / Churned MRR** | Por mes: nuevas subs, upgrades, canceladas | Necesita event sourcing o snapshot mensual en tabla nueva `mrr_events` |
| **Gross Churn %** | Subs canceladas este mes / subs activas al inicio del mes | `cancelledAt` ya existe en `Subscription` |
| **Net Revenue Retention** | (MRR inicio + expansion - downgrade - churn) / MRR inicio | Avanzado, para cuando haya 50+ tenants |
| **CAC** | Gasto mkt del mes / nuevos tenants pagos del mes | Input manual en admin (campo "gasto_mkt_mensual") |
| **LTV** | ARPU / churn mensual | Derivado |
| **LTV:CAC** | Objetivo > 3:1 | Derivado |
| **Activation rate** | % tenants que en primeros 7 días crean ≥1 paciente, ≥1 producto, ≥1 cita | Query sobre tablas operativas |
| **Time to first value** | Horas desde signup a primera acción meaningful | Timestamp en `tenants.createdAt` vs. primer `patient.createdAt` |
| **Feature adoption por plan** | % de tenants del plan X que usaron feature Y este mes | Log de eventos (puede ser tabla `usage_events` simple) |
| **DAU/WAU/MAU por tenant** | Usuarios activos en el panel | Log de login + eventos principales |

**Implementación mínima viable:** una sola vista `/admin/metrics` con cards de MRR, churn mes, tenants activos, MRR por plan. Queries Prisma directas, sin warehouse. Cuando pasen los 50 tenants entonces pensar en Metabase/PostHog.

---

## 2. Rediseño de planes de suscripción

### 2.1 Tabla comparativa

Los planes actuales (Bs 150 / 350 / 700) están **mal posicionados**: el salto de 150 a 350 es 133%, el de 350 a 700 es 100%. No hay ancla premium. Los límites no son visibles ni accionables. Propongo 4 tiers (incluyendo Free) con nombres comerciales en español:

| Característica | **Escaparate** (Free) | **Consultorio** | **Óptica Pro** | **Cadena** |
|---|---|---|---|---|
| **Precio mensual** | Bs 0 | **Bs 249** | **Bs 549** | **Bs 1,199** |
| **Precio anual** (20% off) | Bs 0 | **Bs 199/mes** (Bs 2,388/año) | **Bs 439/mes** (Bs 5,268/año) | **Bs 959/mes** (Bs 11,508/año) |
| **USD equivalente** (6.96 Bs/USD) | $0 | ~$35/mes | ~$79/mes | ~$172/mes |
| **Público objetivo** | Óptica 1 persona probando; lead magnet | Micro óptica 1-2 personas | Óptica mediana 3-8 empleados, 1 local | Cadena 2-5 sucursales |
| **Usuarios** | 1 | 2 | 6 | 15 (extensible) |
| **Pacientes** | 50 | 500 | 5,000 | Ilimitado |
| **Productos en inventario** | 30 | 300 | 2,000 | Ilimitado |
| **Ventas/mes** | 20 | 200 | 2,000 | Ilimitado |
| **Storage exámenes/imágenes** | 100 MB | 2 GB | 10 GB | 50 GB |
| **Sucursales** | 1 | 1 | 1 | 3 incluidas (extra Bs 150/mes) |
| **Portal público /:slug** | Sí (con marca Vision Kit) | Sí | Sí (marca removible) | Sí (marca removible) |
| **Booking público de citas** | 5 reservas/mes | Ilimitado | Ilimitado | Ilimitado |
| **Recordatorios email** | No | Sí | Sí | Sí |
| **Recordatorios WhatsApp** | No | Add-on | Incluido (500 msg/mes) | Incluido (3,000 msg/mes) |
| **Historial clínico y exámenes** | Básico | Completo | Completo + plantillas personalizadas | Completo + plantillas |
| **Receta digital con QR** | No | Sí | Sí | Sí |
| **Módulo taller/montaje** | No | No | Sí | Sí |
| **Comisiones por óptico** | No | No | Sí | Sí |
| **Reportes básicos** | No | Sí | Sí | Sí |
| **Reportes avanzados** (cohortes, margen, stock turnover) | No | No | Sí | Sí |
| **Multi-sucursal consolidado** | No | No | No | Sí |
| **Transferencias de stock entre sucursales** | No | No | No | Sí |
| **Dominio personalizado** | No | Add-on (Bs 79) | Add-on (Bs 79) | Incluido |
| **Factura electrónica SIN** | No | Add-on | Add-on | Incluido |
| **API access + webhooks** | No | No | No | Sí |
| **Exportación de datos** (CSV/Excel) | Pacientes | Todo | Todo | Todo + scheduled exports |
| **Backups** | Semanal (retención 7 días) | Diario (30 días) | Diario (60 días) | Diario (90 días) + snapshot on-demand |
| **Soporte** | Email 48h | Email 24h | WhatsApp + email 8h | WhatsApp dedicado + SLA 4h |
| **Onboarding** | Self-service | 1h video | 2h video + migración datos | Full migración + capacitación on-site (La Paz/SCZ/CBBA) |

**Notas de implementación del packaging:**

- Todos los toggles de features caen en el campo `features: Json` del modelo `SubscriptionPlan`. Ejemplo: `{ "workshop_module": true, "custom_domain": false, "commissions": true, "whatsapp_included_messages": 500, "multi_branch": true }`.
- Los límites numéricos (`maxUsers`, `maxPatients`, `maxProducts`, `maxStorageMb`) ya tienen columnas. Falta añadir: `maxSalesPerMonth` y `maxBranches` — requieren migración.
- **Trial:** todo signup nuevo entra con plan "Óptica Pro" durante 14 días, luego downgrade a "Escaparate" si no paga. No pedir tarjeta upfront.
- **Grandfathering:** los 3 tenants actuales (si existen) mantienen precios viejos 12 meses.

### 2.2 Enforcement de límites (cómo aplicar los planes)

El modelo ya soporta esto. Lo que falta cablear:

- **Guard NestJS `PlanQuotaGuard`** que antes de crear `Patient`, `Product`, `Sale` consulte `subscription.plan.maxX` contra el count actual del tenant. Devuelve 402 Payment Required con mensaje claro: "Alcanzaste el límite de 500 pacientes del plan Consultorio. Actualiza a Óptica Pro."
- **Feature flag helper** en frontend: `const hasFeature = (key) => plan.features[key] === true`. Cada botón de feature premium muestra un badge "PRO" y modal de upgrade si no está disponible.
- **Soft limits con warning al 80%** del límite para no sorprender al tenant.

---

## 3. Roadmap — features nuevas (3-6 meses)

Ordenadas por **impacto comercial (I) vs. esfuerzo de dev (E)**. Formato: `[I/E]`.

| # | Feature | I | E | Justificación comercial |
|---|---|---|---|---|
| 1 | **Enforcement de cuotas + UI de upgrade** | Alto | Bajo | Sin esto, nadie paga planes superiores. Cuotas ya modeladas. 3-5 días. **Gate que desbloquea todo lo demás.** |
| 2 | **Recordatorios de cita por email + WhatsApp Business API** | Alto | Medio | Feature que el óptico **siente cada día**. Reduce no-shows 30-40%. WhatsApp requiere aprobación de Meta (2-4 sem). Email hoy mismo. |
| 3 | **Receta digital con QR compartible + PDF** | Alto | Bajo | Viralidad orgánica — cada receta lleva branding. 1 semana dev. |
| 4 | **Factura electrónica SIN (Bolivia)** | Muy alto | Muy alto | Es el diferenciador vs. Odoo. Requiere entender API del SIN, certificación. 6-8 semanas, pero **mata competencia**. |
| 5 | **Módulo de taller/montaje con tracking de órdenes** | Alto | Medio | Feature pedido explícito por ópticas, no existe en competencia. 2-3 semanas. |
| 6 | **Dashboard de métricas platform admin (MRR, churn, activation)** | Alto (para el fundador) | Bajo | Sin métricas no hay decisiones de producto. 3-5 días. |
| 7 | **Multi-sucursal real con transferencias de stock** | Medio | Alto | Justifica plan Cadena. Construir cuando haya 2+ clientes pidiéndolo. No antes. |
| 8 | **Programa de fidelidad con puntos** | Medio | Medio | Add-on vendible, no crítico en primeros 6 meses. |

**Secuencia temporal sugerida (orden real de construcción):**

1. Semanas 1-2: **#1 Enforcement + UI de upgrade** + **#6 Dashboard métricas**. Corto, alto apalancamiento.
2. Semanas 3-4: **#3 Receta digital con QR** + kickoff registro WhatsApp Business API (Meta).
3. Semanas 5-8: **#2 Recordatorios email/WhatsApp** (una vez aprobado por Meta) + **bolivianización de seed** y copy.
4. Semanas 9-12: **#5 Módulo taller**. Empezar onboarding de primeros 10 clientes pagos.
5. Semanas 13-20: **#4 Factura electrónica SIN**. Mientras, ventas siguen cerrando con add-on manual.
6. Después de 20-30 tenants: **#7 Multi-sucursal** y **#8 Fidelidad**.

---

## 4. Recomendación clara: qué hacer la próxima semana

**Objetivo de la semana:** pasar de "tengo un producto" a "puedo vender el plan correcto al cliente correcto y cobrarle lo que vale".

**Lunes-Martes (dev, 2 días):**
1. Bolivianizar el `seed.ts` y `ClinicSettings` defaults: reemplazar CURP por CI/NIT, teléfonos `+591`, currency `BOB`, taxRate 0.13 (IVA efectivo en facturación) o 0.03 según régimen, ciudades bolivianas. Bloquea demos creíbles.
2. Crear el script de seed de planes (`seedPlans.ts`) con los 4 tiers nuevos (Escaparate, Consultorio, Óptica Pro, Cadena) y el JSON de `features` mapeado.

**Miércoles (dev, 1 día):**
3. Implementar `PlanQuotaGuard` + helper `hasFeature()` en frontend. Cablear al menos a 3 endpoints críticos: crear paciente, crear producto, crear venta.

**Jueves (product/growth, 1 día):**
4. Armar landing de pricing en `apps/landing` con la tabla comparativa de los 4 planes (copiable desde §2.1). Incluir toggle mensual/anual con descuento 20% visible.
5. Redactar los 3 mensajes outbound de WhatsApp segmentados por tamaño de óptica (texto corto, link a landing, oferta trial 14 días).

**Viernes (ventas, 1 día):**
6. Construir lista de 50 ópticas objetivo en La Paz + Santa Cruz (Google Maps + Instagram). Mandar los primeros 20 mensajes outbound. Meta: agendar 3 demos para la semana siguiente.

**Métrica de éxito de la semana:** 3 demos agendadas y 4 planes reales en DB con enforcement funcionando. Todo lo demás del roadmap se construye sobre eso.

**Lo que NO hay que hacer todavía:** factura electrónica SIN, AR del catálogo, multi-sucursal, integración con aseguradoras. Son features para cuando haya tracción validada — gastar semanas ahí sin clientes pagos es el error #1 de founders técnicos.

---

## 5. Archivos clave para la implementación

- [apps/backend/prisma/schema.prisma](../apps/backend/prisma/schema.prisma) — añadir `maxSalesPerMonth`, `maxBranches` al modelo `SubscriptionPlan`
- [apps/backend/prisma/seed.ts](../apps/backend/prisma/seed.ts) — bolivianizar datos demo
- [apps/backend/prisma/seedPlans.ts](../apps/backend/prisma/seedPlans.ts) — **nuevo** — poblar los 4 tiers con su `features` JSON
- [apps/backend/src/platform/platform.service.ts](../apps/backend/src/platform/platform.service.ts) — base de CRUD de planes, extender con enforcement
- Guard nuevo `PlanQuotaGuard` en `apps/backend/src/common/guards/`
- [apps/admin](../apps/admin) — nueva vista `/admin/metrics` con MRR/churn/activation
- [apps/landing](../apps/landing) — nueva página `/pricing` con tabla comparativa y toggle mensual/anual
