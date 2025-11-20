import { test, expect } from '@playwright/test';

/**
 * Tests para GET /shipping
 * Endpoint para listar envíos con filtros opcionales
 * @see openapilog.yaml - /shipping (GET)
 */
test.describe('Shipping Service - Listar Envíos', () => {
  test('debería retornar lista de envíos sin filtros', async ({ request }) => {
    const response = await request.get('/shipping');

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('shipments');
    expect(body).toHaveProperty('pagination');

    expect(Array.isArray(body.shipments)).toBe(true);
  });

  test('debería retornar estructura de paginación correcta', async ({ request }) => {
    const response = await request.get('/shipping');
    const body = await response.json();

    expect(body.pagination).toHaveProperty('current_page');
    expect(body.pagination).toHaveProperty('total_pages');
    expect(body.pagination).toHaveProperty('total_items');
    expect(body.pagination).toHaveProperty('items_per_page');

    // Validar tipos
    expect(typeof body.pagination.current_page).toBe('number');
    expect(typeof body.pagination.total_pages).toBe('number');
    expect(typeof body.pagination.total_items).toBe('number');
    expect(typeof body.pagination.items_per_page).toBe('number');

    // Validar valores razonables
    expect(body.pagination.current_page).toBeGreaterThan(0);
    expect(body.pagination.items_per_page).toBeGreaterThan(0);
    expect(body.pagination.total_items).toBeGreaterThanOrEqual(0);
  });

  test('debería retornar estructura correcta para cada envío', async ({ request }) => {
    const response = await request.get('/shipping');
    const body = await response.json();

    if (body.shipments.length > 0) {
      body.shipments.forEach((shipment: any) => {
        // Campos requeridos según schema
        expect(shipment).toHaveProperty('shipping_id');
        expect(shipment).toHaveProperty('order_id');
        expect(shipment).toHaveProperty('user_id');
        expect(shipment).toHaveProperty('products');
        expect(shipment).toHaveProperty('status');
        expect(shipment).toHaveProperty('transport_type');
        expect(shipment).toHaveProperty('estimated_delivery_at');
        expect(shipment).toHaveProperty('created_at');

        // Validar tipos
        expect(typeof shipment.shipping_id).toBe('number');
        expect(typeof shipment.order_id).toBe('number');
        expect(typeof shipment.user_id).toBe('number');
        expect(Array.isArray(shipment.products)).toBe(true);
        expect(typeof shipment.status).toBe('string');
        expect(typeof shipment.transport_type).toBe('string');
        expect(typeof shipment.estimated_delivery_at).toBe('string');
        expect(typeof shipment.created_at).toBe('string');

        // Validar formato de fechas ISO 8601
        const deliveryDate = new Date(shipment.estimated_delivery_at);
        const createdAt = new Date(shipment.created_at);
        expect(deliveryDate.getTime()).not.toBeNaN();
        expect(createdAt.getTime()).not.toBeNaN();
      });
    }
  });

  test('debería filtrar por user_id', async ({ request }) => {
    const userId = 456;
    const response = await request.get(`/shipping?user_id=${userId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Todos los envíos deberían pertenecer al usuario especificado
    body.shipments.forEach((shipment: any) => {
      expect(shipment.user_id).toBe(userId);
    });
  });

  test('debería filtrar por status', async ({ request }) => {
    const status = 'created';
    const response = await request.get(`/shipping?status=${status}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Todos los envíos deberían tener el status especificado
    body.shipments.forEach((shipment: any) => {
      expect(shipment.status).toBe(status);
    });
  });

  test('debería filtrar por rango de fechas', async ({ request }) => {
    const fromDate = '2025-01-01';
    const toDate = '2025-12-31';
    const response = await request.get(`/shipping?from_date=${fromDate}&to_date=${toDate}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validar que las fechas de creación estén en el rango
    const from = new Date(fromDate);
    const to = new Date(toDate);

    body.shipments.forEach((shipment: any) => {
      const createdAt = new Date(shipment.created_at);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(to.getTime());
    });
  });

  test('debería soportar paginación con parámetros page y limit', async ({ request }) => {
    const page = 1;
    const limit = 10;
    const response = await request.get(`/shipping?page=${page}&limit=${limit}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.pagination.current_page).toBe(page);
    expect(body.pagination.items_per_page).toBe(limit);
    expect(body.shipments.length).toBeLessThanOrEqual(limit);
  });

  test('debería usar valores por defecto para paginación', async ({ request }) => {
    const response = await request.get('/shipping');

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Valores por defecto según OpenAPI: page=1, limit=20
    expect(body.pagination.current_page).toBe(1);
    expect(body.pagination.items_per_page).toBe(20);
  });

  test('debería validar que limit no exceda el máximo (100)', async ({ request }) => {
    const response = await request.get('/shipping?limit=150');

    // Debería retornar error o limitar a 100
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.pagination.items_per_page).toBeLessThanOrEqual(100);
    } else {
      expect([400, 422]).toContain(response.status());
    }
  });

  test('debería validar que page sea mayor a 0', async ({ request }) => {
    const response = await request.get('/shipping?page=0');

    expect([400, 422]).toContain(response.status());
  });

  test('debería combinar múltiples filtros', async ({ request }) => {
    const userId = 456;
    const status = 'created';
    const page = 1;
    const limit = 10;

    const response = await request.get(
      `/shipping?user_id=${userId}&status=${status}&page=${page}&limit=${limit}`,
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validar que se aplicaron todos los filtros
    body.shipments.forEach((shipment: any) => {
      expect(shipment.user_id).toBe(userId);
      expect(shipment.status).toBe(status);
    });

    expect(body.pagination.current_page).toBe(page);
    expect(body.pagination.items_per_page).toBe(limit);
  });

  test('debería retornar estructura de productos en cada envío', async ({ request }) => {
    const response = await request.get('/shipping');
    const body = await response.json();

    if (body.shipments.length > 0) {
      body.shipments.forEach((shipment: any) => {
        expect(Array.isArray(shipment.products)).toBe(true);

        shipment.products.forEach((product: any) => {
          expect(product).toHaveProperty('product_id');
          expect(product).toHaveProperty('quantity');
          expect(typeof product.product_id).toBe('number');
          expect(typeof product.quantity).toBe('number');
          expect(product.quantity).toBeGreaterThan(0);
        });
      });
    }
  });
});

