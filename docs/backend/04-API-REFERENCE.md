# 📡 API Reference - Endpoints Completos

Referencia completa de todos los endpoints disponibles en el sistema de logística.

**Última actualización:** Diciembre 2025

---

## 🌐 URL Base

Todos los endpoints se acceden a través del **API Gateway**:

**Desarrollo:** `http://localhost:3004`
**Producción:** `https://api.logistics.example.com`

El Gateway rutea automáticamente a los microservicios:
- `/config/*` → Config Service (puerto 3003)
- `/shipping/*` → Shipping Service (puerto 3001)
- `/stock/*` → Stock Integration Service (puerto 3002)

---

## 🔐 Autenticación

### Desarrollo
- Endpoints públicos (`/health`, `/api`, `/gateway/status`): Sin autenticación
- Otros endpoints: Keycloak JWT opcional

### Producción
- **Todos los endpoints** (excepto públicos) requieren JWT token en header:
  ```
  Authorization: Bearer <jwt_token>
  ```

📖 **Ver:** [KEYCLOAK_INTEGRATION.md](../KEYCLOAK_INTEGRATION.md)

---

## 📚 Documentación Swagger

Cada servicio expone su documentación interactiva:

| Servicio | URL Swagger |
|----------|-------------|
| **API Gateway** | http://localhost:3004/api |
| **Config Service** | http://localhost:3003/api |
| **Shipping Service** | http://localhost:3001/api |
| **Stock Service** | http://localhost:3002/api |

---

## 🔧 Config Service

**Base Path:** `/config`

### Transport Methods (Métodos de Transporte)

#### Listar Métodos de Transporte
```http
GET /config/transport-methods
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Moto",
    "description": "Envíos rápidos en moto",
    "capacity": 10.0,
    "baseRate": 5.0,
    "status": "ACTIVE",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
]
```

#### Crear Método de Transporte
```http
POST /config/transport-methods
```

**Request Body:**
```json
{
  "name": "Camión",
  "description": "Envíos grandes",
  "capacity": 1000.0,
  "baseRate": 50.0,
  "status": "ACTIVE"
}
```

**Response 201:**
```json
{
  "id": 4,
  "name": "Camión",
  "capacity": 1000.0,
  "baseRate": 50.0,
  "status": "ACTIVE"
}
```

#### Actualizar Método de Transporte
```http
PATCH /config/transport-methods/:id
```

**Request Body:**
```json
{
  "name": "Camión Grande",
  "capacity": 1500.0
}
```

#### Eliminar Método de Transporte
```http
DELETE /config/transport-methods/:id
```

**Response 204:** No Content

---

### Coverage Zones (Zonas de Cobertura)

#### Listar Zonas
```http
GET /config/coverage-zones
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Zona Centro",
    "description": "Resistencia centro",
    "coordinates": {
      "type": "Polygon",
      "coordinates": [[[-58.986, -27.451], ...]]
    },
    "status": "ACTIVE",
    "transportMethodId": 1
  }
]
```

#### Crear Zona
```http
POST /config/coverage-zones
```

**Request Body:**
```json
{
  "name": "Zona Norte",
  "description": "Barranqueras",
  "coordinates": {
    "type": "Polygon",
    "coordinates": [[...]]
  },
  "transportMethodId": 1
}
```

---

### Tariff Configs (Tarifas)

#### Listar Tarifas
```http
GET /config/tariff-configs
```

**Query Parameters:**
- `zoneId` (optional): Filtrar por zona
- `transportMethodId` (optional): Filtrar por método de transporte
- `effectiveDate` (optional): Tarifas vigentes en fecha específica

**Response 200:**
```json
[
  {
    "id": 1,
    "zoneId": 1,
    "transportMethodId": 1,
    "pricePerKm": 2.5,
    "pricePerKg": 1.0,
    "minPrice": 50.0,
    "maxPrice": null,
    "effectiveFrom": "2025-12-01T00:00:00Z",
    "effectiveTo": null
  }
]
```

