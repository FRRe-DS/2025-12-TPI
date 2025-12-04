# 🎨 Frontend - Sistema PEPACK (Gestión Logística)

## 📋 Información para Exposición

**Proyecto:** Sistema de Gestión Logística y de BOCA  
**Tecnologías:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Keycloak  
**Responsable:** Grupo 12 - TPI 2025

---

## 🎯 Visión General del Frontend

### ¿Qué es PEPACK?

PEPACK es un **sistema completo de gestión logística** que permite:
- **Gestión de envíos** en tiempo real
- **Optimización de rutas** de entrega
- **Análisis detallado** con métricas y dashboards
- **Seguimiento completo** de pedidos
- **Configuración dinámica** del sistema

### Rol del Frontend

El frontend actúa como la **interfaz principal** del sistema, proporcionando:
- **Dashboard interactivo** con métricas en tiempo real
- **Sistema de autenticación** seguro con Keycloak
- **Gestión completa** de configuraciones del sistema
- **Seguimiento visual** de envíos y entregas
- **Experiencia de usuario moderna** y responsive

---

## 🛠️ Stack Tecnológico

### Framework Principal
- **Next.js 16** - Framework React con App Router
- **React 19** - Librería para interfaces de usuario
- **TypeScript** - JavaScript tipado para mayor robustez

### UI/UX
- **Tailwind CSS v4** - Framework CSS utilitario
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconos consistentes
- **Recharts** - Gráficos y visualizaciones

### Autenticación y Seguridad
- **Keycloak** - Sistema de gestión de identidades
- **JWT Tokens** - Autenticación stateless

### Estado y Datos
- **Axios** - Cliente HTTP con interceptores
- **Zod** - Validación de esquemas TypeScript
- **Custom Stores** - Gestión de estado reactiva

### Arquitectura
```
Frontend (Next.js)
├── App Router (Páginas)
├── Middleware Layer
│   ├── Services (API calls)
│   ├── Stores (State management)
│   └── Composables (React hooks)
└── UI Components (Radix + Custom)
```

---

## 🏗️ Arquitectura del Frontend

### Estructura de Directorios

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Páginas principales
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── configuration/ # Configuración del sistema
│   │   │   ├── operaciones/   # Operaciones (seguimiento)
│   │   │   ├── reservas/      # Gestión de reservas
│   │   │   └── reportes/      # Reportes y análisis
│   │   ├── (public)/          # Páginas públicas
│   │   │   ├── track/         # Seguimiento público
│   │   │   └── ...
│   │   ├── auth/              # Callbacks de autenticación
│   │   └── layout.tsx         # Layout raíz
│   │
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes base (Radix UI)
│   │   ├── config/            # Componentes de configuración
│   │   └── Sidebar.tsx        # Navegación principal
│   │
│   └── lib/                   # Utilidades y configuración
│       ├── middleware/        # Capa de servicios
│       ├── config/           # Configuración de entorno
│       └── ...
│
├── public/                    # Assets estáticos
└── package.json
```

### Patrón de Arquitectura: Middleware Layer

```
Componente React
    ↓ (useHook)
Composable (useConfig)
    ↓ (llama a)
Store (configStore)
    ↓ (realiza)
Service (configService)
    ↓ (HTTP request)
API Gateway (Backend)
```

**Beneficios:**
- **Separación clara** de responsabilidades
- **Reutilización** de lógica entre componentes
- **Testabilidad** mejorada
- **Mantenimiento** más sencillo

---

## 📱 Páginas Principales

### 1. 🏠 Página de Inicio (Landing)
- **Login con Keycloak** integrado
- **Diseño moderno** con gradientes y glassmorphism
- **Información del sistema** y funcionalidades
- **Responsive** para todos los dispositivos

### 2. 📊 Dashboard Principal
- **Métricas en tiempo real:**
  - Total de pedidos
  - Pedidos completados
  - Tiempo promedio de entrega
  - Eficiencia de rutas
- **Gráficos interactivos:**
  - Entregas mensuales (área chart)
  - Distribución por zonas (pie chart)
  - Tiempos de entrega (bar chart)
- **Pedidos recientes** con estado visual
- **Pedidos en proceso** con barra de progreso

### 3. ⚙️ Configuración del Sistema
- **Gestión de métodos de transporte**
- **Configuración de zonas de cobertura**
- **Reglas de cotización dinámicas**
- **Gestión de vehículos y conductores**
- **Interfaz tabulada** para organización

### 4. 📦 Operaciones
- **Seguimiento de envíos** en tiempo real
- **Vista detallada** por pedido
- **Estados de entrega** visuales
- **Información de rutas** y tiempos

### 5. 📈 Reportes
- **Análisis avanzado** de datos
- **Métricas de rendimiento**
- **Exportación de datos**
- **Filtros personalizados**

### 6. 🎫 Reservas
- **Gestión de reservas** de entregas
- **Programación de envíos**
- **Validación de disponibilidad**

---

## 🎨 Características de UI/UX

### Diseño Moderno
- **Glassmorphism:** Efectos de vidrio translúcido
- **Gradientes dinámicos:** Colores vivos y atractivos
- **Animaciones suaves:** Transiciones y hover effects
- **Responsive design:** Móvil, tablet y desktop

### Componentes Reutilizables
```typescript
// Componentes Radix UI utilizados:
- Button, Card, Dialog, Input, Select
- Table, Tabs, Badge, Checkbox
- Dropdown Menu, Alert Dialog

