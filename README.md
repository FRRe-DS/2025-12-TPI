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
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Autenticación**: Keycloak
- **Cache**: Redis (Soporte en servicios clave)
- **Microservicios**: Patrón Facade + Service Discovery
- **DevOps**: Docker + Docker Compose + GitHub Actions

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
│   ├── src/app/                       # App Router (páginas)
│   ├── src/lib/                       # Lógica de negocio y servicios
│   ├── public/                        # Assets estáticos
│   └── Dockerfile
│
├── docs/                              # Documentación técnica
├── docker-compose.yml                 # Orquestación de servicios
└── README.md                          # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Git

### Configuración Rápida con Docker Compose

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/FRRe-DS/2025-12-TPI.git
   cd 2025-12-TPI
   ```

2. **Configurar Variables de Entorno (.env):**
   Crea un archivo `.env` en la raíz del proyecto. Este archivo será usado por Docker Compose para configurar todos los servicios.

   ```bash
   # .env example
   
   # Supabase / PostgreSQL
   DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   
   # Keycloak
   KEYCLOAK_URL=https://keycloak.mmalgor.com.ar
   KEYCLOAK_REALM=ds-2025-realm
   KEYCLOAK_CLIENT_ID=grupo-12
   
   # APIs Externas
   STOCK_API_URL=https://comprasg5.mmalgor.com.ar/v1
   STOCK_API_BEARER_TOKEN=tu_token_aqui
   ```

3. **Levantar Servicios:**
   ```bash
   docker-compose up -d --build
   ```

4. **Verificar Estado:**
   ```bash
   docker-compose ps
   ```

### 🌐 Servicios Disponibles

| Servicio | Puerto | URL Interna | Descripción |
|----------|--------|-------------|-------------|
| **Frontend** | 3000 | http://frontend:3000 | Interfaz de usuario (Next.js) |
| **API Gateway** | 3004 | http://operator-interface-service:3004 | Punto de entrada único |
| **Config Service** | 3003 | http://config-service:3003 | Configuración y flota |
| **Shipping Service** | 3001 | http://shipping-service:3001 | Envíos y cotizaciones |
| **Stock Service** | 3002 | http://stock-integration-service:3002 | Integración con Stock |
| **Redis** | 6379 | redis:6379 | Cache |

## � APIs y Endpoints Principales

El **Operator Interface Service (Gateway)** en el puerto `3004` es el único punto de entrada para el frontend.

- **Envíos**:
  - `GET /shipping` - Listar envíos (Soporta paginación: `?page=1&limit=20`)
  - `POST /shipping` - Crear nuevo envío
  - `GET /shipping/:id` - Detalle de envío

- **Configuración**:
  - `GET /config/transport-methods` - Métodos de transporte disponibles
  - `GET /config/coverage-zones` - Zonas de cobertura

- **Stock**:
  - `GET /stock/productos` - Listar productos disponibles

## 🌿 Estrategia de Branches

- `main` → Producción (Código estable)
- `dev` → Desarrollo (Integración continua)
- `feature/*` → Nuevas funcionalidades
- `fix/*` → Corrección de errores

## 👥 Equipo

**Grupo 12 - Desarrollo de Software 2025 - UTN FRRE**

## 📄 Licencia

Apache-2.0