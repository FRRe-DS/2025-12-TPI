import { test, expect } from '@playwright/test';

test.describe('Configuración del Sistema', () => {
  test('debe mostrar página de configuración', async ({ page }) => {
    await page.goto('/configuration');

    // Verificar título de configuración
    await expect(page.getByText('Configuración del Sistema')).toBeVisible();
  });

  test('debe mostrar pestañas de configuración', async ({ page }) => {
    await page.goto('/configuration');

    // Verificar pestañas disponibles
    await expect(page.getByRole('tab', { name: 'Métodos de Transporte' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Zonas de Cobertura' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Reglas de Cotización' })).toBeVisible();
  });

  test('debe permitir navegación entre pestañas', async ({ page }) => {
    await page.goto('/configuration');

    // Hacer clic en la pestaña de Transporte
    await page.getByRole('tab', { name: 'Métodos de Transporte' }).click();

    // Verificar que se muestre el contenido de transporte
    await expect(page.getByText('Métodos de Transporte')).toBeVisible();

    // Cambiar a la pestaña de Tarifas
    await page.getByRole('tab', { name: 'Reglas de Cotización' }).click();

    // Verificar que se muestre el contenido de tarifas
    await expect(page.getByText('Reglas de Cotización')).toBeVisible();
  });

  test('debe mostrar tabla de datos en configuración', async ({ page }) => {
    await page.goto('/configuration');

    // Seleccionar pestaña de transporte
    await page.getByRole('tab', { name: 'Métodos de Transporte' }).click();

    // Verificar que se muestre una tabla (DataTable component)
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verificar headers de tabla
    await expect(page.getByText('Nombre')).toBeVisible();
    await expect(page.getByText('Código')).toBeVisible();
    await expect(page.getByText('Días')).toBeVisible();
  });

  test('debe tener funcionalidad de búsqueda', async ({ page }) => {
    await page.goto('/configuration');

    // Verificar que hay un campo de búsqueda o toolbar
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
  });
});
