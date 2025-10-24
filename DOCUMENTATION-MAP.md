# 📚 Mapa de Documentación - TPI 2025

Guía visual de dónde encontrar cada documento.

---

## 📁 Estructura de Carpetas

```
📂 /
│
├── 📄 README.md                        ← Quick start (5 min read)
├── 📄 CLAUDE.md                        ← Guía completa (1000+ líneas) ⭐ EMPEZAR AQUÍ
├── 📄 API-GATEWAY-ROUTES.md            ← Rutas del gateway detalladas
├── 📄 ARCHITECTURE-UPDATE-2025.md      ← Lo nuevo: Facade + Service Discovery
├── 📄 FIXES-SUMMARY.md                 ← Resumen de fixes recientes
│
└── 📂 docs/                            ← Documentación organizada por tema
    │
    ├── 📄 README.md                    ← Índice completo de docs
    ├── 📄 SYSTEM-ARCHITECTURE.md       ← Visión general (5 min)
    │
    ├── 📂 backend/                     ← Backend Documentation
    │   ├── 📄 01-MICROSERVICES.md      ← Config, Shipping, Stock, Gateway
    │   ├── 📄 02-API-GATEWAY.md        ← Facade Pattern, Service Discovery
    │   ├── 📄 03-DATABASE.md           ← Prisma Schema, Migraciones
    │   └── 📄 04-API-REFERENCE.md      ← Endpoints, Ejemplos cURL
    │
    ├── 📂 frontend/                    ← Frontend Documentation
    │   └── 📄 01-FRONTEND-ARCHITECTURE.md ← React, Components, Stores
    │
    └── 📂 deployment/                  ← DevOps
        └── 📄 DEPLOYMENT.md            ← Setup, Docker, Production
```

---

## 🎯 Por Dónde Empezar

### Opción 1: Super Rápido (10 min)
```
1. Leer README.md (raíz)               ← Qué es el proyecto
2. Ver docs/README.md                  ← Navegar documentación  
3. Listo! Ya sabes dónde buscar info
```

### Opción 2: Entender Todo (1 hora)
```
1. Leer /CLAUDE.md                     ← Guía completa
2. Leer docs/SYSTEM-ARCHITECTURE.md    ← Arquitectura general
3. Leer docs/backend/01-MICROSERVICES.md ← Backend
4. Leer docs/frontend/01-FRONTEND-ARCHITECTURE.md ← Frontend
5. Leer /ARCHITECTURE-UPDATE-2025.md   ← Lo nuevo
```

### Opción 3: Orientado a Tarea
```
"Quiero agregar un endpoint"
  └─ docs/backend/01-MICROSERVICES.md

"Quiero crear componente React"
  └─ docs/frontend/01-FRONTEND-ARCHITECTURE.md

"¿Cómo funciona el Gateway?"
  └─ docs/backend/02-API-GATEWAY.md

"¿Cuáles son todos los endpoints?"
  └─ docs/backend/04-API-REFERENCE.md
  └─ /API-GATEWAY-ROUTES.md

"Cómo deployar?"
  └─ docs/deployment/DEPLOYMENT.md
```

---

## 📊 Documentos Por Tipo

### Visión General (Empezar con estos)
- ✅ [README.md](./README.md) - Quick start
- ✅ [CLAUDE.md](./CLAUDE.md) - Guía completa
- ✅ [docs/README.md](./docs/README.md) - Índice de documentación
- ✅ [docs/SYSTEM-ARCHITECTURE.md](./docs/SYSTEM-ARCHITECTURE.md) - Arquitectura

### Backend - Desarrollo
- 🔧 [docs/backend/01-MICROSERVICES.md](./docs/backend/01-MICROSERVICES.md) - Los 4 servicios
- 🔧 [docs/backend/02-API-GATEWAY.md](./docs/backend/02-API-GATEWAY.md) - Gateway inteligente
- 🔧 [docs/backend/03-DATABASE.md](./docs/backend/03-DATABASE.md) - Base de datos Prisma
- 🔧 [docs/backend/04-API-REFERENCE.md](./docs/backend/04-API-REFERENCE.md) - Endpoints

### Frontend - Desarrollo
- 🎨 [docs/frontend/01-FRONTEND-ARCHITECTURE.md](./docs/frontend/01-FRONTEND-ARCHITECTURE.md) - React Next.js
- 🎨 [API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md) - Rutas del gateway