// Componentes personalizados:
- DataTable (con sorting y filtrado)
- Toolbar (búsqueda + filtros)
- ConfirmDialog (operaciones destructivas)
- BadgeEstado (estados visuales)
```

### Tema Visual
- **Colores principales:** Indigo, cyan, teal, purple
- **Paleta consistente** en toda la aplicación
- **Estados visuales** claros (éxito, error, loading)
- **Iconografía** de Lucide React

---

## 🔐 Sistema de Autenticación

### Keycloak Integration
- **OAuth 2.0 + OpenID Connect**
- **Single Sign-On (SSO)**
- **Gestión de roles y permisos**
- **Tokens JWT** seguros

### Flujo de Autenticación
```
Usuario → Login Button → Keycloak Server
    ↓
Token JWT → Local Storage
    ↓
API Requests → Authorization Header
```

### Protección de Rutas
```typescript
// Componente ProtectedRoute
- Verifica token válido
- Redirige a login si no autenticado
- Maneja expiración de sesión
```

---

## 📊 Dashboard Interactivo

### Métricas Principales
- **KPI Cards** con animaciones hover
- **Indicadores de tendencia** (+/- porcentajes)
- **Iconos representativos** por métrica
- **Actualización en tiempo real**

### Visualizaciones
- **Gráficos de Recharts:**
  - AreaChart: Entregas mensuales
  - PieChart: Distribución geográfica
  - BarChart: Tiempos de entrega

### Estados en Tiempo Real
- **Pedidos en proceso** con barras de progreso
- **Estados de entrega** con colores distintivos
- **Última actualización** visible
- **Modo demo/frontend** claramente indicado

---

## 🔧 Tecnologías Modernas

### Next.js 16 Features
- **App Router:** Rutas basadas en archivos
- **Server Components:** Por defecto
- **Client Components:** Solo cuando necesario (`'use client'`)
- **TypeScript:** Soporte completo

### React 19
- **Concurrent Features**
- **Automatic Batching**
- **New Hooks API**

### Tailwind CSS v4
- **CSS-in-JS approach**
- **Utility-first** methodology
- **Responsive design** integrado

### Validación con Zod
```typescript
// Esquemas de validación
const shipmentSchema = z.object({
  originAddress: addressSchema,
  destinationAddress: addressSchema,
  weight: z.number().min(0.1).max(1000),
  transportMethodId: z.string().uuid(),
});
```

---

## 🚀 Características Destacadas

### 1. **Modo Demo Completo**
- Funciona sin backend conectado
- Datos mock realistas
- Todas las funcionalidades disponibles
- Indicador visual claro del modo

### 2. **Responsive Design**
- **Mobile-first approach**
- **Breakpoints** optimizados
- **Touch-friendly** interfaces

### 3. **Performance Optimizada**
- **Lazy loading** de componentes
- **Code splitting** automático
- **Image optimization** integrada

### 4. **Accesibilidad**
- **Componentes Radix UI** accesibles
- **Semantic HTML**
- **Keyboard navigation**
- **Screen reader** support

### 5. **Type Safety**
- **TypeScript** en todo el proyecto
- **Zod schemas** para validación
- **Type inference** automática

---

## 📈 Métricas y KPIs

### Dashboard Principal
- **Total Pedidos:** Seguimiento general
- **Pedidos Completados:** Tasa de éxito
- **Tiempo Promedio:** Eficiencia operativa
- **Eficiencia de Rutas:** Optimización logística

### Visualizaciones
- **Tendencias mensuales** de entregas
- **Distribución geográfica** por zonas
- **Análisis de tiempos** de entrega
- **Estados de pedidos** en tiempo real

---

## 🔄 Integración con Backend

### API Gateway
- **Comunicación unificada** con microservicios
- **Interceptores HTTP** automáticos
- **Manejo de errores** centralizado
- **Autenticación automática** con JWT

### Microservicios
- **Config Service:** Configuraciones del sistema
- **Shipping Service:** Gestión de envíos
- **Stock Integration:** Integración de inventario
- **Operator Interface:** Interfaz de operadores

---

## 🎯 Conclusión

### Logros del Frontend

1. **Interfaz moderna** y atractiva
2. **Arquitectura escalable** con Middleware Layer
3. **Integración completa** con Keycloak
4. **Dashboard interactivo** con métricas reales
5. **Código mantenible** con TypeScript
6. **Experiencia responsive** en todos los dispositivos

### Tecnologías Clave
- **Next.js 16 + React 19** para desarrollo moderno
- **Tailwind CSS + Radix UI** para UI consistente
- **Keycloak** para autenticación enterprise
- **TypeScript + Zod** para type safety
- **Recharts** para visualizaciones

### Impacto
- **Usuario final:** Interfaz intuitiva y moderna
- **Desarrolladores:** Código mantenible y escalable
- **Sistema:** Integración perfecta con backend
- **Negocio:** Métricas claras para toma de decisiones

---

**Presentado por:** Grupo 12 - TPI 2025  
**Fecha:** Diciembre 2025  
**Proyecto:** Sistema PEPACK - Gestión Logística y de BOCA
