import { defineConfig, devices } from '@playwright/test';

const API_PORT = 3055;
const WEB_PORT = 5180;
const DB = process.env.E2E_DATABASE_URL ?? 'postgresql://postgres:pg@localhost:55433/postgres';

export const API_URL = `http://localhost:${API_PORT}/api/v1`;

export default defineConfig({
  testDir: './tests',
  // Las pruebas comparten la misma base: en serie para que no se pisen
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1400, height: 900 },
    // Opcional en local: usar un Chromium ya instalado en vez de `playwright install`
    launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {},
  },
  webServer: [
    {
      // Backend compilado (npm run build --workspace=apps/backend antes de correr)
      command: 'node dist/main.js',
      cwd: '../apps/backend',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        PORT: String(API_PORT),
        DATABASE_URL: DB,
        DIRECT_URL: DB,
        JWT_SECRET: 'e2e-jwt-secret',
        JWT_PLATFORM_SECRET: 'e2e-platform-secret',
        CORS_ORIGINS: `http://localhost:${WEB_PORT}`,
        NODE_ENV: 'test',
        LOG_LEVEL: 'warn',
        // Los tests hacen muchos logins seguidos desde la misma IP
        LOGIN_THROTTLE_PER_MIN: '1000',
        LOGIN_THROTTLE_PER_HOUR: '10000',
      },
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      cwd: '../apps/frontend',
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { VITE_API_URL: API_URL },
    },
  ],
});
