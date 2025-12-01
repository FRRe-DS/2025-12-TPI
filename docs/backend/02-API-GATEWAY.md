# 🔌 Backend - API Gateway (Operator Interface Service)

Documentación detallada del Gateway que utiliza **Facade Pattern + Service Discovery**.

---

## 📋 Visión General

El **Operator Interface Service** (puerto :3004) es el único endpoint que el frontend conoce. Utiliza descubrimiento dinámico de servicios para rutear automáticamente requests a los microservicios correctos.

**Beneficios:**
- ✅ Frontend desacoplado de topología backend
- ✅ Agregar servicios sin cambiar frontend
- ✅ Reintentos automáticos en fallos transitorios
- ✅ Health checks automáticos cada 30 segundos
- ✅ Manejo consistente de errores

---

## 🏗️ Arquitectura del Gateway

```
Request → Frontend (http://localhost:3000)
           ↓
    NEXT_PUBLIC_API_URL = http://localhost:3004
           ↓
ProxyController (@All('*'))
           ↓
ServiceFacade.request()
           ↓
ServiceRegistry.findServiceByRoute()
           ↓
Identifica servicio correcto
           ↓
HTTP request a microservicio
           ↓
Reintentos automáticos si falla
           ↓
Response al cliente
```

---

## 🔧 Componentes Principales

### 1. ServiceRegistry (Service Discovery)

**Ubicación:** `backend/services/operator-interface-service/src/core/service-registry.ts`

**Responsabilidades:**
- Registrar servicios disponibles
- Detectar cambios de estado (health checks)
- Mapear rutas a servicios
- Marcar servicios como healthy/unhealthy

**Servicios Registrados:**

```typescript
{
  name: 'config-service',
  baseUrl: 'http://localhost:3003',
  routes: ['/config'],
  healthCheckUrl: '/health',
  isHealthy: true,
  lastHealthCheck: Date
}
```

**Métodos Principales:**

```typescript
// Registrar nuevo servicio
registerService(
  name: string,
  baseUrl: string,
  routes: string[],
  healthCheckUrl: string
): void

// Encontrar servicio por ruta
findServiceByRoute(path: string): RegisteredService | undefined
  // Ejemplo: '/config/transport-methods' → busca '/config' → retorna config-service

// Obtener todos servicios
getAllServices(): RegisteredService[]

// Marcar servicio como no saludable
markServiceUnhealthy(serviceName: string): void
```

**Health Check:**
```typescript
// Se ejecuta cada 30 segundos
private async checkAllServicesHealth(): Promise<void> {
  for (const service of this.services.values()) {
    try {
      const response = await this.fetchWithTimeout(
        `${service.baseUrl}${service.healthCheckUrl}`,
        5000  // timeout 5 segundos
      );
      service.isHealthy = response.ok;
      service.lastHealthCheck = new Date();
    } catch (error) {
      service.isHealthy = false;
      service.lastHealthCheck = new Date();
    }
  }
}
```

---

### 2. ServiceFacade (Patrón Facade)

**Ubicación:** `backend/services/operator-interface-service/src/core/service-facade.ts`

**Responsabilidades:**
- Orquestar llamadas a servicios
- Implementar reintentos automáticos
- Transformar errores a formato consistente
- Verificar salud del servicio

**Método Principal:**

```typescript
async request<T>(
  method: string,              // GET, POST, PATCH, DELETE, etc
  path: string,                // /config/transport-methods
  data?: any,                  // Body para POST/PATCH
  headers?: Record<string, string>  // Headers adicionales
): Promise<T>
```

**Flujo de Ejecución:**

```
1. Encontrar servicio vía ServiceRegistry
   ↓
2. Si servicio no encontrado → Lanzar NotFoundException (404)
   ↓
3. Verificar salud del servicio
   ↓
4. Hacer request HTTP con timeout (10 segundos)
   ↓
5. Si success (200-299) → Retornar data
   ↓
6. Si fallo transitorio (5xx, 429, 503, 504) y no es último intento
   → Esperar 1 segundo y reintentar
   ↓
7. Si todos reintentos fallan
   → Marcar servicio como unhealthy
   → Lanzar BadGatewayException (502)
```

