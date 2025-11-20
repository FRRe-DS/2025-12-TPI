import { test, expect } from '@playwright/test';

test.describe('Stock Integration Service - Health Check', () => {
  test('debería responder con status 200 en /health', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test('debería retornar estructura de respuesta correcta', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('service');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('environment');
    
    expect(body.status).toBe('ok');
    expect(body.service).toBe('Stock Integration Service');
    expect(typeof body.timestamp).toBe('string');
  });

  test('debería retornar timestamp válido en formato ISO', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    const timestamp = new Date(body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
    expect(timestamp.toISOString()).toBe(body.timestamp);
  });

  test('debería retornar información del servicio', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    expect(body.service).toBe('Stock Integration Service');
    expect(body.version).toBeDefined();
    expect(body.environment).toBeDefined();
    expect(['development', 'production', 'test']).toContain(body.environment);
  });

  test('debería responder rápidamente (< 1 segundo)', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/health');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000);
  });
});

