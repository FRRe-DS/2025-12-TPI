# 🔄 API Gateway Routes - Proxy Inteligente

Documentación completa de todas las rutas disponibles a través del **Operator Interface Service Gateway** (puerto 3004).

**Importante:** El gateway utiliza **Service Discovery + Facade Pattern** para rutear automáticamente requests a los microservicios corretos. No necesitas saber qué servicio maneja cada endpoint - ¡el gateway lo descubre automáticamente!

---

## 📊 Arquitectura de Ruteo

```
Request → Gateway :3004
         ↓
    ProxyController
         ↓
    ServiceFacade
         ↓
    ServiceRegistry
         ↓
    ¿Cuál servicio maneja /config?
         ↓
    config-service :3003
         ↓
    Response ← Gateway
```

---

## 🏗️ Endpoints por Servicio

### 🔧 CONFIG SERVICE (Configuración)

Todas las rutas comienzan con `/config`. El gateway automáticamente routea estas requests a **config-service** corriendo en puerto 3003.

#### Métodos de Transporte

```
GET    /config/transport-methods
       Obtener lista de todos los métodos de transporte

       Response:
       [
         {
           "id": "uuid",
           "name": "Terrestre",
           "code": "ROAD",
           "description": "Transporte por carretera",
           "estimatedDays": 5,
           "createdAt": "2025-10-24T...",
           "updatedAt": "2025-10-24T..."
         },
         ...
       ]

POST   /config/transport-methods
       Crear nuevo método de transporte

       Body:
       {
         "name": "Aéreo",
         "code": "AIR",
         "description": "Transporte aéreo",
         "estimatedDays": 1
       }

GET    /config/transport-methods/:id
       Obtener método de transporte específico

       URL: /config/transport-methods/3fa85f64-5717-4562-b3fc-2c963f66afa6

PATCH  /config/transport-methods/:id
       Actualizar método de transporte

       Body:
       {
         "name": "Aéreo Express",
         "estimatedDays": 2
       }
```

#### Zonas de Cobertura

```
GET    /config/coverage-zones
       Obtener lista de todas las zonas de cobertura

       Response:
       [
         {
           "id": "uuid",
           "name": "CABA",
           "postalCodeStart": "1000",
           "postalCodeEnd": "1499",
           "province": "Buenos Aires",
           "createdAt": "2025-10-24T...",
           "updatedAt": "2025-10-24T..."
         },
         ...
       ]

POST   /config/coverage-zones
       Crear nueva zona de cobertura

       Body:
       {
         "name": "GBA Norte",
         "postalCodeStart": "1600",
         "postalCodeEnd": "1999",
         "province": "Buenos Aires"
       }

GET    /config/coverage-zones/:id
       Obtener zona de cobertura específica

       URL: /config/coverage-zones/3fa85f64-5717-4562-b3fc-2c963f66afa6

PATCH  /config/coverage-zones/:id
       Actualizar zona de cobertura

       Body:
       {
         "name": "GBA Norte Ampliado",
         "postalCodeEnd": "2000"
       }
```

#### Configuraciones de Tarifa

```
GET    /config/tariff-configs
       Obtener lista de todas las configuraciones de tarifa

       Query Parameters (opcionales):
       ?transportMethodId=uuid

       Response:
       [
         {
           "id": "uuid",
           "transportMethodId": "uuid",
           "transportMethod": {
             "id": "uuid",
             "name": "Terrestre",
             "code": "ROAD"
           },
           "baseCost": 100.00,
           "costPerKm": 1.50,
           "costPerKg": 0.50,
           "minShipmentWeight": 5,
           "maxShipmentWeight": 50,
           "description": "Tarifa estándar terrestre",
           "isActive": true,
           "createdAt": "2025-10-24T...",
           "updatedAt": "2025-10-24T..."
         },
         ...
       ]

POST   /config/tariff-configs
       Crear nueva configuración de tarifa

       Body:
       {
         "transportMethodId": "uuid",
         "baseCost": 150.00,
         "costPerKm": 2.00,
         "costPerKg": 0.75,
         "minShipmentWeight": 10,
         "maxShipmentWeight": 100,
         "description": "Tarifa premium terrestre",
         "isActive": true
       }

GET    /config/tariff-configs/:id
       Obtener configuración de tarifa específica

       URL: /config/tariff-configs/3fa85f64-5717-4562-b3fc-2c963f66afa6

PATCH  /config/tariff-configs/:id
       Actualizar configuración de tarifa

       Body:
       {
         "baseCost": 160.00,
         "costPerKm": 2.10,
         "isActive": true
       }

DELETE /config/tariff-configs/:id
       Eliminar configuración de tarifa

       URL: /config/tariff-configs/3fa85f64-5717-4562-b3fc-2c963f66afa6
       Response: 204 No Content
```

