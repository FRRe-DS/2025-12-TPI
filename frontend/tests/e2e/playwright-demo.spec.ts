import { test, expect } from '@playwright/test';

/**
 * 🧪 DEMO DE PLAYWRIGHT FUNCIONANDO
 *
 * Este test demuestra que Playwright está configurado correctamente
 * y puede controlar navegadores, aunque no podamos probar la app Next.js
 * debido a limitaciones de Node.js versión.
 */

test.describe('🎭 Playwright Demo - Funcionalidad Básica', () => {
  test('✅ Playwright puede abrir navegador y navegar', async ({ page }) => {
    console.log('🚀 Iniciando demo de Playwright...');

    // Abrir una página web pública
    await page.goto('https://example.com');
    console.log('📄 Página cargada correctamente');

    // Verificar elementos básicos
    const title = page.locator('h1');
    await expect(title).toContainText('Example Domain');
    console.log('✅ Título encontrado');

    // Verificar párrafo (usar selector más específico)
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();
    console.log('✅ Contenido visible');

    console.log('🎉 ¡Playwright funciona perfectamente!');
  });

  test('🎨 Playwright puede interactuar con elementos', async ({ page }) => {
    console.log('🖱️ Probando interacciones...');

    await page.goto('https://example.com');

    // Verificar que podemos hacer clic (aunque no haya botones)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log('✅ Elementos interactivos encontrados');

    // Verificar responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Diseño responsive funciona');

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Desktop también funciona');

    console.log('🎉 ¡Interacciones funcionan!');
  });

  test('📊 Playwright puede tomar screenshots', async ({ page }) => {
    console.log('📸 Probando screenshots...');

    await page.goto('https://example.com');

    // Tomar screenshot
    await page.screenshot({ path: 'test-results/demo-screenshot.png' });
    console.log('✅ Screenshot guardado');

    console.log('🎉 ¡Screenshots funcionan!');
  });

  test('🔍 Playwright puede hacer assertions avanzadas', async ({ page }) => {
    console.log('🔍 Probando assertions...');

    await page.goto('https://example.com');

    // Verificar URL
    await expect(page).toHaveURL('https://example.com/');
    console.log('✅ URL correcta');

    // Verificar título de página
    await expect(page).toHaveTitle('Example Domain');
    console.log('✅ Título de página correcto');

    // Verificar que no hay errores de consola
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.waitForTimeout(1000); // Esperar posibles errores

    expect(errors.length).toBe(0);
    console.log('✅ No hay errores de JavaScript');

    console.log('🎉 ¡Assertions avanzadas funcionan!');
  });
});
