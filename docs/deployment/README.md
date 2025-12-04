# 🚀 Deployment - Guía de Despliegue

Guía completa para desplegar el sistema de logística en diferentes entornos.

**Última actualización:** Diciembre 2025

---

## 📋 Arquitectura de Despliegue

### Servicios Backend (Microservicios)
- **Config Service** (puerto 3003): Gestión de configuraciones, métodos de transporte, zonas de cobertura, vehículos y conductores
- **Shipping Service** (puerto 3001): Cotización, creación y gestión de envíos, planificación de rutas
- **Stock Integration Service** (puerto 3002): Integración con API externa de stock
- **Operator Interface Service** (puerto 3004): **API Gateway** - punto único de entrada

### Servicios de Infraestructura
- **PostgreSQL** (puerto 5432): Base de datos principal compartida
- **Redis** (puerto 6379): Caché para cotizaciones y stock
- **Keycloak** (puerto 8080): Autenticación y autorización

### Frontend
- **Next.js App** (puerto 3005): Interfaz de operador

---

## 🐳 Despliegue Local con Docker (Recomendado)

### Prerrequisitos
- Docker >= 20.x
- Docker Compose >= 2.x
- Git
- Al menos 4GB RAM disponible

### 1. Clonar el Repositorio

```bash
git clone https://github.com/FRRe-DS/2025-12-TPI-1.git
cd 2025-12-TPI-1
```

### 2. Configurar Variables de Entorno

#### Archivo .env en la raíz del proyecto

```bash
# Base de datos PostgreSQL (local)
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/logistics_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres123@postgres:5432/logistics_db?schema=public"

# Redis
REDIS_URL="redis://redis:6379"

# Keycloak
KEYCLOAK_ADMIN_PASSWORD="ds2025"

# APIs externas (opcional)
DISTANCE_API_KEY="your-api-key"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3004"
```

**Nota:**
- En Docker Compose, las variables se inyectan desde `docker-compose.yml`
- Los servicios se comunican usando nombres de servicio como hostnames (ej: `postgres`, `redis`)
- No commitear archivos `.env` con credenciales reales

### 3. Iniciar Todos los Servicios

```bash
# Levantar todos los servicios (construye imágenes si no existen)
docker-compose up -d --build

# Ver logs de todos los servicios
docker-compose logs -f

# Ver estado de los contenedores
docker-compose ps
```

### 4. Ejecutar Migraciones de Base de Datos

```bash
# Opción 1: Desde la raíz del proyecto (requiere pnpm instalado)
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate

# Opción 2: Dentro del contenedor de un servicio
docker-compose exec config-service sh -c "cd /app/backend/shared/database && pnpm prisma migrate deploy"

# (Opcional) Cargar datos de ejemplo
docker-compose exec config-service sh -c "cd /app/backend/shared/database && pnpm prisma db seed"
```

### 5. Verificar Despliegue

```bash
# Verificar health de todos los servicios
curl http://localhost:3003/health  # Config Service
curl http://localhost:3001/health  # Shipping Service
curl http://localhost:3002/health  # Stock Service
curl http://localhost:3004/health  # API Gateway
curl http://localhost:3005          # Frontend

# Verificar estado agregado desde el Gateway
curl http://localhost:3004/gateway/status
```

### 6. Acceder a las Aplicaciones

- **Frontend**: http://localhost:3005
- **API Gateway** (único que frontend conoce): http://localhost:3004
- **Keycloak Admin**: http://localhost:8080 (admin/ds2025)
- **Swagger Docs**:
  - API Gateway: http://localhost:3004/api
  - Config Service: http://localhost:3003/api
  - Shipping Service: http://localhost:3001/api
  - Stock Service: http://localhost:3002/api

### 7. Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (borra datos de BD)
docker-compose down -v
```

---

## 🔧 Despliegue Manual (Desarrollo Local sin Docker)

### Prerrequisitos
- Node.js >= 20.x
- pnpm >= 8.x
- PostgreSQL >= 15
- Redis >= 7.x
- Git

### 1. Configurar Infraestructura

```bash
# Opción 1: Instalar PostgreSQL localmente
# (Depende del sistema operativo)

