import { test, expect } from '@playwright/test';

test.describe('Página Principal - PEPACK', () => {
  test('debe cargar la página de inicio correctamente', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');

    // Verificar que el título esté presente
    await expect(page.locator('h1')).toContainText('PEPACK');

    // Verificar elementos de la página de login
    await expect(page.getByText('Inicia sesión para acceder a tu dashboard')).toBeVisible();

    // Verificar que el botón de login esté presente
    const loginButton = page.getByRole('button', { name: 'Iniciar Sesión con Keycloak' });
    await expect(loginButton).toBeVisible();
  });

  test('debe mostrar las características del sistema', async ({ page }) => {
    await page.goto('/');

    // Verificar las características destacadas
    await expect(page.getByText('Gestión de Envíos')).toBeVisible();
    await expect(page.getByText('Optimización de Rutas')).toBeVisible();
    await expect(page.getByText('Análisis Completo')).toBeVisible();
  });

  test('debe tener diseño responsive', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      // En móvil, verificar que el layout se adapte
      await expect(page.locator('.bg-white.rounded-2xl')).toBeVisible();
    } else {
      // En desktop, verificar elementos específicos
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