**Configuración de Reintentos:**

```typescript
private readonly maxRetries = 2;           // Máximo 2 reintentos (3 intentos total)
private readonly retryDelay = 1000;        // 1 segundo de espera entre reintentos

// Estados que pueden reintentar
const retryableStatus = [408, 429, 500, 502, 503, 504];

// Estados que NO reintentam
// 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found)
```

**Transformación de Errores:**

```typescript
throw new BadGatewayException({
  message: `Service ${service.name} failed`,
  originalError: error.message,
  statusCode: statusCode || 502,
});
```

---

### 3. ProxyController (Router Inteligente)

**Ubicación:** `backend/services/operator-interface-service/src/core/proxy.controller.ts`

**Responsabilidades:**
- Capturar todos los requests no manejados
- Delegar a ServiceFacade
- Retornar respuestas con status correcto
- Proporcionar endpoint de debugging

**Rutas:**

```typescript
// Captura TODAS las rutas no manejadas
@All('*')
async proxyRequest(@Req() req: Request, @Res() res: Response)

// Debug: Ver status de servicios
@All('/gateway/status')
getStatus()
```

**Filtrado de Headers:**

```typescript
private extractRelevantHeaders(headers: Record<string, any>): Record<string, string> {
  const relevantHeaders = [
    'authorization',           // JWT token
    'content-type',           // application/json
    'accept',                 // Accept headers
    'accept-language',        // Idioma
    'user-agent',             // Browser info
    'x-request-id',           // Request ID para logging
    'x-correlation-id',       // Correlación distribuida
  ];

  // Solo pasar estos headers al servicio destino
  // Evita pasar headers internos de Express (host, connection, etc)
}
```

**Manejo de Errores:**

```typescript
// 404 - Service not found
if (error instanceof NotFoundException) {
  return res.status(404).json({
    statusCode: 404,
    message: error.message,
  });
}

// 502 - Bad gateway
if (error instanceof BadGatewayException) {
  return res.status(502).json(error.getResponse());
}

// Otros errores
return res.status(502).json({
  statusCode: 502,
  message: 'Bad Gateway - Unexpected error',
  error: error.message,
});
```

---

### 4. CoreModule (Empaquetamiento)

**Ubicación:** `backend/services/operator-interface-service/src/core/core.module.ts`

```typescript
@Module({
  imports: [HttpModule],
  controllers: [ProxyController],
  providers: [ServiceRegistry, ServiceFacade],
  exports: [ServiceRegistry, ServiceFacade],
})
export class CoreModule implements OnModuleDestroy {
  constructor(private serviceRegistry: ServiceRegistry) {}

  // Limpiar resources cuando módulo se destruye
  onModuleDestroy() {
    this.serviceRegistry.destroy();  // Detiene health checks
  }
}
```

---

## 🔄 Flujos Completos

### Caso 1: Request Exitoso

```
GET /config/transport-methods
        ↓
ProxyController recibe
Logs: 🔄 Proxy: GET /config/transport-methods
        ↓
ServiceFacade.request(GET, /config/transport-methods)
        ↓
ServiceRegistry.findServiceByRoute('/config')
Encuentra: config-service @ http://localhost:3003
        ↓
Verifica isHealthy = true (último check: 30s atrás)
        ↓
HTTP GET http://localhost:3003/config/transport-methods
Logs: 📤 GET http://localhost:3003/config/transport-methods (attempt 1/3)
        ↓
Response 200 OK + data
        ↓
Logs: ✅ GET http://localhost:3003/... → 200
        ↓
Retorna data al cliente
```

### Caso 2: Fallo Transitorio (Reintento)