### Infraestructura
- 🚀 [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md) - Setup, Docker, Deploy

### Recientes
- ⭐ [ARCHITECTURE-UPDATE-2025.md](./ARCHITECTURE-UPDATE-2025.md) - Facade Pattern + Service Discovery
- 📝 [FIXES-SUMMARY.md](./FIXES-SUMMARY.md) - Resumen de correcciones

---

## 🔑 Documentos Clave

| Documento | Líneas | Leer Primero? | Audiencia | Tiempo |
|-----------|--------|--------------|-----------|--------|
| [CLAUDE.md](./CLAUDE.md) | 900+ | ⭐⭐⭐ | Todos | 20 min |
| [README.md](./README.md) | 280 | ⭐⭐⭐ | Todos | 5 min |
| [docs/README.md](./docs/README.md) | 400+ | ⭐⭐ | Todos | 10 min |
| [docs/SYSTEM-ARCHITECTURE.md](./docs/SYSTEM-ARCHITECTURE.md) | 65 | ⭐⭐ | Todos | 5 min |
| [docs/backend/01-MICROSERVICES.md](./docs/backend/01-MICROSERVICES.md) | 500+ | ⭐⭐ | Backend | 15 min |
| [docs/backend/02-API-GATEWAY.md](./docs/backend/02-API-GATEWAY.md) | 700+ | ⭐⭐ | Backend, Arch | 20 min |
| [docs/backend/03-DATABASE.md](./docs/backend/03-DATABASE.md) | 280 | ⭐ | Backend, DBA | 10 min |
| [docs/backend/04-API-REFERENCE.md](./docs/backend/04-API-REFERENCE.md) | 500+ | 📖 | Backend, Frontend | Referencia |
| [docs/frontend/01-FRONTEND-ARCHITECTURE.md](./docs/frontend/01-FRONTEND-ARCHITECTURE.md) | 700+ | ⭐⭐ | Frontend | 20 min |
| [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md) | 280 | ⭐ | DevOps | 15 min |
| [API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md) | 650+ | 📖 | Frontend, Devs | Referencia |
| [ARCHITECTURE-UPDATE-2025.md](./ARCHITECTURE-UPDATE-2025.md) | 400+ | ⭐ | Arquitectos | 15 min |

**Leyenda:** ⭐⭐⭐ Crítico | ⭐⭐ Importante | ⭐ Útil | 📖 Referencia

---

## 🎓 Rutas de Aprendizaje

### Para Backend Developer
```
1. CLAUDE.md                           (20 min)
   ↓
2. docs/backend/01-MICROSERVICES.md    (15 min)
   ↓
3. docs/backend/02-API-GATEWAY.md      (20 min)
   ↓
4. docs/backend/03-DATABASE.md         (10 min)
   ↓
5. docs/backend/04-API-REFERENCE.md    (referencia)
```

### Para Frontend Developer
```
1. CLAUDE.md                           (20 min)
   ↓
2. docs/frontend/01-FRONTEND-ARCHITECTURE.md (20 min)
   ↓
3. API-GATEWAY-ROUTES.md               (referencia)
   ↓
4. docs/backend/04-API-REFERENCE.md    (referencia)
```

### Para DevOps / SysAdmin
```
1. README.md                           (5 min)
   ↓
2. docs/SYSTEM-ARCHITECTURE.md         (5 min)
   ↓
3. docs/deployment/DEPLOYMENT.md       (15 min)
   ↓
4. docs/backend/03-DATABASE.md         (10 min)
```

### Para Arquitecto de Sistemas
```
1. CLAUDE.md                           (20 min)
   ↓
2. docs/SYSTEM-ARCHITECTURE.md         (5 min)
   ↓
3. ARCHITECTURE-UPDATE-2025.md         (15 min)
   ↓
4. docs/backend/02-API-GATEWAY.md      (20 min)
```

---

## 🔍 Buscar Información Específica

