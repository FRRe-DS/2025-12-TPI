# 🏗️ Backend - Microservicios

Documentación de los 4 microservicios que componen el sistema de logística.

**Stack:** NestJS + TypeScript + Prisma ORM + PostgreSQL

---

## 📊 Visión General

```
┌─────────────────────────────────────────────────────────────┐
│  Operator Interface Service (Gateway) - Puerto :3004        │
│  ├─ ServiceRegistry (Service Discovery)                     │
│  ├─ ServiceFacade (Orquestación)                            │
│  └─ ProxyController (Ruteo Inteligente)                     │
└─────────────────────┬────────────────────────────────────────┘
          │
  ┌─────────────────────────────────────────┐
  │                  │                  │
  ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Config Service   │ │Shipping Service  │ │  Stock Integ.    │
│ Puerto :3003     │ │ Puerto :3001     │ │ Puerto :3002     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🔧 Config Service (Puerto :3003)

**Responsabilidad:** Gestionar configuración del sistema (transportes, zonas, tarifas).

### Endpoints Disponibles

```
Métodos de Transporte:
  GET    /config/transport-methods          Listar métodos
  POST   /config/transport-methods          Crear método
  GET    /config/transport-methods/:id      Obtener método
  PATCH  /config/transport-methods/:id      Actualizar método
  DELETE /config/transport-methods/:id      Eliminar método

Zonas de Cobertura:
  GET    /config/coverage-zones             Listar zonas
  POST   /config/coverage-zones             Crear zona
  GET    /config/coverage-zones/:id         Obtener zona
  PATCH  /config/coverage-zones/:id         Actualizar zona
  DELETE /config/coverage-zones/:id         Eliminar zona

Configuraciones de Tarifa:
  GET    /config/tariff-configs             Listar tarifas
  POST   /config/tariff-configs             Crear tarifa
  GET    /config/tariff-configs/:id         Obtener tarifa
  PATCH  /config/tariff-configs/:id         Actualizar tarifa
  DELETE /config/tariff-configs/:id         Eliminar tarifa

Health Check:
  GET    /health                            Status del servicio
