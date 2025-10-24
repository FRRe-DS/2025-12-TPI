# 📚 Documentación del Proyecto - Logística TPI 2025

Documentación completa y organizada del sistema de logística.

---

## 🗂️ Estructura de Documentación

```
docs/
├── README.md                     # Este archivo (índice)
├── SYSTEM-ARCHITECTURE.md        # Arquitectura general del sistema
│
├── backend/                      # Documentación Backend
│   ├── 01-MICROSERVICES.md      # Microservicios (Config, Shipping, Stock, Gateway)
│   ├── 02-API-GATEWAY.md        # Facade Pattern + Service Discovery
│   ├── 03-DATABASE.md           # Schema Prisma y migraciones
│   └── 04-API-REFERENCE.md      # Endpoints y ejemplos
│
├── frontend/                     # Documentación Frontend
│   └── 01-FRONTEND-ARCHITECTURE.md  # Componentes, stores, hooks
│
└── deployment/                   # DevOps y despliegue
    └── DEPLOYMENT.md            # Guías de deployment
```

---

## 🚀 Inicio Rápido

### 1. Leer Primero

Si es tu primera vez, lee esto en orden:

1. **[SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)** (5 min)
   - Visión general del sistema
   - Componentes principales

2. **[../CLAUDE.md](../CLAUDE.md)** (15 min)
   - Guía completa de desarrollo
   - Comandos útiles
   - Troubleshooting

3. **[../README.md](../README.md)** (5 min)
   - Setup inicial
   - Quick start

### 2. Para Desarrollo Backend

1. **[backend/01-MICROSERVICES.md](./backend/01-MICROSERVICES.md)**
   - Entender los 4 microservicios
   - Endpoints disponibles
   - Modelos de datos

2. **[backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md)**
   - Cómo funciona el proxy inteligente
   - Facade Pattern
   - Service Discovery
   - Health checks

3. **[backend/03-DATABASE.md](./backend/03-DATABASE.md)**
   - Schema Prisma
   - Migraciones
   - Datos iniciales

4. **[backend/04-API-REFERENCE.md](./backend/04-API-REFERENCE.md)**
   - Todos los endpoints
   - Ejemplos cURL
   - Códigos de respuesta

### 3. Para Desarrollo Frontend

1. **[frontend/01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md)**
   - Estructura del frontend
   - Componentes React
   - Pattern de stores + composables
   - Keycloak integration

2. **[../API-GATEWAY-ROUTES.md](../API-GATEWAY-ROUTES.md)**
   - Rutas disponibles del gateway
   - Ejemplos de uso

### 4. Para DevOps / Deployment

1. **[deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)**
   - Setup local
   - Docker
   - Producción
   - CI/CD

---

## 📖 Documentación Por Tema

### Backend - Microservicios

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [01-MICROSERVICES.md](./backend/01-MICROSERVICES.md) | Estructura de los 4 microservicios | Backend devs |
| [02-API-GATEWAY.md](./backend/02-API-GATEWAY.md) | Gateway inteligente con Facade | Backend devs, Arquitectos |
| [03-DATABASE.md](./backend/03-DATABASE.md) | Schema Prisma y datos | Backend devs, DBAs |
| [04-API-REFERENCE.md](./backend/04-API-REFERENCE.md) | Todos los endpoints | Backend devs, Frontend devs |

### Frontend - React + Next.js

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md) | Componentes, stores, hooks | Frontend devs |

### Infraestructura - DevOps

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md) | Setup, Docker, deployment | DevOps, Backend |

### Arquitectura General

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md) | Visión global del sistema | Todos |
| [../CLAUDE.md](../CLAUDE.md) | Guía completa desarrollo | Todos |
| [../API-GATEWAY-ROUTES.md](../API-GATEWAY-ROUTES.md) | Rutas del gateway | Frontend devs |

---

## 🔍 Buscar Por Tarea

### Quiero agregar un nuevo endpoint

1. Lee [backend/01-MICROSERVICES.md](./backend/01-MICROSERVICES.md) - Sección "Desarrollo de Microservicios"
2. Implementa en el controller + service
3. Testa con `curl` usando ejemplos en [backend/04-API-REFERENCE.md](./backend/04-API-REFERENCE.md)

### Quiero crear un nuevo componente React

1. Lee [frontend/01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md)
2. Usa patrón Service + Store + Composable
3. Implementa validación con Zod

### Quiero entender el Gateway

1. Lee [backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md)
2. Ver health checks: `curl http://localhost:3004/gateway/status`
3. Ver logs en terminal mientras corre

### Quiero deployar a producción

1. Lee [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)
2. Configurar variables de entorno
3. Usar Docker compose o plataforma preferida

### Necesito agregar tabla a BD

1. Lee [backend/03-DATABASE.md](./backend/03-DATABASE.md)
2. Edita `backend/shared/database/prisma/schema.prisma`
3. Corre `npx prisma migrate dev --name descriptivo_nombre`

---

## 📚 Documentación Adicional en Raíz

```
/
├── CLAUDE.md                    # Documentación completa para Claude Code
├── API-GATEWAY-ROUTES.md        # Rutas del gateway (detallado)
├── ARCHITECTURE-UPDATE-2025.md  # Cambios recientes (Facade Pattern)
├── README.md                    # Quick start del proyecto
└── FIXES-SUMMARY.md             # Resumen de fixes aplicados
```

---

## 🎯 Por Rol

### Developer Backend

**Leer:**
1. [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)
2. [backend/01-MICROSERVICES.md](./backend/01-MICROSERVICES.md)
3. [backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md)
4. [backend/03-DATABASE.md](./backend/03-DATABASE.md)

**Referencias:**
- [backend/04-API-REFERENCE.md](./backend/04-API-REFERENCE.md)
- [../CLAUDE.md](../CLAUDE.md)

