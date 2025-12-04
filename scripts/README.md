# 🧪 Scripts de Testing

Scripts para probar la API de logística.

## 📋 Requisitos

- `curl` instalado
- `json_pp` instalado (para formatear JSON)
- Archivo `.env` configurado con las credenciales

## 🔧 Configuración

Crea un archivo `.env` en esta carpeta con las siguientes variables:

```bash
# API Gateway URL
API_URL=https://apilogistica.mmalgor.com.ar

# Stock API URL
STOCK_API_URL=https://stock.mmalgor.com.ar/v1

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.mmalgor.com.ar
REALM=ds-2025-realm
CLIENT_ID=grupo-12
CLIENT_SECRET=tu-client-secret-aqui  # Opcional: requerido si el cliente es confidencial

# Credenciales de prueba (REQUERIDO)
TEST_USER=tu-usuario-aqui
TEST_PASSWORD=tu-password-aqui
```

### Valores por Defecto

Los scripts tienen valores por defecto para las siguientes variables:
- `API_URL`: `http://localhost:3004`
- `STOCK_API_URL`: `https://comprasg5.mmalgor.com.ar`
- `KEYCLOAK_URL`: `https://keycloak.mmalgor.com.ar`
- `REALM`: `ds-2025-realm`
- `CLIENT_ID`: `grupo-12`

**Nota:** `TEST_USER` y `TEST_PASSWORD` NO tienen valores por defecto y son requeridos.

## 🚀 Uso

### 1. Obtener Token de Autenticación

```bash
./get_token.sh
```

Este script obtiene un token de Keycloak y lo guarda en `.token` para uso en otros scripts.

### 2. Scripts de Testing

Todos los scripts cargan automáticamente las variables de entorno desde `.env`:

```bash
# Calcular costo de envío
./test_shipping_cost.sh

# Crear un envío
./test_create_shipment.sh

# Obtener detalles de un envío
./test_get_shipment.sh <shipping_id>

# Cancelar un envío
./test_cancel_shipment.sh <shipping_id>

# Listar envíos
./test_list_shipments.sh

# Listar productos (Stock API)
./test_list_products.sh

# Obtener métodos de transporte
./test_transport_methods.sh
```

## 📝 Variables de Entorno

### Variables Requeridas

- `TEST_USER`: Usuario para autenticación en Keycloak
- `TEST_PASSWORD`: Contraseña del usuario

### Variables Opcionales (con defaults)

- `API_URL`: URL del API Gateway (default: `http://localhost:3004`)
- `STOCK_API_URL`: URL de la API de Stock (default: `https://comprasg5.mmalgor.com.ar`)
- `KEYCLOAK_URL`: URL de Keycloak (default: `https://keycloak.mmalgor.com.ar`)
- `REALM`: Realm de Keycloak (default: `ds-2025-realm`)
- `CLIENT_ID`: Client ID de Keycloak (default: `grupo-12`)
- `CLIENT_SECRET`: Client Secret de Keycloak (opcional, requerido si el cliente es confidencial)

## 🔒 Seguridad

- **NO** subas el archivo `.env` a git (está en `.gitignore`)
- **NO** compartas tus credenciales
- El archivo `.token` también está en `.gitignore`

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `get_token.sh` | Obtiene token de autenticación de Keycloak |
| `test_shipping_cost.sh` | Calcula el costo de un envío |
| `test_create_shipment.sh` | Crea un nuevo envío |
| `test_get_shipment.sh` | Obtiene detalles de un envío específico |
| `test_cancel_shipment.sh` | Cancela un envío |
| `test_list_shipments.sh` | Lista todos los envíos |
| `test_list_products.sh` | Lista productos de la API de Stock |
| `test_transport_methods.sh` | Lista métodos de transporte disponibles |

## 🔧 Arquitectura de los Scripts

Todos los scripts utilizan un sistema común de carga de variables de entorno:

1. **`load_env.sh`**: Script común que carga variables de entorno desde `.env`
2. **`get_token.sh`**: Obtiene y guarda el token de autenticación
3. **Scripts de test**: Cargar `load_env.sh` y `get_token.sh`, luego ejecutan su prueba

Este diseño permite:
- Centralizar la configuración
- Reutilizar código común
- Fácil mantenimiento
- Valores por defecto sensatos

---

**Última actualización**: Diciembre 2025