```

### Modelos de Datos

**TransportMethod**
```typescript
{
  id: string;              // UUID
  name: string;            // "Terrestre", "Aéreo", etc
  code: string;            // "ROAD", "AIR", etc
  description?: string;
  estimatedDays: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**CoverageZone**
```typescript
{
  id: string;
  name: string;            // "CABA", "GBA", etc
  postalCodeStart: string;
  postalCodeEnd: string;
  province: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**TariffConfig**
```typescript
{
  id: string;
  transportMethodId: string;
  transportMethod: TransportMethod;  // Relación
  baseCost: number;
  costPerKm: number;
  costPerKg: number;
  minShipmentWeight: number;
  maxShipmentWeight: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Controladores

**Location:** `backend/services/config-service/src/config/`

```
config.controller.ts      # Routes HTTP
config.service.ts         # Lógica de negocio
config.module.ts          # Módulo NestJS
```

---

## 🚚 Shipping Service (Puerto :3001)

**Responsabilidad:** Lógica de envíos, cálculos, tracking y estado.

### Endpoints Principales

```
Envíos:
  GET    /shipping/shipments                Listar envíos
  POST   /shipping/shipments                Crear envío
  GET    /shipping/shipments/:id            Obtener envío
  PATCH  /shipping/shipments/:id            Actualizar envío
  GET    /shipping/shipments/:id/tracking   Tracking detallado

Cálculos:
  POST   /shipping/calculate-cost           Cotizar envío
  POST   /shipping/calculate-delivery-time  Estimar entrega

Health Check:
  GET    /health                            Status del servicio
```

### Modelos de Datos

**Shipment**
```typescript
{
  id: string;
  trackingNumber: string;          // Número de tracking único
  status: ShipmentStatus;          // PENDING, PICKED_UP, OUT_FOR_DELIVERY, etc
  originAddress: string;
  destinationAddress: string;
  weight: number;                  // kg
  transportMethodId: string;
  transportMethod: TransportMethod;
  baseCost: number;
  deliveryEstimate: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**ShipmentStatus**
```
PENDING              → Envío creado, pendiente pickup
PICKUP_SCHEDULED     → Pickup agendado
PICKING_UP           → En proceso de recogida
PICKED_UP            → Recogida completada
OUT_FOR_DELIVERY     → En ruta de entrega
DELIVERED            → Entregado exitosamente
DELIVERY_FAILED      → Entrega fallida
RETURNING            → Retornando a origen
RETURNED             → Retornado a origen
CANCELLED            → Cancelado
```

### Lógica de Negocio

**Cálculo de Costo:**
```typescript
totalCost = baseCost +
            (distanceKm * costPerKm) +
            (weight * costPerKg)
```

**Estimación de Entrega:**
- Basada en transportMethodId
- Considerando cobertura geográfica
- Sumando días de transporte estimado

### Controladores

**Location:** `backend/services/shipping-service/src/shipping/`

```
shipping.controller.ts           # Routes HTTP
shipping.service.ts              # Lógica shipping
tariff-calculation.service.ts    # Cálculos de costo
```

---

## 📦 Stock Integration Service (Puerto :3002)

**Responsabilidad:** Integración con sistema externo de stock/inventario.

### Endpoints Disponibles

```
Inventario:
  GET    /stock/inventory                   Ver inventario
  POST   /stock/inventory/reserve           Reservar stock
  POST   /stock/inventory/release           Liberar reserva
  POST   /stock/inventory/check-availability Verificar disponibilidad

Health Check:
  GET    /health                            Status del servicio
```

### Modelos de Datos

**Inventory**
```typescript
{
  id: string;
  sku: string;                   // Stock Keeping Unit
  productName: string;
  warehouse: string;
  quantity: number;              // Total disponible
  reservedQuantity: number;      // Reservado
  availableQuantity: number;     // = quantity - reserved
  lastUpdated: Date;
}
```

**Reservation**
```typescript
{
  id: string;
  sku: string;
  quantity: number;
  warehouseId: string;
  orderId: string;               // Referencia a orden
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED';
  expiresAt: Date;
  createdAt: Date;
}
```

### Integración Externa

Se conecta con API externa de stock:
```typescript
// Ejemplo de auth
const token = await getExternalToken();

// Endpoints consumidos
GET  /api/inventory?sku=ABC123
POST /api/reservations
GET  /api/reservations/:id
```

### Controladores

**Location:** `backend/services/stock-integration-service/src/stock/`

```
stock.controller.ts        # Routes HTTP
stock.service.ts           # Lógica integración
stock-auth.guard.ts        # Autenticación externa
```

---

## 🔌 Operator Interface Service - Gateway (Puerto :3004)

**Responsabilidad:** Single entry point para frontend, ruteo inteligente a microservicios.

### Arquitectura Facade + Service Discovery

**Componentes:**

1. **ServiceRegistry** - Mantiene registro dinámico de servicios
   ```typescript
   config-service       → http://localhost:3003 → ['/config']
   shipping-service     → http://localhost:3001 → ['/shipping']
   stock-integration    → http://localhost:3002 → ['/stock']
   ```

2. **ServiceFacade** - Orquesta llamadas
   - Retry automático (2 reintentos)
   - Error handling consistente
   - Health checks

3. **ProxyController** - Ruteo inteligente
   - `@All('*')` - Captura todos requests
   - `GET /gateway/status` - Debug endpoint

### Endpoints

```
Gateway Control:
  GET    /gateway/status                    Status de servicios
  GET    /health                            Health check gateway

Ruteo Automático:
  *      /*                                 Proxy a servicio apropiado
           ↓ /config/* → config-service
           ↓ /shipping/* → shipping-service
           ↓ /stock/* → stock-integration
```

### Health Check Response

```json
{
  "services": [
    {
      "name": "config-service",
      "baseUrl": "http://localhost:3003",
      "routes": ["/config"],
      "isHealthy": true,
      "lastHealthCheck": "2025-10-24T12:34:56.789Z"
    }
  ],
  "timestamp": "2025-10-24T12:35:00.123Z"
}
```

### Módulos

**Location:** `backend/services/operator-interface-service/src/core/`

```
service-registry.ts        # Service discovery
service-facade.ts          # Orquestación
proxy.controller.ts        # Router inteligente
core.module.ts             # Empaquetamiento
```

---

## 🗂️ Estructura de Directorios Backend

```
backend/
├── shared/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Schema de BD
│   │   │   └── migrations/             # Cambios de BD
│   │   └── src/
│   │       └── prisma.module.ts        # Módulo Prisma
│   ├── types/
│   │   ├── dtos/
│   │   ├── entities/
│   │   └── enums/
│   └── utils/
│       ├── helpers/
│       └── constants/
│
└── services/
    ├── config-service/
    │   ├── src/
    │   │   ├── config/
    │   │   │   ├── config.controller.ts
    │   │   │   ├── config.service.ts
    │   │   │   └── config.module.ts
    │   │   ├── app.module.ts
    │   │   └── main.ts
    │   ├── test/
    │   └── package.json
    │
    ├── shipping-service/
    │   └── (similar structure)
    │
    ├── stock-integration-service/
    │   └── (similar structure)
    │
    └── operator-interface-service/
        └── (similar structure)
```

---

## 🔄 Flujo de una Request

**Ejemplo: Obtener métodos de transporte**

```
1. Frontend: GET http://localhost:3004/config/transport-methods

2. Operator Gateway recibe:
   - ProxyController(@All('*')) captura

3. ServiceFacade.request('GET', '/config/transport-methods')
   - ServiceRegistry.findServiceByRoute('/config')
   - Retorna: config-service @ http://localhost:3003

4. HTTP GET http://localhost:3003/config/transport-methods

5. Config Service procesa:
   - config.controller.ts: @Get() handler
   - config.service.ts: Busca en BD
   - Retorna: [{ id, name, code, ... }]

6. Gateway retorna response a Frontend

7. Frontend renderiza datos
```

---

## 🚀 Desarrollo de Microservicios

### Agregar Nuevo Endpoint

**En config-service (ejemplo):**

1. **Controller** (`config.controller.ts`):
```typescript
@Get('search')
async search(@Query('query') query: string) {
  return this.configService.search(query);
}
```

2. **Service** (`config.service.ts`):
```typescript
async search(query: string) {
  return this.prisma.transportMethod.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}
```

3. **Test automáticamente** vía Gateway:
```bash
curl http://localhost:3004/config/transport-methods/search?query=aer
```

---

## 🧪 Testing

### Compilar Servicio Individual

```bash
cd backend/services/config-service
pnpm run build
```

### Tests Unitarios

```bash
cd backend/services/config-service
pnpm test
pnpm run test:watch
```

### Tests E2E

```bash
cd backend/services/config-service
pnpm run test:e2e
```

### Health Check Manual

```bash
curl http://localhost:3003/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3004/health
```

---

## 🔐 Variables de Entorno

Cada servicio puede tener su propio `.env`:

```env
# Database (compartida)
DATABASE_URL=postgresql://user:pass@localhost:5432/logistica_db

# Redis (compartida)
REDIS_URL=redis://localhost:6379

# Node environment
NODE_ENV=development

# Service-specific
PORT=3001  # o 3002, 3003, 3004
```

---

## 🛠️ Troubleshooting

**Servicio no inicia:**
```bash
# Ver error en logs
pnpm run start:dev

# Verificar puerto está libre
lsof -i :3001

# Verificar BD conecta
pnpm prisma db execute --stdin < /dev/null
```

**Gateway no rutea:**
```bash
# Ver status de servicios
curl http://localhost:3004/gateway/status

# Ver que servicio está unhealthy
curl http://localhost:3004/gateway/status | jq '.services[] | select(.isHealthy==false)'
```

**Errores de tipo:**
```bash
# Regenerar cliente Prisma
cd backend/shared/database
npx prisma generate
```

---

**Última actualización:** Diciembre 3, 2025