---

### 🚚 SHIPPING SERVICE (Envíos)

Todas las rutas comienzan con `/shipping`. El gateway automáticamente routea estas requests a **shipping-service** corriendo en puerto 3001.

#### Shipments

```
GET    /shipping/shipments
       Obtener lista de todos los envíos

       Query Parameters (opcionales):
       ?status=PENDING,OUT_FOR_DELIVERY
       ?limit=20
       ?offset=0

       Response:
       [
         {
           "id": "uuid",
           "trackingNumber": "TRACK-20251024-001",
           "status": "OUT_FOR_DELIVERY",
           "originAddress": "Calle Principal 123, CABA",
           "destinationAddress": "Avenida Siempre Viva 742, GBA",
           "weight": 2.5,
           "estimatedDelivery": "2025-10-26",
           "createdAt": "2025-10-24T...",
           "updatedAt": "2025-10-24T..."
         },
         ...
       ]

POST   /shipping/shipments
       Crear nuevo envío

       Body:
       {
         "originAddress": "Depósito Central, CABA",
         "destinationAddress": "Casa del Cliente, GBA",
         "weight": 5.0,
         "transportMethodId": "uuid",
         "description": "Pedido ecommerce"
       }

GET    /shipping/shipments/:id
       Obtener envío específico con todos sus detalles

       URL: /shipping/shipments/3fa85f64-5717-4562-b3fc-2c963f66afa6

PATCH  /shipping/shipments/:id
       Actualizar estado o datos del envío

       Body:
       {
         "status": "DELIVERED",
         "notes": "Entregado exitosamente"
       }

GET    /shipping/shipments/:id/tracking
       Obtener histórico de tracking detallado

       Response:
       {
         "trackingNumber": "TRACK-20251024-001",
         "events": [
           {
             "timestamp": "2025-10-24T10:00:00Z",
             "status": "PENDING",
             "location": "Depósito Central",
             "notes": "Envío registrado"
           },
           {
             "timestamp": "2025-10-24T14:30:00Z",
             "status": "PICKED_UP",
             "location": "Depósito Central",
             "notes": "Paquete recogido"
           },
           {
             "timestamp": "2025-10-25T08:00:00Z",
             "status": "OUT_FOR_DELIVERY",
             "location": "Centro de Distribución GBA",
             "notes": "En ruta para entrega"
           }
         ]
       }
```

#### Cálculo de Costos

```
POST   /shipping/calculate-cost
       Calcular costo de envío basado en parámetros

       Body:
       {
         "weight": 3.5,
         "distanceKm": 25,
         "transportMethodId": "uuid",
         "originPostalCode": "1425",
         "destinationPostalCode": "1896"
       }

       Response:
       {
         "baseCost": 100.00,
         "kmCost": 37.50,
         "weightCost": 1.75,
         "totalCost": 139.25,
         "currency": "ARS",
         "estimatedDays": 5
       }

POST   /shipping/calculate-delivery-time
       Calcular tiempo de entrega estimado

       Body:
       {
         "originPostalCode": "1425",
         "destinationPostalCode": "1896",
         "transportMethodId": "uuid"
       }

       Response:
       {
         "estimatedDays": 5,
         "estimatedDate": "2025-10-29",
         "carrier": "Terrestre"
       }
```

---

### 📦 STOCK INTEGRATION SERVICE

