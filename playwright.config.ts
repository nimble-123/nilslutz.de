import { defineConfig, devices } from '@playwright/test'

// Override with PORT=xxxx when 3000 is taken (e.g. parallel worktrees)
const PORT = Number(process.env.PORT ?? 3000)
const baseURL = `http://localhost:${PORT}`

/**
 * E2E smoke tests run against a production build (`next build && next start`).
 * Browsers are installed via `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
