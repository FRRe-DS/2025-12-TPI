# Análisis de Requisitos Pendientes

Basado en un análisis exhaustivo del código actual frente a `zutils/REQUISITOS.md`.

## 🔴 PRIORIDAD 0 - CRÍTICO (Bloqueante para entrega/evaluación)

### 1. RF-017: Actualización de Estados de Envíos
- **Estado**: ❌ Faltante
- **Ubicación**: `backend/services/shipping-service`
- **Detalle**: No existe el endpoint `PATCH /shipping/{id}/status` en `ShippingController`.
- **Requerido**: 
  - Endpoint para transicionar estados.
  - Validación de máquina de estados.
  - Recálculo automático de ETA.
  - Registro en `ShipmentLog`.

### 2. RF-024: Dashboard de Planificación de Rutas (Drag & Drop)
- **Estado**: ⚠️ Incompleto / Mock
- **Ubicación**: `frontend/src/app/(main)/operaciones/hojas-ruta/page.tsx`
- **Detalle**: La página actual es una tabla simple que usa datos mock (`generateMockRoutes`).
- **Requerido**:
  - Interfaz de dos paneles (Pendientes vs Rutas).
  - Funcionalidad Drag & Drop (`RF-026`).
  - Validación visual de capacidad (semaforo de colores).
  - Integración real con el backend.

### 3. RF-033: Polish UX/UI y Frontend
- **Estado**: ⚠️ En Progreso
- **Ubicación**: Todo el Frontend
- **Detalle**: Hay componentes visuales básicos, logo de texto "PEPACK", y uso extensivo de mocks en páginas clave (`Seguimiento`, `HojasRuta`).
- **Requerido**:
  - Eliminar todos los fallbacks a `generateMockData`.
  - Asegurar consistencia visual final.
  - Feedback visual real en cargas y errores.

### 4. RF-028: Integración Completa con Portal
- **Estado**: ❓ A Verificar
- **Ubicación**: `backend/services/shipping-service/src/tracking.controller.ts`
- **Detalle**: Existe el controlador para recibir peticiones del Portal, pero se debe verificar el flujo completo End-to-End.

### 5. RF-034/035/036: Documentación y Deploy Final
- **Estado**: 🕒 Pendiente
- **Detalle**: Tareas finales de documentación (README, Arquitectura), Video Demo y Deploy en Oracle Cloud.

---

## 🟡 PRIORIDAD 1 - IMPORTANTE

### 6. RF-023: Lógica Avanzada de Planificación (Backend)
- **Estado**: ⚠️ Parcial
- **Ubicación**: `backend/services/config-service/src/fleet/services/routes.service.ts`
- **Detalle**: El servicio actual es un CRUD básico.
- **Requerido**:
  - Endpoint `GET /routes/pending-shipments` (crucial para el dashboard).
  - Validación de capacidad (peso/volumen) al crear/editar ruta.
  - Algoritmo de optimización de secuencia de paradas.

### 7. RF-019: Tracking Público
- **Estado**: ❓ A Verificar
- **Ubicación**: `frontend/src/app/(public)/track/[id]/page.tsx`
- **Detalle**: Validar que funcione correctamente sin autenticación y muestre el timeline visual.

### 8. RF-030: Dashboard de Reportes
- **Estado**: ❓ A Verificar
- **Ubicación**: `backend/services/operator-interface-service` (Gateway)
- **Detalle**: Verificar que el endpoint `GET /reports/kpis` esté implementado y conecte con datos reales.

---

## 🟢 PRIORIDAD 2 - COMPLEMENTARIO

### 9. RF-018: Generación de Etiquetas PDF
- **Estado**: ❌ Faltante
- **Ubicación**: `backend/services/shipping-service`
- **Detalle**: No existe funcionalidad para generar PDF del envío.

### 10. RF-020: Caché en Cliente
- **Estado**: 🕒 Pendiente
- **Detalle**: Optimizaciones de performance en el frontend.

