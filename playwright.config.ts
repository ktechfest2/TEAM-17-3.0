import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', fullyParallel: false, use: { baseURL: 'http://localhost:3000', headless: true, viewport: { width: 390, height: 844 } }, webServer: { command: 'npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 120000 } });
