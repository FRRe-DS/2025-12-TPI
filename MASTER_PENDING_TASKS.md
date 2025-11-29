# 📋 MASTER PLAN: Tareas Pendientes para Entrega Final

Este documento consolida todos los requisitos faltantes, deuda técnica y tareas de integración necesarias para finalizar el proyecto, priorizadas por impacto en la evaluación.

---

## 🚨 FASE 1: BASE DE DATOS Y CORE (Bloqueante)

Antes de conectar el frontend, debemos arreglar el modelo de datos.

### 1.1. Corrección de Esquema (Prisma)
- **Problema**: No existe relación entre `Shipment` (Envío) y `Route` (Ruta).
- **Tarea**: Modificar `backend/shared/database/prisma/schema.prisma`.
  - Agregar campo `shipmentId` (opcional, unique) al modelo `RouteStop`.
  - Esto permite que una parada en la ruta corresponda a la entrega/recogida de un envío específico.
- **Acción**: Crear migración `link_route_stop_to_shipment`.

---

## 🚚 FASE 2: BACKEND - GESTIÓN DE ESTADOS Y RUTAS

### 2.1. Actualización de Estados (RF-017) - [CRÍTICO]
- **Faltante**: Endpoint `PATCH /shipping/{id}/status`.
- **Lógica Requerida**:
  - Validar transición de estados (ej: de `CREATED` a `IN_TRANSIT`).
  - Actualizar historial en `ShipmentLog`.
  - Recalcular ETA si el estado cambia a `IN_TRANSIT` o `DELAYED`.

### 2.2. Lógica de Planificación (RF-023)
- **Faltante**: Endpoint `GET /fleet/routes/pending-shipments`.
  - Debe devolver envíos con estado `CREATED` que aún no están asignados a una ruta activa.
- **Faltante**: Validación de Capacidad en `POST /fleet/routes`.
  - Sumar peso/volumen de los envíos asignados.
  - Validar contra capacidad del vehículo seleccionado.

### 2.3. Corrección de Contrato API (Swagger)
- **Tarea**: Asegurar que los DTOs de respuesta en `ShippingService` usen `snake_case` para cumplir con `openapilog.yaml`. (Ya se avanzó en esto, falta verificar persistencia).

---

## 🖥 FASE 3: FRONTEND - DASHBOARD OPERATIVO

### 3.1. Dashboard de Hojas de Ruta (RF-024) - [CRÍTICO]
- **Estado Actual**: Tabla simple con datos mock.
- **Tarea**: Reconstruir página `/operaciones/hojas-ruta`.
  - Implementar **Drag & Drop** (librería `dnd-kit`).
  - **Panel Izquierdo**: Lista de "Envíos Pendientes" (consumiendo endpoint nuevo 2.2).
  - **Panel Derecho**: Constructor de Ruta (Timeline).
  - Visualizar barra de capacidad del vehículo.

### 3.2. Eliminación de Mocks (Integración)
- **Tarea**: Conectar todas las páginas a los endpoints reales.
  - `/operaciones/seguimiento`: Usar `shipmentService` real.
  - `/operaciones/hojas-ruta`: Usar `routeService` real.
  - Eliminar funciones `generateMockData()`.

### 3.3. Polish UX/UI (RF-033)
- **Tarea**: Mejorar feedback visual.
  - Spinners de carga reales.
  - Manejo de errores (Toasts) cuando falla el backend.
  - Logo definitivo.

---

## 🌐 FASE 4: INTEGRACIÓN Y ENTREGA

### 4.1. Integración con Portal (RF-028)
- **Tarea**: Verificar flujo End-to-End.
  - Simular petición desde Portal (crear envío).
  - Verificar que aparece en "Pendientes" en nuestro Dashboard.
  - Asignar a ruta y cambiar estado.
  - Verificar que Portal ve el nuevo estado.

### 4.2. Documentación y Deploy
- **Tarea**: Generar `README.md` final con instrucciones de despliegue.
- **Tarea**: Verificar despliegue en Oracle Cloud (Docker Compose).

---

## 📉 FASE 5: EXTRAS Y REPORTES (RF-018, RF-030)

### 5.1. Generación de Etiquetas PDF (RF-018)
- **Objetivo**: Permitir descargar una etiqueta de envío con código de barras.
- **Implementación Backend**:
  - Nuevo Endpoint: `GET /shipping/{id}/label`.
  - Librería: Usar `pdfkit` (ligero) o `puppeteer` (más pesado pero flexible con HTML).
  - **Contenido del PDF**:
    - Logo de la empresa.
    - Código de barras (usando librería `bwip-js` o similar) con el `tracking_number`.
    - Dirección de Origen y Destino bien formateadas.
    - Peso y detalles básicos.
- **Implementación Frontend**:
  - Botón "Imprimir Etiqueta" en el detalle del envío.

### 5.2. Dashboard de Reportes Real (RF-030)
- **Objetivo**: Reemplazar gráficos estáticos con datos agregados de la BD.
- **Endpoints Requeridos** (en Gateway o Shipping Service):
  - `GET /reports/kpis`: Retorna contadores rápidos.
    - Envíos totales hoy.
    - Envíos entregados vs pendientes.
  - `GET /reports/shipments-by-status`: Para gráfico de torta/barras.
    - Query: `SELECT status, COUNT(*) FROM shipments GROUP BY status`.
  - `GET /reports/revenue-over-time`: Para gráfico de línea.
    - Query: `SELECT DATE(created_at), SUM(total_cost) FROM shipments GROUP BY DATE(created_at)`.
- **Frontend**:
  - Conectar componentes de gráficos (`Chart.js` / `Recharts`) a estos endpoints.
