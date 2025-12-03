import { test, expect } from '@playwright/test';

test.describe('Dashboard - Funcionalidades', () => {
  // Simular autenticación - En un entorno real, usarías un mock o bypass
  test.beforeEach(async ({ page }) => {
    // Para este ejemplo, asumimos que estamos en modo demo
    // En producción, necesitarías manejar la autenticación real
    await page.goto('/');
    // Simular estar autenticado (en modo demo esto funciona)
  });

  test('debe mostrar el dashboard principal', async ({ page }) => {
    // Navegar al dashboard (asumiendo que ya está autenticado en modo demo)
    await page.goto('/dashboard');

    // Verificar título del dashboard
    await expect(page.getByText('PEPACK - Gestión Logística y de BOCA')).toBeVisible();

    // Verificar que se muestre el modo demo
    await expect(page.getByText(/Modo Demo|Frontend Mode/)).toBeVisible();
  });

  test('debe mostrar métricas principales', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar tarjetas de métricas
    await expect(page.getByText('Total Pedidos')).toBeVisible();
    await expect(page.getByText('Pedidos Completados')).toBeVisible();
    await expect(page.getByText('Tiempo Promedio Entrega')).toBeVisible();
    await expect(page.getByText('Eficiencia de Rutas')).toBeVisible();

    // Verificar que las métricas tengan valores
    const totalPedidosCard = page.locator('[class*="rounded-2xl"]').filter({ hasText: 'Total Pedidos' });
    await expect(totalPedidosCard).toBeVisible();
  });

  test('debe mostrar gráficos de entregas mensuales', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar sección de gráficos
    await expect(page.getByText('Entregas Mensuales')).toBeVisible();

    // Verificar que el gráfico esté presente (Recharts)
    const chartContainer = page.locator('[class*="recharts-wrapper"]');
    await expect(chartContainer).toBeVisible();
  });

  test('debe mostrar distribución por zonas', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar gráfico de distribución
    await expect(page.getByText('Distribución por Zonas')).toBeVisible();

    // Verificar leyendas de zonas
    await expect(page.getByText('Bogotá')).toBeVisible();
    await expect(page.getByText('Medellín')).toBeVisible();
    await expect(page.getByText('Cali')).toBeVisible();
  });

  test('debe mostrar pedidos recientes', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar sección de pedidos recientes
    await expect(page.getByText('Pedidos Recientes')).toBeVisible();

    // Verificar que se muestren pedidos
    const pedidosContainer = page.locator('[class*="space-y-4"]').first();
    await expect(pedidosContainer).toBeVisible();

    // Verificar que al menos un pedido esté visible
    const pedido = page.locator('[class*="bg-white"]').first();
    await expect(pedido).toBeVisible();
  });

  test('debe permitir refrescar datos', async ({ page }) => {
    await page.goto('/dashboard');

    // Encontrar el botón de refresh
    const refreshButton = page.locator('[class*="animate-spin"]').locator('xpath=ancestor::button').first();
    await expect(refreshButton).toBeVisible();

    // Hacer clic en refresh (si no está spinning)
    const isSpinning = await refreshButton.locator('[class*="animate-spin"]').isVisible();
    if (!isSpinning) {
      await refreshButton.click();
      // Verificar que no haya errores después del refresh
      await expect(page.getByText('Dashboard Error')).not.toBeVisible();
    }
  });
});
