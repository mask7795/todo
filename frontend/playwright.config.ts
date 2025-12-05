import { defineConfig, devices } from '@playwright/test';

const useWebServer = process.env.CI_WEBSERVER !== '0';

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: useWebServer
    ? {
        command: 'npm run start:dev',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        stdout: 'pipe',
        stderr: 'pipe',
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
