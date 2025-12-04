# 🎯 Mejoras Propuestas para el Dashboard del Frontend

## 📊 Análisis de la Base de Datos

### Datos Reales Disponibles en Supabase

**Resumen de Datos:**
- **56 envíos (shipments)** en total
  - 2 entregados (DELIVERED)
  - 36 creados (CREATED)
  - 0 en tránsito (IN_TRANSIT)
- **87 logs de seguimiento** (shipment_logs)
- **57 productos** asociados a envíos
- **5 vehículos** disponibles (todos con estado AVAILABLE)
- **6 conductores** registrados
- **30 zonas de cobertura** activas
- **5 métodos de transporte** configurados
- **2 configuraciones de tarifas**

**Distribución Geográfica:**
- 55 envíos a Rosario, Santa Fe
- 1 envío a Resistencia, Chaco

**Métricas Financieras:**
- Costo promedio por envío: ~$5,952 ARS
- Total facturado (noviembre): $330,509 ARS
- Total facturado (diciembre): $2,817 ARS

**Temporal:**
- Envíos desde: 24 de noviembre 2025
- Envíos hasta: 2 de diciembre 2025

---

## 🚀 Propuestas de Mejora para el Dashboard del Panel Principal

### 1. **Conectar Dashboard con Datos Reales** ⚡

**Estado Actual:** El dashboard usa datos mock estáticos.

**Mejora:** Conectar el dashboard del panel principal con los endpoints existentes del backend para obtener datos en tiempo real.

**Endpoints Existentes a Utilizar (Solo los que están implementados en el backend):**
```typescript
// Datos de envíos (procesar en frontend para métricas)
GET /shipping                   // Listar envíos (filtros: status, from_date, to_date, page, limit)
GET /shipping/:id               // Detalles de envío específico
GET /shipping/track/:trackingNumber  // Tracking por número

// Datos de flota
GET /fleet/vehicles             // Listar todos los vehículos
GET /fleet/vehicles/:id         // Detalles de vehículo

// Datos de configuración
GET /config/transport-methods   // Métodos de transporte disponibles
GET /config/coverage-zones      // Zonas de cobertura
GET /config/tariff-configs      // Configuraciones de tarifas
```

**Implementación - Procesar Datos en el Frontend:**
- **Métricas del Dashboard**: Usar `GET /shipping` y procesar en el frontend:
  - Contar total de envíos
  - Filtrar por estado (CREATED, IN_TRANSIT, DELIVERED, CANCELLED)
  - Calcular promedios y porcentajes
  - Agrupar por fecha para gráficos temporales
  
- **KPIs**: Calcular desde `GET /shipping`:
  - Tasa de entrega: `(DELIVERED / total) * 100`
  - Tiempo promedio: calcular desde `created_at` y `estimated_delivery_at`
  - Distribución por estado: agrupar por `status`
  - Distribución por método: agrupar por `transport_type`

- **Envíos Recientes**: Usar `GET /shipping?limit=10&page=1`

- **Estado de Flota**: Usar `GET /fleet/vehicles` y filtrar por `status` en el frontend

- **Distribución Geográfica**: Usar `GET /shipping` y agrupar por `delivery_address.city/state`

**Beneficios:**
- Datos actualizados en tiempo real
- Métricas precisas de operaciones
- Mejores decisiones basadas en datos reales
- Sin necesidad de crear nuevos endpoints

---

### 2. **Mejorar Métricas y KPIs del Panel Principal** 📈

#### A. Panel de Estadísticas Principales (Procesar en Frontend)

**Métricas a Calcular desde `GET /shipping`:**

1. **Total de Envíos**
   - Fuente: `GET /shipping` → contar total de envíos
   - Filtrar por fecha para hoy/semana/mes usando `from_date` y `to_date`
   - Mostrar en la tarjeta principal del dashboard

