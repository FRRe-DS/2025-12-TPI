# 💰 Cálculo del Costo Final del Envío

## 📋 Resumen Ejecutivo

El sistema calcula el costo del envío mediante una fórmula basada en **3 componentes principales**:
1. **Tarifa Base** (costo fijo)
2. **Costo por Peso** (peso facturable × costo por kg)
3. **Costo por Distancia** (distancia × costo por km)

### Fórmula Final

```
Costo Total = Tarifa Base + (Peso Facturable × Costo por kg) + (Distancia × Costo por km)
```

---

## 🔄 Proceso de Cálculo Paso a Paso

### Paso 1: Determinar el Peso Facturable

El sistema calcula **dos tipos de peso** y usa el **mayor entre ambos**:

#### A. Peso Físico Real
- Suma del peso real de todos los productos
- Fórmula: `Σ (peso_producto × cantidad)` para todos los productos

#### B. Peso Volumétrico
- Calculado a partir de las dimensiones (largo × ancho × alto)
- Fórmula: `(Volumen en m³) × Factor Volumétrico`

**Ejemplo:**
```typescript
// Dimensiones en cm: 50cm × 30cm × 40cm
volumen_m3 = (50 × 30 × 40) / 1,000,000 = 0.06 m³

// Factor volumétrico (configurado en tariff_configs)
factor_volumetrico = 167 (ejemplo)

peso_volumetrico = 0.06 × 167 = 10.02 kg
```

#### C. Peso Facturable (Billable Weight)
```typescript
peso_facturable = Math.max(peso_fisico_real, peso_volumetrico)
```

**Razón:** Se cobra por el mayor entre peso real y volumétrico, ya que un paquete grande pero liviano ocupa espacio que podría usarse para otros envíos.

---

### Paso 2: Calcular la Distancia

El sistema calcula la distancia entre origen y destino usando códigos postales:

#### A. Consulta a Cache
- Primero busca en cache si ya se calculó esta ruta

#### B. API Externa (si está configurada)
- Consulta servicios como:
  - Google Maps Distance Matrix API
  - Distance Matrix AI
  - OpenRouteService
- Si falla, continúa al siguiente paso

#### C. Cálculo Manual (Fallback)
- Usa coordenadas predefinidas para códigos postales argentinos
- Calcula distancia usando fórmula de Haversine (geolib)
- Si no encuentra coordenadas, usa 500 km por defecto

**Coordenadas Predefinidas (ejemplos):**
- CABA (C1000AAA): -34.6037, -58.3816
- Rosario (S2000ABC): -32.9442, -60.6505
- Córdoba (X5000ABC): -31.4201, -64.1888

**Fórmula Haversine:**
```typescript
distancia_km = haversine(origen_lat, origen_lon, destino_lat, destino_lon) / 1000
```

---

### Paso 3: Obtener Configuración de Tarifas

El sistema busca la configuración de tarifas activa desde la base de datos:

**Tabla:** `tariff_configs`

**Filtros aplicados:**
- `transport_method_id`: Método de transporte (ROAD, AIR, SEA, etc.)
- `environment`: development, testing, production
- `is_active = true`
- `valid_from <= ahora`
- `valid_to IS NULL OR valid_to >= ahora`

**Campos de la tarifa:**
- `base_tariff`: Tarifa base (costo fijo)
- `cost_per_kg`: Costo por kilogramo
- `cost_per_km`: Costo por kilómetro
- `volumetric_factor`: Factor para cálculo de peso volumétrico

---

### Paso 4: Calcular los Costos

Una vez obtenidos todos los datos, se calcula:

```typescript
// Obtener valores de la configuración de tarifa
baseTariff = Number(tariffConfig.baseTariff);
costPerKg = Number(tariffConfig.costPerKg);
costPerKm = Number(tariffConfig.costPerKm);

// Calcular componentes
weightCost = billableWeight * costPerKg;
distanceCost = distance * costPerKm;

// Costo total
totalCost = baseTariff + weightCost + distanceCost;

// Redondear a 2 decimales
totalCost = Math.round(totalCost * 100) / 100;
```

---

## 📊 Ejemplo Práctico de Cálculo

### Datos de Entrada:
- **Origen**: Buenos Aires (C1000AAA)
- **Destino**: Rosario (S2000ABC)
- **Productos**: 
  - Producto 1: 5kg, dimensiones 50×30×40 cm, cantidad 2
  - Producto 2: 3kg, sin dimensiones, cantidad 1
- **Método de transporte**: ROAD

### Cálculo:

#### 1. Peso Físico Real:
```
Producto 1: 5kg × 2 = 10kg
Producto 2: 3kg × 1 = 3kg
─────────────────────────
Total: 13kg
```

#### 2. Peso Volumétrico:
```
Producto 1:
  Volumen = (50 × 30 × 40) / 1,000,000 = 0.06 m³
  Peso vol = 0.06 × 167 = 10.02 kg
  Total con cantidad: 10.02 × 2 = 20.04 kg

Producto 2: Sin dimensiones → 0kg
─────────────────────────────────
Total volumétrico: 20.04 kg
```

#### 3. Peso Facturable:
```
Math.max(13kg, 20.04kg) = 20.04 kg
```

#### 4. Distancia:
```
Buenos Aires → Rosario = 300 km (aproximado)
```

#### 5. Tarifas (ejemplo de tariff_configs):
```
base_tariff = 500 ARS
cost_per_kg = 50 ARS
cost_per_km = 5 ARS
```

#### 6. Cálculo Final:
```
Costo por peso = 20.04 × 50 = 1,002 ARS
Costo por distancia = 300 × 5 = 1,500 ARS
Tarifa base = 500 ARS
───────────────────────────────────────
COSTO TOTAL = 3,002 ARS
```