#### Crear Tarifa
```http
POST /config/tariff-configs
```

**Request Body:**
```json
{
  "zoneId": 1,
  "transportMethodId": 1,
  "pricePerKm": 2.5,
  "pricePerKg": 1.0,
  "minPrice": 50.0,
  "effectiveFrom": "2025-12-01T00:00:00Z"
}
```

---

### Vehicles (Vehículos)

#### Listar Vehículos
```http
GET /config/vehicles
```

**Query Parameters:**
- `status` (optional): AVAILABLE, IN_USE, MAINTENANCE, INACTIVE

**Response 200:**
```json
[
  {
    "id": 1,
    "licensePlate": "ABC123",
    "transportMethodId": 1,
    "capacity": 10.0,
    "status": "AVAILABLE",
    "currentLocation": {
      "latitude": -27.451,
      "longitude": -58.986
    }
  }
]
```

#### Crear Vehículo
```http
POST /config/vehicles
```

**Request Body:**
```json
{
  "licensePlate": "XYZ789",
  "transportMethodId": 2,
  "capacity": 50.0,
  "status": "AVAILABLE"
}
```

---

### Drivers (Conductores)

#### Listar Conductores
```http
GET /config/drivers
```

**Response 200:**
```json
[
  {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "licenseNumber": "LIC123456",
    "phone": "+54 9 362 4123456",
    "email": "juan@example.com",
    "status": "ACTIVE"
  }
]
```

#### Crear Conductor
```http
POST /config/drivers
```

**Request Body:**
```json
{
  "firstName": "María",
  "lastName": "González",
  "licenseNumber": "LIC789012",
  "phone": "+54 9 362 4567890",
  "email": "maria@example.com"
}
```

---

## 📦 Shipping Service

**Base Path:** `/shipping`

### Quotation (Cotización)

#### Calcular Costo de Envío
```http
POST /shipping/cost
```

**Request Body:**
```json
{
  "origin": {
    "latitude": -27.451,
    "longitude": -58.986,
    "address": "Av. 9 de Julio 123, Resistencia"
  },
  "destination": {
    "latitude": -27.468,
    "longitude": -58.837,
    "address": "Ruta 11 km 5, Barranqueras"
  },
  "weight": 5.0,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  }
}
```

**Response 200:**
```json
{
  "estimatedCost": 125.50,
  "distance": 15.3,
  "estimatedDuration": "45 min",
  "availableTransportMethods": [
    {
      "id": 1,
      "name": "Moto",
      "cost": 125.50,
      "estimatedDelivery": "2025-12-03T16:30:00Z"
    },
    {
      "id": 2,
      "name": "Auto",
      "cost": 180.00,
      "estimatedDelivery": "2025-12-03T17:00:00Z"
    }
  ]
}
```

---

### Shipments (Envíos)

#### Crear Envío
```http
POST /shipping
```

**Request Body:**
```json
{
  "customerId": 123,
  "origin": {
    "latitude": -27.451,
    "longitude": -58.986,
    "address": "Av. 9 de Julio 123, Resistencia"
  },
  "destination": {
    "latitude": -27.468,
    "longitude": -58.837,
    "address": "Ruta 11 km 5, Barranqueras"
  },
  "weight": 5.0,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  },
  "transportMethodId": 1
}
```

**Response 201:**
```json
{
  "id": 42,
  "trackingCode": "SHIP-2025-000042",
  "status": "PENDING",
  "estimatedCost": 125.50,
  "estimatedDelivery": "2025-12-03T16:30:00Z",
  "createdAt": "2025-12-03T15:00:00Z"
}
```

#### Listar Envíos
```http
GET /shipping
```

**Query Parameters:**
- `status` (optional): PENDING, IN_TRANSIT, DELIVERED, CANCELLED, FAILED
- `customerId` (optional): Filtrar por cliente
- `page` (optional): Página (default: 1)
- `limit` (optional): Registros por página (default: 20)