2. **Tasa de Entrega Exitosa**
   - Fuente: `GET /shipping` → filtrar `status = 'DELIVERED'` y calcular: `(delivered / total) * 100`
   - Mostrar como porcentaje con indicador de tendencia

3. **Tiempo Promedio de Entrega**
   - Fuente: `GET /shipping` → filtrar `status = 'DELIVERED'`
   - Calcular diferencia entre `created_at` y `estimated_delivery_at` (o fecha real si existe)
   - Convertir a días y horas para visualización

4. **Envíos en Tránsito**
   - Fuente: `GET /shipping?status=IN_TRANSIT` → contar resultados
   - Mostrar en tarjeta con indicador visual

5. **Vehículos Disponibles**
   - Fuente: `GET /fleet/vehicles` → filtrar por `status === 'AVAILABLE'`
   - Contar y mostrar en tarjeta

6. **Distribución por Estados**
   - Fuente: `GET /shipping` → agrupar por `status` y contar
   - Crear array: `[{ status: 'CREATED', count: X }, ...]`
   - Usar para gráfico de dona existente

#### B. Gráfico de Tendencias Temporales (Procesar en Frontend)

**Mejorar el gráfico mensual existente:**
- Obtener todos los envíos: `GET /shipping` (sin límite o con límite alto)
- Procesar en el frontend:
  ```typescript
  // Agrupar por mes desde created_at
  const timelineData = shipments.reduce((acc, shipment) => {
    const month = new Date(shipment.created_at).toLocaleDateString('es-AR', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { mes: month, entregas: 0, creados: 0, cancelados: 0 };
    }
    acc[month].creados++;
    if (shipment.status === 'DELIVERED') acc[month].entregas++;
    if (shipment.status === 'CANCELLED') acc[month].cancelados++;
    return acc;
  }, {});
  ```
- Reemplazar datos mock con estos datos procesados
- Agregar visualización de revenue sumando `total_cost` por mes

---

### 3. **Distribución Geográfica y Zonas** 🗺️

**Mejorar Sección de Distribución por Zonas (Usar Endpoints Existentes)**

**Datos disponibles:**
- `GET /config/coverage-zones` → Lista completa de zonas activas con `postal_codes`
- `GET /shipping` → Envíos con `delivery_address` (ciudad, estado, postal_code)

**Implementación - Procesar en Frontend:**
- Obtener envíos: `GET /shipping`
- Obtener zonas: `GET /config/coverage-zones`
- Procesar en el frontend:
  ```typescript
  // Agrupar envíos por ciudad
  const cityDistribution = shipments.reduce((acc, s) => {
    const city = s.delivery_address?.city || 'Desconocida';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});
  
  // Convertir a array y ordenar
  const topZones = Object.entries(cityDistribution)
    .map(([zona, entregas]) => ({ zona, entregas }))
    .sort((a, b) => b.entregas - a.entregas)
    .slice(0, 10);
  ```
- Usar para el gráfico de dona existente
- Agregar tooltip con cantidad de envíos por ciudad

**Beneficios:**
- Identificar zonas de alta demanda
- Visualización basada en datos reales
- Sin necesidad de crear nuevos endpoints

---

### 4. **Panel de Estado de Flota en Dashboard** 🚛

**Mejorar Visualización de Vehículos (Usar Endpoints Existentes):**

**Datos disponibles:**
- `GET /fleet/vehicles` → Lista completa de vehículos con estado
- `GET /shipping` → Envíos con `vehicle_id` para contar asignaciones

**Implementación - Procesar en Frontend:**
- Obtener vehículos: `GET /fleet/vehicles`
- Obtener envíos: `GET /shipping`
- Procesar en el frontend:
  ```typescript
  // Contar vehículos por estado
  const vehiclesByStatus = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});
  
  // Contar envíos por vehículo
  const shipmentsByVehicle = shipments
    .filter(s => s.vehicle_id)
    .reduce((acc, s) => {
      acc[s.vehicle_id] = (acc[s.vehicle_id] || 0) + 1;
      return acc;
    }, {});
  ```
