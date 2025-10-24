# 📦 Sistema de Logística y Transporte - TPI 2025

> **Trabajo Práctico Integrador - Desarrollo de Software 2025**
> **UTN FRRE - Facultad Regional Resistencia - Grupo 12**

## 🎯 Descripción del Proyecto

Sistema integral de gestión logística que opera en modelo punto a punto (A→B): retira mercadería en depósitos de Stock y entrega directamente al cliente final, sin sucursales intermedias ni centros de distribución propios.

### Responsabilidades del Sistema:
- ✅ Cotizar costo y tiempo de envío
- ✅ Crear y gestionar envíos post-compra
- ✅ Planificar retiros en depósitos de Stock
- ✅ Coordinar y ejecutar retiros físicos
- ✅ Planificar rutas de entrega optimizadas
- ✅ Ejecutar entregas con evidencia digital
- ✅ Gestionar problemas, reintentos y reprogramaciones
- ✅ Procesar cancelaciones
- ✅ Gestionar devoluciones a Stock
- ✅ Mantener trazabilidad completa
- ✅ Generar documentación operativa

## 🏗️ Arquitectura

### Ecosistema Completo:
- **Portal de Compras**: Venta, cobro, gestión de catálogo
- **Stock**: Gestión de inventario y reservas
- **Logística** (este módulo): Transporte, seguimiento y coordinación

### Stack Tecnológico:
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Autenticación**: Keycloak
- **Cache**: Redis
- **Microservicios**: Patrón Facade + Service Discovery
- **Testing**: Jest
- **DevOps**: Docker + Docker Compose

## 📁 Estructura del Proyecto

