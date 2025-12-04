# 🗄️ Base de Datos - Documentación

Documentación del schema de base de datos y gestión de migraciones.

**Última actualización:** Diciembre 2025

---

## 📐 Arquitectura de Datos

### Tecnologías
- **Base de Datos**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Migraciones**: Prisma Migrate
- **Seed**: Datos iniciales con `prisma/seed.ts`

### Ubicación
```
backend/shared/database/
├── prisma/
│   ├── schema.prisma      # Schema principal
│   ├── migrations/        # Historial de migraciones
│   └── seed.ts           # Datos iniciales
├── src/
│   └── prisma.service.ts # Servicio Prisma para NestJS
└── package.json          # @logistics/database
```

---

## 📊 Modelos Principales

### Configuración (Config Service)

#### TransportMethod
Métodos de transporte disponibles (Moto, Auto, Camioneta, etc.)

**Campos:**
- `id`: Int (PK)
- `name`: String (único)
- `description`: String?
- `capacity`: Float (kg)
- `baseRate`: Float ($/km)
- `status`: Enum (ACTIVE, INACTIVE)
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

#### CoverageZone
Zonas geográficas de cobertura

**Campos:**
- `id`: Int (PK)
- `name`: String
- `description`: String?
- `coordinates`: Json (polígono geográfico)
- `status`: Enum (ACTIVE, INACTIVE)
- `transportMethodId`: Int (FK → TransportMethod)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `transportMethod`: TransportMethod
- `tariffs`: TariffConfig[]

---

#### TariffConfig
Configuración de tarifas por zona y método de transporte

**Campos:**
- `id`: Int (PK)
- `zoneId`: Int (FK → CoverageZone)
- `transportMethodId`: Int (FK → TransportMethod)
- `pricePerKm`: Float
- `pricePerKg`: Float
- `minPrice`: Float
- `maxPrice`: Float?
- `effectiveFrom`: DateTime
- `effectiveTo`: DateTime?
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `zone`: CoverageZone
- `transportMethod`: TransportMethod

---

#### Vehicle
Vehículos de la flota

**Campos:**
- `id`: Int (PK)
- `licensePlate`: String (único)
- `transportMethodId`: Int (FK → TransportMethod)
- `capacity`: Float (kg)
- `status`: Enum (AVAILABLE, IN_USE, MAINTENANCE, INACTIVE)
- `currentLocation`: Json? (lat/lng)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `transportMethod`: TransportMethod
- `routes`: Route[]

---

#### Driver
Conductores de la flota

**Campos:**
- `id`: Int (PK)
- `firstName`: String
- `lastName`: String
- `licenseNumber`: String (único)
- `phone`: String
- `email`: String?
- `status`: Enum (ACTIVE, INACTIVE, ON_ROUTE)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `routes`: Route[]

---

### Envíos (Shipping Service)

#### Shipment
Envíos creados por los clientes

**Campos:**
- `id`: Int (PK)
- `trackingCode`: String (único, público)
- `customerId`: Int
- `status`: Enum (PENDING, IN_TRANSIT, DELIVERED, CANCELLED, FAILED)
- `origin`: Json (dirección + coordenadas)
- `destination`: Json (dirección + coordenadas)
- `weight`: Float (kg)
- `dimensions`: Json (length, width, height)
- `estimatedCost`: Float
- `actualCost`: Float?
- `estimatedDelivery`: DateTime
- `actualDelivery`: DateTime?
- `transportMethodId`: Int (FK → TransportMethod)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `transportMethod`: TransportMethod
- `routeStops`: RouteStop[]
- `history`: ShipmentHistory[]

---

#### Route
Rutas planificadas para entregas

