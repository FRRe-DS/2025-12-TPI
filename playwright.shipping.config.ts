import { defineConfig } from '@playwright/test';

/**
 * Configuración de Playwright para tests de API del Shipping Service
 * Estos tests NO usan navegador, solo hacen requests HTTP directos
 * @see https://playwright.dev/docs/test-api-testing
 */
export default defineConfig({
  testDir: './tests/api/shipping',
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
    /* Base URL to use in actions like `await request.get('/shipping')`. */
    /* Usa NEXT_PUBLIC_API_URL si está disponible, sino usa la URL del servicio desplegado */
    baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.SHIPPING_API_BASE_URL || 'https://api.logistica-utn.com',
    
    /* Extra HTTP headers to be sent with every request */
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  /* Configure projects for different services */
  projects: [
    {
      name: 'shipping',
      testMatch: /.*\.spec\.ts/,
    },
  ],

  /* El servicio está desplegado externamente, no se inicia localmente */
  // webServer: {
  //   command: 'pnpm -C backend/services/shipping-service run start:dev',
  //   url: 'http://localhost:3001/health',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  //   stdout: 'pipe',
  //   stderr: 'pipe',
  // },
});

