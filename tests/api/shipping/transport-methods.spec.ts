import { test, expect } from '@playwright/test';

/**
 * Tests para GET /shipping/transport-methods
 * Endpoint para obtener métodos de transporte disponibles
 * @see openapilog.yaml - /shipping/transport-methods
 */
test.describe('Shipping Service - Métodos de Transporte', () => {
  test('debería retornar lista de métodos de transporte', async ({ request }) => {
    const response = await request.get('/shipping/transport-methods');

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('transport_methods');
    expect(Array.isArray(body.transport_methods)).toBe(true);
  });

  test('debería retornar estructura correcta para cada método de transporte', async ({ request }) => {
    const response = await request.get('/shipping/transport-methods');
    const body = await response.json();

    expect(body.transport_methods.length).toBeGreaterThan(0);

    body.transport_methods.forEach((method: any) => {
      // Validar campos requeridos según schema
      expect(method).toHaveProperty('type');
      expect(method).toHaveProperty('name');
      expect(method).toHaveProperty('estimated_days');

      // Validar tipos
      expect(typeof method.type).toBe('string');
      expect(typeof method.name).toBe('string');
      expect(typeof method.estimated_days).toBe('string');

      // Validar que type sea uno de los valores válidos
      expect(['air', 'sea', 'rail', 'road']).toContain(method.type);

      // Validar que estimated_days tenga formato válido (ej: "1-3")
      expect(method.estimated_days).toMatch(/^\d+-\d+$/);
    });
  });

  test('debería incluir todos los tipos de transporte disponibles', async ({ request }) => {
    const response = await request.get('/shipping/transport-methods');
    const body = await response.json();

    const types = body.transport_methods.map((m: any) => m.type);
    const expectedTypes = ['air', 'sea', 'rail', 'road'];

    // Verificar que al menos algunos de los tipos esperados estén presentes
    // (puede que no todos estén disponibles según configuración)
    const hasAnyExpectedType = expectedTypes.some((type) => types.includes(type));
    expect(hasAnyExpectedType).toBe(true);
  });

  test('debería retornar nombres descriptivos para cada método', async ({ request }) => {
    const response = await request.get('/shipping/transport-methods');
    const body = await response.json();

    body.transport_methods.forEach((method: any) => {
      expect(method.name.length).toBeGreaterThan(0);
      expect(typeof method.name).toBe('string');
    });
  });

  test('debería retornar estimated_days en formato válido', async ({ request }) => {
    const response = await request.get('/shipping/transport-methods');
    const body = await response.json();

    body.transport_methods.forEach((method: any) => {
      // Formato esperado: "1-3", "5-10", etc.
      const daysPattern = /^\d+-\d+$/;
      expect(method.estimated_days).toMatch(daysPattern);

      // Verificar que el primer número sea menor o igual al segundo
      const [min, max] = method.estimated_days.split('-').map(Number);
      expect(min).toBeLessThanOrEqual(max);
      expect(min).toBeGreaterThan(0);
    });
  });

  test('debería responder rápidamente (< 1 segundo)', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/shipping/transport-methods');
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000);
  });
});

