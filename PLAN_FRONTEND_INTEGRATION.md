# Plan de Integración Frontend con Backend (Microservicios)

Este plan detalla los pasos necesarios para integrar el frontend existente con la nueva arquitectura de microservicios, autenticación Keycloak y endpoints de Shipping.

## 1. Revisión de Tipos y DTOs (`frontend/src/lib/middleware/services/shipment.service.ts`)

### Problemas Identificados
1. **`CalculateQuote` incompleto**: El método `calculateQuote` no envía `transport_type` al backend, lo cual generará un error 400.
2. **Tipos de ID de Usuario**: El backend usa UUIDs (strings) para los IDs de usuario (Keycloak), pero el frontend define `user_id: number`.

### Tareas
- [ ] Modificar interfaz `CreateShipmentDTO`:
  ```typescript
  export interface CreateShipmentDTO {
    order_id: number;
    user_id: string; // Cambiar de number a string (UUID)
    delivery_address: AddressDTO;
    transport_type: 'AIR' | 'SEA' | 'RAIL' | 'ROAD';
    products: ProductDTO[];
  }
  ```
- [ ] Actualizar firma de `calculateQuote`:
  ```typescript
  async calculateQuote(
    delivery_address: AddressDTO,
    products: ProductDTO[],
    transport_type: 'AIR' | 'SEA' | 'RAIL' | 'ROAD' // Nuevo parámetro
  ): Promise<CalculateCostResponseDTO> {
    return httpClient.post('/shipping/cost', { delivery_address, products, transport_type });
  }
  ```

## 2. Integración de Autenticación Keycloak

El `AuthService` ya está configurado para usar `keycloak-js` y el `HttpClient` inyecta el token.
- [ ] Verificar que `NEXT_PUBLIC_AUTH_URL`, `NEXT_PUBLIC_AUTH_REALM`, `NEXT_PUBLIC_AUTH_CLIENT_ID` en `.env.local` (o `.env`) apunten al Keycloak correcto.
- [ ] Asegurar que el login redirija correctamente y guarde el token.

## 3. Actualización de Componentes UI

### Pantalla de Cotización/Creación de Envío
- [ ] Localizar el componente que llama a `shipmentService.calculateQuote`.
- [ ] Asegurar que el usuario haya seleccionado un método de transporte ANTES de llamar a cotizar.
- [ ] Pasar el `transport_type` seleccionado a la llamada del servicio.

### Pantalla de Tracking (Integración con Compras)
- [ ] Si existe una pantalla de tracking público, debe usar `shipmentService.getShipment(id)`.
- [ ] Manejar estados de error (404 Not Found) amigablemente.

## 4. Variables de Entorno

Asegurar que el frontend apunte al Gateway:

```env
NEXT_PUBLIC_API_URL=http://localhost:3004
# O en producción:
# NEXT_PUBLIC_API_URL=https://gateway.tudominio.com
```

## 5. Pruebas Manuales

1. **Login**: Iniciar sesión y verificar que se obtiene token.
2. **Transport Methods**: Verificar que el dropdown de métodos de transporte se llena con datos del backend (`/shipping/transport-methods`).
3. **Cotización**: Probar cotizar un envío con diferentes productos y métodos. Verificar que el precio cambia.
4. **Crear Envío**: Completar el flujo de creación y verificar que devuelve un ID de envío y Tracking Number.
5. **Tracking**: Usar el Tracking Number para consultar el estado.

---

## 6. Integración con Stock (Productos y Reservas)

- [x] Crear `stock.service.ts` con wrappers sobre el gateway (`/stock/productos`, `/stock/reservas`, `PATCH/DELETE` de reservas).
- [x] Implementar stores reactivos (`products.store.ts`, `reservas.store.ts`) para centralizar estado, errores y caching en memoria.
- [x] Exponer hooks `useProductos()` y `useReservas()` para que las páginas lean del store en lugar de hacer `fetch` directo al API externo.
- [x] Refactorizar `productos/page.tsx` y `reservas/page.tsx` para usar los hooks y mostrar `lastUpdatedAt` desde el store.
- [x] Añadir pruebas E2E en el gateway (`stock.catalog.e2e.spec.ts`) para verificar que los nuevos endpoints proxied están disponibles y propagan errores adecuadamente.
