# 📦 Sistema de Logística y Transporte - TPI 2025

> **Trabajo Práctico Integrador - Desarrollo de Software 2025**
> **UTN FRRE - Facultad Regional Resistencia - Grupo 12**

## 📚 Documentación

**Toda la documentación técnica está centralizada en [`/docs`](./docs/)**

### Guías Rápidas:
- 🚀 **[Deployment en Dokploy](./docs/deployment/INDEX.md)** - Guía completa de despliegue
- 🌐 **[Networking](./docs/deployment/DOKPLOY-NETWORKING.md)** - Configuración de red y servicios
- 🗄️ **[Database](./docs/deployment/DOKPLOY-DATABASE.md)** - PostgreSQL + Prisma
- 🏗️ **[Arquitectura](./docs/architecture/README.md)** - Diseño del sistema
- 📡 **[API](./docs/api/README.md)** - Endpoints y contratos

---

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
<<<<<<< HEAD
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL (4 microservicios)
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Cache**: Redis
- **Documentación**: OpenAPI/Swagger
- **Testing**: Jest + Testing Library
- **DevOps**: Docker + Scripts personalizados + GitHub Actions
=======
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Autenticación**: Keycloak
- **Cache**: Redis
- **Microservicios**: Patrón Facade + Service Discovery
- **Testing**: Jest
- **DevOps**: Docker + Docker Compose
>>>>>>> origin/main

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
<<<<<<< HEAD
├── frontend/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/               # App Router (páginas)
│   │   ├── components/        # Componentes UI
│   │   └── lib/               # Utilidades y configuración
│   ├── public/                # Assets estáticos
│   ├── Dockerfile
│   └── package.json
│
├── docs/                       # Documentación
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── deployment/
│
├── .github/
│   └── workflows/              # CI/CD
│
├── docker-compose.yml
├── README.md
└── CONTRIBUTING.md
=======
├── docker-compose.yml                 # Servicios: PostgreSQL, Redis, Keycloak
├── CLAUDE.md                          # Documentación para Claude Code (COMPLETA)
├── API-GATEWAY-ROUTES.md              # Documentación endpoints gateway (NUEVA)
├── README.md                          # Este archivo
└── package.json                       # Root package.json con scripts npm
>>>>>>> origin/main
```

## 🚀 Instalación y Configuración

### Prerrequisitos
<<<<<<< HEAD
- Docker >= 20.x
- Docker Compose >= 2.x (opcional, para usar docker-compose)
- Node.js >= 18.x y pnpm (para desarrollo local)
=======
- Node.js 20+
- Docker y Docker Compose
>>>>>>> origin/main
- Git
- Al menos 4GB RAM disponible

<<<<<<< HEAD
## 🐳 Desarrollo con Docker

### Opción 1: Docker Compose (Recomendado)

#### 1. Clonar el repositorio
=======
### Configuración Inicial (5 minutos)

1. **Clonar y entrar al directorio:**
>>>>>>> origin/main
```bash
git clone https://github.com/FRRe-DS/2025-12-TPI.git
cd 2025-12-TPI
```

<<<<<<< HEAD
### 2. Configurar Variables de Entorno para Supabase

**Importante**: Los microservicios usan **Supabase** como base de datos. Debes configurar las variables de entorno antes de levantar los servicios.

#### Opción A: Usar archivo .env (Recomendado)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# En la raíz del proyecto
cat > .env << 'EOF'
# URLs de Supabase (obtenerlas desde tu proyecto en Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
EOF
```

**Cómo obtener las URLs de Supabase:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **Database**
3. Copia la **Connection string** (URI) para `DATABASE_URL`
4. Para `DIRECT_URL`, usa la misma URL pero con puerto `5432` en lugar de `6543`

**Ejemplo de URLs:**
```bash
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:[TU_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abcdefghijklmnop:[TU_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### Opción B: Exportar variables de entorno

```bash
export DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**Nota**: Los archivos `.env` individuales por servicio son opcionales si usas Docker Compose con el `.env` en la raíz. Si necesitas personalizar valores por servicio, crea los siguientes archivos:

#### Config Service
```bash
cd backend/services/config-service
cp env.example .env
# Editar .env con tus credenciales de base de datos
```

#### Operator Interface Service
=======
2. **Instalar todas las dependencias:**
```bash
npm run install:all
```

3. **Iniciar servicios Docker (PostgreSQL, Redis, Keycloak):**
>>>>>>> origin/main
```bash
cd backend/services/operator-interface-service
cp env.example .env
# Editar .env con URLs de servicios y configuración de Keycloak
```

