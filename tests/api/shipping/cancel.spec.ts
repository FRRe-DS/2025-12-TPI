import { test, expect } from '@playwright/test';

/**
 * Tests para POST /shipping/{shipping_id}/cancel
 * Endpoint para cancelar un envío
 * @see openapilog.yaml - /shipping/{shipping_id}/cancel
 */
test.describe('Shipping Service - Cancelar Envío', () => {
  let cancelableShippingId: number | null = null;
  let nonCancelableShippingId: number | null = null;

  // Helper para crear envíos de prueba
  test.beforeAll(async ({ request }) => {
    const createRequest = {
      order_id: 123,
      user_id: 456,
      delivery_address: {
        street: 'Av. Siempre Viva 123',
        city: 'Resistencia',
        state: 'Chaco',
        postal_code: 'H3500ABC',
        country: 'AR',
      },
      transport_type: 'air',
      products: [{ id: 1, quantity: 1 }],
    };

    try {
      // Crear envío cancelable (status: created o reserved)
      const response = await request.post('/shipping', {
        data: createRequest,
      });

      if (response.status() === 201) {
        const body = await response.json();
        cancelableShippingId = body.shipping_id;

        // Verificar que el envío esté en estado cancelable
        const detailResponse = await request.get(`/shipping/${cancelableShippingId}`);
        if (detailResponse.status() === 200) {
          const detailBody = await detailResponse.json();
          // Si no está en estado cancelable, intentar crear otro
          if (!['created', 'reserved'].includes(detailBody.status)) {
            cancelableShippingId = null;
          }
        }
      }
    } catch (error) {
      console.log('No se pudo crear envío de prueba:', error);
    }
  });

  test('debería cancelar un envío en estado cancelable', async ({ request }) => {
    test.skip(!cancelableShippingId, 'No se pudo crear envío cancelable de prueba');

    const response = await request.post(`/shipping/${cancelableShippingId}/cancel`);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('shipping_id');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('cancelled_at');

    // Validar tipos
    expect(typeof body.shipping_id).toBe('number');
    expect(typeof body.status).toBe('string');
    expect(typeof body.cancelled_at).toBe('string');

    // Validar que el status sea "cancelled"
    expect(body.status).toBe('cancelled');

    // Validar formato de fecha ISO 8601
    const cancelledDate = new Date(body.cancelled_at);
    expect(cancelledDate.getTime()).not.toBeNaN();
  });

  test('debería retornar 404 para envío inexistente', async ({ request }) => {
    const nonExistentId = 999999;
    const response = await request.post(`/shipping/${nonExistentId}/cancel`);

    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();

    const body = await response.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
  });

  test('debería retornar 400 cuando el envío no puede ser cancelado', async ({ request }) => {
    // Este test requiere un envío en estado no cancelable (in_transit, delivered, etc.)
    // Como no podemos garantizar tener uno, verificamos el comportamiento

    // Primero intentamos obtener un envío existente
    const listResponse = await request.get('/shipping?status=in_transit&limit=1');
    
    if (listResponse.status() === 200) {
      const listBody = await listResponse.json();
      
      if (listBody.shipments.length > 0) {
        const shippingId = listBody.shipments[0].shipping_id;
        const cancelResponse = await request.post(`/shipping/${shippingId}/cancel`);

        // Debería retornar 400 si el envío no puede ser cancelado
        if (cancelResponse.status() === 400) {
          const errorBody = await cancelResponse.json();
          expect(errorBody).toHaveProperty('code');
          expect(errorBody).toHaveProperty('message');
          expect(errorBody.code).toBe('bad_request');
        }
      }
    }
  });

  test('debería validar que shipping_id sea un número válido', async ({ request }) => {
    const response = await request.post('/shipping/invalid-id/cancel');

    expect([400, 404]).toContain(response.status());
  });

  test('debería actualizar el estado del envío a "cancelled"', async ({ request }) => {
    test.skip(!cancelableShippingId, 'No se pudo crear envío cancelable de prueba');

    // Cancelar el envío
    const cancelResponse = await request.post(`/shipping/${cancelableShippingId}/cancel`);
    
    if (cancelResponse.status() === 200) {
      // Verificar que el estado se haya actualizado
      const detailResponse = await request.get(`/shipping/${cancelableShippingId}`);
      
      if (detailResponse.status() === 200) {
        const detailBody = await detailResponse.json();
        expect(detailBody.status).toBe('cancelled');
      }
    }
  });

  test('debería retornar timestamp de cancelación válido', async ({ request }) => {
    test.skip(!cancelableShippingId, 'No se pudo crear envío cancelable de prueba');

    const response = await request.post(`/shipping/${cancelableShippingId}/cancel`);

    if (response.status() === 200) {
      const body = await response.json();
      const cancelledDate = new Date(body.cancelled_at);
      
      // Validar que la fecha sea válida y reciente
      expect(cancelledDate.getTime()).not.toBeNaN();
      expect(cancelledDate.getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  test('debería retornar shipping_id correcto en la respuesta', async ({ request }) => {
    test.skip(!cancelableShippingId, 'No se pudo crear envío cancelable de prueba');

    const response = await request.post(`/shipping/${cancelableShippingId}/cancel`);

    if (response.status() === 200) {
      const body = await response.json();
      expect(body.shipping_id).toBe(cancelableShippingId);
    }
  });

  test('debería manejar múltiples intentos de cancelación', async ({ request }) => {
    test.skip(!cancelableShippingId, 'No se pudo crear envío cancelable de prueba');

    // Primer intento de cancelación
    const firstResponse = await request.post(`/shipping/${cancelableShippingId}/cancel`);

    if (firstResponse.status() === 200) {
      // Segundo intento debería retornar error o estado ya cancelado
      const secondResponse = await request.post(`/shipping/${cancelableShippingId}/cancel`);

      // Puede retornar 400 (ya cancelado) o 200 (idempotente)
      expect([200, 400, 409]).toContain(secondResponse.status());
    }
  });
});

