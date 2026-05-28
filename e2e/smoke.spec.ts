import { test, expect } from '@playwright/test'

const staticRoutes = ['/', '/about', '/contact', '/tools', '/work', '/notes', '/legal-notice', '/privacy-policy']

test.describe('static routes', () => {
  for (const route of staticRoutes) {
    test(`GET ${route} responds 200 and renders navbar + footer`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      // Navbar logo (a link labelled "Nils Lutz")
      await expect(page.getByRole('link', { name: 'Nils Lutz' }).first()).toBeVisible()
      // Footer present
      await expect(page.locator('footer')).toBeVisible()
    })
  }
})

test('robots.txt and sitemap.xml are served', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain('<urlset')
})