```
logisticaG12/  (MONOREPO)
│
├── backend/                           # Backend Microservicios (NestJS)
│   ├── shared/                        # Paquetes compartidos
│   │   ├── database/                  # Schema Prisma, migraciones
│   │   ├── types/                     # Interfaces TypeScript compartidas
│   │   └── utils/                     # Funciones utilidades comunes
│   │
│   └── services/                      # Microservicios individuales
│       ├── config-service/            # Métodos transporte, zonas, tarifas
│       ├── shipping-service/          # Core shipping, cálculos, tracking
│       ├── stock-integration-service/ # Integración sistema stock externo
│       └── operator-interface-service/# Gateway - endpoint único frontend
│
├── frontend/                          # Frontend (Next.js 16 + React 19)
│   ├── src/app/
│   │   ├── components/                # Componentes React UI
│   │   ├── lib/middleware/            # Capa de servicios
│   │   │   ├── services/              # API calls al backend
│   │   │   ├── stores/                # Estado global (patrón Svelte/Vue)
│   │   │   ├── composables/           # React hooks para stores
│   │   │   ├── validators/            # Validaciones Zod
│   │   │   ├── errors/                # Manejo de errores
│   │   │   └── http/                  # Cliente Axios + interceptores
│   │   └── (main)/                    # Páginas Next.js App Router
│   ├── public/                        # Assets estáticos
│   ├── .env.local                     # Variables entorno local
│   └── package.json
│
├── docker-compose.yml                 # Servicios: PostgreSQL, Redis, Keycloak
├── CLAUDE.md                          # Documentación para Claude Code (COMPLETA)
├── API-GATEWAY-ROUTES.md              # Documentación endpoints gateway (NUEVA)
├── README.md                          # Este archivo
└── package.json                       # Root package.json con scripts npm
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- Docker y Docker Compose
- Git

### Configuración Inicial (5 minutos)

1. **Clonar y entrar al directorio:**
```bash
git clone https://github.com/FRRe-DS/2025-12-TPI.git
cd 2025-12-TPI
```

2. **Instalar todas las dependencias:**
```bash
npm run install:all
```

3. **Iniciar servicios Docker (PostgreSQL, Redis, Keycloak):**
```bash
docker-compose up -d
```

4. **Setup base de datos:**
```bash
cd backend/shared/database
npx prisma migrate dev
npx prisma db seed
```

5. **Compilar paquetes compartidos:**
```bash
cd /path/to/root
npm run build:shared
```

### Inicio Diario (Desarrollo)

**Terminal 1 - Todos los servicios backend:**
```bash
npm run dev
# Inicia: Shipping (:3001), Stock (:3002), Config (:3003), Gateway (:3004)
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Abre http://localhost:3000
```

**Verificar que funciona:**
- Frontend: http://localhost:3000
- Gateway Health: http://localhost:3004/health
- Gateway Status: http://localhost:3004/gateway/status
- Prisma Studio: `cd backend/shared/database && npx prisma studio`

## 🔗 APIs y Endpoints

### Endpoints Gateway (vía puerto :3004)

**Documentación Completa:** Ver [API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md)

**Endpoints Principales:**
```
CONFIG SERVICE (http://localhost:3003)
GET    /config/transport-methods      → Listar métodos transporte
GET    /config/coverage-zones         → Listar zonas cobertura
GET    /config/tariff-configs         → Listar tarifas

SHIPPING SERVICE (http://localhost:3001)
GET    /shipping/shipments            → Listar envíos
POST   /shipping/shipments            → Crear envío
POST   /shipping/calculate-cost       → Cotizar envío
GET    /shipping/shipments/:id/tracking → Tracking envío

STOCK INTEGRATION SERVICE (http://localhost:3002)
GET    /stock/inventory               → Ver inventario
POST   /stock/inventory/reserve       → Reservar stock
POST   /stock/inventory/check-availability → Verificar disponibilidad

GATEWAY CONTROL
GET    /gateway/status                → Status de todos servicios
GET    /health                        → Health check del gateway
```

### Arquitectura de Comunicación

```
Frontend (http://localhost:3000)
        ↓
        NEXT_PUBLIC_API_URL = http://localhost:3004
        ↓
Operator Interface Gateway (:3004)
  ├─ ServiceRegistry (Descubrimiento de servicios)
  ├─ ServiceFacade (Orquestación de llamadas)
  └─ ProxyController (Ruteo inteligente)
        ↓
Microservicios Internos
  ├─ Config Service (:3003)
  ├─ Shipping Service (:3001)
  └─ Stock Integration (:3002)
```

**Nota:** El gateway usa **Facade Pattern + Service Discovery** para rutear automáticamente requests sin hardcodear rutas en el frontend.

## 🔄 Flujo de Estados

```
created → pickup_scheduled → picking_up → picked_up → 
out_for_delivery → delivered ✅

Desvíos:
created → cancelled ❌
pickup_scheduled → cancelled ❌
out_for_delivery → delivery_failed → out_for_delivery (reintento)
delivery_failed → returning → returned ❌
```

## 🌿 Estrategia de Branches

### Branches Permanentes:
- `main` → Producción (código estable, protegida)
- `dev` → Integración continua (donde se mergea todo)

### Branches Temporales:
- `feature/<scope>-<descripcion>` → Nueva funcionalidad
- `fix/<scope>-<descripcion>` → Corrección de bug
- `chore/<descripcion>` → Tareas de mantenimiento
- `docs/<tema>` → Documentación

## 📋 Sprints Planificados

1. **Sprint 1**: Fundación Arquitectónica
2. **Sprint 2**: Creación y Gestión de Envíos
3. **Sprint 3**: Tracking y Estados
4. **Sprint 4**: Planificación y Rutas
5. **Sprint 5**: Refinamiento e Integración
6. **Sprint 6**: Polish y Entrega

## 🛠️ Comandos Útiles

### Nivel Raíz (Monorepo)
```bash
npm run install:all           # Instalar todas dependencias
npm run build                 # Compilar backend
npm run dev                   # Iniciar todos servicios
npm run clean                 # Limpiar node_modules y dist
npm run lint                  # Arreglar ESLint
npm run format                # Formatear con Prettier
```

### Servicios Individuales
```bash
npm run start:dev:shipping    # Shipping Service (:3001)
npm run start:dev:stock       # Stock Integration (:3002)
npm run start:dev:config      # Config Service (:3003)
npm run start:dev:operator    # Operator Gateway (:3004)
```

### Base de Datos
```bash
cd backend/shared/database
npx prisma migrate dev        # Crear migración y aplicar
npx prisma db seed            # Poblar datos test
npx prisma studio             # Interfaz visual BD
npx prisma generate           # Generar cliente Prisma
```

### Docker
```bash
docker-compose up -d          # Levantar PostgreSQL, Redis, Keycloak
docker-compose down           # Detener servicios
docker-compose logs           # Ver logs
docker-compose ps             # Listar contenedores
```

## 📚 Documentación Importante

### Para Empezar
- **[CLAUDE.md](./CLAUDE.md)** - Documentación completa para desarrollo (Recomendado leer primero!)
- **[API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md)** - Todas las rutas disponibles del gateway inteligente
- **[README.md](./README.md)** - Este archivo

### Documentación Específica por Módulo
- `frontend/CLAUDE.md` - Guía específica del frontend
- `frontend/MIGRATION-SUMMARY.md` - Migración de SvelteKit a Next.js
- `backend/shared/database/prisma/schema.prisma` - Schema de base de datos

## 👥 Equipo

**Grupo 12 - Desarrollo de Software 2025 - UTN FRRE**

## 📄 Licencia

Apache-2.0

## 🔗 Enlaces

- **Repositorio**: https://github.com/FRRe-DS/2025-12-TPI
- **Documentación**: [Ver docs/](./docs/)
- **Issues**: https://github.com/FRRe-DS/2025-12-TPI/issues