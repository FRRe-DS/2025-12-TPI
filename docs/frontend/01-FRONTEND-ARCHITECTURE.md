# 🎨 Frontend - Arquitectura y Componentes

Documentación completa del frontend Next.js 16 + React 19.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Keycloak

---

## 📊 Visión General

```
Next.js Frontend (http://localhost:3005)
├─ Pages (App Router)
│  ├─ Dashboard
│  ├─ Configuration
│  ├─ Shipments
│  └─ Tracking
│
├─ Components
│  ├─ UI Components (Radix UI)
│  └─ Feature Components
│
└─ Middleware Layer
   ├─ Services (API calls)
   ├─ Stores (State management)
   ├─ Composables (React hooks)
   ├─ HTTP Client (Axios)
   ├─ Validators (Zod)
   └─ Error Handling
```

---

## 🏗️ Estructura de Directorios

```
frontend/
├── src/
│   └── app/
│       ├── (main)/                    # App Router pages
│       │   ├── page.tsx               # Home
│       │   ├── configuration/
│       │   │   └── page.tsx
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── shipments/
│       │   │   └── page.tsx
│       │   └── tracking/
│       │       └── page.tsx
│       │
│       ├── components/                # React components
│       │   ├── ui/                    # Radix UI components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   ├── table.tsx
│       │   │   ├── tabs.tsx
│       │   │   └── ... (otros componentes Radix)
│       │   │
│       │   ├── config/                # Configuration components
│       │   │   ├── DataTable.tsx      # Tabla genérica
│       │   │   ├── Toolbar.tsx        # Toolbar con búsqueda
│       │   │   ├── EmptyState.tsx     # Estado vacío
│       │   │   ├── ConfirmDialog.tsx  # Diálogo confirmación
│       │   │   └── BadgeEstado.tsx    # Badge de estado
│       │   │
│       │   ├── config-pages/          # Feature pages
│       │   │   ├── TransportMethods.tsx
│       │   │   ├── CoverageZones.tsx
│       │   │   ├── ReglasCotizacion.tsx (Tariffs)
│       │   │   ├── Vehicles.tsx
│       │   │   ├── Drivers.tsx
│       │   │   └── ... (más páginas)
│       │   │
│       │   └── Sidebar.tsx            # Navegación principal
│       │
│       ├── lib/
│       │   └── middleware/            # Capa de servicios
│       │       ├── services/          # Domain services
│       │       │   ├── config.service.ts
│       │       │   ├── shipment.service.ts
│       │       │   ├── vehicle.service.ts
│       │       │   ├── driver.service.ts
│       │       │   └── ... (más servicios)
│       │       │
│       │       ├── stores/            # State management
│       │       │   ├── config.store.ts
│       │       │   ├── shipments.store.ts
│       │       │   ├── vehicles.store.ts
│       │       │   ├── drivers.store.ts
│       │       │   └── ui.store.ts
│       │       │
│       │       ├── composables/       # React hooks
│       │       │   ├── useConfig.ts
│       │       │   ├── useShipments.ts
│       │       │   ├── useVehicles.ts
│       │       │   ├── useDrivers.ts
│       │       │   └── ... (más hooks)
│       │       │
│       │       ├── http/              # HTTP client
│       │       │   ├── http-client.ts # Axios con interceptores
│       │       │   └── config.ts      # Configuración
│       │       │
│       │       ├── auth/              # Keycloak
│       │       │   ├── KeycloakProvider.tsx
│       │       │   ├── auth.service.ts
│       │       │   └── keycloak.config.ts
│       │       │
│       │       ├── validators/        # Zod schemas
│       │       │   └── schemas/
│       │       │       ├── address.schema.ts
│       │       │       └── shipment.schema.ts
│       │       │
│       │       ├── errors/            # Error handling
│       │       │   ├── api-error.ts
│       │       │   └── error-handler.ts
│       │       │
│       │       └── mappers/           # DTO transformations
│       │           └── status.formatter.ts
│       │
│       ├── layout.tsx                 # Root layout
│       ├── page.tsx                   # Home page
│       └── globals.css                # Global styles
│
├── public/                            # Static assets
├── .env.local                         # Environment variables
├── next.config.ts                     # Next.js config
├── tsconfig.json                      # TypeScript config
├── tailwind.config.ts                 # Tailwind config
└── package.json
```

---

## 🎯 Patrones de Diseño

### 1. Middleware Layer Pattern

