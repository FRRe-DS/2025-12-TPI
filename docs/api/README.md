# 📡 Documentación de APIs

Documentación completa de los endpoints disponibles en el sistema de logística.

**Última actualización:** Diciembre 2025

---

## 🌐 API Gateway

Todos los servicios están expuestos a través del **API Gateway** en el puerto `3004`.

**URL Base (desarrollo):** `http://localhost:3004`

El Gateway rutea automáticamente las peticiones a los microservicios correspondientes:
- `/config/*` → Config Service (puerto 3003)
- `/shipping/*` → Shipping Service (puerto 3001)
- `/stock/*` → Stock Integration Service (puerto 3002)

📖 **Para más detalles sobre el Gateway, ver:** [backend/02-API-GATEWAY.md](../backend/02-API-GATEWAY.md)

---

## 📋 Servicios Disponibles

### 1. Config Service (Configuración)

**Responsabilidades:**
- Gestión de métodos de transporte
- Gestión de zonas de cobertura
- Configuración de tarifas
- Gestión de vehículos y conductores

**Endpoints principales:**
```
GET    /config/transport-methods
POST   /config/transport-methods
PATCH  /config/transport-methods/:id
DELETE /config/transport-methods/:id

GET    /config/coverage-zones
POST   /config/coverage-zones
PATCH  /config/coverage-zones/:id
DELETE /config/coverage-zones/:id

GET    /config/vehicles
POST   /config/vehicles
PATCH  /config/vehicles/:id

GET    /config/drivers
POST   /config/drivers
PATCH  /config/drivers/:id
```

**Swagger UI:** http://localhost:3003/api

---

### 2. Shipping Service (Envíos)

**Responsabilidades:**
- Cotización de envíos
- Creación y gestión de envíos
- Planificación de rutas
- Tracking de envíos

**Endpoints principales:**
```
POST   /shipping/cost              # Cotizar envío
POST   /shipping                   # Crear envío
GET    /shipping                   # Listar envíos
GET    /shipping/:id               # Obtener envío
PATCH  /shipping/:id               # Actualizar envío
POST   /shipping/:id/cancel        # Cancelar envío
POST   /shipping/:id/deliver       # Marcar como entregado
GET    /shipping/:trackingCode     # Tracking público
```

**Swagger UI:** http://localhost:3001/api

---

### 3. Stock Integration Service (Integración Stock)

**Responsabilidades:**
- Integración con API de Stock externa
- Validación de productos y disponibilidad
- Gestión de retiros en depósitos

**Endpoints principales:**
```
GET    /stock/products/:id         # Obtener producto
POST   /stock/reserve              # Reservar stock
POST   /stock/release              # Liberar reserva
GET    /stock/availability         # Consultar disponibilidad
```

**Swagger UI:** http://localhost:3002/api

---

## 🔐 Autenticación

### Desarrollo
Por defecto, en desarrollo **no hay autenticación** para facilitar el testing.

### Producción
- **Keycloak** para autenticación de usuarios (interfaz de operador)
- Los endpoints internos requieren token JWT válido
- Los endpoints públicos (cotización, tracking) no requieren auth

📖 **Para configuración de Keycloak, ver:** [KEYCLOAK_INTEGRATION.md](../KEYCLOAK_INTEGRATION.md)

---

## 📖 Documentación Swagger

Cada microservicio expone su documentación Swagger/OpenAPI:

| Servicio | URL Swagger (desarrollo) |
|----------|--------------------------|
| **API Gateway** | http://localhost:3004/api |
| **Config Service** | http://localhost:3003/api |
| **Shipping Service** | http://localhost:3001/api |
| **Stock Integration** | http://localhost:3002/api |

---

## 🧪 Testing de APIs

### Con cURL

```bash
# Listar métodos de transporte (via Gateway)
curl http://localhost:3004/config/transport-methods

# Cotizar envío (via Gateway)
curl -X POST http://localhost:3004/shipping/cost \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"latitude": -27.451, "longitude": -58.986},
    "destination": {"latitude": -27.468, "longitude": -58.837},
    "weight": 5.0,
    "dimensions": {"length": 30, "width": 20, "height": 15}
  }'

# Obtener tracking (via Gateway)
curl http://localhost:3004/shipping/TRACK123456
```

### Con Postman

1. Importar colección desde `/backend/postman/logistics-api.json` (si existe)
2. Configurar `baseUrl` variable a `http://localhost:3004`
3. Ejecutar requests desde la colección

### Con Swagger UI

1. Abrir http://localhost:3004/api (Gateway)
2. Explorar endpoints disponibles
3. Usar "Try it out" para testear directamente

---

## 📊 Códigos de Respuesta HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa (GET, PATCH) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `204` | No Content | Operación exitosa sin contenido (DELETE) |
| `400` | Bad Request | Datos de entrada inválidos |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `422` | Unprocessable Entity | Validación de negocio fallida |
| `500` | Internal Server Error | Error del servidor |
| `503` | Service Unavailable | Servicio temporalmente no disponible |

---

## 🔄 Formato de Respuestas

### Respuesta Exitosa
```json
{
  "id": 1,
  "name": "Moto",
  "capacity": 10,
  "status": "active"
}
```

### Respuesta con Lista
```json
[
  {
    "id": 1,
    "name": "Moto"
  },
  {
    "id": 2,
    "name": "Auto"
  }
]
```

### Respuesta de Error
```json
{
  "statusCode": 400,
  "message": ["El campo 'name' es requerido"],
  "error": "Bad Request"
}
```

---

## 📝 Validación de Datos

Todos los endpoints validan automáticamente usando:

- **DTOs** con `class-validator`
- **Transformación** automática con `class-transformer`
- **Sanitización** de datos de entrada
- **Tipos TypeScript** estrictos

Ejemplo de validación:
```typescript
export class CreateTransportMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  capacity: number;
}
```

---

## 🚀 Rate Limiting

Por seguridad, se aplican límites de requests:

| Contexto | Límite | Ventana |
|----------|--------|---------|
| API pública (cotización, tracking) | 100 req | 1 minuto |
| API autenticada | 1000 req | 1 minuto |
| Por IP en total | 500 req | 1 minuto |

Cuando se excede el límite:
- Status code: `429 Too Many Requests`
- Headers incluyen `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🔗 Enlaces Útiles

- **[Backend Microservices](../backend/01-MICROSERVICES.md)** - Arquitectura de microservicios
- **[API Gateway](../backend/02-API-GATEWAY.md)** - Funcionamiento del Gateway
- **[API Reference](../backend/04-API-REFERENCE.md)** - Documentación detallada de todos los endpoints

---

**Última actualización:** Diciembre 3, 2025