- Mostrar tarjeta de resumen con:
  - Total: `vehicles.length`
  - Disponibles: `vehiclesByStatus['AVAILABLE'] || 0`
  - En uso: `vehiclesByStatus['IN_USE'] || 0`
  - En mantenimiento: `vehiclesByStatus['MAINTENANCE'] || 0`

**Visualización:**
- Tarjeta compacta en el dashboard principal
- Mostrar porcentaje de utilización: `(vehículos en uso / total) * 100`
- Link a página de gestión de flota para más detalles

---

### 5. **Top Zonas de Cobertura en Dashboard** 📍

**Usar Datos Existentes:**

**Datos disponibles:**
- `GET /config/coverage-zones` → Lista de zonas activas con `postal_codes`
- `GET /shipping` → Envíos con `delivery_address.postal_code`

**Implementación - Procesar en Frontend:**
- Obtener envíos: `GET /shipping`
- Obtener zonas: `GET /config/coverage-zones`
- Procesar en el frontend:
  ```typescript
  // Agrupar envíos por código postal y mapear a zonas
  const shipmentsByZone = shipments.reduce((acc, s) => {
    const postalCode = s.delivery_address?.postal_code;
    if (!postalCode) return acc;
    
    // Encontrar zona que contiene este código postal
    const zone = zones.find(z => z.postal_codes?.includes(postalCode));
    const zoneName = zone?.name || 'Sin zona';
    acc[zoneName] = (acc[zoneName] || 0) + 1;
    return acc;
  }, {});
  
  const topZones = Object.entries(shipmentsByZone)
    .map(([zone, shipments]) => ({ zone, shipments }))
    .sort((a, b) => b.shipments - a.shipments)
    .slice(0, 10);
  ```
- Mostrar en el gráfico de distribución existente

**Visualización:**
- Mejorar el gráfico de dona de "Distribución por Zonas" con datos reales
- Mostrar top 5-10 zonas en el dashboard principal
- Tooltip con cantidad de envíos y porcentaje

---

### 6. **Distribución por Método de Transporte** 🚚

**Usar Endpoints Existentes:**

**Datos disponibles:**
- `GET /shipping` → Envíos con `transport_type` y `total_cost`
- `GET /config/transport-methods` → Detalles de métodos (nombre, capacidad, tarifa base)

**Implementación - Procesar en Frontend:**
- Obtener envíos: `GET /shipping`
- Obtener métodos: `GET /config/transport-methods`
- Procesar en el frontend:
  ```typescript
  // Agrupar por tipo de transporte
  const byTransportType = shipments.reduce((acc, s) => {
    const type = s.transport_type || 'UNKNOWN';
    if (!acc[type]) {
      acc[type] = { count: 0, totalCost: 0 };
    }
    acc[type].count++;
    acc[type].totalCost += s.total_cost || 0;
    return acc;
  }, {});
  
  // Mapear a formato para gráfico
  const transportDistribution = Object.entries(byTransportType).map(([type, data]) => ({
    type: methods.find(m => m.code === type)?.name || type,
    count: data.count,
    percentage: (data.count / shipments.length) * 100,
    avgCost: data.totalCost / data.count
  }));
  
  // Calcular costo promedio total
  const averageCost = shipments.reduce((sum, s) => sum + (s.total_cost || 0), 0) / shipments.length;
  ```
- Usar para gráfico de distribución
- Mostrar costo promedio total en tarjeta

**Visualización:**
- Gráfico de barras o dona mostrando distribución por tipo de transporte
- Tarjeta con costo promedio total
- Tooltip con detalles de cada método

---

### 7. **Mejorar Sección "Pedidos en Proceso"** ⏱️

**Usar Endpoints Existentes:**