```
GET /shipping/shipments
        ↓
ProxyController recibe
        ↓
ServiceFacade intenta: HTTP GET http://localhost:3001/shipping/shipments
        ↓
Response: 503 Service Unavailable (config-service se reinició)
        ↓
Logs: ⚠️ Request failed (503), retrying in 1000ms...
        ↓
Espera 1 segundo
        ↓
Reintento 1: HTTP GET http://localhost:3001/shipping/shipments
Response: 200 OK + data
        ↓
Logs: ✅ GET http://localhost:3001/... → 200
        ↓
Retorna data (usuario no notó el problema!)
```

### Caso 3: Fallo Persistente (Todos los Reintentos Fallan)

```
GET /stock/inventory
        ↓
ServiceFacade intenta 3 veces (1 intento + 2 reintentos)
        ↓
Todos retornan 503
        ↓
Logs: ❌ stock-integration-service marked as unhealthy
        ↓
ServiceRegistry.markServiceUnhealthy('stock-integration-service')
        ↓
Lanza BadGatewayException
        ↓
ProxyController retorna 502 Bad Gateway
        ↓
Response:
{
  "statusCode": 502,
  "message": "Service stock-integration-service failed",
  "originalError": "connect ECONNREFUSED",
  "statusCode": 503
}
```

### Caso 4: Servicio No Registrado

```
GET /unknown/endpoint
        ↓
ServiceRegistry.findServiceByRoute('/unknown')
No encuentra servicio que maneje '/unknown'
        ↓
Retorna undefined
        ↓
Lanza NotFoundException
        ↓
ProxyController retorna 404 Not Found
        ↓
Response:
{
  "statusCode": 404,
  "message": "No service found for route: /unknown/endpoint"
}
```

---

## 📡 Endpoints del Gateway

### Monitoreo y Debugging

```
GET /gateway/status
    Retorna: Status de todos servicios registrados

    Response:
    {
      "services": [
        {
          "name": "config-service",
          "baseUrl": "http://localhost:3003",
          "routes": ["/config"],
          "isHealthy": true,
          "lastHealthCheck": "2025-10-24T12:34:56.789Z"
        },
        ...
      ],
      "timestamp": "2025-10-24T12:35:00.123Z"
    }
    Status: 200 OK

GET /health
    Retorna: Status del gateway

    Response:
    {
      "status": "ok",
      "timestamp": "2025-10-24T12:35:00.123Z"
    }
    Status: 200 OK
```

### Proxy Universal

```
* /*
    Captura TODAS las rutas que no sean /gateway/status ni /health

    Ejemplos:
    GET    /config/transport-methods    → rutea a config-service
    POST   /shipping/shipments          → rutea a shipping-service
    PATCH  /stock/inventory             → rutea a stock-integration-service

    Códigos de respuesta:
    200    Si el servicio procesa exitosamente
    404    Si no hay servicio para esta ruta
    502    Si el servicio falla (después de reintentos)
    504    Si timeout (>10 segundos)
```

---

## 🚀 Logging y Debugging

### Logs Disponibles

```
🔄 Proxy: GET /config/transport-methods
   └─ Indica que gateway recibió request

📤 GET http://localhost:3003/... (attempt 1/3)
   └─ Request siendo enviado (intento 1 de 3)

✅ GET http://localhost:3003/... → 200
   └─ Request exitoso

⚠️ Request failed (502), retrying in 1000ms...
   └─ Fallo transitorio, reintentando

❌ Service config-service marked as unhealthy
   └─ Servicio marcado como caído

❌ Service not found for route: /unknown
   └─ No hay servicio que maneje esta ruta
```

### Ver Status de Servicios

```bash
# Ver todos los servicios y su health
curl http://localhost:3004/gateway/status | jq

# Ver solo servicios unhealthy
curl http://localhost:3004/gateway/status | jq '.services[] | select(.isHealthy==false)'

# Ver última vez que se chequeó salud
curl http://localhost:3004/gateway/status | jq '.services[] | {name, lastHealthCheck}'
```

### Testear Routing

```bash
# Este debe funcionar (config-service corre en :3003)
curl http://localhost:3004/config/transport-methods

# Este fallará con 404 si stock-integration no está registrado
curl http://localhost:3004/unknown/endpoint

# Ver qué servicio maneja cada ruta
curl http://localhost:3004/gateway/status | jq '.services[] | {name, routes}'
```