# Opción 2: PostgreSQL con Docker
docker run -d --name postgres-local -p 5432:5432 \
  -e POSTGRES_DB=logistics_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  postgres:16-alpine

# Redis con Docker
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```

### 2. Configurar Base de Datos

```bash
# Desde la raíz del proyecto
cd backend/shared/database

# Instalar dependencias
pnpm install

# Ejecutar migraciones
pnpm prisma migrate dev

# Generar cliente Prisma
pnpm prisma generate

# (Opcional) Cargar datos de ejemplo
pnpm prisma db seed
```

### 3. Configurar y Levantar Servicios Backend

#### Terminal 1: Config Service
```bash
cd backend/services/config-service
cp env.example .env
# Editar .env con credenciales locales
pnpm install
pnpm run start:dev
```

#### Terminal 2: Shipping Service
```bash
cd backend/services/shipping-service
cp env.example .env
pnpm install
pnpm run start:dev
```

#### Terminal 3: Stock Integration Service
```bash
cd backend/services/stock-integration-service
cp env.example .env
pnpm install
pnpm run start:dev
```

#### Terminal 4: Operator Interface Service (Gateway)
```bash
cd backend/services/operator-interface-service
cp env.example .env
pnpm install
pnpm run start:dev
```

### 4. Configurar y Levantar Frontend

```bash
# Terminal 5
cd frontend
cp .env.example .env.local
# Configurar NEXT_PUBLIC_API_URL=http://localhost:3004
pnpm install
pnpm dev
```

### 5. Configurar Keycloak (Opcional)

```bash
# Usar Docker para Keycloak
docker run -d -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=ds2025 \
  quay.io/keycloak/keycloak:latest start-dev
```

---

## 🏗️ Build de Imágenes Docker

### Build Individual de Servicios

Todos los builds se ejecutan desde la **raíz del monorepo**:

```bash
# Config Service
docker build \
  -f backend/services/config-service/Dockerfile \
  -t logistics-config-service:latest \
  .

# Shipping Service
docker build \
  -f backend/services/shipping-service/Dockerfile \
  -t logistics-shipping-service:latest \
  .

# Stock Integration Service
docker build \
  -f backend/services/stock-integration-service/Dockerfile \
  -t logistics-stock-service:latest \
  .

# Operator Interface Service (Gateway)
docker build \
  -f backend/services/operator-interface-service/Dockerfile \
  -t logistics-operator-service:latest \
  .

# Frontend
docker build \
  -f frontend/Dockerfile \
  -t logistics-frontend:latest \
  frontend/
```

### Build con Docker Compose

```bash
# Construir todas las imágenes
docker-compose build

# Construir sin caché (útil para troubleshooting)
docker-compose build --no-cache

# Construir un servicio específico
docker-compose build config-service
```

---

## 🚀 Despliegue en Producción

### Variables de Entorno para Producción

```bash
# Base de datos (usar PostgreSQL gestionado como AWS RDS, Google Cloud SQL, etc.)
DATABASE_URL="postgresql://user:password@production-host:5432/logistics_db?schema=public&connection_limit=10"
DIRECT_URL="postgresql://user:password@production-host:5432/logistics_db?schema=public"

# Redis (usar Redis Cloud, AWS ElastiCache, etc.)
REDIS_URL="redis://:password@production-redis-host:6379"

# Frontend URL (para CORS)
FRONTEND_URL="https://logistics.example.com"

# APIs externas
DISTANCE_API_KEY="production-api-key"

# Seguridad
JWT_SECRET="generate-random-secret-512-bits"
KEYCLOAK_ADMIN_PASSWORD="strong-production-password"

# Node environment
NODE_ENV="production"
```

### Estrategias de Despliegue

#### Opción 1: Docker Compose en VPS

```bash
# 1. Conectar al servidor
ssh user@production-server

# 2. Clonar repositorio
git clone https://github.com/FRRe-DS/2025-12-TPI-1.git
cd 2025-12-TPI-1

# 3. Configurar variables de entorno
nano .env