**Datos disponibles:**
- `GET /shipping` → Lista de envíos con `status` y `logs`
- Filtrar por estado: `GET /shipping?status=CREATED` o múltiples estados

**Implementación - Procesar en Frontend:**
- Obtener envíos en proceso: `GET /shipping` y filtrar por `status IN ['CREATED', 'IN_TRANSIT']`
- Procesar en el frontend:
  ```typescript
  const inProcess = shipments
    .filter(s => ['CREATED', 'IN_TRANSIT'].includes(s.status))
    .map(s => ({
      id: s.id,
      trackingNumber: s.tracking_number,
      status: s.status,
      progress: s.status === 'CREATED' ? 25 : s.status === 'IN_TRANSIT' ? 75 : 100,
      lastEvent: s.logs?.[s.logs.length - 1] || { message: 'Sin eventos' }
    }))
    .slice(0, 10); // Últimos 10
  ```
- Mostrar progreso basado en estado
- Actualización automática cada 30 segundos con polling

**Visualización:**
- Lista de envíos en proceso con barra de progreso
- Mostrar último evento desde `logs[logs.length - 1]`
- Badge con estado actual
- Link a detalles del envío

---

### 8. **Tabla de Envíos Recientes con Datos Reales** 📋

**Usar Endpoint Existente:**

**Datos disponibles:**
- `GET /shipping` → Lista completa de envíos con todos los campos necesarios
- Filtros disponibles: `status`, `startDate`, `endDate`, `originZone`, `destinationZone`, `transportMethodId`

**Implementación:**
- Reemplazar datos mock con `GET /shipping?limit=10` (últimos 10 envíos)
- Mapear campos de la API:
  - `tracking_number` → Tracking Number
  - `delivery_address.city, state` → Cliente/Destino
  - `status` → Estado (con badges de color)
  - `created_at` → Fecha de Creación
  - `total_cost` → Costo Total
  - `transport_type` → Método de Transporte
  - `vehicle_id` → Vehículo Asignado (mostrar si existe)

**Funcionalidades:**
- Ordenamiento: usar `created_at` descendente por defecto
- Filtrado: usar parámetros del endpoint (`status`, `startDate`, `endDate`)
- Búsqueda: filtrar client-side por `tracking_number` o usar endpoint con filtros
- Acción: link a `/shipping/:id` para ver detalles

---

### 9. **Filtros de Tiempo y Períodos** 📅

**Usar Parámetros de Endpoints Existentes:**

**Implementación:**
- Agregar selector de período en el dashboard:
  - Hoy
  - Esta semana
  - Este mes
  - Personalizado
- Pasar parámetros `from_date` y `to_date` a:
  - `GET /shipping?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`
- Procesar los datos recibidos según el período seleccionado
- Actualizar todos los componentes cuando cambie el período

**Beneficios:**
- Análisis temporal de métricas
- Comparación de períodos
- Sin necesidad de crear nuevos endpoints

---

### 10. **Alertas Básicas en Dashboard** 🔔

**Usar Datos de Endpoints Existentes:**

**Implementación - Procesar en Frontend:**
- Obtener envíos: `GET /shipping`
- Procesar alertas:
  ```typescript
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  // Envíos con retraso
  const delayedShipments = shipments.filter(s => {
    if (s.status === 'DELIVERED') return false;
    const estimatedDate = s.estimated_delivery_at ? new Date(s.estimated_delivery_at) : null;
    return estimatedDate && estimatedDate < now;
  });
  
  // Envíos en CREATED por más de 48h
  const stuckShipments = shipments.filter(s => {
    if (s.status !== 'CREATED') return false;
    const createdDate = new Date(s.created_at);
    return createdDate < twoDaysAgo;
  });
  ```
- Mostrar badges de alerta en tarjetas relevantes
- Vehículos sin uso: comparar vehículos disponibles con envíos asignados

**Visualización:**
- Badges de alerta en tarjetas relevantes
- Contador de alertas en el header
- Tooltip con detalles al hacer hover

