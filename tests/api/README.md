# Tests de API con Playwright

Este directorio contiene tests de API para los servicios backend del sistema, específicamente para el **Stock Integration Service**.

## Estructura

```
tests/api/
└── stock-integration/
    ├── health.spec.ts          # Tests del endpoint /health
    ├── external-api.spec.ts    # Tests de integración con API externa
    ├── circuit-breaker.spec.ts # Tests del circuit breaker
    ├── cache.spec.ts           # Tests del sistema de cache
    ├── retry.spec.ts           # Tests de lógica de retry
    └── gateway.spec.ts         # Tests a través del API Gateway
```

## Configuración

Los tests usan `playwright.api.config.ts` que:
- No requiere navegador (usa `request` API de Playwright)
- Configura baseURL para `http://localhost:3002` (Stock Integration Service)
- Inicia automáticamente el servicio antes de ejecutar los tests

## Ejecutar Tests

### Todos los tests de API
```bash
pnpm run test:api
```

### Con interfaz visual
```bash
pnpm run test:api:ui
```

### Ver navegador (aunque no se use para API)
```bash
pnpm run test:api:headed
```

### Modo debug
```bash
pnpm run test:api:debug
```

### Listar tests disponibles
```bash
pnpm run test:api:list
```

### Ejecutar un archivo específico
```bash
pnpm exec playwright test --config=playwright.api.config.ts tests/api/stock-integration/health.spec.ts
```

## Requisitos

1. **Stock Integration Service corriendo**: Los tests iniciarán automáticamente el servicio, pero puedes iniciarlo manualmente:
   ```bash
   cd backend/services/stock-integration-service
   pnpm run start:dev
   ```

2. **Variables de entorno**: El servicio necesita configuración del API externo:
   ```bash
   STOCK_API_URL=https://stock.ds.frre.utn.edu.ar/v1
   STOCK_API_TIMEOUT=5000
   STOCK_API_RETRY_ATTEMPTS=3
   ```

3. **Redis (opcional)**: Para tests completos de cache, Redis debería estar corriendo:
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

## Tests Disponibles

### Health Check (5 tests)
- Verifica que `/health` responda correctamente
- Valida estructura de respuesta
- Verifica timestamp ISO
- Verifica información del servicio
- Verifica tiempo de respuesta

### Integración con API Externa (5 tests)
- Verifica endpoint raíz `/`
- Verifica configuración del API externo
- Verifica capacidades del servicio
- Manejo de errores cuando API externa no está disponible
- Configuración de timeout y retry

### Circuit Breaker (5 tests)
- Estado inicial CLOSED
- Información del circuit breaker en health check
- Respuesta por defecto cuando está OPEN
- Configuración de threshold y timeout
- Manejo de múltiples requests

### Cache (4 tests)
- Información del cache en health check
- Performance en requests repetidos (cache hit)
- Configuración de TTL
- Manejo cuando cache no está disponible

### Retry Logic (5 tests)
- Configuración de retry expuesta
- Configuración de timeout
- Requests válidos sin retry
- Manejo de timeouts
- Información de retry en métricas

### API Gateway (5 tests)
- Health check a través del gateway
- Headers de request ID
- Endpoint raíz a través del gateway
- Manejo de errores de routing
- Estado del gateway

**Total: 29 tests**

## Notas

- Los tests del gateway requieren que el Operator Interface Service esté corriendo en el puerto 3004
- Algunos tests pueden hacer skip si el servicio requerido no está disponible
- Los tests están diseñados para ser independientes y ejecutables en paralelo

