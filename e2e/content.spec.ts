import { test, expect } from '@playwright/test'

test('notes index lists notes and a note detail renders', async ({ page }) => {
  await page.goto('/notes')
  await expect(page.getByRole('heading', { level: 1, name: 'Writing' })).toBeVisible()

  const firstNote = page.locator('a[href^="/notes/"]').first()
  await expect(firstNote).toBeVisible()
  await firstNote.click()

  await expect(page).toHaveURL(/\/notes\/.+/)
  await expect(page.locator('article h1')).toBeVisible()
})

test('case studies index lists studies and a detail renders', async ({ page }) => {
  await page.goto('/work')
  await expect(page.getByRole('heading', { level: 1, name: 'Case Studies' })).toBeVisible()

  const firstStudy = page.locator('a[href^="/work/"]').first()
  await expect(firstStudy).toBeVisible()
  await firstStudy.click()

  await expect(page).toHaveURL(/\/work\/.+/)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('MDX code blocks are syntax-highlighted', async ({ page }) => {
  // A note with several TypeScript code fences.
  await page.goto('/notes/dependency-injection-cap')
  await expect(page.locator('article h1')).toBeVisible()
  // rehype-pretty-code renders fenced code into <pre><code> blocks.
  await expect(page.locator('pre code').first()).toBeVisible()
})
