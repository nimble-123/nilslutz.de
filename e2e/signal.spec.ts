import { test, expect } from '@playwright/test'

// Replaces the old theme-toggle spec: the "Signal" design is dark-only.
test('site is dark-only (no theme toggle, dark color-scheme)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /theme/i })).toHaveCount(0)
  const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)
  expect(scheme).toContain('dark')
})

test('home hero renders the wordmark, the scene sections and case links', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nils')
  for (const id of ['#hero', '#core', '#topology']) await expect(page.locator(id)).toBeAttached()
  await expect(page.locator('canvas[aria-hidden="true"]')).toBeAttached()
  await expect(page.locator('a[href^="/work/"]').first()).toBeAttached()
})

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })
  test('hero copy and calls to action are readable without animation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /case studies/i }).first()).toBeVisible()
    await expect(page.locator('#hero')).toContainText('Clean-Core')
  })
})
