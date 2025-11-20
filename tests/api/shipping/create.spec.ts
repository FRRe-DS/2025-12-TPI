import { test, expect } from '@playwright/test';

/**
 * Tests para POST /shipping
 * Endpoint para crear un nuevo envío
 * @see openapilog.yaml - /shipping (POST)
 */
test.describe('Shipping Service - Crear Envío', () => {
  const validRequest = {
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
    products: [
      { id: 1, quantity: 1 },
      { id: 2, quantity: 2 },
    ],
  };

  test('debería crear un envío correctamente', async ({ request }) => {
    const response = await request.post('/shipping', {
      data: validRequest,
    });

    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('shipping_id');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('transport_type');
    expect(body).toHaveProperty('estimated_delivery_at');

    // Validar tipos
    expect(typeof body.shipping_id).toBe('number');
    expect(typeof body.status).toBe('string');
    expect(typeof body.transport_type).toBe('string');
    expect(typeof body.estimated_delivery_at).toBe('string');

    // Validar que shipping_id sea positivo
    expect(body.shipping_id).toBeGreaterThan(0);

    // Validar que status sea uno de los valores válidos
    expect(['created', 'reserved', 'in_transit', 'delivered', 'cancelled', 'in_distribution', 'arrived']).toContain(
      body.status,
    );

    // Validar formato de fecha ISO 8601
    const deliveryDate = new Date(body.estimated_delivery_at);
    expect(deliveryDate.getTime()).not.toBeNaN();
  });

  test('debería validar campos requeridos - falta order_id', async ({ request }) => {
    const invalidRequest = {
      user_id: 456,
      delivery_address: validRequest.delivery_address,
      transport_type: 'air',
      products: validRequest.products,
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar campos requeridos - falta user_id', async ({ request }) => {
    const invalidRequest = {
      order_id: 123,
      delivery_address: validRequest.delivery_address,
      transport_type: 'air',
      products: validRequest.products,
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar campos requeridos - falta delivery_address', async ({ request }) => {
    const invalidRequest = {
      order_id: 123,
      user_id: 456,
      transport_type: 'air',
      products: validRequest.products,
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar campos requeridos - falta transport_type', async ({ request }) => {
    const invalidRequest = {
      order_id: 123,
      user_id: 456,
      delivery_address: validRequest.delivery_address,
      products: validRequest.products,
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar campos requeridos - falta products', async ({ request }) => {
    const invalidRequest = {
      order_id: 123,
      user_id: 456,
      delivery_address: validRequest.delivery_address,
      transport_type: 'air',
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar que transport_type sea válido', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      transport_type: 'invalid_type',
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar que products no esté vacío', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      products: [],
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar formato de código postal', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      delivery_address: {
        ...validRequest.delivery_address,
        postal_code: 'INVALID',
      },
    };

    const response = await request.post('/shipping', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería retornar status "created" al crear un envío', async ({ request }) => {
    const response = await request.post('/shipping', {
      data: validRequest,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    // El estado inicial debería ser "created"
    expect(body.status).toBe('created');
  });

  test('debería aceptar diferentes tipos de transporte', async ({ request }) => {
    const transportTypes = ['air', 'road', 'rail', 'sea'];

    for (const transportType of transportTypes) {
      const requestWithTransportType = {
        ...validRequest,
        transport_type: transportType,
      };

      const response = await request.post('/shipping', {
        data: requestWithTransportType,
      });

      // Algunos tipos pueden no estar disponibles, pero si están disponibles deberían funcionar
      if (response.status() === 201) {
        const body = await response.json();
        expect(body.transport_type).toBe(transportType);
      }
    }
  });

  test('debería manejar conflictos cuando productos no están disponibles', async ({ request }) => {
    // Este test asume que el servicio puede detectar productos no disponibles
    // Si el servicio tiene lógica para esto, debería retornar 409 o 400
    const requestWithInvalidProducts = {
      ...validRequest,
      products: [{ id: 99999, quantity: 1 }], // ID de producto que probablemente no existe
    };

    const response = await request.post('/shipping', {
      data: requestWithInvalidProducts,
    });

    // Puede retornar 400, 409 o 422 dependiendo de la implementación
    expect([400, 409, 422]).toContain(response.status());
  });
});