Todas las rutas comienzan con `/stock`. El gateway automáticamente routea estas requests a **stock-integration-service** corriendo en puerto 3002.

#### Inventario

```
GET    /stock/inventory
       Obtener estado actual del inventario

       Query Parameters (opcionales):
       ?warehouseId=uuid
       ?sku=ABC123

       Response:
       [
         {
           "id": "uuid",
           "sku": "ABC123",
           "productName": "Producto A",
           "warehouse": "Central",
           "quantity": 150,
           "reservedQuantity": 10,
           "availableQuantity": 140,
           "lastUpdated": "2025-10-24T14:30:00Z"
         },
         ...
       ]

POST   /stock/inventory/reserve
       Reservar cantidad de producto en stock

       Body:
       {
         "sku": "ABC123",
         "quantity": 5,
         "warehouseId": "uuid",
         "orderId": "uuid"
       }

       Response:
       {
         "reservationId": "uuid",
         "sku": "ABC123",
         "quantity": 5,
         "status": "CONFIRMED",
         "expiresAt": "2025-10-25T10:00:00Z"
       }

POST   /stock/inventory/release
       Liberar reserva de stock (ej: cancelación)

       Body:
       {
         "reservationId": "uuid"
       }

GET    /stock/inventory/check-availability
       Verificar disponibilidad de múltiples productos

       Body:
       {
         "items": [
           { "sku": "ABC123", "quantity": 5 },
           { "sku": "XYZ789", "quantity": 2 }
         ],
         "warehouseId": "uuid"
       }

       Response:
       {
         "available": true,
         "items": [
           { "sku": "ABC123", "requested": 5, "available": 10 },
           { "sku": "XYZ789", "requested": 2, "available": 3 }
         ]
       }
```

---

### 🔌 GATEWAY CONTROL & MONITORING

Endpoints especiales del gateway para control y debugging del proxy inteligente.

```
GET    /gateway/status
       Obtener estado de todos los servicios registrados

       Response:
       {
         "services": [
           {
             "name": "config-service",
             "baseUrl": "http://localhost:3003",
             "routes": ["/config"],
             "isHealthy": true,
             "lastHealthCheck": "2025-10-24T12:34:56.789Z"
           },
           {
             "name": "shipping-service",
             "baseUrl": "http://localhost:3001",
             "routes": ["/shipping"],
             "isHealthy": true,
             "lastHealthCheck": "2025-10-24T12:34:56.789Z"
           },
           {
             "name": "stock-integration-service",
             "baseUrl": "http://localhost:3002",
             "routes": ["/stock"],
             "isHealthy": true,
             "lastHealthCheck": "2025-10-24T12:34:56.789Z"
           }
         ],
         "timestamp": "2025-10-24T12:35:00.123Z"
       }

GET    /health
       Verificar que el gateway está corriendo

       Response:
       {
         "status": "ok",
         "timestamp": "2025-10-24T12:35:00.123Z"
       }
```

---

## 🧪 Ejemplos de Uso (cURL)

### Obtener métodos de transporte

```bash
curl -X GET http://localhost:3004/config/transport-methods
```

### Crear nuevo método de transporte

```bash
curl -X POST http://localhost:3004/config/transport-methods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marítimo",
    "code": "SEA",
    "description": "Transporte marítimo internacional",
    "estimatedDays": 30
  }'
```

### Obtener shipments con estado específico

```bash
curl -X GET "http://localhost:3004/shipping/shipments?status=OUT_FOR_DELIVERY&limit=10"
```

### Calcular costo de envío

```bash
curl -X POST http://localhost:3004/shipping/calculate-cost \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 5.0,
    "distanceKm": 50,
    "transportMethodId": "550e8400-e29b-41d4-a716-446655440000",
    "originPostalCode": "1425",
    "destinationPostalCode": "1896"
  }'
```

### Verificar disponibilidad en stock

```bash
curl -X GET http://localhost:3004/stock/inventory/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "sku": "ABC123", "quantity": 5 }
    ],
    "warehouseId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Ver status del gateway

```bash
curl http://localhost:3004/gateway/status | jq
```

---

## 📝 Headers Útiles

La mayoría de requests pueden incluir estos headers opcionales:

```bash
# Autenticación (si Keycloak está configurado)
Authorization: Bearer <jwt-token>

