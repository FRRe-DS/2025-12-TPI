# 🏗️ Arquitectura del Sistema

Visión general de la arquitectura del sistema de logística TPI 2025.

**Última actualización:** Diciembre 2025

---

## 📐 Principios de Diseño

El sistema está diseñado siguiendo estos principios arquitectónicos:

1. **Microservicios**: Servicios independientes con responsabilidades específicas
2. **API Gateway Pattern**: Punto único de entrada para el frontend
3. **Facade Pattern**: Abstracción de la complejidad de los microservicios
4. **Service Discovery**: Registro dinámico y health checking de servicios
5. **Monorepo**: Código compartido entre servicios mediante pnpm workspaces
6. **Domain-Driven Design**: Separación clara de dominios de negocio

---

## 🗂️ Estructura del Monorepo

```
2025-12-TPI-1/
├── backend/
│   ├── services/                    # Microservicios
│   │   ├── config-service/          # Puerto 3003
│   │   ├── shipping-service/        # Puerto 3001
│   │   ├── stock-integration-service/ # Puerto 3002
│   │   └── operator-interface-service/ # Puerto 3004 (Gateway)
│   └── shared/                      # Bibliotecas compartidas (pnpm workspaces)
│       ├── database/                # @logistics/database
│       ├── types/                   # @logistics/types
│       └── utils/                   # @logistics/utils
├── frontend/                        # Next.js App (Puerto 3005)
├── tracking-portal-next/            # Portal público de tracking
├── docs/                            # Documentación centralizada
└── docker-compose.yml               # Orquestación de servicios
```

---

## 🔧 Microservicios Backend

### 1. Config Service (Puerto 3003)

**Responsabilidad:** Configuración del sistema y gestión de la flota

**Dominios:**
- **Transport Methods**: Métodos de transporte disponibles
- **Coverage Zones**: Zonas de cobertura y tarifas
- **Vehicles**: Gestión de vehículos
- **Drivers**: Gestión de conductores
- **Routes**: Planificación de rutas

**Stack:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Swagger/OpenAPI

**Endpoints:** `/config/*`

---

### 2. Shipping Service (Puerto 3001)

**Responsabilidad:** Gestión completa del ciclo de vida de envíos

**Dominios:**
- **Quotation**: Cotización de envíos
- **Shipments**: Creación y gestión de envíos
- **Tracking**: Seguimiento público de envíos
- **Route Planning**: Optimización de rutas

**Stack:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caché de cotizaciones)
- Algoritmos de ruteo (geolib)

**Endpoints:** `/shipping/*`

---

### 3. Stock Integration Service (Puerto 3002)

**Responsabilidad:** Integración con API externa de Stock

**Características:**
- **HTTP Client resiliente** (circuit breaker, retry)
- **Caché con Redis** para reducir latencia
- **Validación** de productos y disponibilidad
- **Gestión de retiros** en depósitos

**Stack:**
- NestJS + TypeScript
- Redis (caché)
- Axios con interceptors

**Endpoints:** `/stock/*`

---

### 4. Operator Interface Service (Puerto 3004) - **API Gateway**

**Responsabilidad:** Gateway inteligente que orquesta llamadas a microservicios

**Características:**
- **Service Registry**: Registro dinámico de servicios
- **Service Facade**: Patrón Facade para simplicidad del frontend
- **Smart Proxy**: Ruteo automático basado en paths
- **Health Aggregation**: Health checks centralizados
- **Request ID Tracking**: Trazabilidad de requests

**Stack:**
- NestJS + TypeScript
- Proxy inteligente con reintentos
- Service discovery interno

**Endpoint Base:** `http://localhost:3004`

📖 **Documentación detallada:** [backend/02-API-GATEWAY.md](../backend/02-API-GATEWAY.md)

---

## 🎨 Frontend

### Frontend Principal (Puerto 3005)

**Responsabilidad:** Interfaz de operador para gestión del sistema

**Tecnologías:**
- Next.js 16 + React 19
- Tailwind CSS
- Keycloak (autenticación)
- Custom Store + Composables (state management)

**Características:**
- SPA con server-side rendering
- Autenticación con Keycloak
- Comunicación únicamente con API Gateway (puerto 3004)
- No conoce la topología de microservicios

---

### Tracking Portal (Puerto separado)

**Responsabilidad:** Portal público para tracking de envíos

**Tecnologías:**
- Next.js
- Acceso público (sin auth)

---

## 📚 Shared Libraries (pnpm workspaces)

### @logistics/database
- **Prisma Client** configurado
- **Schema** centralizado
- **Migraciones** compartidas
- Usado por: Config, Shipping

### @logistics/types
- **DTOs** para validación
- **Interfaces** compartidas
- **Enums** del dominio
- Usado por: Todos los servicios

