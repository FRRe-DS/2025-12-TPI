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
    /* Prioridad: SHIPPING_API_BASE_URL > NEXT_PUBLIC_API_URL > 127.0.0.1 (IPv4 explícito) */
    baseURL: process.env.SHIPPING_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001',
    
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

  /* Iniciar el servicio localmente si no está corriendo */
  webServer: {
    command: 'cd backend/services/shipping-service && export PORT=3001 && export NODE_ENV=development && export DATABASE_URL="${DATABASE_URL:-postgresql://postgres.ghexalvmqhvfnkgyagzb:Pepack.2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true}" && export DIRECT_URL="${DIRECT_URL:-postgresql://postgres.ghexalvmqhvfnkgyagzb:Pepack.2025@aws-1-us-east-2.pooler.supabase.com:5432/postgres}" && export CONFIG_SERVICE_URL="${CONFIG_SERVICE_URL:-http://127.0.0.1:3003}" && export STOCK_SERVICE_URL="${STOCK_SERVICE_URL:-http://127.0.0.1:3002}" && export FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:3000}" && TS_NODE_PROJECT=tsconfig.json npx ts-node -r tsconfig-paths/register src/main.ts',
    url: 'http://127.0.0.1:3001/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

