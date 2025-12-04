import { test, expect } from '@playwright/test';

test.describe('🔍 Debug - Ver qué carga realmente', () => {
  test('Capturar screenshot de la página principal', async ({ page }) => {
    console.log('🖼️ Tomando screenshot de la página principal...');

    await page.goto('/');
    await page.waitForTimeout(2000); // Esperar que cargue

    // Tomar screenshot para debug
    await page.screenshot({
      path: 'test-results/debug-homepage.png',
      fullPage: true
    });

    // Ver qué elementos están realmente presentes
    const bodyText = await page.locator('body').textContent();
    console.log('📄 Contenido de la página:', bodyText?.substring(0, 500) + '...');

    // Verificar si hay algún elemento con texto
    const allText = await page.locator('*').filter({ hasText: /.+/ }).allTextContents();
    console.log('📝 Textos encontrados:', allText.slice(0, 10));

    // Solo verificar que la página cargó (sin assertions específicas)
    expect(true).toBe(true); // Test siempre pasa para debug
  });

  test('Capturar screenshot del dashboard', async ({ page }) => {
    console.log('🖼️ Tomando screenshot del dashboard...');

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/debug-dashboard.png',
      fullPage: true
    });

    const bodyText = await page.locator('body').textContent();
    console.log('📄 Contenido del dashboard:', bodyText?.substring(0, 500) + '...');

    expect(true).toBe(true);
  });
});
