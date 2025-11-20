import { test, expect } from '@playwright/test';

/**
 * Tests para POST /shipping/cost
 * Endpoint para calcular el costo de envío sin crear recursos
 * @see openapilog.yaml - /shipping/cost
 */
test.describe('Shipping Service - Calcular Costo de Envío', () => {
  const validRequest = {
    delivery_address: {
      street: 'Av. Dirac 1234',
      city: 'Resistencia',
      state: 'Chaco',
      postal_code: 'H3500ABC',
      country: 'AR',
    },
    products: [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ],
  };

  test('debería calcular el costo de envío correctamente', async ({ request }) => {
    const response = await request.post('/shipping/cost', {
      data: validRequest,
    });

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('currency');
    expect(body).toHaveProperty('total_cost');
    expect(body).toHaveProperty('transport_type');
    expect(body).toHaveProperty('products');

    // Validar tipos
    expect(typeof body.currency).toBe('string');
    expect(typeof body.total_cost).toBe('number');
    expect(typeof body.transport_type).toBe('string');
    expect(Array.isArray(body.products)).toBe(true);

    // Validar que total_cost sea positivo
    expect(body.total_cost).toBeGreaterThan(0);

    // Validar estructura de productos en la respuesta
    if (body.products.length > 0) {
      body.products.forEach((product: any) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('cost');
        expect(typeof product.id).toBe('number');
        expect(typeof product.cost).toBe('number');
        expect(product.cost).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test('debería validar campos requeridos - falta delivery_address', async ({ request }) => {
    const invalidRequest = {
      products: [{ id: 1, quantity: 1 }],
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar campos requeridos - falta products', async ({ request }) => {
    const invalidRequest = {
      delivery_address: validRequest.delivery_address,
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar formato de código postal argentino', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      delivery_address: {
        ...validRequest.delivery_address,
        postal_code: 'INVALID', // Formato inválido
      },
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar que products no esté vacío', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      products: [],
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar que quantity sea mayor a 0', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      products: [{ id: 1, quantity: 0 }],
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería validar formato de country (ISO 3166-1 alpha-2)', async ({ request }) => {
    const invalidRequest = {
      ...validRequest,
      delivery_address: {
        ...validRequest.delivery_address,
        country: 'ARGENTINA', // Debe ser código de 2 letras
      },
    };

    const response = await request.post('/shipping/cost', {
      data: invalidRequest,
    });

    expect([400, 422]).toContain(response.status());
  });

  test('debería retornar estructura de respuesta completa', async ({ request }) => {
    const response = await request.post('/shipping/cost', {
      data: validRequest,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validar todos los campos según schema
    expect(body).toHaveProperty('currency');
    expect(body).toHaveProperty('total_cost');
    expect(body).toHaveProperty('transport_type');
    expect(body).toHaveProperty('products');

    // Validar que transport_type sea uno de los valores válidos
    expect(['air', 'sea', 'rail', 'road']).toContain(body.transport_type);

    // Validar que currency sea un código válido
    expect(typeof body.currency).toBe('string');
    expect(body.currency.length).toBeGreaterThan(0);
  });

  test('debería manejar múltiples productos correctamente', async ({ request }) => {
    const requestWithMultipleProducts = {
      ...validRequest,
      products: [
        { id: 1, quantity: 3 },
        { id: 2, quantity: 2 },
        { id: 3, quantity: 1 },
      ],
    };

    const response = await request.post('/shipping/cost', {
      data: requestWithMultipleProducts,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.products.length).toBeGreaterThanOrEqual(3);
    expect(body.total_cost).toBeGreaterThan(0);
  });
});

