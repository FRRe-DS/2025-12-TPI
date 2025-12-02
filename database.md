# Documentación de Base de Datos - Sistema de Logística

Este documento describe todas las tablas de la base de datos, sus columnas y su propósito en el sistema.

---

## 📋 Índice de Tablas

1. [TransportMethod](#1-transportmethod---métodos-de-transporte)
2. [CoverageZone](#2-coveragezone---zonas-de-cobertura)
3. [TariffConfig](#3-tariffconfig---configuración-de-tarifas)
4. [Vehicle](#4-vehicle---vehículos)
5. [Driver](#5-driver---conductores)
6. [Shipment](#6-shipment---envíos)
7. [ShipmentProduct](#7-shipmentproduct---productos-por-envío)
8. [ShipmentLog](#8-shipmentlog---historial-de-estados)

---

## 1. TransportMethod - Métodos de Transporte

**Tabla**: `transport_methods`

**Propósito**: Define los diferentes métodos de transporte disponibles en el sistema (terrestre, aéreo, marítimo, ferroviario).

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del método de transporte | Clave primaria, generado automáticamente |
| `code` | VARCHAR(20) | Código único del método (ej: "road", "air", "sea", "rail") | Identificación rápida y búsqueda |
| `name` | VARCHAR(100) | Nombre descriptivo (ej: "Transporte Terrestre") | Mostrar en interfaces de usuario |
| `description` | TEXT | Descripción opcional del método | Información adicional para usuarios |
| `average_speed` | INT | Velocidad promedio en km/h | Cálculo de tiempos de entrega estimados |
| `estimated_days` | VARCHAR(20) | Rango estimado de días (ej: "1-2", "3-5") | Mostrar al cliente tiempo estimado |
| `base_cost_per_km` | DECIMAL(10,2) | Costo base por kilómetro | Cálculo de costos de envío |
| `base_cost_per_kg` | DECIMAL(10,2) | Costo base por kilogramo | Cálculo de costos de envío |
| `is_active` | BOOLEAN | Indica si el método está activo | Filtrar métodos disponibles |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

### Relaciones

- **1:N con TariffConfig**: Un método puede tener múltiples configuraciones de tarifa
- **1:N con Vehicle**: Múltiples vehículos pueden usar el mismo método

### Índices

- `idx_transport_methods_active`: Búsqueda rápida de métodos activos
- `idx_transport_methods_code`: Búsqueda por código único

---

## 2. CoverageZone - Zonas de Cobertura

**Tabla**: `coverage_zones`

**Propósito**: Define zonas geográficas de cobertura basadas en códigos postales para calcular costos y disponibilidad de envíos.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único de la zona | Clave primaria |
| `name` | VARCHAR(100) | Nombre de la zona (ej: "Zona Norte", "CABA") | Identificación y visualización |
| `description` | TEXT | Descripción opcional de la zona | Información adicional |
| `postal_codes` | TEXT[] | Array de códigos postales cubiertos | Determinar si una dirección está en la zona |
| `is_active` | BOOLEAN | Indica si la zona está activa | Filtrar zonas disponibles |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

### Relaciones

- Ninguna relación directa (las zonas se usan para cálculos de costos)

### Índices

- `idx_coverage_zones_active`: Búsqueda rápida de zonas activas
- `idx_coverage_zones_postal_codes`: Búsqueda eficiente por códigos postales (índice GIN para arrays)

---

## 3. TariffConfig - Configuración de Tarifas

**Tabla**: `tariff_configs`

**Propósito**: Configuración de tarifas específicas por método de transporte, permitiendo diferentes precios por ambiente (desarrollo/producción) y períodos de validez.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único de la configuración | Clave primaria |
| `transport_method_id` | UUID | FK a TransportMethod | Asociar tarifa con método de transporte |
| `base_tariff` | DECIMAL(10,2) | Tarifa base | Costo inicial del envío |
| `cost_per_kg` | DECIMAL(10,2) | Costo por kilogramo | Cálculo basado en peso |
| `cost_per_km` | DECIMAL(10,2) | Costo por kilómetro | Cálculo basado en distancia |
| `volumetric_factor` | INT | Factor volumétrico para cálculo | Considerar volumen además de peso |
| `environment` | VARCHAR(20) | Ambiente (development, production) | Separar tarifas de prueba y reales |
| `is_active` | BOOLEAN | Indica si la configuración está activa | Filtrar configuraciones válidas |
| `valid_from` | TIMESTAMPTZ | Fecha desde la cual es válida | Períodos de validez |
| `valid_to` | TIMESTAMPTZ | Fecha hasta la cual es válida | Períodos de validez |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

### Relaciones

- **N:1 con TransportMethod**: Cada tarifa pertenece a un método de transporte

### Índices

- `idx_tariff_configs_transport_method`: Búsqueda por método de transporte
- `idx_tariff_configs_environment`: Filtrar por ambiente
- `idx_tariff_configs_active`: Búsqueda de configuraciones activas

---

## 4. Vehicle - Vehículos

**Tabla**: `vehicles`

**Propósito**: Gestión de la flota de vehículos disponibles para realizar envíos.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del vehículo | Clave primaria |
| `license_plate` | VARCHAR(20) | Placa del vehículo (única) | Identificación única, búsqueda |
| `make` | VARCHAR(50) | Marca (ej: "Mercedes", "Scania") | Información del vehículo |
| `model` | VARCHAR(50) | Modelo (ej: "Sprinter", "R440") | Información del vehículo |
| `year` | INT | Año de fabricación | Información del vehículo |
| `capacity_kg` | INT | Capacidad máxima en kilogramos | Validar si un envío cabe |
| `volume_m3` | DECIMAL(10,2) | Capacidad volumétrica en m³ | Validar si un envío cabe |
| `fuel_type` | VARCHAR(20) | Tipo de combustible (ej: "DIESEL", "GASOLINE") | Información operativa |
| `status` | VARCHAR(20) | Estado (ej: "AVAILABLE", "IN_USE", "MAINTENANCE") | Determinar disponibilidad |
| `transport_method_id` | UUID | FK a TransportMethod (opcional) | Tipo de transporte que puede realizar |
| `driver_id` | UUID | FK a Driver (opcional) | Conductor asignado |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

### Relaciones

- **N:1 con TransportMethod**: Un vehículo puede estar asociado a un método de transporte
- **N:1 con Driver**: Un vehículo puede tener un conductor asignado
- **1:N con Shipment**: Un vehículo puede tener múltiples envíos asignados

### Índices

- `idx_vehicles_license_plate`: Búsqueda rápida por placa
- `idx_vehicles_status`: Filtrar por estado (disponibilidad)
- `idx_vehicles_driver`: Búsqueda por conductor
- `idx_vehicles_transport_method`: Búsqueda por método de transporte

---

## 5. Driver - Conductores

**Tabla**: `drivers`

**Propósito**: Gestión de conductores que operan los vehículos.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del conductor | Clave primaria |
| `employee_id` | VARCHAR(30) | ID de empleado (único) | Identificación interna de la empresa |
| `first_name` | VARCHAR(80) | Nombre | Información personal |
| `last_name` | VARCHAR(80) | Apellido | Información personal |
| `email` | VARCHAR(150) | Email (único) | Contacto y autenticación |
| `phone` | VARCHAR(30) | Teléfono | Contacto |
| `license_number` | VARCHAR(50) | Número de licencia (único) | Validación legal |
| `license_type` | VARCHAR(10) | Tipo de licencia (ej: "A", "B", "C", "D") | Validar qué vehículos puede conducir |
| `status` | VARCHAR(20) | Estado (ej: "ACTIVE", "INACTIVE", "SUSPENDED") | Determinar disponibilidad |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

### Relaciones

- **1:N con Vehicle**: Un conductor puede estar asignado a múltiples vehículos

### Índices

- `idx_drivers_employee_id`: Búsqueda por ID de empleado
- `idx_drivers_email`: Búsqueda por email (login)
- `idx_drivers_status`: Filtrar por estado (disponibilidad)

---

## 6. Shipment - Envíos

**Tabla**: `shipments`

**Propósito**: Tabla principal que almacena todos los envíos del sistema. Contiene información del pedido, cliente, direcciones, estado y costos.

### Columnas

#### Identificación

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del envío | Clave primaria |
| `tracking_number` | VARCHAR(50) | Número de seguimiento (único) | Identificación pública para clientes |
| `order_id` | INT | ID de la orden en el sistema externo | Integración con sistema de pedidos |
| `order_reference` | VARCHAR(100) | Referencia de la orden (opcional) | Identificación alternativa |
| `user_id` | INT | ID del usuario/cliente | Identificar quién hizo el pedido |
| `user_reference` | VARCHAR(100) | Referencia del usuario (opcional) | Identificación alternativa |

#### Direcciones (Desnormalizadas para Performance)

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `delivery_street` | VARCHAR(200) | Calle de entrega | Dirección completa de entrega |
| `delivery_city` | VARCHAR(100) | Ciudad de entrega | Dirección completa de entrega |
| `delivery_state` | VARCHAR(100) | Estado/Provincia de entrega | Dirección completa de entrega |
| `delivery_postal_code` | VARCHAR(20) | Código postal de entrega | Dirección completa de entrega |
| `delivery_country` | VARCHAR(2) | País de entrega (código ISO) | Dirección completa de entrega |
| `departure_street` | VARCHAR(200) | Calle de origen (opcional) | Dirección de salida (obtenida de Stock API) |
| `departure_city` | VARCHAR(100) | Ciudad de origen (opcional) | Dirección de salida |
| `departure_state` | VARCHAR(100) | Estado/Provincia de origen (opcional) | Dirección de salida |
| `departure_postal_code` | VARCHAR(20) | Código postal de origen (opcional) | Dirección de salida |
| `departure_country` | VARCHAR(2) | País de origen (opcional) | Dirección de salida |

**Nota**: Las direcciones están desnormalizadas (no en tabla separada) para mejorar el rendimiento de consultas.

#### Estado y Transporte

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `status` | VARCHAR(30) | Estado del envío | Seguimiento del ciclo de vida |
| | | Valores posibles: | |
| | | - `CREATED`: Creado, pendiente de reserva | |
| | | - `RESERVED`: Stock reservado | |
| | | - `IN_TRANSIT`: En tránsito | |
| | | - `ARRIVED`: Llegó al destino | |
| | | - `IN_DISTRIBUTION`: En distribución local | |
| | | - `DELIVERED`: Entregado | |
| | | - `CANCELLED`: Cancelado | |
| `transport_type` | VARCHAR(20) | Tipo de transporte usado | Determinar método de envío |
| | | Valores: `AIR`, `SEA`, `RAIL`, `ROAD` | |
| `carrier_name` | VARCHAR(100) | Nombre del transportista (opcional) | Información del transportista |

#### Costos

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `total_cost` | DECIMAL(10,2) | Costo total del envío | Facturación y reportes |
| `currency` | VARCHAR(3) | Moneda (default: "ARS") | Soporte multi-moneda |

#### Fechas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `estimated_delivery_at` | TIMESTAMPTZ | Fecha estimada de entrega | Mostrar al cliente |
| `cancelled_at` | TIMESTAMPTZ | Fecha de cancelación (opcional) | Auditoría de cancelaciones |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización | Auditoría |

#### Asignación y Reserva

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `vehicle_id` | UUID | FK a Vehicle (opcional) | Asignar vehículo al envío |
| `reservation_id` | VARCHAR(100) | ID de reserva en el sistema de Stock (opcional) | Referencia a la reserva de inventario |

### Relaciones

- **1:N con ShipmentProduct**: Un envío contiene múltiples productos
- **1:N con ShipmentLog**: Un envío tiene múltiples registros de historial
- **N:1 con Vehicle**: Un envío puede estar asignado a un vehículo (opcional)

### Índices

- `idx_shipments_order`: Búsqueda por ID de orden
- `idx_shipments_user`: Búsqueda por ID de usuario
- `idx_shipments_user_reference`: Búsqueda por referencia de usuario
- `idx_shipments_order_reference`: Búsqueda por referencia de orden
- `idx_shipments_status`: Filtrar por estado
- `idx_shipments_tracking`: Búsqueda por número de seguimiento (único)
- `idx_shipments_created_at`: Ordenar por fecha de creación

---

## 7. ShipmentProduct - Productos por Envío

**Tabla**: `shipment_products`

**Propósito**: Almacena los productos incluidos en cada envío. Relación muchos-a-muchos entre envíos y productos.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del registro | Clave primaria |
| `shipment_id` | UUID | FK a Shipment | Asociar producto con envío |
| `product_id` | INT | ID del producto en el sistema de Stock | Integración con sistema de inventario |
| `product_reference` | VARCHAR(100) | Referencia del producto (opcional) | Identificación alternativa |
| `quantity` | INT | Cantidad del producto en el envío | Cálculo de peso total, facturación |
| `created_at` | TIMESTAMPTZ | Fecha de creación | Auditoría |

### Relaciones

- **N:1 con Shipment**: Cada producto pertenece a un envío (CASCADE DELETE: si se elimina el envío, se eliminan sus productos)

### Índices

- `idx_shipment_products_shipment`: Búsqueda rápida de productos por envío
- `idx_shipment_products_product`: Búsqueda por ID de producto
- `idx_shipment_products_product_reference`: Búsqueda por referencia de producto

---

## 8. ShipmentLog - Historial de Estados

**Tabla**: `shipment_logs`

**Propósito**: Registra todos los cambios de estado y eventos importantes de cada envío. Proporciona auditoría completa y permite el seguimiento en tiempo real.

### Columnas

| Columna | Tipo | Descripción | Uso |
|---------|------|-------------|-----|
| `id` | UUID | Identificador único del log | Clave primaria |
| `shipment_id` | UUID | FK a Shipment | Asociar log con envío |
| `status` | VARCHAR(30) | Estado del envío en este momento | Historial de estados |
| `message` | TEXT | Mensaje descriptivo del evento | Información detallada del cambio |
| `timestamp` | TIMESTAMPTZ | Fecha y hora del evento | Orden cronológico de eventos |

### Relaciones

- **N:1 con Shipment**: Cada log pertenece a un envío (CASCADE DELETE: si se elimina el envío, se eliminan sus logs)

### Índices

- `idx_shipment_logs_shipment`: Búsqueda rápida de logs por envío
- `idx_shipment_logs_timestamp`: Ordenar logs por fecha

### Ejemplos de Mensajes

- `"Shipment created with tracking number: TRACK-12345"`
- `"Stock reserved successfully"`
- `"Shipment picked up by carrier"`
- `"In transit to destination"`
- `"Arrived at distribution center"`
- `"Out for delivery"`
- `"Delivered to recipient"`
- `"Shipment cancelled by user"`

---

## 🔗 Resumen de Relaciones

```
TransportMethod (1) → (N) TariffConfig
TransportMethod (1) → (N) Vehicle
CoverageZone (independiente, usado para cálculos)
Vehicle (N) → (1) TransportMethod
Vehicle (N) → (1) Driver
Vehicle (1) → (N) Shipment
Driver (1) → (N) Vehicle
Shipment (1) → (N) ShipmentProduct
Shipment (1) → (N) ShipmentLog
Shipment (N) → (1) Vehicle
```

---

## 📊 Flujo de Datos Típico

1. **Creación de Envío**: Se crea un registro en `shipments` con estado `CREATED`
2. **Productos**: Se crean registros en `shipment_products` para cada producto
3. **Log Inicial**: Se crea un log en `shipment_logs` con el evento de creación
4. **Reserva de Stock**: El estado cambia a `RESERVED` y se crea un nuevo log
5. **En Tránsito**: El estado cambia a `IN_TRANSIT` con log correspondiente
6. **Entrega**: El estado cambia a `DELIVERED` con log final

---

## 🔍 Consultas Comunes

### Buscar envío por tracking number
```sql
SELECT * FROM shipments WHERE tracking_number = 'TRACK-12345';
```

### Obtener productos de un envío
```sql
SELECT * FROM shipment_products WHERE shipment_id = 'uuid-del-envio';
```

### Obtener historial completo de un envío
```sql
SELECT * FROM shipment_logs 
WHERE shipment_id = 'uuid-del-envio' 
ORDER BY timestamp ASC;
```

### Buscar envíos por estado
```sql
SELECT * FROM shipments WHERE status = 'IN_TRANSIT';
```

### Buscar envíos de un usuario
```sql
SELECT * FROM shipments WHERE user_id = 12345;
```

---

## 📝 Notas Importantes

1. **Desnormalización**: Las direcciones están desnormalizadas en `shipments` para mejorar el rendimiento, evitando JOINs innecesarios.

2. **CASCADE DELETE**: 
   - Si se elimina un `Shipment`, se eliminan automáticamente sus `ShipmentProduct` y `ShipmentLog`
   - Si se elimina un `TransportMethod`, se eliminan sus `TariffConfig`

3. **Referencias Externas**: 
   - `order_id` y `user_id` son IDs del sistema externo (no hay FK)
   - `product_id` es ID del sistema de Stock (no hay FK)

4. **Tracking Number**: Es único y se genera automáticamente. Es el identificador público que se muestra a los clientes.

5. **Estados**: El flujo de estados es secuencial pero puede saltarse algunos (ej: de CREATED a CANCELLED directamente).

---

## 🎯 Casos de Uso por Tabla

- **TransportMethod**: Configuración de métodos disponibles, cálculo de costos
- **CoverageZone**: Determinar si una dirección está cubierta, calcular costos adicionales
- **TariffConfig**: Cálculo preciso de costos de envío
- **Vehicle**: Gestión de flota, asignación de vehículos a envíos
- **Driver**: Gestión de conductores, asignación a vehículos
- **Shipment**: Tabla central del sistema, todos los envíos
- **ShipmentProduct**: Detalle de qué productos van en cada envío
- **ShipmentLog**: Seguimiento en tiempo real, auditoría, historial completo