La capa de middleware encapsula toda comunicación backend:

```typescript
// ❌ NO HACER - Directo en componentes
async function fetchData() {
  const response = await fetch('http://localhost:3004/config/...');
  return response.json();
}

// ✅ HACER - Vía service + store + composable
const { data, loading, error } = useConfig();
```

### 2. Service Layer (API Calls)

**Ubicación:** `src/app/lib/middleware/services/`

```typescript
// config.service.ts
export const configService = {
  async getTransportMethods() {
    return httpClient.get('/config/transport-methods');
  },

  async createTransportMethod(data) {
    return httpClient.post('/config/transport-methods', data);
  },

  // ... más métodos
};
```

**Ventajas:**
- Centraliza API calls
- Fácil de testear
- Reutilizable en múltiples componentes

### 3. Store Pattern (State Management)

**Ubicación:** `src/app/lib/middleware/stores/`

```typescript
// config.store.ts
export const configStore = {
  // State
  data: [],
  loading: false,
  error: null,

  // Actions
  async load() {
    this.loading = true;
    try {
      this.data = await configService.getTransportMethods();
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  },

  // Mutations
  add(item) {
    this.data.push(item);
  },
};
```

**Nota:** Este patrón Svelte/Vue es NO ESTÁNDAR en React.
Se recomienda migrar a Zustand o Redux en el futuro.

### 4. React Hooks (Composables)

**Ubicación:** `src/app/lib/middleware/stores/composables/`

```typescript
// useConfig.ts
export function useConfig() {
  const [state, setState] = useState(configStore);

  useEffect(() => {
    configStore.load();
    setState({ ...configStore });
  }, []);

  return {
    transportMethods: state.data,
    loading: state.loading,
    error: state.error,
    refresh: () => configStore.load(),
  };
}
```

**Uso en componentes:**
```typescript
export function ConfigPage() {
  const { transportMethods, loading, error } = useConfig();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <DataTable columns={[...]} data={transportMethods} />;
}
```

---

## 🎨 Componentes UI

### Componentes Radix UI Base

Ubicación: `src/app/components/ui/`

```typescript
// Ejemplos de componentes disponibles:
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown } from '@/components/ui/dropdown-menu';
import { AlertDialog } from '@/components/ui/alert-dialog';
```

### Componentes de Configuración

Ubicación: `src/app/components/config/`

**DataTable.tsx**
- Tabla genérica con sorting, filtrado
- Renderiza cualquier tipo de datos
- Usa Radix UI Table

**Toolbar.tsx**
- Búsqueda
- Filtros
- Botones de acción

**ConfirmDialog.tsx**
- Diálogo de confirmación
- Para operaciones destructivas

**BadgeEstado.tsx**
- Badge que muestra estado
- Colores según estado

**EmptyState.tsx**
- Mensaje cuando no hay datos

### Componentes de Features

Ubicación: `src/app/components/config-pages/`

**Ejemplo: TransportMethods.tsx**

```typescript
'use client';

import { useConfig } from '@/lib/middleware/stores/composables/useConfig';
import { DataTable } from '../config/DataTable';
import { Button } from '../ui/button';

export function TransportMethods() {
  const { transportMethods, loading } = useConfig();

  return (
    <div>
      <div className="flex justify-between">
        <h2>Métodos de Transporte</h2>
        <Button>+ Nuevo</Button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <DataTable
          columns={[
            { accessorKey: 'name', header: 'Nombre' },
            { accessorKey: 'code', header: 'Código' },
            { accessorKey: 'estimatedDays', header: 'Días' },
          ]}
          data={transportMethods}
        />
      )}
    </div>
  );
}
```

---

## 📡 HTTP Client & Interceptores

**Ubicación:** `src/app/lib/middleware/http/http-client.ts`

```typescript
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
  timeout: 10000,
});

// Request interceptor - Agregar JWT token
httpClient.interceptors.request.use((config) => {
  const token = getToken(); // De Keycloak
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Manejo de errores
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Manejo de errores...
    throw error;
  }
);
```

---

## 🔐 Autenticación (Keycloak)

**Ubicación:** `src/app/lib/middleware/auth/`

```typescript
// keycloak.config.ts
export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'logistica',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'logix-frontend',
};

// auth.service.ts
export const authService = {
  async login(username, password) {
    // Login logic
  },

  async logout() {
    // Logout logic
  },

  getToken() {
    // Get stored token
  },
};

// KeycloakProvider.tsx
export function KeycloakProvider({ children }) {
  // Wrap app con autenticación
  return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>;
}
```

