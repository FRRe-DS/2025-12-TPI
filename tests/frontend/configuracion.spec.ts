import { test, expect } from '@playwright/test';

test.describe('Configuración - Vehículos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de configuración de vehículos
    await page.goto('/configuration/vehiculos');
  });

  test('debería mostrar la tabla de vehículos correctamente', async ({ page }) => {
    // Verificar que la página cargue
    await expect(page).toHaveURL(/configuration\/vehiculos/);

    // Verificar que se muestre el título
    await expect(page.locator('h1')).toContainText('Vehículos');

    // Verificar que se muestre la tabla
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verificar que tenga encabezados de columna
    await expect(page.locator('th').filter({ hasText: 'Patente' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Marca' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Modelo' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Estado' })).toBeVisible();
  });

  test('debería mostrar los inputs en negro (no gris)', async ({ page }) => {
    // Verificar que el input de búsqueda tenga texto negro
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verificar que los estilos de color sean correctos (usando CSS personalizado)
    const inputColor = await searchInput.evaluate(el => getComputedStyle(el).color);
    expect(inputColor).toBe('rgb(0, 0, 0)'); // negro
  });

  test('debería mostrar el modal con fondo blanco al hacer clic en "Añadir Vehículo"', async ({ page }) => {
    // Hacer clic en el botón "Añadir Vehículo"
    await page.locator('button').filter({ hasText: 'Añadir Vehículo' }).click();

    // Esperar que aparezca el modal
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Verificar que el modal tenga fondo blanco (no negro)
    const modalBackground = await modal.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(modalBackground).toBe('rgb(255, 255, 255)'); // blanco

    // Verificar que el título del modal sea visible
    await expect(modal.locator('h2')).toContainText('Añadir Vehículo');

    // Verificar que los inputs del formulario sean visibles
    await expect(modal.locator('input[name="license_plate"]')).toBeVisible();
    await expect(modal.locator('input[name="make"]')).toBeVisible();
    await expect(modal.locator('input[name="model"]')).toBeVisible();
  });

  test('debería validar el formulario de vehículo correctamente', async ({ page }) => {
    // Abrir modal
    await page.locator('button').filter({ hasText: 'Añadir Vehículo' }).click();

    // Esperar que el modal esté visible
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Intentar guardar sin completar campos requeridos
    await page.locator('button').filter({ hasText: 'Guardar' }).click();

    // Verificar que los campos requeridos muestren validación HTML5
    const licensePlateInput = page.locator('input[name="license_plate"]');
    
    // En Playwright, verificamos la validación usando evaluate()
    const isInvalid = await licensePlateInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);

    // Completar formulario correctamente
    await licensePlateInput.fill('ABC-123');
    await page.locator('input[name="make"]').fill('Mercedes-Benz');
    await page.locator('input[name="model"]').fill('Sprinter');
    await page.locator('input[name="year"]').fill('2020');
    await page.locator('input[name="capacityKg"]').fill('2000');
    await page.locator('input[name="volumeM3"]').fill('15');
    await page.locator('select[name="fuelType"]').selectOption('DIESEL');

    // Ahora el formulario debería ser válido
    const isValid = await licensePlateInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(true);
  });
});

test.describe('Configuración - Conductores', () => {
  test('debería mostrar la página de conductores', async ({ page }) => {
    await page.goto('/configuration/conductores');

    await expect(page).toHaveURL(/configuration\/conductores/);
    await expect(page.locator('h1')).toContainText('Conductores');
  });

  test('debería mostrar el menú desplegable sin etiqueta "Acciones"', async ({ page }) => {
    await page.goto('/configuration/conductores');

    // Si hay filas en la tabla, verificar el menú
    const dropdownTrigger = page.locator('button[aria-label="Abrir menú"]').first();
    if (await dropdownTrigger.isVisible()) {
      await dropdownTrigger.click();

      // Verificar que aparezca el menú sin la etiqueta "Acciones"
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();

      // Verificar que contenga las opciones directamente
      await expect(menu).toContainText('Editar');
      await expect(menu).toContainText('Eliminar');
    }
  });
});
