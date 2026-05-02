import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'browser',
    include: ['test/**/*.browser.test.ts'],
    exclude: ['node_modules/**'],
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
      headless: true,
    },
  },
});