**Response 200:**
```json
{
  "data": [
    {
      "id": 42,
      "trackingCode": "SHIP-2025-000042",
      "customerId": 123,
      "status": "IN_TRANSIT",
      "estimatedDelivery": "2025-12-03T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Obtener Envío por ID
```http
GET /shipping/:id
```

**Response 200:**
```json
{
  "id": 42,
  "trackingCode": "SHIP-2025-000042",
  "customerId": 123,
  "status": "IN_TRANSIT",
  "origin": { "latitude": -27.451, "longitude": -58.986 },
  "destination": { "latitude": -27.468, "longitude": -58.837 },
  "weight": 5.0,
  "estimatedCost": 125.50,
  "actualCost": null,
  "transportMethod": {
    "id": 1,
    "name": "Moto"
  },
  "history": [
    {
      "status": "PENDING",
      "description": "Envío creado",
      "timestamp": "2025-12-03T15:00:00Z"
    },
    {
      "status": "IN_TRANSIT",
      "description": "En camino",
      "timestamp": "2025-12-03T15:30:00Z"
    }
  ]
}
```

#### Actualizar Envío
```http
PATCH /shipping/:id
```

**Request Body:**
```json
{
  "status": "DELIVERED",
  "actualCost": 125.50,
  "actualDelivery": "2025-12-03T16:25:00Z"
}
```

#### Cancelar Envío
```http
POST /shipping/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Cliente canceló el pedido"
}
```

**Response 200:**
```json
{
  "id": 42,
  "status": "CANCELLED",
  "cancelledAt": "2025-12-03T15:45:00Z"
}
```

#### Marcar como Entregado
```http
POST /shipping/:id/deliver
```

**Request Body:**
```json
{
  "notes": "Entregado al portero",
  "receivedBy": "Juan Pérez"
}
```

---

### Tracking (Seguimiento Público)

#### Rastrear Envío por Código
```http
GET /shipping/track/:trackingCode
```

**Ejemplo:**
```http
GET /shipping/track/SHIP-2025-000042
```

**Response 200:**
```json
{
  "trackingCode": "SHIP-2025-000042",
  "status": "IN_TRANSIT",
  "estimatedDelivery": "2025-12-03T16:30:00Z",
  "history": [
    {
      "status": "PENDING",
      "description": "Envío creado",
      "location": "Resistencia",
      "timestamp": "2025-12-03T15:00:00Z"
    },
    {
      "status": "IN_TRANSIT",
      "description": "En camino a destino",
      "location": "Ruta 11",
      "timestamp": "2025-12-03T15:30:00Z"
    }
  ]
}
```

---

## 📊 Stock Integration Service

**Base Path:** `/stock`

### Products

#### Obtener Producto
```http
GET /stock/products/:id
```

**Response 200:**
```json
{
  "id": 123,
  "name": "Notebook Dell",
  "sku": "NB-DELL-001",
  "weight": 2.5,
  "dimensions": {
    "length": 40,
    "width": 30,
    "height": 5
  },
  "available": true,
  "stock": 15
}
```

#### Consultar Disponibilidad
```http
POST /stock/availability
```

**Request Body:**
```json
{
  "productIds": [123, 456, 789]
}
```

**Response 200:**
```json
{
  "products": [
    {
      "productId": 123,
      "available": true,
      "stock": 15
    },
    {
      "productId": 456,
      "available": false,
      "stock": 0
    }
  ]
}
```

#### Reservar Stock
```http
POST /stock/reserve
```

**Request Body:**
```json
{
  "productId": 123,
  "quantity": 2,
  "orderId": 5678
}
```

**Response 200:**
```json
{
  "reservationId": "RSV-2025-001",
  "productId": 123,
  "quantity": 2,
  "expiresAt": "2025-12-03T16:00:00Z"
}
```

#### Liberar Reserva
```http
POST /stock/release
```

**Request Body:**
```json
{
  "reservationId": "RSV-2025-001"
}
```

**Response 204:** No Content

---

## 🚪 API Gateway Endpoints

### Gateway Status
```http
GET /gateway/status
```

**Response 200:**
```json
{
  "status": "ok",
  "services": {
    "config": {
      "name": "config-service",
      "baseUrl": "http://localhost:3003",
      "isHealthy": true,
      "lastHealthCheck": "2025-12-03T15:55:00Z"
    },
    "shipping": {
      "name": "shipping-service",
      "baseUrl": "http://localhost:3001",
      "isHealthy": true,
      "lastHealthCheck": "2025-12-03T15:55:00Z"
    },
    "stock": {
      "name": "stock-integration-service",
      "baseUrl": "http://localhost:3002",
      "isHealthy": true,
      "lastHealthCheck": "2025-12-03T15:55:00Z"
    }
  }
}
```

### Health Checks

Cada servicio expone su propio health check:

```http
GET /health
```

**Response 200:**
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-12-03T16:00:00Z"
}
```