### @logistics/utils
- Utilidades comunes
- Helpers de formato
- Constantes compartidas
- Usado por: Todos los servicios

---

## 🔄 Flujo de Comunicación

```
┌─────────────────┐
│   Frontend      │ Puerto 3005
│  (Next.js 16)   │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  API Gateway    │ Puerto 3004
│ (Operator Svc)  │
└────────┬────────┘
         │
    ┌────┼─────┬──────┐
    │    │     │      │
    ↓    ↓     ↓      ↓
┌─────┐ ┌───┐ ┌────┐ ┌────────┐
│Config│ │Ship│ │Stock│ │Database│
│ 3003 │ │3001│ │3002│ │  5432  │
└─────┘ └───┘ └────┘ └────────┘
```

**Principio clave:** El frontend **solo conoce el Gateway** (puerto 3004).
No tiene conocimiento de Config, Shipping o Stock services.

---

## 🛡️ Patrones Arquitectónicos Aplicados

### 1. API Gateway Pattern
- **Problema**: Frontend necesita llamar a múltiples servicios
- **Solución**: Gateway único que rutea automáticamente
- **Beneficio**: Frontend desacoplado de topología backend

### 2. Facade Pattern
- **Problema**: Complejidad de orquestar llamadas a microservicios
- **Solución**: ServiceFacade con lógica de reintentos y fallbacks
- **Beneficio**: Resiliencia y simplicidad

### 3. Service Discovery
- **Problema**: Servicios deben conocer URLs de otros servicios
- **Solución**: Service Registry con health checking
- **Beneficio**: Configuración dinámica, detección de fallos

### 4. Circuit Breaker
- **Uso**: Stock Integration Service
- **Beneficio**: Evita cascadas de fallos en servicios externos

### 5. Repository Pattern
- **Uso**: Todos los servicios con Prisma
- **Beneficio**: Separación de lógica de negocio y acceso a datos

---

## 🗄️ Base de Datos

### PostgreSQL (Puerto 5432)

**Estrategia:** Base de datos compartida con schemas lógicos separados

**Ownership:**
- **Config Service**: TransportMethod, CoverageZone, TariffConfig, Vehicle, Driver
- **Shipping Service**: Shipment, Route, RouteStop, ShipmentHistory

**ORM:** Prisma

📖 **Documentación:** [database/README.md](../database/README.md)

---

## 🚀 Deployment

### Desarrollo (Local)

```bash
# Levantar todos los servicios
pnpm dev

# O con Docker
docker-compose up
```

### Producción

**Opciones:**
- Docker Compose (simple)
- Kubernetes (escalable)
- Dokploy (recomendado para este proyecto)

📖 **Documentación:** [deployment/DEPLOYMENT.md](../deployment/DEPLOYMENT.md)

---

## 🔐 Seguridad

### Autenticación
- **Keycloak** para frontend
- **JWT tokens** para servicios internos
- **API Keys** para integraciones externas

### Network Security
- Servicios backend **no expuestos** públicamente
- Solo Gateway expuesto (puerto 3004)
- HTTPS en producción (Let's Encrypt)

### Data Security
- **Validación** en todos los endpoints (class-validator)
- **Sanitización** de inputs
- **Rate limiting** para prevenir abuse

---

## 📊 Monitoring & Observability

### Health Checks
- Cada servicio expone `/health`
- Gateway agrega health de todos los servicios
- `GET /gateway/status` para estado general

### Logging
- Logs estructurados (JSON)
- Request ID tracking para trazabilidad
- Niveles: error, warn, info, debug

### Metrics (Futuro)
- Prometheus para métricas
- Grafana para dashboards
- Alerting en fallos críticos

---

## 🔄 CI/CD

### GitHub Actions

**Workflows:**
- **Build**: Compilación de TypeScript
- **Test**: Tests unitarios y e2e
- **Lint**: ESLint + Prettier
- **Deploy**: Deployment automático a producción

---

## 📈 Escalabilidad

### Horizontal Scaling

Servicios diseñados para escalar horizontalmente:

- **Stateless**: No mantienen estado en memoria
- **Load Balancer**: Nginx/Traefik para distribuir carga
- **Database Pool**: Connection pooling con Prisma
- **Cache**: Redis para reducir carga en DB

### Vertical Scaling

- Recursos ajustables por servicio en Docker
- CPU/Memory limits configurables
- Auto-scaling en Kubernetes (futuro)

---

## 🔗 Enlaces

- **[Backend Microservices](../backend/01-MICROSERVICES.md)** - Detalles de cada servicio
- **[API Gateway](../backend/02-API-GATEWAY.md)** - Funcionamiento del Gateway
- **[Database](../database/README.md)** - Schema y migraciones
- **[Deployment](../deployment/DEPLOYMENT.md)** - Guías de deployment

---

**Última actualización:** Diciembre 3, 2025