<<<<<<< HEAD
#### Shipping Service (si existe env.example)
```bash
cd backend/services/shipping-service
# Si existe env.example:
cp env.example .env
# Editar .env con configuración de servicios
```

#### Stock Integration Service (si existe env.example)
```bash
cd backend/services/stock-integration-service
# Si existe env.example:
cp env.example .env
# Editar .env con configuración
```

#### Frontend (opcional)
```bash
cd frontend
# Crear .env.local para variables de entorno de Next.js
# Las variables NEXT_PUBLIC_* se pasan como build args en Docker
```

**Importante**: 
- **Con Docker Compose**: Crea un archivo `.env` en la raíz del proyecto con `DATABASE_URL` y `DIRECT_URL` de Supabase
- **Sin Docker**: Los archivos `.env` en cada servicio son obligatorios
- **Keycloak**: Usa su propia base de datos PostgreSQL local (no requiere configuración)

### 3. Levantar todos los servicios
```bash
# Construir imágenes y levantar todos los servicios
docker-compose up -d --build

# Ver logs de todos los servicios
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps
```

### 4. Ejecutar migraciones de base de datos
```bash
# Instalar dependencias del backend (necesario para Prisma)
cd backend
pnpm install

# Generar cliente Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# (Opcional) Cargar datos de ejemplo
# pnpm prisma:db:seed
```

#### 4. Verificar que todo funciona
```bash
# Health checks
curl http://localhost:3003/health  # Config Service
curl http://localhost:3001/health  # Shipping Service
curl http://localhost:3002/health  # Stock Service
curl http://localhost:3004/health  # Operator Interface
curl http://localhost:3000          # Frontend
```

### Opción 2: Docker Individual (Manual)

#### 1. Construir imágenes de microservicios

Cada servicio se construye desde la **raíz del monorepo**:

```bash
# Config Service
docker build \
  -f backend/services/config-service/Dockerfile \
  -t logistics-config-service:latest \
  --build-arg SERVICE_PATH=backend/services/config-service \
  --build-arg SERVICE_FILTER=@logistics/config-service \
  --build-arg PORT=3003 \
  .

# Shipping Service
docker build \
  -f backend/services/shipping-service/Dockerfile \
  -t logistics-shipping-service:latest \
  --build-arg SERVICE_PATH=backend/services/shipping-service \
  --build-arg SERVICE_FILTER=@logistics/shipping-service \
  --build-arg PORT=3001 \
  .

# Stock Integration Service
docker build \
  -f backend/services/stock-integration-service/Dockerfile \
  -t logistics-stock-service:latest \
  .

# Operator Interface Service
docker build \
  -f backend/services/operator-interface-service/Dockerfile \
  -t logistics-operator-service:latest \
  --build-arg SERVICE_PATH=backend/services/operator-interface-service \
  --build-arg SERVICE_FILTER=@logistics/operator-interface-service \
  --build-arg PORT=3004 \
  .

# Frontend
docker build \
  -f frontend/Dockerfile \
  -t logistics-frontend:latest \
  frontend/
```

#### 2. Levantar infraestructura
```bash
# PostgreSQL
docker run -d --name postgres-dev -p 5432:5432 \
  -e POSTGRES_DB=logistics_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  postgres:16-alpine

# Redis
docker run -d --name redis-dev -p 6379:6379 redis:7-alpine
```

#### 3. Ejecutar servicios

```bash
# Config Service
docker run -d -p 3003:3003 \
  -e PORT=3003 \
  -e DATABASE_URL=postgresql://postgres:postgres123@host.docker.internal:5432/logistics_db \
  -e DIRECT_URL=postgresql://postgres:postgres123@host.docker.internal:5432/logistics_db \
  --name logistics-config-service \
  logistics-config-service:latest

# Shipping Service
docker run -d -p 3001:3001 \
  -e PORT=3001 \
  -e DATABASE_URL=postgresql://postgres:postgres123@host.docker.internal:5432/logistics_db \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e CONFIG_SERVICE_URL=http://host.docker.internal:3003 \
  -e STOCK_SERVICE_URL=http://host.docker.internal:3002 \
  --name logistics-shipping-service \
  logistics-shipping-service:latest

# Stock Integration Service
docker run -d -p 3002:3002 \
  -e PORT=3002 \
  -e DATABASE_URL=postgresql://postgres:postgres123@host.docker.internal:5432/logistics_db \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  --name logistics-stock-service \
  logistics-stock-service:latest

# Operator Interface Service
docker run -d -p 3004:3004 \
  -e PORT=3004 \
  -e CONFIG_SERVICE_URL=http://host.docker.internal:3003 \
  -e SHIPPING_SERVICE_URL=http://host.docker.internal:3001 \
  -e STOCK_SERVICE_URL=http://host.docker.internal:3002 \
  -e KEYCLOAK_URL=http://host.docker.internal:8080 \
  -e KEYCLOAK_REALM=ds-2025-realm \
  --name logistics-operator-service \
  logistics-operator-service:latest

# Frontend
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3004 \
  -e NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_KEYCLOAK_REALM=ds-2025-realm \
  -e NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=logistics-frontend \
  --name logistics-frontend \
  logistics-frontend:latest
```