# 4. Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# 5. Ejecutar migraciones
docker-compose exec config-service sh -c "cd /app/backend/shared/database && pnpm prisma migrate deploy"
```

#### Opción 2: Kubernetes (Escalable)

```yaml
# Ejemplo de Deployment para Config Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: config-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: config-service
  template:
    metadata:
      labels:
        app: config-service
    spec:
      containers:
      - name: config-service
        image: logistics-config-service:v1.0.0
        ports:
        - containerPort: 3003
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
```

#### Opción 3: Dokploy / Coolify (Recomendado para este proyecto)

- **Dokploy** o **Coolify** son plataformas self-hosted similares a Vercel/Heroku
- Deployment automático desde Git
- Configuración de variables de entorno vía UI
- Soporte para monorepos

```bash
# Configurar cada servicio en Dokploy:
# 1. Config Service: backend/services/config-service
# 2. Shipping Service: backend/services/shipping-service
# 3. Stock Service: backend/services/stock-integration-service
# 4. Gateway: backend/services/operator-interface-service
# 5. Frontend: frontend/
```

---

## 📊 Monitoreo y Observabilidad

### Health Checks

```bash
# Verificar todos los servicios
curl http://localhost:3003/health  # Config Service
curl http://localhost:3001/health  # Shipping Service
curl http://localhost:3002/health  # Stock Service
curl http://localhost:3004/health  # API Gateway
curl http://localhost:3005          # Frontend

# Health check agregado desde Gateway
curl http://localhost:3004/gateway/status
```

**Respuesta esperada del Gateway:**
```json
{
  "status": "ok",
  "services": {
    "config": "healthy",
    "shipping": "healthy",
    "stock": "healthy"
  }
}
```

### Logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f config-service
docker-compose logs -f shipping-service
docker-compose logs -f operator-interface-service

# Logs con timestamps
docker-compose logs -f --timestamps

# Ver solo errores
docker-compose logs -f | grep -i error
```

### Métricas (Implementación Futura)

```bash
# Endpoints de métricas (si están habilitados)
curl http://localhost:3003/metrics  # Config Service
curl http://localhost:3001/metrics  # Shipping Service
curl http://localhost:3004/metrics  # Gateway
```

**Métricas recomendadas para monitorear:**
- **Config Service**: Latencia de consultas a BD, cache hits/misses
- **Shipping Service**: Tiempo de cálculo de rutas, llamadas a API de distancia
- **Stock Service**: Latencia de API externa, cache hits
- **Gateway**: Throughput, errores de proxy, latencia de requests

---

## 🔄 CI/CD

### GitHub Actions

**Archivo:** `.github/workflows/test.yml`

```yaml
name: Test & Build

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [config-service, shipping-service, stock-integration-service, operator-interface-service]

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: logistics_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: |
          cd backend/shared/database
          pnpm prisma migrate deploy

      - name: Build service
        run: |
          cd backend/services/${{ matrix.service }}
          pnpm run build

      - name: Run tests
        run: |
          cd backend/services/${{ matrix.service }}
          pnpm run test:e2e

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: |
          cd frontend
          pnpm install

      - name: Build frontend
        run: |
          cd frontend
          pnpm run build
```

---

## 🔧 Troubleshooting

### Servicios No Inician

#### PostgreSQL Connection Issues

```bash
# Verificar estado del contenedor
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Verificar conectividad
docker-compose exec postgres pg_isready -U postgres -d logistics_db

# Conectar a la BD para debug
docker-compose exec postgres psql -U postgres -d logistics_db
```

#### Redis Connection Issues

```bash
# Verificar conectividad
docker-compose exec redis redis-cli ping

# Verificar logs
docker-compose logs redis

# Limpiar caché
docker-compose exec redis redis-cli FLUSHALL
```

#### Servicio No Puede Conectar a Dependencias

```bash
# Verificar variables de entorno
docker-compose exec config-service env | grep -E "(DATABASE|REDIS)"

# Verificar conectividad entre servicios
docker-compose exec config-service nc -zv postgres 5432
docker-compose exec shipping-service nc -zv redis 6379
docker-compose exec frontend nc -zv operator-interface-service 3004
```

### Problemas de Base de Datos

#### Migraciones Fallidas

```bash
# Verificar estado de migraciones
cd backend/shared/database
pnpm prisma migrate status

# Aplicar migraciones manualmente
pnpm prisma migrate deploy

# Reset completo (⚠️ BORRA TODOS LOS DATOS)
pnpm prisma migrate reset --force
```