### "Cómo agregrar un nuevo endpoint?"
Ir a: [docs/backend/01-MICROSERVICES.md](./docs/backend/01-MICROSERVICES.md#-desarrollo-de-microservicios)

### "¿Cuál es el puerto del Gateway?"
Ir a: [CLAUDE.md](./CLAUDE.md) - Buscar "3004"

### "¿Cómo funciona el retrying automático?"
Ir a: [docs/backend/02-API-GATEWAY.md](./docs/backend/02-API-GATEWAY.md#-servicefacade-patrón-facade)

### "¿Qué componentes UI están disponibles?"
Ir a: [docs/frontend/01-FRONTEND-ARCHITECTURE.md](./docs/frontend/01-FRONTEND-ARCHITECTURE.md#-componentes-ui)

### "¿Cómo hacer deployment?"
Ir a: [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md)

### "¿Cuáles son todos los endpoints?"
Ir a: [API-GATEWAY-ROUTES.md](./API-GATEWAY-ROUTES.md) o [docs/backend/04-API-REFERENCE.md](./docs/backend/04-API-REFERENCE.md)

### "¿Cómo está organizada la BD?"
Ir a: [docs/backend/03-DATABASE.md](./docs/backend/03-DATABASE.md)

### "¿Cómo usar Stores + Composables?"
Ir a: [docs/frontend/01-FRONTEND-ARCHITECTURE.md](./docs/frontend/01-FRONTEND-ARCHITECTURE.md#-patrones-de-diseño)

---

## 📈 Estadísticas

```
Total de documentos: 12
Documentos principales: 11
Líneas de documentación: 4,500+
Ejemplos de código: 150+
Diagramas ASCII: 30+

Por tema:
├─ Backend:      4 docs (1,500 líneas)
├─ Frontend:     1 doc (700 líneas)
├─ DevOps:       1 doc (280 líneas)
├─ General:      4 docs (1,500 líneas)
└─ Referencia:   2 docs (1,100 líneas)
```

---

## ✅ Documentación Cubierta

- ✅ Visión general del sistema
- ✅ Microservicios (4 servicios)
- ✅ API Gateway (Facade + Discovery)
- ✅ Base de datos (Schema Prisma)
- ✅ APIs (Endpoints y ejemplos)
- ✅ Frontend (React Next.js)
- ✅ Deployment (Local, Docker, Prod)
- ✅ Troubleshooting
- ✅ Comandos útiles
- ✅ Patrones de diseño

---

## 🔗 Enlaces Rápidos

### Documentación
- [Índice principal (docs/README.md)](./docs/README.md)
- [Guía completa (CLAUDE.md)](./CLAUDE.md)
- [Quick start (README.md)](./README.md)

### Backend
- [Microservicios](./docs/backend/01-MICROSERVICES.md)
- [API Gateway](./docs/backend/02-API-GATEWAY.md)
- [Base de datos](./docs/backend/03-DATABASE.md)
- [Endpoints](./docs/backend/04-API-REFERENCE.md)

### Frontend
- [Arquitectura React](./docs/frontend/01-FRONTEND-ARCHITECTURE.md)
- [Rutas del gateway](./API-GATEWAY-ROUTES.md)

### Infraestructura
- [Deployment](./docs/deployment/DEPLOYMENT.md)

### Lo Nuevo
- [Facade Pattern (Octubre 2025)](./ARCHITECTURE-UPDATE-2025.md)

---

## 💡 Tips de Navegación

### En tu IDE (VS Code, etc):
```
Usa Ctrl+P (o Cmd+P) y busca:
- "CLAUDE" → Guía completa
- "MICROSERVICES" → Microservicios
- "API-GATEWAY" → Gateway
- "FRONTEND" → Frontend
- "DATABASE" → Base de datos
```

### En el navegador (GitHub):
```
Navega a /docs/README.md para ver índice completo
Usa búsqueda Ctrl+F en cualquier markdown
```

### Desde terminal:
```bash
# Ver estructura
tree docs/

# Buscar en docs
grep -r "tu-busqueda" docs/

# Contar líneas
wc -l docs/**/*.md
```

---

## 📝 Notas Finales

- Documentación actualizada: **24 de Octubre, 2025**
- Todas las referencias funcionan
- Ejemplos probados en desarrollo
- Sigue estructura de monorepo

---

**¿No encuentras lo que buscas?**

1. Busca en [docs/README.md](./docs/README.md) - Sección "Buscar Por Tarea"
2. Busca en [CLAUDE.md](./CLAUDE.md) usando Ctrl+F
3. Revisa tabla de contents en cada documento

---

**Última actualización:** 24 de Octubre, 2025
**Responsable:** Grupo 12 TPI 2025