---

## 🔐 Seguridad

### Headers Permitidos

Solo estos headers se pasan al servicio destino:
- `authorization` - JWT token
- `content-type` - Content type
- `accept` - Accept types
- `accept-language` - Preferred language
- `user-agent` - Browser info
- `x-request-id` - Para logging
- `x-correlation-id` - Para trazar requests distribuidos

### Headers NO Permitidos (Filtrados)

- `host` - Internal routing
- `connection` - Internal
- `content-length` - Recalculado
- Otros headers internos de Express

---

## ⚙️ Configuración

### Variables de Entorno

```env
# URL base para descubrimiento de servicios
BACKEND_BASE_URL=http://localhost

# Puerto del gateway
PORT=3004

# Node environment
NODE_ENV=development
```

### Servicios Configurados en ServiceRegistry

```typescript
const servicesConfig = [
  {
    name: 'config-service',
    baseUrl: process.env.BACKEND_BASE_URL + ':3003',
    routes: ['/config'],
    healthCheckUrl: '/health',
  },
  {
    name: 'shipping-service',
    baseUrl: process.env.BACKEND_BASE_URL + ':3001',
    routes: ['/shipping'],
    healthCheckUrl: '/health',
  },
  {
    name: 'stock-integration-service',
    baseUrl: process.env.BACKEND_BASE_URL + ':3002',
    routes: ['/stock'],
    healthCheckUrl: '/health',
  },
];
```

### Parámetros de Reintentos

```typescript
maxRetries: 2            // Total de reintentos (3 intentos)
retryDelay: 1000        // 1 segundo entre intentos
timeout: 10000          // 10 segundos timeout por request
healthCheckInterval: 30000  // 30 segundos entre health checks
```

---

## 🧪 Testing del Gateway

### Compilar Gateway

```bash
cd backend/services/operator-interface-service
npm run build
```

### Iniciar Gateway

```bash
npm run start:dev
# Logs: [Nest] 12345 - 10/24/2025, 12:30:00 PM   LOG [NestFactory] Nest application successfully started
# Logs: ✅ Registered 3 services
```

### Hacer Test Requests

```bash
# Test simple
curl -X GET http://localhost:3004/config/transport-methods

# Test con headers
curl -X GET http://localhost:3004/config/transport-methods \
  -H "X-Request-ID: req-12345" \
  -H "X-Correlation-ID: corr-67890"

# Test POST
curl -X POST http://localhost:3004/config/transport-methods \
  -H "Content-Type: application/json" \
  -d '{"name":"Marítimo","code":"SEA"}'

# Ver status
curl http://localhost:3004/gateway/status | jq
```

---

## 📈 Escalabilidad Futura

### Posibles Mejoras

1. **Circuit Breaker Pattern**
   - Fallar rápido si servicio está down
   - Recuperación automática

2. **Rate Limiting**
   - Limitar requests por cliente
   - Proteger contra abuso

3. **Caching**
   - Cache GET responses en Redis
   - Invalidación automática

4. **Load Balancing**
   - Múltiples instancias del mismo servicio
   - Round-robin o weighted distribution

5. **Consul/Eureka Integration**
   - Auto-register servicios
   - Reemplazo de registry estático

---

## 🐛 Troubleshooting

**Gateway no inicia:**
```bash
npm run start:dev
# Ver error específico en logs
```

**Servicio no rutea:**
```bash
# Verificar que servicio está registrado
curl http://localhost:3004/gateway/status

# Verificar que servicio está sano
curl http://localhost:3003/health
```

**Todos los servicios unhealthy:**
```bash
# Revisar que servicios están corriendo
ps aux | grep "node.*start:dev"

# Revisar logs de servicios individuales
npm run start:dev:config
npm run start:dev:shipping
npm run start:dev:stock
```

---

**Última actualización:** 24 de Octubre, 2025
**Responsable:** Grupo 12 TPI 2025
