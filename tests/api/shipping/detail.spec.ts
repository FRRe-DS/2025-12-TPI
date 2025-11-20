import { test, expect } from '@playwright/test';

/**
 * Tests para GET /shipping/{shipping_id}
 * Endpoint para obtener detalles completos de un envío
 * @see openapilog.yaml - /shipping/{shipping_id} (GET)
 */
test.describe('Shipping Service - Detalle de Envío', () => {
  let createdShippingId: number | null = null;

  // Helper para crear un envío antes de obtener su detalle
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
      const response = await request.post('/shipping', {
        data: createRequest,
      });

      if (response.status() === 201) {
        const body = await response.json();
        createdShippingId = body.shipping_id;
      }
    } catch (error) {
      // Si falla la creación, los tests se saltarán
      console.log('No se pudo crear envío de prueba:', error);
    }
  });

  test('debería retornar detalles completos de un envío existente', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('shipping_id');
    expect(body).toHaveProperty('order_id');
    expect(body).toHaveProperty('user_id');
    expect(body).toHaveProperty('delivery_address');
    expect(body).toHaveProperty('departure_address');
    expect(body).toHaveProperty('products');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('transport_type');
    expect(body).toHaveProperty('estimated_delivery_at');
    expect(body).toHaveProperty('created_at');
    expect(body).toHaveProperty('updated_at');
    expect(body).toHaveProperty('logs');
  });

  test('debería retornar estructura completa de direcciones', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    // Validar delivery_address
    expect(body.delivery_address).toHaveProperty('street');
    expect(body.delivery_address).toHaveProperty('city');
    expect(body.delivery_address).toHaveProperty('state');
    expect(body.delivery_address).toHaveProperty('postal_code');
    expect(body.delivery_address).toHaveProperty('country');

    // Validar departure_address
    expect(body.departure_address).toHaveProperty('street');
    expect(body.departure_address).toHaveProperty('city');
    expect(body.departure_address).toHaveProperty('state');
    expect(body.departure_address).toHaveProperty('postal_code');
    expect(body.departure_address).toHaveProperty('country');
  });

  test('debería retornar historial completo de logs', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    expect(Array.isArray(body.logs)).toBe(true);

    body.logs.forEach((log: any) => {
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('status');
      expect(log).toHaveProperty('message');

      expect(typeof log.timestamp).toBe('string');
      expect(typeof log.status).toBe('string');
      expect(typeof log.message).toBe('string');

      // Validar formato de fecha ISO 8601
      const timestamp = new Date(log.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();

      // Validar que status sea uno de los valores válidos
      expect([
        'created',
        'reserved',
        'in_transit',
        'delivered',
        'cancelled',
        'in_distribution',
        'arrived',
      ]).toContain(log.status);
    });
  });

  test('debería retornar información de tracking si está disponible', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    // tracking_number y carrier_name pueden ser opcionales según el estado
    if (body.tracking_number) {
      expect(typeof body.tracking_number).toBe('string');
      expect(body.tracking_number.length).toBeGreaterThan(0);
    }

    if (body.carrier_name) {
      expect(typeof body.carrier_name).toBe('string');
      expect(body.carrier_name.length).toBeGreaterThan(0);
    }
  });

  test('debería retornar información de costo si está disponible', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    // total_cost y currency pueden estar disponibles
    if (body.total_cost !== undefined) {
      expect(typeof body.total_cost).toBe('number');
      expect(body.total_cost).toBeGreaterThanOrEqual(0);
    }

    if (body.currency) {
      expect(typeof body.currency).toBe('string');
      expect(body.currency.length).toBeGreaterThan(0);
    }
  });

  test('debería retornar 404 para envío inexistente', async ({ request }) => {
    const nonExistentId = 999999;
    const response = await request.get(`/shipping/${nonExistentId}`);

    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();

    const body = await response.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
  });

  test('debería validar que shipping_id sea un número válido', async ({ request }) => {
    const response = await request.get('/shipping/invalid-id');

    expect([400, 404]).toContain(response.status());
  });

  test('debería retornar estructura completa de productos', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);

    body.products.forEach((product: any) => {
      expect(product).toHaveProperty('product_id');
      expect(product).toHaveProperty('quantity');
      expect(typeof product.product_id).toBe('number');
      expect(typeof product.quantity).toBe('number');
      expect(product.quantity).toBeGreaterThan(0);
    });
  });

  test('debería retornar fechas en formato ISO 8601', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    // Validar formato de todas las fechas
    const dates = [
      body.estimated_delivery_at,
      body.created_at,
      body.updated_at,
    ];

    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      expect(date.getTime()).not.toBeNaN();
      expect(date.toISOString()).toBe(dateStr);
    });
  });

  test('debería retornar status válido', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    expect([
      'created',
      'reserved',
      'in_transit',
      'delivered',
      'cancelled',
      'in_distribution',
      'arrived',
    ]).toContain(body.status);
  });

  test('debería retornar transport_type válido', async ({ request }) => {
    test.skip(!createdShippingId, 'No se pudo crear envío de prueba');

    const response = await request.get(`/shipping/${createdShippingId}`);
    const body = await response.json();

    expect(['air', 'sea', 'rail', 'road']).toContain(body.transport_type);
  });
});