#### "Table does not exist" Errors

```bash
# Regenerar cliente Prisma
cd backend/shared/database
pnpm prisma generate

# Aplicar migraciones
pnpm prisma migrate deploy

# Si persiste, verificar schema
pnpm prisma db pull
```

### Problemas de Gateway

#### Gateway no rutea correctamente

```bash
# Verificar registro de servicios
curl http://localhost:3004/gateway/status

# Verificar logs del Gateway
docker-compose logs -f operator-interface-service

# Verificar que servicios estén accesibles
curl http://localhost:3003/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

#### CORS Errors

```bash
# Verificar configuración de CORS en Gateway
docker-compose exec operator-interface-service env | grep FRONTEND_URL

# Verificar headers CORS
curl -H "Origin: http://localhost:3005" \
     -H "Access-Control-Request-Method: GET" \
     -v http://localhost:3004/config/transport-methods
```

### Problemas de Frontend

#### Build Issues - Google Fonts

```bash
# El build necesita internet para descargar fuentes
# Construir con network host:
docker build --network=host -f frontend/Dockerfile -t logistics-frontend:latest frontend/
```

#### API Connection Issues

```bash
# Verificar configuración
docker-compose exec frontend env | grep NEXT_PUBLIC

# Verificar conectividad con Gateway
docker-compose exec frontend curl http://operator-interface-service:3004/health

# Verificar desde host
curl http://localhost:3004/health
```

#### Frontend muestra página en blanco

```bash
# Verificar logs de Next.js
docker-compose logs -f frontend

# Verificar build
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Verificar que el Gateway esté accesible
curl http://localhost:3004/gateway/status
```

### Comandos Útiles para Debug

```bash
# Ver estado completo del sistema
docker-compose ps -a

# Ver uso de recursos
docker stats

# Ver redes Docker
docker network ls
docker network inspect 2025-12-tpi-1_default

# Entrar a un contenedor para debug
docker-compose exec config-service sh

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres logistics_db > backup-$(date +%Y%m%d).sql

# Restore de base de datos
docker-compose exec -T postgres psql -U postgres logistics_db < backup-20251203.sql

# Limpiar Docker
docker system prune -f
docker volume prune -f
```

### Logs Estructurados

```bash
# Ver solo requests HTTP
docker-compose logs -f | grep "HTTP"

# Ver errores de base de datos
docker-compose logs -f | grep -i "prisma\|postgres"

# Ver errores de Redis
docker-compose logs -f | grep -i "redis"

# Exportar logs a archivo
docker-compose logs > logs-$(date +%Y%m%d-%H%M%S).txt
```

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar contraseñas por defecto (PostgreSQL, Keycloak, etc.)
- [ ] Usar HTTPS con certificados SSL (Let's Encrypt)
- [ ] Configurar firewall para exponer solo puertos necesarios
- [ ] Habilitar rate limiting en Gateway
- [ ] Rotar credenciales regularmente
- [ ] Habilitar logs de auditoría
- [ ] Implementar backup automático de BD
- [ ] Configurar monitoreo y alertas
- [ ] Revisar dependencias con `pnpm audit`
- [ ] Configurar secrets management (no usar `.env` en producción)

### Configuración de Firewall

```bash
# Solo exponer puertos públicos
ufw allow 80/tcp    # HTTP (redirige a HTTPS)
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH (solo desde IPs confiables)
ufw deny 5432/tcp   # PostgreSQL (no exponer)
ufw deny 6379/tcp   # Redis (no exponer)
ufw deny 3003/tcp   # Config Service (no exponer)
ufw deny 3001/tcp   # Shipping Service (no exponer)
ufw deny 3002/tcp   # Stock Service (no exponer)
ufw enable
```

---

## 🔗 Enlaces

- **[Arquitectura del Sistema](../architecture/README.md)** - Diseño y patrones
- **[API Gateway](../backend/02-API-GATEWAY.md)** - Funcionamiento del Gateway
- **[Base de Datos](../database/README.md)** - Schema y migraciones
- **[API Reference](../api/README.md)** - Documentación de endpoints

---

**Última actualización:** Diciembre 3, 2025