---

## 📋 Plan de Implementación Recomendado

### Fase 1: Conexión con Datos Reales (Prioridad Alta) ⚡
1. **Conectar servicios existentes y procesar datos:**
   - Usar `shipmentService.getShipments()` para obtener todos los envíos
   - Procesar en el frontend para calcular:
     - Total de envíos (contar)
     - Envíos completados (filtrar `status === 'DELIVERED'`)
     - Tasa de entrega: `(delivered / total) * 100`
     - Envíos en tránsito (filtrar `status === 'IN_TRANSIT'`)
   - Reemplazar datos mock en las 4 tarjetas principales

2. **Conectar gráfico mensual:**
   - Obtener envíos: `GET /shipping`
   - Agrupar por mes desde `created_at` en el frontend
   - Calcular entregas, creados y cancelados por mes
   - Reemplazar datos mock con datos procesados

3. **Conectar tabla de envíos recientes:**
   - Usar `shipmentService.getShipments({ limit: 10, page: 1 })`
   - Ordenar por `created_at` descendente
   - Mapear campos de la API a la interfaz del dashboard

### Fase 2: Mejoras de Visualización (Prioridad Media) 📊
1. **Distribución por zonas:**
   - Obtener envíos: `GET /shipping`
   - Obtener zonas: `GET /config/coverage-zones`
   - Agrupar envíos por ciudad/estado en el frontend
   - Usar para el gráfico de dona
   - Agregar tooltips con detalles

2. **Distribución por método de transporte:**
   - Obtener envíos: `GET /shipping`
   - Agrupar por `transport_type` en el frontend
   - Calcular porcentajes y costos promedio
   - Mostrar gráfico de barras o dona

3. **Panel de estado de flota:**
   - Usar `vehicleService.getVehicles()` para obtener todos los vehículos
   - Filtrar y contar por `status` en el frontend
   - Mostrar tarjeta compacta con resumen

### Fase 3: Funcionalidades Adicionales (Prioridad Baja) 🔧
1. **Filtros de tiempo:**
   - Agregar selector de período
   - Pasar parámetros `from` y `to` a los endpoints

2. **Alertas básicas:**
   - Detectar envíos con retraso desde `getShipments()`
   - Mostrar badges de alerta en tarjetas

3. **Mejora de "Pedidos en Proceso":**
   - Filtrar envíos por estado CREATED/IN_TRANSIT
   - Mostrar progreso basado en estado

---

## 🛠️ Tecnologías y Servicios a Usar

**Servicios del Frontend (Ya Existentes):**
- `reportService` - Para métricas y KPIs
- `shipmentService` - Para datos de envíos
- `vehicleService` - Para datos de flota

**Librerías (Ya en Uso):**
- **Gráficos**: Recharts (ya implementado en el dashboard)
- **HTTP Client**: Ya configurado en `http-client.ts`
- **Estado**: Stores y composables existentes

**No se requieren nuevas dependencias** - Solo usar los servicios y endpoints existentes

---

## 📝 Notas Importantes

1. **Endpoints de Reportes**: Los endpoints `/reports/*` están definidos en el frontend (`report.service.ts`), pero deben estar implementados en el backend. Si no existen, se pueden calcular en el frontend usando los datos de `/shipping` y otros endpoints.

2. **Manejo de Errores**: Implementar manejo de errores cuando los endpoints no estén disponibles:
   - Fallback a datos mock si el endpoint falla
   - Mostrar mensaje de error claro al usuario
   - Logging de errores para debugging

3. **Performance**: 
   - Usar `limit` en las consultas a `/shipping` para evitar cargar demasiados datos
   - Implementar caché en el frontend para datos que no cambian frecuentemente
   - Usar paginación si se muestran muchos envíos

4. **Datos de Prueba**: Actualmente hay 56 envíos pero la mayoría están en estado CREATED. El dashboard funcionará con estos datos, mostrando la realidad actual del sistema.

