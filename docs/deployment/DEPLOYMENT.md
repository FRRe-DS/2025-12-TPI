# 🚀 Guías de Despliegue

## Entornos

### Desarrollo Local
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3004
- **Base de datos**: Supabase (PostgreSQL)
- **Cache**: Redis (Local via Docker)
- **Auth**: Keycloak (Local via Docker)

### Producción / Staging
- **Frontend**: https://logistica.mmalgor.com.ar
- **API Gateway**: https://api.logistica.mmalgor.com.ar (o similar)
- **Base de datos**: Supabase (Cloud)
- **Cache**: Redis (Cloud o Contenedor)
- **Auth**: Keycloak (https://keycloak.mmalgor.com.ar)

## Despliegue Local con Docker Compose (Recomendado)

Esta es la forma más sencilla de levantar todo el ecosistema de microservicios.

### Prerrequisitos
- Docker & Docker Compose
- Git

### 1. Clonar Repositorio
```bash
git clone https://github.com/FRRe-DS/2025-12-TPI.git
cd 2025-12-TPI
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto. Este archivo alimenta a todos los servicios en Docker Compose.

```bash
# .env
# Supabase / PostgreSQL
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Keycloak
KEYCLOAK_URL=https://keycloak.mmalgor.com.ar
KEYCLOAK_REALM=ds-2025-realm
KEYCLOAK_CLIENT_ID=grupo-12

# APIs Externas (Stock)
STOCK_API_URL=https://comprasg5.mmalgor.com.ar/v1
STOCK_API_BEARER_TOKEN=tu_token_aqui
```

### 3. Levantar Servicios
```bash
# Levantar todo (Frontend + Backend + DBs)
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### 4. Verificar Despliegue
- **Frontend**: http://localhost:3000
- **Operator Interface (Gateway)**: http://localhost:3004/health
- **Shipping Service**: http://localhost:3001/health
- **Stock Service**: http://localhost:3002/health
- **Config Service**: http://localhost:3003/health

## Despliegue Manual (Sin Docker Compose)

Si prefieres correr los servicios individualmente (útil para desarrollo de un solo módulo).

### 1. Backend
Cada microservicio está en `backend/services/`.

```bash
cd backend/services/shipping-service
pnpm install
# Configurar .env local
pnpm start:dev
```

### 2. Frontend
```bash
cd frontend
pnpm install
# Configurar .env.local
pnpm dev
```

## CI/CD Pipeline

El proyecto utiliza GitHub Actions para integración continua.

### Workflows
- **Build & Test**: Se ejecuta en cada Push/PR a `dev` y `main`.
- **Deploy**: (Configuración pendiente según proveedor de hosting).

## Monitoreo y Mantenimiento

### Logs
```bash
# Ver logs de un servicio específico
docker-compose logs -f shipping-service
docker-compose logs -f operator-interface-service
```

### Reiniciar un servicio
Si haces cambios en el código de un servicio:
```bash
docker-compose build shipping-service
docker-compose up -d shipping-service
```

### Base de Datos (Prisma)
Si necesitas aplicar migraciones manualmente:
```bash
cd backend
pnpm prisma:migrate
```

---

**Última actualización**: 4 de Diciembre de 2025