### 🌐 Servicios Disponibles

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Frontend** | 3000 | http://localhost:3000 | Interfaz de usuario (Next.js) |
| **API Gateway** | 3004 | http://localhost:3004 | Operator Interface Service |
| **Config Service** | 3003 | http://localhost:3003 | Configuración y flota |
| **Shipping Service** | 3001 | http://localhost:3001 | Envíos y cotizaciones |
| **Stock Service** | 3002 | http://localhost:3002 | Integración con Stock |
| **Keycloak** | 8080 | http://localhost:8080 | Autenticación |
| **PostgreSQL** | 5432 | localhost:5432 | Base de datos |
| **Redis** | 6379 | localhost:6379 | Cache |

### 📚 Documentación de APIs

Cada servicio expone su documentación Swagger:
- **Config Service**: http://localhost:3003/api/docs
- **Shipping Service**: http://localhost:3001/api/docs
- **Stock Service**: http://localhost:3002/api/docs
- **API Gateway**: http://localhost:3004/api/docs

### 🛑 Detener Servicios

```bash
# Con Docker Compose
docker-compose down

# Individualmente
docker stop logistics-config-service logistics-shipping-service \
  logistics-stock-service logistics-operator-service logistics-frontend \
  postgres-dev redis-dev

# Limpiar contenedores
docker-compose down -v  # Con volúmenes
```

## 🔧 Desarrollo Local sin Docker

Si prefieres desarrollo local con Node.js:

```bash
# 1. Instalar dependencias
cd backend && pnpm install
cd ../frontend && pnpm install

# 2. Configurar Variables de Entorno (OBLIGATORIO para desarrollo local)
# Config Service
cd backend/services/config-service
cp env.example .env
# Editar .env con DATABASE_URL y DIRECT_URL

# Operator Interface Service
cd ../operator-interface-service
cp env.example .env
# Editar .env con CONFIG_SERVICE_URL, SHIPPING_SERVICE_URL, STOCK_SERVICE_URL

# Shipping Service (si existe env.example)
cd ../shipping-service
# cp env.example .env  # Si existe

# Stock Integration Service (si existe env.example)
cd ../stock-integration-service
# cp env.example .env  # Si existe

# Frontend
cd ../../../frontend
# Crear .env.local con NEXT_PUBLIC_API_URL, NEXT_PUBLIC_KEYCLOAK_URL, etc.

# 3. Levantar infraestructura (PostgreSQL y Redis)
docker run -d --name postgres-dev -p 5432:5432 \
  -e POSTGRES_DB=logistics_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  postgres:16-alpine

docker run -d --name redis-dev -p 6379:6379 redis:7-alpine

# 4. Configurar base de datos
cd backend
pnpm prisma:generate
pnpm prisma:migrate

# 5. Levantar servicios backend (en una terminal)
cd backend
pnpm dev  # Levanta todos los microservicios

# 6. Levantar frontend (en otra terminal)
cd frontend
pnpm dev  # Next.js en http://localhost:3000
```

📖 **Documentación completa**: [Ver docs/](./docs/)
=======
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
>>>>>>> origin/main

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

<<<<<<< HEAD
### 🐳 Docker Compose
```bash
# Levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f                    # Todos los servicios
docker-compose logs -f config-service     # Servicio específico

# Ver estado
docker-compose ps

# Detener servicios
docker-compose down                       # Detener
docker-compose down -v                    # Detener y eliminar volúmenes

# Reconstruir un servicio específico
docker-compose build config-service
docker-compose up -d config-service
=======
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
>>>>>>> origin/main
```

### 🐳 Docker Individual
```bash
<<<<<<< HEAD
# Construir imágenes (desde raíz del monorepo)
docker build -f backend/services/config-service/Dockerfile \
  -t logistics-config-service:latest \
  --build-arg SERVICE_PATH=backend/services/config-service \
  --build-arg SERVICE_FILTER=@logistics/config-service \
  --build-arg PORT=3003 .

docker build -f frontend/Dockerfile -t logistics-frontend:latest frontend/

# Ver imágenes construidas
docker images | grep logistics

# Ver contenedores corriendo
docker ps | grep logistics
```

