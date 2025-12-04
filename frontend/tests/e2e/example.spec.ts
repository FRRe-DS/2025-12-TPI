import { test, expect } from '@playwright/test';

/**
 * 🧪 TEST DE EJEMPLO PRÁCTICO
 *
 * Este test demuestra las funcionalidades básicas de Playwright
 * Puedes ejecutarlo con: pnpm test:dev example.spec.ts
 */

test.describe('🚀 Ejemplo Práctico - PEPACK', () => {
  test('✅ Verificar que PEPACK funciona correctamente', async ({ page }) => {
    console.log('🧪 Iniciando test básico...');

    // 1. Ir a la página principal
    await page.goto('/');
    console.log('📄 Página cargada');

    // 2. Verificar elementos básicos
    await expect(page.locator('h1')).toContainText('PEPACK');
    console.log('✅ Título encontrado');

    // 3. Verificar botón de login
    const loginButton = page.getByRole('button', { name: 'Iniciar Sesión con Keycloak' });
    await expect(loginButton).toBeVisible();
    console.log('✅ Botón de login visible');

    // 4. Verificar características
    await expect(page.getByText('Gestión de Envíos')).toBeVisible();
    await expect(page.getByText('Optimización de Rutas')).toBeVisible();
    console.log('✅ Características visibles');

    console.log('🎉 Test completado exitosamente!');
  });

  test('📊 Dashboard debe mostrar métricas', async ({ page }) => {
    console.log('🧪 Probando dashboard...');

    // Ir al dashboard (modo demo permite acceso directo)
    await page.goto('/dashboard');
    console.log('📊 Dashboard cargado');

    // Verificar título
    await expect(page.getByText('PEPACK - Gestión Logística')).toBeVisible();
    console.log('✅ Título del dashboard correcto');

    // Verificar métricas principales
    await expect(page.getByText('Total Pedidos')).toBeVisible();
    await expect(page.getByText('Pedidos Completados')).toBeVisible();
    await expect(page.getByText('Tiempo Promedio Entrega')).toBeVisible();
    console.log('✅ Métricas principales visibles');

    // Verificar modo demo
    await expect(page.getByText(/Modo Demo|Frontend Mode/)).toBeVisible();
    console.log('✅ Modo demo activo');

    console.log('🎉 Dashboard test completado!');
  });

  test('⚙️ Configuración debe cargar pestañas', async ({ page }) => {
    console.log('🧪 Probando configuración...');

    await page.goto('/configuration');
    console.log('⚙️ Página de configuración cargada');

    // Verificar título
    await expect(page.getByText('Configuración del Sistema')).toBeVisible();
    console.log('✅ Título de configuración correcto');

    // Verificar pestañas
    await expect(page.getByRole('tab', { name: 'Métodos de Transporte' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Zonas de Cobertura' })).toBeVisible();
    console.log('✅ Pestañas disponibles');

    // Probar cambio de pestaña
    await page.getByRole('tab', { name: 'Métodos de Transporte' }).click();
    await expect(page.getByText('Métodos de Transporte')).toBeVisible();
    console.log('✅ Navegación por pestañas funciona');

    console.log('🎉 Configuración test completado!');
  });

  test('🎨 Diseño responsive debe funcionar', async ({ page }) => {
    console.log('🧪 Probando responsive design...');

    await page.goto('/');

    // Verificar en desktop
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Desktop: Elementos visibles');

    // Simular móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Mobile: Elementos adaptados');

    console.log('🎉 Responsive test completado!');
  });
});