---

## ✅ Validación con Zod

**Ubicación:** `src/app/lib/middleware/validators/schemas/`

```typescript
// address.schema.ts
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(3).max(255),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().regex(/^\d{4,5}$/),
  country: z.string().default('AR'),
});

export type Address = z.infer<typeof addressSchema>;

// shipment.schema.ts
export const shipmentSchema = z.object({
  originAddress: addressSchema,
  destinationAddress: addressSchema,
  weight: z.number().min(0.1).max(1000),
  transportMethodId: z.string().uuid(),
  description: z.string().optional(),
});

export type Shipment = z.infer<typeof shipmentSchema>;

// Uso en componentes:
const [errors, setErrors] = useState({});

async function handleSubmit(formData) {
  try {
    const validated = shipmentSchema.parse(formData);
    await shipmentService.create(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      setErrors(error.flatten().fieldErrors);
    }
  }
}
```

---

## 🌍 Next.js App Router

### Layout Raíz

**src/app/layout.tsx**

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <KeycloakProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </KeycloakProvider>
      </body>
    </html>
  );
}
```

### Página Home

**src/app/page.tsx**

```typescript
export default function Home() {
  return (
    <div>
      <h1>Dashboard de Logística</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Páginas de Configuración

**src/app/(main)/configuration/page.tsx**

```typescript
'use client';

import { Tabs } from '@/components/ui/tabs';
import { TransportMethods } from '@/components/config-pages/TransportMethods';
import { CoverageZones } from '@/components/config-pages/CoverageZones';
import { TariffConfigs } from '@/components/config-pages/ReglasCotizacion';

export default function ConfigurationPage() {
  return (
    <Tabs defaultValue="transporte">
      <div>
        <h2 className="text-2xl font-bold mb-4">Configuración del Sistema</h2>
      </div>

      <Tabs.List>
        <Tabs.Trigger value="transporte">Métodos de Transporte</Tabs.Trigger>
        <Tabs.Trigger value="cobertura">Zonas de Cobertura</Tabs.Trigger>
        <Tabs.Trigger value="tarifas">Reglas de Cotización</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="transporte">
        <TransportMethods />
      </Tabs.Content>

      <Tabs.Content value="cobertura">
        <CoverageZones />
      </Tabs.Content>

      <Tabs.Content value="tarifas">
        <TariffConfigs />
      </Tabs.Content>
    </Tabs>
  );
}
```

---

## 🎯 Variables de Entorno

**frontend/.env.local**

```env
# API Gateway
NEXT_PUBLIC_API_URL=http://localhost:3004

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=logistica
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=logix-frontend

# Ambiente
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_NAME=Logística Sistema
```

**Importante:** Variables públicas deben empezar con `NEXT_PUBLIC_`

---

## 📱 Import Paths

Usar alias `@/` para imports (configurado en tsconfig.json):

```typescript
// ✅ CORRECTO
import { Button } from '@/components/ui/button';
import { useConfig } from '@/lib/middleware/stores/composables/useConfig';
import { configService } from '@/lib/middleware/services/config.service';

// ❌ INCORRECTO
import { Button } from '../../../components/ui/button';
import { useConfig } from '../../../../lib/middleware/...';
```

---

## 🚀 Convenciones de Código

### Componentes Funcionales

```typescript
'use client';  // Marcar como Client Component (Interactividad)

import { useState, useEffect } from 'react';

export function MyComponent() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup
  }, []);

  return <div>Content</div>;
}
```

### Usar `'use client'` para:
- Componentes con hooks (useState, useEffect, etc)
- Event handlers
- Context consumers
- Browser APIs

### NO usar `'use client'` para:
- Páginas que solo renderizan
- Components sin interactividad
- Data fetching (mejor en servidor)

---

## 🧪 Testing Componentes

```bash
cd frontend
pnpm test                    # Ejecutar tests
pnpm run test:watch         # Watch mode
pnpm run test:cov          # Coverage report
```

---

## 📊 Estado Global

Evitar prop drilling usando stores + composables:

```typescript
// ❌ Prop drilling (malo)
<Page props={props} passingDownDeep={true} />

// ✅ Usar composable (bueno)
function Component() {
  const { data } = useConfig();  // Acceso directo
  return <div>{data}</div>;
}
```

---

**Última actualización:** Diciembre 3, 2025