### Backend (pnpm)
```bash
cd backend

# Desarrollo
pnpm install:all           # Instalar todas las dependencias
pnpm build:shared          # Construir librerías compartidas
pnpm dev                   # Levantar todos los servicios en desarrollo
pnpm start:dev:config      # Levantar solo config-service

# Base de datos
pnpm prisma:generate       # Generar cliente Prisma
pnpm prisma:migrate        # Ejecutar migraciones
pnpm prisma:studio         # Interfaz gráfica de BD

# Testing
pnpm test:all             # Tests de todos los servicios
pnpm test:e2e:all         # Tests E2E de todos los servicios

# Utilidades
pnpm format               # Formatear código
pnpm lint                 # Ejecutar linter
```

### Frontend
```bash
cd frontend
pnpm install              # Instalar dependencias
pnpm dev                  # Desarrollo (puerto 3000)
pnpm build                # Build de producción
pnpm start                # Servidor de producción
pnpm lint                 # Ejecutar linter
=======
docker-compose up -d          # Levantar PostgreSQL, Redis, Keycloak
docker-compose down           # Detener servicios
docker-compose logs           # Ver logs
docker-compose ps             # Listar contenedores
>>>>>>> origin/main
```

## 📚 Documentación Importante

<<<<<<< HEAD
### 📖 Guías Principales
- **[Documentación Técnica](./docs/)** - Arquitectura, APIs, base de datos y deployment
- **[Deployment con Docker](./docs/deployment/)** - Guías completas de despliegue
- **[APIs y Endpoints](./docs/api/)** - Documentación de servicios y contratos

### 🧪 Testing y Desarrollo
- **[API Testing Guide](./API-TESTING.md)** - Guía de testing de APIs
- **[OpenAPI Specification](./openapilog.yaml)** - Especificaciones OpenAPI
- **[Project Context](./memory/project-context.md)** - Contexto del proyecto
- **[Constitution](./memory/constitution.md)** - Constitución del proyecto

### 🔧 Troubleshooting Rápido

#### Si los servicios no inician:
```bash
# Verificar estado de Docker
docker --version && docker-compose --version

# Verificar que no haya conflictos de puertos
lsof -i :3000,3001,3002,3003,3004,5432,6379,8080

# Limpiar y reconstruir
docker-compose down
docker-compose up -d --build
```

#### Error de Google Fonts en build del Frontend:
Si ves errores como "Failed to fetch Geist from Google Fonts" durante el build:
- **Solución temporal**: El build necesita conexión a internet para descargar fuentes
- **Solución permanente**: Cambiar a fuentes locales en `frontend/src/app/layout.tsx`
- **Workaround**: Construir la imagen con `--network=host` o configurar proxy en Docker

#### Si hay errores de base de datos:
```bash
# Resetear base de datos
cd backendd
pnpm prisma:migrate:reset

# Verificar conexión
docker run --rm -it --network host postgres:16-alpine psql \
  -h localhost -U postgres -d logistics_db
```

#### Para desarrollo local sin Docker:
```bash
# Asegurarse de que PostgreSQL y Redis estén corriendo
docker ps | grep -E "(postgres|redis)"

# Verificar variables de entorno
cd backend/services/operator-interface-service
cat .env  # Verificar URLs de servicios
```
=======
### Para Empezar
- **[CLAUDE.md](./CLAUDE.md)** - Documentación completa para desarrollo (Recomendado leer primero!)
- **[API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md)** - Todas las rutas disponibles del gateway inteligente
- **[README.md](./README.md)** - Este archivo

### Documentación Específica por Módulo
- `frontend/CLAUDE.md` - Guía específica del frontend
- `frontend/MIGRATION-SUMMARY.md` - Migración de SvelteKit a Next.js
- `backend/shared/database/prisma/schema.prisma` - Schema de base de datos
>>>>>>> origin/main

## 👥 Equipo

**Grupo 12 - Desarrollo de Software 2025 - UTN FRRE**

## 📄 Licencia

Apache-2.0

## 🔗 Enlaces

- **Repositorio**: https://github.com/FRRe-DS/2025-12-TPI
- **Documentación**: [Ver docs/](./docs/)
- **Issues**: https://github.com/FRRe-DS/2025-12-TPI/issues

---

**Última actualización del README**: $(date +%d) de $(date +%B) de 2025