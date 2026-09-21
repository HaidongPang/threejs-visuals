import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 30000, workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { browserName: 'chromium', viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4173/examples/optical-assembly/', reuseExistingServer: !process.env.CI }
});