---

## ⚠️ Códigos de Respuesta HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa (GET, PATCH) |
| **201** | Created | Recurso creado exitosamente (POST) |
| **204** | No Content | Operación exitosa sin contenido (DELETE) |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token JWT faltante o inválido |
| **403** | Forbidden | Sin permisos para la operación |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Recurso ya existe (ej: duplicate key) |
| **422** | Unprocessable Entity | Validación de negocio fallida |
| **500** | Internal Server Error | Error del servidor |
| **502** | Bad Gateway | Error al conectar con microservicio |
| **503** | Service Unavailable | Servicio temporalmente no disponible |
| **504** | Gateway Timeout | Timeout al conectar con microservicio |

---

## 🔄 Formato de Respuestas de Error

### Error de Validación (400)
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "capacity must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Error de Autenticación (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Token JWT inválido o expirado"
}
```

### Error de Negocio (422)
```json
{
  "statusCode": 422,
  "message": "No hay vehículos disponibles para el método de transporte seleccionado",
  "error": "Unprocessable Entity"
}
```

### Error de Servidor (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 🧪 Ejemplos con cURL

### Cotizar Envío
```bash
curl -X POST http://localhost:3004/shipping/cost \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "origin": {
      "latitude": -27.451,
      "longitude": -58.986
    },
    "destination": {
      "latitude": -27.468,
      "longitude": -58.837
    },
    "weight": 5.0,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    }
  }'
```

### Crear Envío
```bash
curl -X POST http://localhost:3004/shipping \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "customerId": 123,
    "origin": {
      "latitude": -27.451,
      "longitude": -58.986,
      "address": "Av. 9 de Julio 123"
    },
    "destination": {
      "latitude": -27.468,
      "longitude": -58.837,
      "address": "Ruta 11 km 5"
    },
    "weight": 5.0,
    "transportMethodId": 1
  }'
```

### Rastrear Envío (Sin Autenticación)
```bash
curl http://localhost:3004/shipping/track/SHIP-2025-000042
```

### Listar Métodos de Transporte
```bash
curl http://localhost:3004/config/transport-methods \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Ver Status del Gateway (Sin Autenticación)
```bash
curl http://localhost:3004/gateway/status | jq
```

---

## 📖 Rate Limiting

Para evitar abuso, se aplican límites de requests:

| Tipo | Límite | Ventana |
|------|--------|---------|
| Endpoints públicos (tracking, cost) | 100 req | 1 minuto |
| Endpoints autenticados | 1000 req | 1 minuto |
| Por IP total | 500 req | 1 minuto |

**Headers de respuesta cuando se acerca al límite:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1701619200
```

**Respuesta al exceder límite (429):**
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

---

## 🔗 Enlaces

- **[API Gateway](./02-API-GATEWAY.md)** - Funcionamiento del Gateway
- **[Microservicios](./01-MICROSERVICES.md)** - Arquitectura backend
- **[Keycloak](../KEYCLOAK_INTEGRATION.md)** - Autenticación JWT
- **[Base de Datos](../database/README.md)** - Schema de datos

---

**Última actualización:** Diciembre 3, 2025