### Developer Frontend

**Leer:**
1. [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)
2. [frontend/01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md)
3. [backend/04-API-REFERENCE.md](./backend/04-API-REFERENCE.md)

**Referencias:**
- [../API-GATEWAY-ROUTES.md](../API-GATEWAY-ROUTES.md)
- [../CLAUDE.md](../CLAUDE.md)

### Arquitecto de Sistemas

**Leer:**
1. [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)
2. [backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md)
3. [../ARCHITECTURE-UPDATE-2025.md](../ARCHITECTURE-UPDATE-2025.md)
4. [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)

### DevOps / SysAdmin

**Leer:**
1. [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)
2. [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)
3. [backend/03-DATABASE.md](./backend/03-DATABASE.md)

---

## 🔑 Conceptos Clave

### Facade Pattern + Service Discovery

El **API Gateway** usa estos patrones para rutear automáticamente:

- **ServiceRegistry**: Mantiene registro dinámico de microservicios
- **ServiceFacade**: Orquesta llamadas con reintentos automáticos
- **ProxyController**: Router inteligente que captura todos los requests

📖 **Leer:** [backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md)

### Store + Composable Pattern

El frontend usa estos patrones para state management (No estándar React):

- **Services**: API calls (httpClient)
- **Stores**: Estado global (observable)
- **Composables**: React hooks que consumen stores

📖 **Leer:** [frontend/01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md)

### Monorepo

Estructura de monorepo con:

- `backend/shared/*` - Paquetes compartidos (database, types, utils)
- `backend/services/*` - Microservicios independientes
- `frontend/` - Aplicación Next.js

📖 **Leer:** [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)

---

## 🔄 Flujos Típicos

### Flow: Crear nuevo transporte

```
1. Backend Developer crea endpoint en config-service
   └─ Leer: backend/01-MICROSERVICES.md

2. Gateway automáticamente rutea /config/* a config-service
   └─ Leer: backend/02-API-GATEWAY.md

3. Frontend Developer agrega componente React
   └─ Leer: frontend/01-FRONTEND-ARCHITECTURE.md

4. Frontend llama API vía httpClient
   └─ Leer: backend/04-API-REFERENCE.md
```

### Flow: Agregar nueva tabla a BD

```
1. Editar schema en backend/shared/database/prisma/schema.prisma
   └─ Leer: backend/03-DATABASE.md

2. Crear migración: npx prisma migrate dev

3. Usar en servicio backend: this.prisma.tableName.findMany()
   └─ Leer: backend/01-MICROSERVICES.md

4. Exponer endpoint: @Get()
   └─ Leer: backend/04-API-REFERENCE.md

5. Consumir desde frontend vía httpClient
```

---

## ⚠️ Convenciones Importantes

### Backend

- **Puertos Fijos:**
  - Config Service: 3003
  - Shipping Service: 3001
  - Stock Integration: 3002
  - **Gateway (único frontend conoce): 3004**

- **Estructura Microservicio:**
  - `controller.ts` - Routes HTTP
  - `service.ts` - Lógica de negocio
  - `module.ts` - Empaquetamiento NestJS

### Frontend

- **Imports:** Usar alias `@/` (pointing to `src/app/`)
- **Env vars públicas:** Empezar con `NEXT_PUBLIC_`
- **Componentes:** Marcar con `'use client'` si tienen hooks
- **Calls API:** Siempre vía `httpClient`, nunca `fetch` directo

### Base de Datos

- **ORM:** Prisma
- **Queries:** Siempre incluir `relationships` con `include`
- **Migraciones:** `npx prisma migrate dev --name descriptivo`
- **Reset:** `npx prisma migrate reset` (cuidado - borra datos)

---

## 🆘 Necesito Ayuda Con...

### API Gateway no funciona
Leer: [backend/02-API-GATEWAY.md](./backend/02-API-GATEWAY.md) - Sección Troubleshooting

### Componente React no carga datos
Leer: [frontend/01-FRONTEND-ARCHITECTURE.md](./frontend/01-FRONTEND-ARCHITECTURE.md)

### Database connection error
Leer: [backend/03-DATABASE.md](./backend/03-DATABASE.md) - Sección Troubleshooting

### Deployment fails
Leer: [deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)

### No entiendo cómo agregr endpoint
Leer: [../CLAUDE.md](../CLAUDE.md) - Sección "Adding a New Endpoint"

---

## 📊 Estadísticas de Documentación

```
Total de documentos: 8
Páginas de documentación: ~50 páginas
Líneas de documentación: 2,500+
Ejemplos de código: 100+

Cobertura:
- Backend: 100% ✅
- Frontend: 80% (expandible)
- DevOps: 100% ✅
- API: 100% ✅
```

---

## 🔄 Actualización Reciente (Octubre 2025)

Se implementó **Facade Pattern + Service Discovery** en el Gateway:

- ✅ Frontend totalmente desacoplado de topología backend
- ✅ Nuevos microservicios sin cambios en frontend
- ✅ Reintentos automáticos en fallos transitorios
- ✅ Health checks cada 30 segundos

📖 **Leer:** [../ARCHITECTURE-UPDATE-2025.md](../ARCHITECTURE-UPDATE-2025.md)

---

## 📝 Notas

- Esta documentación está actualizada a **24 de Octubre de 2025**
- Usar `/CLAUDE.md` como guía principal para desarrollo
- Todos los comandos asumen estar en raíz del monorepo
- Versiones de Node.js: 20+

---

## 👥 Equipo

**Grupo 12 - Desarrollo de Software 2025**
**UTN FRRE - Facultad Regional Resistencia**

---

**Última actualización:** 24 de Octubre, 2025
