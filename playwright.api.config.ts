import { defineConfig } from '@playwright/test';

/**
 * Configuración de Playwright para tests de API
 * Estos tests NO usan navegador, solo hacen requests HTTP directos
 * @see https://playwright.dev/docs/test-api-testing
 */
export default defineConfig({
  testDir: './tests/api',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await request.get('/health')`. */
    baseURL: process.env.STOCK_API_BASE_URL || 'http://localhost:3002',
    
    /* Extra HTTP headers to be sent with every request */
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  /* Configure projects for different services */
  projects: [
    {
      name: 'stock-integration',
      testMatch: /stock-integration\/.*\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'cd backend/services/stock-integration-service && pnpm run start:dev',
    url: 'http://localhost:3002/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutos para iniciar el servicio
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

