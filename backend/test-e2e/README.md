# 🧪 Backend E2E Tests

Tests de integración End-to-End para validar el flujo completo de los microservicios de logística a través del API Gateway.

## 📋 Requisitos

- **Node.js** 18+
- **pnpm** instalado
- **Entorno corriendo** (Local o Producción)

## 🚀 Configuración

1.  **Instalar dependencias**:
    ```bash
    pnpm install
    ```

2.  **Configurar variables de entorno**:
    Copia el archivo de ejemplo y ajusta las variables según tu entorno:
    ```bash
    cp .env.example .env
    ```
    
    Variables clave:
    - `GATEWAY_URL`: URL del API Gateway (ej: `https://apilogistica.mmalgor.com.ar` o `http://localhost:3004`)
    - `KEYCLOAK_URL`: URL de Keycloak para obtener tokens.
    - `USERNAME` / `PASSWORD`: Credenciales de un usuario válido en Keycloak.

## 🏃‍♂️ Ejecución

Puedes ejecutar los tests usando **pnpm**:

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar un test específico
pnpm test gateway.spec.ts
```

## 📂 Descripción de los Tests

### 1. `gateway.spec.ts` (Auth & Gateway)
Verifica la seguridad y el enrutamiento básico del Gateway.
- **🔐 Auth**: Se autentica contra Keycloak y obtiene un Token JWT.
- **🛡️ Rutas Protegidas**: Verifica que `/config/transport-methods` sea accesible con token.
- **🚫 Seguridad**: Confirma que el acceso sin token sea rechazado (401).
- **📦 Tracking**: Prueba la creación de un tracking (`/api/logistics/tracking`), validando la integración con el servicio de envíos.

### 2. `shipping-flow.spec.ts` (Flujo de Envíos)
Prueba el flujo de negocio principal de envíos.
- **🚢 Métodos de Transporte**: Obtiene la lista de métodos disponibles.
- **💰 Cotización**: Calcula el costo de envío (`/shipping/cost`) basado en origen, destino y peso.
- **🚚 Creación de Envío**: Intenta crear un envío (`/shipping`).
    - *Nota*: Si el stock es insuficiente, valida que el error sea controlado (400 Bad Request), lo cual se considera un test exitoso de integración.

## 🛠️ Solución de Problemas

- **Error 401 Unauthorized**: Verifica que las credenciales en `.env` sean correctas y el usuario tenga los roles necesarios.
- **Error 502 Bad Gateway**: El Gateway no puede conectar con los microservicios. Verifica que los servicios backend estén corriendo.
- **Error ECONNREFUSED**: La URL del Gateway es incorrecta o el servicio está caído.