**Campos:**
- `id`: Int (PK)
- `routeCode`: String (único)
- `vehicleId`: Int (FK → Vehicle)
- `driverId`: Int (FK → Driver)
- `status`: Enum (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `plannedDate`: DateTime
- `startedAt`: DateTime?
- `completedAt`: DateTime?
- `totalDistance`: Float? (km)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `vehicle`: Vehicle
- `driver`: Driver
- `stops`: RouteStop[]

---

#### RouteStop
Paradas en una ruta (un envío es una parada)

**Campos:**
- `id`: Int (PK)
- `routeId`: Int (FK → Route)
- `shipmentId`: Int (FK → Shipment)
- `stopOrder`: Int (orden en la ruta)
- `estimatedArrival`: DateTime
- `actualArrival`: DateTime?
- `status`: Enum (PENDING, ARRIVED, DELIVERED, FAILED)
- `notes`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relaciones:**
- `route`: Route
- `shipment`: Shipment

---

#### ShipmentHistory
Historial de cambios de estado de envíos

**Campos:**
- `id`: Int (PK)
- `shipmentId`: Int (FK → Shipment)
- `status`: Enum (igual que Shipment.status)
- `description`: String
- `location`: Json? (lat/lng donde ocurrió el evento)
- `timestamp`: DateTime
- `createdBy`: String? (usuario que realizó la acción)

**Relaciones:**
- `shipment`: Shipment

---

## 🔄 Migraciones

### Crear Nueva Migración

```bash
# Desde raíz del proyecto
cd backend/shared/database

# Crear migración después de editar schema.prisma
pnpm prisma migrate dev --name nombre_descriptivo

# Ejemplo: agregar campo 'email' a Driver
pnpm prisma migrate dev --name add_email_to_driver
```

### Aplicar Migraciones en Producción

```bash
pnpm prisma migrate deploy
```

### Reset de Base de Datos (⚠️ CUIDADO - Borra todos los datos)

```bash
pnpm prisma migrate reset
```

---

## 🌱 Seed (Datos Iniciales)

### Ejecutar Seed

```bash
cd backend/shared/database
pnpm prisma db seed
```

### Datos que se Crean

**Transport Methods:**
- Moto (10 kg)
- Auto (50 kg)
- Camioneta (200 kg)
- Camión (1000 kg)

**Coverage Zones:**
- Zona Centro (Resistencia)
- Zona Norte (Barranqueras)
- Zona Sur (Fontana)

**Tariff Configs:**
- Tarifas por zona y método de transporte

**Vehicles:**
- 2 motos
- 2 autos
- 1 camioneta

**Drivers:**
- 3 conductores de ejemplo

---

## 🔍 Queries Comunes

### Obtener envío con toda su información

```typescript
const shipment = await prisma.shipment.findUnique({
  where: { id: 1 },
  include: {
    transportMethod: true,
    routeStops: {
      include: {
        route: {
          include: {
            vehicle: true,
            driver: true
          }
        }
      }
    },
    history: {
      orderBy: { timestamp: 'desc' }
    }
  }
});
```

### Listar rutas activas con paradas

```typescript
const activeRoutes = await prisma.route.findMany({
  where: {
    status: { in: ['PLANNED', 'IN_PROGRESS'] }
  },
  include: {
    vehicle: true,
    driver: true,
    stops: {
      include: {
        shipment: true
      },
      orderBy: { stopOrder: 'asc' }
    }
  }
});
```

### Obtener tarifas vigentes

```typescript
const currentTariffs = await prisma.tariffConfig.findMany({
  where: {
    effectiveFrom: { lte: new Date() },
    OR: [
      { effectiveTo: null },
      { effectiveTo: { gte: new Date() } }
    ]
  },
  include: {
    zone: true,
    transportMethod: true
  }
});
```

---

## 🛡️ Constraints y Validaciones

### Unique Constraints
- `TransportMethod.name`
- `Vehicle.licensePlate`
- `Driver.licenseNumber`
- `Shipment.trackingCode`
- `Route.routeCode`

### Foreign Key Constraints
Todas las relaciones tienen `onDelete` configurado:
- **CASCADE**: Si se borra el padre, se borran los hijos (ej: Route → RouteStop)
- **RESTRICT**: No se puede borrar si tiene hijos (ej: TransportMethod con Vehicles)
- **SET NULL**: Se setea a null (ej: opcional)

### Check Constraints
- `weight > 0`
- `capacity > 0`
- `pricePerKm >= 0`
- `minPrice >= 0`

---

## 📝 Enums

### ShipmentStatus
```
PENDING      - Envío creado, pendiente de asignación
IN_TRANSIT   - En camino
DELIVERED    - Entregado
CANCELLED    - Cancelado
FAILED       - Fallo en entrega
```

### RouteStatus
```
PLANNED      - Ruta planificada
IN_PROGRESS  - En ejecución
COMPLETED    - Completada
CANCELLED    - Cancelada
```

### VehicleStatus
```
AVAILABLE    - Disponible
IN_USE       - En uso
MAINTENANCE  - En mantenimiento
INACTIVE     - Inactivo
```

### DriverStatus
```
ACTIVE       - Activo y disponible
INACTIVE     - Inactivo
ON_ROUTE     - En ruta
```

---

## 🔗 Enlaces

- **[Prisma Documentation](https://www.prisma.io/docs)** - Documentación oficial
- **[Schema Reference](../backend/03-DATABASE.md)** - Documentación técnica del schema
- **[API Reference](../backend/04-API-REFERENCE.md)** - Endpoints que usan estos modelos

---

**Última actualización:** Diciembre 3, 2025