# Identificador de request para logging
X-Request-ID: req-12345

# Identificador de correlación para trazar requests distribuidos
X-Correlation-ID: corr-67890

# User agent (automático en navegadores)
User-Agent: Mozilla/5.0 ...

# Tipo de contenido
Content-Type: application/json
```

---

## 🔄 Códigos de Respuesta

```
200 OK                    - Request exitoso
201 Created              - Recurso creado exitosamente
204 No Content           - Success sin body (ej: DELETE)
400 Bad Request          - Datos de entrada inválidos
401 Unauthorized         - Autenticación requerida
403 Forbidden            - Sin permisos para acceder
404 Not Found            - Recurso no existe
409 Conflict             - Conflicto (ej: duplicado)
429 Too Many Requests    - Rate limit excedido
502 Bad Gateway          - Microservicio no disponible
503 Service Unavailable  - Gateway en mantenimiento
504 Gateway Timeout      - Microservicio no responde
```

---

## 🔐 Nota sobre Autenticación

Actualmente los endpoints **no requieren autenticación** en desarrollo. En producción, todos los requests deben incluir un JWT token válido en el header `Authorization`:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token debe ser obtenido de **Keycloak** en `http://localhost:8080/auth`

---

## 🚀 Cómo el Proxy Inteligente Funciona

### Ejemplo: Request a `/config/transport-methods`

```
1. Client sends GET /config/transport-methods to http://localhost:3004

2. ProxyController receives request
   Logs: 🔄 Proxy: GET /config/transport-methods

3. ServiceFacade.request() called
   Logs: 📤 GET http://localhost:3003/config/transport-methods (attempt 1/3)

4. ServiceRegistry.findServiceByRoute("/config")
   Returns: config-service at http://localhost:3003

5. HTTP request sent to http://localhost:3003/config/transport-methods

6. If successful (200):
   Logs: ✅ GET http://localhost:3003/... → 200
   Response returned to client

7. If fails with 5xx/429/503/504:
   Logs: ⚠️ Request failed (502), retrying in 1000ms...
   Retry with exponential backoff (up to 2 retries)

8. If all retries fail:
   Logs: ❌ Service config-service marked unhealthy
   Returns 502 Bad Gateway to client
```

### ¿Cuándo un servicio se marca como "unhealthy"?

- Health check cada 30 segundos via `GET /health`
- Si falla → marked unhealthy
- Si pasa → marked healthy
- Los requests aún se intentan aunque esté unhealthy (con warning logs)

---

## 💡 Tips de Debugging

### Ver qué servicio maneja una ruta

```bash
curl http://localhost:3004/gateway/status | jq '.services[] | select(.routes[] | contains("/config"))'
```

### Testear health de un servicio

```bash
# Directamente
curl http://localhost:3003/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Via gateway (solo mostrará status último check)
curl http://localhost:3004/gateway/status | jq '.services'
```

### Ver logs del proxy en tiempo real

```bash
npm run start:dev:operator  # Watch terminal output para logs del gateway
```

---

## 📞 Soporte

Si un endpoint devuelve 404 "Service not found":

1. ✅ Verificar que el servicio está corriendo
2. ✅ Verificar que la ruta está registrada en ServiceRegistry
3. ✅ Verificar que el prefijo de ruta coincide (ej: `/config` no `/configs`)
4. ✅ Chequear `curl http://localhost:3004/gateway/status` para ver servicios registrados

Si un endpoint devuelve 502 Bad Gateway:

1. ✅ Chequear que el microservicio objetivo está corriendo
2. ✅ Ver logs del microservicio para errores
3. ✅ Intentar request directo al microservicio (bypass gateway)
4. ✅ Chequear conectividad de red entre servicios

Si un endpoint devuelve timeout:

1. ✅ Chequear que microservicio no está bloqueado
2. ✅ Aumentar timeout (está en 10 segundos en ServiceFacade)
3. ✅ Chequear performance de la operación en el microservicio
