# Análisis de Brecha: Planificación de Rutas y Gestión de Flota

Este documento detalla los elementos faltantes para completar el módulo de **Planificación de Rutas (RF-023)** y su **Dashboard (RF-024)**, así como la integración pendiente entre Frontend y Backend.

## 🚨 1. Hallazgo Crítico: Esquema de Base de Datos

Actualmente, **no existe una relación física** en la base de datos entre `Shipment` (Envíos) y `Route` (Rutas).

- **Situación Actual**:
  - `Route` tiene `RouteStop[]`.
  - `RouteStop` tiene dirección y coordenadas, pero **NO** tiene referencia al `Shipment`.
  - `Shipment` no tiene `routeId`.
- **Problema**: Es imposible asignar un envío a una ruta con el esquema actual.
- **Solución Requerida**:
  - Modificar `schema.prisma` para agregar `shipmentId` (opcional) al modelo `RouteStop` O agregar `routeId` al modelo `Shipment`.
  - *Recomendación*: Agregar `shipmentId` @unique en `RouteStop` para vincular una parada explícitamente a una entrega de envío.

## 🛠 2. Backend: Config Service & Fleet (RF-023)

El controlador actual `RoutesController` es un CRUD básico. Falta toda la lógica de negocio.

### Endpoints Faltantes
1.  **`GET /fleet/routes/pending-shipments`**
    - **Objetivo**: Obtener envíos con estado `CREATED` o `READY` que pertenecen a una zona específica y aún no tienen ruta.
    - **Lógica**: Consultar tabla `Shipments` filtrando por estado y nulo en ruta asignada.
2.  **`POST /fleet/routes/optimize`** (Opcional/Advanced)
    - **Objetivo**: Recibir una lista de paradas y devolverlas ordenadas por proximidad (Nearest Neighbor).

### Lógica de Negocio Faltante
1.  **Validación de Capacidad (Peso/Volumen)**:
    - Al crear/actualizar una ruta, sumar el `weight` y `volume` de todos los `shipments` asignados.
    - Comparar contra `Vehicle.capacityKg` y `Vehicle.volumeM3`.
    - Lanzar advertencia si > 90% o error si > 100%.
2.  **Transición de Estados**:
    - Al confirmar una ruta, actualizar el estado de los envíos asociados a `RESERVED` o `PLANNED`.

## 🖥 3. Frontend: Dashboard de Rutas (RF-024)

La página actual `src/app/(main)/operaciones/hojas-ruta/page.tsx` es solo una tabla de listado. No cumple con el requisito funcional de planificación.

### Componentes Faltantes
1.  **Layout de Planificación (Split View)**:
    - **Panel Izquierdo**: "Envíos Pendientes" (Lista de cards arrastrables).
    - **Panel Derecho**: "Detalle de Ruta" (Timeline de paradas, Droppable area).
2.  **Interacción Drag & Drop**:
    - Implementar librería (ej: `dnd-kit` o `react-beautiful-dnd`).
    - Permitir arrastrar un envío del panel izquierdo al derecho.
3.  **Indicadores Visuales**:
    - Barra de progreso de capacidad del vehículo (Verde/Amarillo/Rojo) que se actualiza en tiempo real al arrastrar items.

## 🔌 4. Integración Frontend <-> Backend

Actualmente el Frontend usa **Mocks** (`generateMockRoutes`). La conexión real requiere:

1.  **Servicios de Middleware**:
    - Actualizar `route.service.ts` para consumir los endpoints reales.
    - Crear método `getPendingShipments()`.
2.  **Manejo de Estado (Stores)**:
    - `routes.store.ts` necesita manejar la "ruta en edición" (draft) antes de guardarla en el backend.

---

## ✅ Plan de Acción Recomendado

### Paso 1: Base de Datos (Bloqueante)
- [ ] Actualizar `schema.prisma` agregando la relación `RouteStop` -> `Shipment`.
- [ ] Ejecutar migración.

### Paso 2: Backend Core
- [ ] Implementar endpoint `GET /pending-shipments`.
- [ ] Implementar lógica de cálculo de capacidad en `RoutesService.create`.

### Paso 3: Frontend UI
- [ ] Instalar librería Drag & Drop.
- [ ] Reconstruir la página `hojas-ruta` con el diseño de dos columnas.
- [ ] Conectar Panel Izquierdo a `getPendingShipments`.
- [ ] Conectar Botón "Guardar Ruta" al `POST /routes`.

