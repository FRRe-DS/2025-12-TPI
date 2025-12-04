import { Page, expect } from '@playwright/test';

/**
 * Utilidades para testing de PEPACK Frontend
 */

export class TestHelpers {
  /**
   * Simula estar autenticado en modo demo
   */
  static async mockAuthentication(page: Page): Promise<void> {
    // En modo demo, simplemente navegar funciona
    await page.goto('/dashboard');
    await expect(page.getByText('PEPACK - Gestión Logística')).toBeVisible();
  }

  /**
   * Espera a que se cargue el dashboard completamente
   */
  static async waitForDashboardLoad(page: Page): Promise<void> {
    await expect(page.getByText('Total Pedidos')).toBeVisible();
    await expect(page.getByText('Pedidos Completados')).toBeVisible();
  }

  /**
   * Verifica que un elemento esté visible con timeout personalizado
   */
  static async expectVisible(page: Page, selector: string, timeout = 5000): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toBeVisible({ timeout });
  }

  /**
   * Toma screenshot con nombre descriptivo
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  /**
   * Simula navegación al sidebar
   */
  static async navigateToSection(page: Page, section: 'dashboard' | 'configuration' | 'operaciones' | 'reportes' | 'reservas'): Promise<void> {
    const sectionMap = {
      dashboard: '/dashboard',
      configuration: '/configuration',
      operaciones: '/operaciones',
      reportes: '/reportes',
      reservas: '/reservas'
    };

    await page.goto(sectionMap[section]);
  }

  /**
   * Verifica que el modo demo esté activo
   */
  static async verifyDemoMode(page: Page): Promise<void> {
    await expect(page.getByText(/Modo Demo|Frontend Mode/)).toBeVisible();
  }

  /**
   * Espera a que se complete una acción asíncrona
   */
  static async waitForAsyncOperation(page: Page): Promise<void> {
    // Esperar a que no haya indicadores de carga
    await page.waitForTimeout(1000); // Espera simple para demo
  }
}

/**
 * Selectores comunes reutilizables
 */
export const Selectors = {
  // Dashboard
  totalPedidos: '[class*="rounded-2xl"]:has-text("Total Pedidos")',
  pedidosCompletados: '[class*="rounded-2xl"]:has-text("Pedidos Completados")',
  tiempoEntrega: '[class*="rounded-2xl"]:has-text("Tiempo Promedio Entrega")',
  eficienciaRutas: '[class*="rounded-2xl"]:has-text("Eficiencia de Rutas")',

  // Navegación
  sidebar: '[class*="sidebar"]',
  loginButton: '[class*="Iniciar Sesión con Keycloak"]',

  // Tablas
  dataTable: 'table',
  searchInput: 'input[type="text"]',

  // Modales y diálogos
  confirmDialog: '[role="dialog"]',
  loadingSpinner: '[class*="animate-spin"]',

  // Gráficos
  chartContainer: '[class*="recharts-wrapper"]'
};

/**
 * Datos de prueba reutilizables
 */
export const TestData = {
  mockUser: {
    username: 'test@example.com',
    password: 'test123'
  },

  mockShipment: {
    origin: 'Bogotá',
    destination: 'Medellín',
    weight: 10,
    transportMethod: 'Terrestre'
  },

  mockVehicle: {
    plate: 'ABC-123',
    capacity: 1000,
    type: 'Camión'
  }
};
