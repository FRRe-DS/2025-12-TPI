# 🧪 Testing con Playwright - PEPACK Frontend

Documentación completa para ejecutar y escribir tests end-to-end con Playwright.

## 📋 Requisitos Previos

- **Node.js** 18+ (Nota: Next.js requiere 20+ para desarrollo, pero tests funcionan con 18)
- **pnpm** instalado
- **Playwright** configurado
- **Servidor local** corriendo en `http://localhost:3000` para tests de desarrollo

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Instalar navegadores de Playwright
```bash
pnpm dlx playwright install
```

### 3. Ejecutar todos los tests (CI/Production)
```bash
pnpm test
```

### 4. Ejecutar tests en modo desarrollo (con servidor local)
```bash
# Terminal 1: Iniciar el servidor
pnpm dev

# Terminal 2: Ejecutar tests
pnpm test:dev
```

### 5. Ejecutar tests en modo UI (recomendado para desarrollo)
```bash
pnpm test:ui
```

## 📊 Comandos Disponibles

| Comando | Descripción | Requiere Servidor | Estado Actual |
|---------|-------------|-------------------|---------------|
| `pnpm test` | Tests CI (sin servidor local) | ❌ | ✅ Funciona |
| `pnpm test:dev` | Tests con servidor local | ✅ | ❌ Requiere Node.js 20+ |
| `pnpm test:ui` | Interfaz visual interactiva | ✅ | ❌ Requiere Node.js 20+ |
| `pnpm test:debug` | Debug paso a paso | ✅ | ❌ Requiere Node.js 20+ |
| `pnpm test:headed` | Navegador visible | ✅ | ❌ Requiere Node.js 20+ |
| `pnpm test:report` | Reporte HTML | ❌ | ✅ Funciona |

## ⚠️ Limitaciones Actuales

### 🚨 Node.js 18 - BLOQUEA TESTS REALES
- **Next.js 16** requiere Node.js 20+ para desarrollo
- **Servidor local** NO puede iniciarse con Node.js 18
- **Tests E2E reales** necesitan `http://localhost:3000`

### ✅ Lo que SÍ funciona:
- **Playwright framework** completamente configurado
- **Tests básicos** de funcionalidad (demo)
- **CI/CD pipeline** listo para cuando tengas Node.js 20+
- **Configuración completa** guardada

### 🔧 Soluciones Disponibles:

#### Opción 1: Actualizar Node.js (Recomendado)
```bash
nvm install 20
nvm use 20
node --version  # Debe mostrar v20.x.x
```

#### Opción 2: Tests en CI/CD (Temporal)
- Los tests CI funcionan porque no necesitan servidor local
- Usan `NODE_ENV=production` para evitar webServer
- Perfectos para integración continua

#### Opción 3: Tests Unitarios (Alternativa)
- Crear tests de componentes con React Testing Library
- No requieren servidor, funcionan con Node.js 18
- Más rápidos que E2E

### Modo Demo
- Tests están optimizados para **modo demo** del frontend
- **Autenticación**: Bypass automático (no requiere Keycloak real)
- **Datos**: Usa datos mock consistentes

## 🏗️ Estructura de Tests

```
tests/
├── e2e/                          # Tests end-to-end
│   ├── playwright-demo.spec.ts  # ✅ FUNCIONA - Demo básico
│   ├── pepack-real-tests.spec.ts # ❌ BLOQUEADO - Tests reales PEPACK
│   ├── homepage.spec.ts         # ❌ BLOQUEADO - Página principal
│   ├── dashboard.spec.ts        # ❌ BLOQUEADO - Dashboard
│   ├── configuration.spec.ts    # ❌ BLOQUEADO - Configuración
│   ├── auth.spec.ts             # ❌ BLOQUEADO - Autenticación
│   └── utils/                   # Utilidades de testing
│       └── test-helpers.ts      # Helpers y utilidades
├── playwright.config.ts         # Configuración de Playwright
└── README.md                    # Esta documentación
```

### 📋 Estado de Tests

| Archivo | Estado | Descripción | Requiere Node.js 20+ |
|---------|--------|-------------|---------------------|
| `playwright-demo.spec.ts` | ✅ **FUNCIONA** | Demo básico de Playwright | ❌ No |
| `pepack-real-tests.spec.ts` | ❌ **BLOQUEADO** | Tests completos del sistema | ✅ Sí |
| `homepage.spec.ts` | ❌ **BLOQUEADO** | Página principal PEPACK | ✅ Sí |
| `dashboard.spec.ts` | ❌ **BLOQUEADO** | Dashboard y métricas | ✅ Sí |
| `configuration.spec.ts` | ❌ **BLOQUEADO** | Configuración sistema | ✅ Sí |
| `auth.spec.ts` | ❌ **BLOQUEADO** | Autenticación Keycloak | ✅ Sí |

## 🎯 Tipos de Tests