---

## 🔍 Archivos Relacionados

### Backend

1. **TariffCalculationService**
   - 📁 `backend/services/shipping-service/src/services/tariff-calculation.service.ts`
   - **Responsabilidad**: Calcula tarifas usando configuración de base de datos
   - **Método principal**: `calculateTariff()`

2. **DistanceCalculationService**
   - 📁 `backend/services/shipping-service/src/services/distance-calculation.service.ts`
   - **Responsabilidad**: Calcula distancia entre códigos postales
   - **Método principal**: `calculateDistance()`

3. **ShippingService**
   - 📁 `backend/services/shipping-service/src/shipping.service.ts`
   - **Responsabilidad**: Orquesta todo el proceso de cálculo
   - **Método principal**: `calculateCostFromDetailedRequest()`

### Base de Datos

1. **Tabla: `tariff_configs`**
   ```sql
   - id (UUID)
   - transport_method_id (UUID) → transport_methods
   - base_tariff (DECIMAL 10,2)
   - cost_per_kg (DECIMAL 10,2)
   - cost_per_km (DECIMAL 10,2)
   - volumetric_factor (INT)
   - environment (VARCHAR)
   - is_active (BOOLEAN)
   - valid_from (TIMESTAMP)
   - valid_to (TIMESTAMP)
   ```

2. **Tabla: `transport_methods`**
   ```sql
   - id (UUID)
   - code (VARCHAR) → 'ROAD', 'AIR', 'SEA', etc.
   - name (VARCHAR)
   - average_speed (INT)
   - estimated_days (VARCHAR)
   - base_cost_per_km (DECIMAL)
   - base_cost_per_kg (DECIMAL)
   ```

---

## 🎯 Factores que Afectan el Costo

### 1. **Peso del Paquete**
- Mayor peso → Mayor costo
- Si el peso volumétrico es mayor que el real, se cobra por el volumétrico

### 2. **Distancia**
- Mayor distancia → Mayor costo
- Calculada por códigos postales usando coordenadas geográficas

### 3. **Método de Transporte**
- Cada método (ROAD, AIR, SEA) tiene sus propias tarifas
- Afecta: tarifa base, costo por kg, costo por km

### 4. **Configuración de Tarifas**
- Puede variar por ambiente (development, testing, production)
- Tiene validez temporal (valid_from, valid_to)
- Puede estar activa o inactiva

### 5. **Dimensiones del Paquete**
- Paquetes grandes pero livianos pagarán por peso volumétrico
- El factor volumétrico está configurado en la tarifa

---

## 🔄 Fallback y Modo Mock

Si no se encuentra configuración de tarifa válida, el sistema usa cálculos mock:

### Modo Mock (MockDataService)
- Usa tarifas hardcodeadas por tipo de transporte:
  - STANDARD: baseRate, perKm, perKg
  - EXPRESS: tarifas más altas
  - OVERNIGHT: tarifas más altas aún
- **Incluye impuestos**: 24% (21% IVA + 3% otros)

**Fórmula Mock:**
```typescript
subtotal = baseRate + (distance × perKm) + (weight × perKg)
taxes = subtotal × 0.24
total = subtotal + taxes
```

---

## 📈 Breakdown del Costo (Desglose)

El sistema retorna un breakdown detallado:

```typescript
{
  total_cost: 3002.00,
  breakdown: {
    baseCost: 500.00,           // Tarifa base
    weightCost: 1002.00,        // Costo por peso
    distanceCost: 1500.00,      // Costo por distancia
    billableWeight: 20.04,      // Peso facturable usado
    volumetricWeight: 20.04,    // Peso volumétrico calculado
    products_cost: 0,           // Costo de productos (si aplica)
    shipping_cost: 3002.00,     // Costo total de envío
    distance_km: 300,           // Distancia en kilómetros
    weight_kg: 13.00            // Peso físico real
  }
}
```

---

## 🔐 Validaciones y Errores

### Validaciones Implementadas:

1. **Peso del producto**:
   - Debe ser un número
   - Debe ser mayor a 0

2. **Dimensiones**:
   - Opcionales, pero si se proveen deben ser válidas

3. **Códigos postales**:
   - Se formatean automáticamente
   - Deben ser válidos

4. **Método de transporte**:
   - Si no existe, se usa fallback mock
   - Se normaliza a mayúsculas (ROAD, AIR, etc.)

### Manejo de Errores:

- Si falla la API de distancia → Usa cálculo manual
- Si no encuentra tarifa → Usa cálculo mock
- Si no encuentra coordenadas → Usa 500 km por defecto
- Todos los errores se registran en logs

---

## 💡 Mejoras Futuras Sugeridas

1. **Descuentos por Volumen**
   - Aplicar descuentos cuando hay múltiples productos
   - Descuentos por cantidad de envíos

2. **Zonas Especiales**
   - Costos adicionales por zonas remotas
   - Descuentos por zonas de alta demanda

3. **Seguro de Envío**
   - Opcional, basado en valor declarado

4. **Embalaje**
   - Costo adicional por embalaje especial

5. **Horarios Especiales**
   - Costo extra por entrega en horarios específicos

---

## 📝 Notas Técnicas

- Los cálculos se redondean a **2 decimales**
- La distancia se redondea a **2 decimales**
- El peso se redondea a **2 decimales**
- El sistema soporta múltiples monedas (por defecto: ARS)
- Las tarifas pueden tener múltiples versiones con validez temporal

---

*Documento generado basado en análisis del código fuente*
*Última actualización: Diciembre 2025*
