import { test, expect } from '@playwright/test'

test('theme toggle switches color mode (class-based)', async ({ page }) => {
  await page.goto('/')

  const html = page.locator('html')
  const toggle = page.getByRole('button', { name: 'Toggle theme' }).first()
  await expect(toggle).toBeVisible()

  const before = await html.getAttribute('class')
  await toggle.click()

  // next-themes is class-based: toggling flips the `dark`/`light` class on <html>.
  await expect.poll(() => html.getAttribute('class')).not.toBe(before)
})