### 1. **Tests de Página** (`homepage.spec.ts`)
- Verificación de carga correcta
- Elementos UI presentes
- Navegación básica
- Diseño responsive

### 2. **Tests de Dashboard** (`dashboard.spec.ts`)
- Métricas principales
- Gráficos y visualizaciones
- Funcionalidad de refresh
- Estados de pedidos

### 3. **Tests de Configuración** (`configuration.spec.ts`)
- Navegación por pestañas
- Tablas de datos
- Funcionalidad CRUD
- Formularios

### 4. **Tests de Autenticación** (`auth.spec.ts`)
- Flujo de login/logout
- Manejo de sesiones
- Protección de rutas
- Integración Keycloak

## 💡 Ejemplos de Tests

### Test Básico
```typescript
import { test, expect } from '@playwright/test';

test('debe cargar la página principal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('PEPACK');
});
```

### Test con Helpers
```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers, Selectors } from './utils/test-helpers';

test('dashboard debe mostrar métricas', async ({ page }) => {
  await TestHelpers.mockAuthentication(page);
  await TestHelpers.waitForDashboardLoad(page);

  await expect(page.locator(Selectors.totalPedidos)).toBeVisible();
});
```

### Test de Interacción
```typescript
test('debe permitir navegación por pestañas', async ({ page }) => {
  await page.goto('/configuration');

  // Hacer clic en pestaña
  await page.getByRole('tab', { name: 'Métodos de Transporte' }).click();

  // Verificar cambio de contenido
  await expect(page.getByText('Métodos de Transporte')).toBeVisible();
});
```

## 🔧 Configuración de Playwright

### Archivo `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',           // Directorio de tests
  fullyParallel: true,             // Tests en paralelo
  retries: process.env.CI ? 2 : 0, // Reintentos en CI

  use: {
    baseURL: 'http://localhost:3000',  // URL base
    trace: 'on-first-retry',           // Traza en fallos
    screenshot: 'only-on-failure',     // Screenshots en error
    video: 'retain-on-failure',        // Videos en error
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'pnpm dev',              // Comando para iniciar servidor
    url: 'http://localhost:3000',     // URL del servidor
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🧰 Utilidades de Testing

### Clase `TestHelpers`
- `mockAuthentication()` - Simula login
- `waitForDashboardLoad()` - Espera carga completa
- `navigateToSection()` - Navegación por secciones
- `verifyDemoMode()` - Verifica modo demo

### Selectores Comunes
```typescript
Selectors.totalPedidos    // Card de total pedidos
Selectors.dataTable       // Tabla genérica
Selectors.searchInput     // Campo de búsqueda
Selectors.loadingSpinner  // Spinner de carga
```

### Datos de Prueba
```typescript
TestData.mockUser         // Usuario de prueba
TestData.mockShipment     // Envío de ejemplo
TestData.mockVehicle      // Vehículo de ejemplo
```

## 🎭 Modo Demo

Como el proyecto funciona en **modo demo**, los tests están configurados para:

- ✅ **Acceso directo** al dashboard (sin login real)
- ✅ **Datos mock** consistentes
- ✅ **Funcionalidades completas** disponibles
- ✅ **Indicadores visuales** de modo demo

## 🔍 Debugging de Tests

### Modo Debug Interactivo
```bash
pnpm test:debug
```
- Pausa en cada paso
- Inspeccionar elementos
- Ejecutar comandos manualmente

### Modo UI Visual
```bash
pnpm test:ui
```
- Interfaz gráfica para ejecutar tests
- Ver resultados en tiempo real
- Navegación por suites de tests

### Screenshots y Videos
Los tests fallidos generan automáticamente:
- 📸 **Screenshots** del estado del error
- 🎥 **Videos** de la ejecución completa
- 📊 **Traces** para debugging detallado

## 📈 Mejores Prácticas

### ✅ HACER
- Usar `page.locator()` en lugar de selectores CSS/XPath directos
- Esperar elementos con `expect().toBeVisible()`
- Usar roles semánticos: `page.getByRole('button')`
- Nombrar tests descriptivamente
- Usar `test.describe()` para agrupar tests relacionados

### ❌ NO HACER
- Usar `page.waitForTimeout()` (usar esperas automáticas)
- Hardcodear URLs completas (usar `baseURL`)
- Ignorar el modo `fullyParallel`
- Tests que dependan del estado anterior

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright tests
  run: pnpm test
  env:
    CI: true

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: test-results/
```

## 📊 Reportes

Después de ejecutar tests, ver reportes con:
```bash
pnpm test:report
```

Genera un reporte HTML interactivo con:
- ✅ Resultados detallados
- 📊 Estadísticas de ejecución
- 🎥 Videos de tests fallidos
- 📸 Screenshots de errores
- 📈 Tendencias de rendimiento

---

**Última actualización:** Diciembre 2025
**Framework:** Playwright v1.57+
**Proyecto:** PEPACK Frontend - Tests E2E
