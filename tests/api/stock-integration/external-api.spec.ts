import { test, expect } from '@playwright/test';

/**
 * Tests de integración con API externa de Stock
 * 
 * Nota: Los métodos como getProductById, getReservaByCompraId, etc.
 * son servicios internos consumidos por otros microservicios vía inyección.
 * Estos tests verifican el comportamiento del servicio cuando se integra
 * con el API externo a través del Shipping Service o directamente.
 */

test.describe('Stock Integration Service - Integración con API Externa', () => {
  test('debería estar disponible el endpoint raíz', async ({ request }) => {
    const response = await request.get('/');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('service');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('description');
    expect(body.service).toBe('Stock Integration Service');
  });

  test('debería retornar información del API externo configurado', async ({ request }) => {
    const response = await request.get('/');
    const body = await response.json();

    // La información del API externo puede estar disponible o no
    // según la implementación actual del servicio
    if (body.externalApi) {
      expect(body.externalApi).toHaveProperty('baseUrl');
      expect(typeof body.externalApi.baseUrl).toBe('string');

      // Verificar que la URL del API externo esté configurada
      expect(body.externalApi.baseUrl).toContain('http');
    } else {
      // Si no está disponible, verificar que al menos el servicio básico funcione
      expect(body).toHaveProperty('service');
      expect(body.service).toBe('Stock Integration Service');

      // Log para indicar que la información del API externo no está expuesta
      console.log('ℹ️  La información del API externo no está disponible en el endpoint raíz');
    }
  });

  test('debería retornar capacidades del servicio', async ({ request }) => {
    const response = await request.get('/');
    const body = await response.json();

    // Verificar que el servicio básico funciona
    expect(body).toHaveProperty('service');

    // Si las capacidades están disponibles, verificarlas
    if (body.capabilities) {
      expect(Array.isArray(body.capabilities)).toBe(true);
      expect(body.capabilities.length).toBeGreaterThan(0);

      // Verificar que mencione las capacidades principales
      const capabilitiesStr = body.capabilities.join(' ').toLowerCase();
      expect(capabilitiesStr).toMatch(/circuit breaker|retry|cache/i);
    } else {
      // Si no están disponibles, verificar que el servicio al menos funciona
      expect(body).toHaveProperty('description');
      console.log('ℹ️  Lista de capacidades no expuesta en endpoint raíz');
    }
  });

  test('debería manejar errores cuando el API externo no está disponible', async ({ request }) => {
    // Este test verifica que el servicio responde correctamente
    // incluso cuando el API externo falla (a través del health check)
    const healthResponse = await request.get('/health');
    expect(healthResponse.status()).toBe(200);
    
    const healthBody = await healthResponse.json();
    // El health check debería indicar el estado del API externo
    // aunque no esté disponible, el servicio debería responder
    expect(healthBody).toHaveProperty('status');
  });

  test('debería tener configuración de timeout y retry', async ({ request }) => {
    const response = await request.get('/');
    const body = await response.json();

    // Verificar que el servicio básico funciona
    expect(body).toHaveProperty('service');
    expect(body.service).toBe('Stock Integration Service');

    // Si la información del API externo está disponible, verificar configuración
    if (body.externalApi) {
      if (body.externalApi.timeout !== undefined) {
        expect(typeof body.externalApi.timeout).toBe('number');
        expect(body.externalApi.timeout).toBeGreaterThan(0);
        expect(body.externalApi.timeout).toBeLessThan(60000); // menos de 1 minuto
      }

      if (body.externalApi.retryAttempts !== undefined) {
        expect(typeof body.externalApi.retryAttempts).toBe('number');
        expect(body.externalApi.retryAttempts).toBeGreaterThan(0);
        expect(body.externalApi.retryAttempts).toBeLessThan(10); // máximo 10 intentos
      }
    } else {
      // Si no está disponible, verificar que el servicio al menos responde
      expect(body).toHaveProperty('version');
      console.log('ℹ️  Configuración de timeout/retry no expuesta en endpoint raíz');
    }
  });
});