5. **Actualización en Tiempo Real**: Considerar polling cada 30-60 segundos para actualizar métricas automáticamente, o implementar WebSockets si está disponible en el futuro.

---

## ✅ Checklist de Implementación

### Fase 1: Conexión Básica (Prioridad Alta)
- [ ] Importar `shipmentService` y `vehicleService` en el componente del dashboard
- [ ] Crear función helper para procesar envíos y calcular métricas
- [ ] Reemplazar datos mock en las 4 tarjetas principales:
  - [ ] Total de envíos: contar desde `GET /shipping`
  - [ ] Envíos completados: filtrar `status === 'DELIVERED'`
  - [ ] Tasa de entrega: calcular `(delivered / total) * 100`
  - [ ] Envíos en tránsito: filtrar `status === 'IN_TRANSIT'`
- [ ] Conectar gráfico mensual: agrupar envíos por mes desde `created_at`
- [ ] Reemplazar tabla de envíos recientes con `getShipments({ limit: 10 })`
- [ ] Agregar manejo de errores y estados de carga

### Fase 2: Mejoras de Visualización (Prioridad Media)
- [ ] Conectar gráfico de distribución por zonas:
  - [ ] Obtener envíos y zonas
  - [ ] Agrupar envíos por ciudad/estado en el frontend
  - [ ] Mostrar top 10 zonas en gráfico de dona
- [ ] Agregar gráfico de distribución por método de transporte:
  - [ ] Agrupar envíos por `transport_type` en el frontend
  - [ ] Calcular porcentajes y costos promedio
- [ ] Mostrar tarjeta de estado de flota:
  - [ ] Obtener vehículos con `getVehicles()`
  - [ ] Filtrar y contar por estado en el frontend
- [ ] Mejorar sección "Pedidos en Proceso":
  - [ ] Filtrar envíos con `status IN ['CREATED', 'IN_TRANSIT']`
  - [ ] Calcular progreso basado en estado

### Fase 3: Funcionalidades Adicionales (Prioridad Baja)
- [ ] Agregar selector de período (Hoy, Semana, Mes, Personalizado)
- [ ] Pasar parámetros `from` y `to` a los endpoints de reportes
- [ ] Implementar detección de alertas (envíos con retraso, envíos en CREATED > 48h)
- [ ] Agregar actualización automática con polling (cada 30-60 segundos)

---

## 🔗 Referencias de Endpoints Existentes

**Endpoints de Envíos (Shipping Service):**
- `GET /shipping` - Listar envíos (filtros: `status`, `from_date`, `to_date`, `page`, `limit`)
- `GET /shipping/:id` - Detalles de envío específico
- `GET /shipping/track/:trackingNumber` - Tracking por número
- `POST /shipping/cost` - Calcular costo de envío
- `POST /shipping` - Crear envío

**Endpoints de Flota (Config Service):**
- `GET /fleet/vehicles` - Listar todos los vehículos
- `GET /fleet/vehicles/:id` - Detalles de vehículo
- `GET /fleet/drivers` - Listar conductores

**Endpoints de Configuración (Config Service):**
- `GET /config/transport-methods` - Métodos de transporte disponibles
- `GET /config/coverage-zones` - Zonas de cobertura
- `GET /config/tariff-configs` - Configuraciones de tarifas

**Servicios del Frontend a Usar:**
- `shipmentService` - `frontend/src/lib/middleware/services/shipment.service.ts`
- `vehicleService` - `frontend/src/lib/middleware/services/vehicle.service.ts`

**Nota Importante:** Los endpoints `/reports/*` NO están implementados en el backend. Todas las métricas y KPIs deben calcularse en el frontend procesando los datos de los endpoints existentes.

---

*Documento actualizado: Diciembre 2025*
*Enfocado en mejoras del dashboard del panel principal usando endpoints existentes*

