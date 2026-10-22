import { expect, test } from '@playwright/test'

test.describe('Auth pages and registration waiting page', () => {
  test('login and register pages have a back-to-home button', async ({ page }) => {
    for (const path of ['/login', '/register']) {
      await page.goto(path)
      await page.getByRole('link', { name: 'Back to home page' }).click()
      await expect(page).toHaveURL(/\/$/)
    }
  })

  test('submitting a registration request opens the waiting page', async ({ page }) => {
    await page.goto('/register')
    await page.locator('#register-name').fill('Test Employee')
    await page.locator('#register-email').fill(`test.${Date.now()}@masar.local`)
    await page.locator('#register-department').selectOption({ index: 1 })
    await page.locator('#register-job-title').fill('Analyst')
    await page.locator('#register-password').fill('Passw0rdOk')
    await page.locator('#register-confirm-password').fill('Passw0rdOk')
    await page.getByRole('button', { name: /Submit|Request/ }).click()
    await expect(page).toHaveURL(/\/registration-waiting$/)
    await expect(page.getByRole('heading', { name: 'Your account request is under review' })).toBeVisible()
    await expect(page.getByText('Test Employee')).toBeVisible()
    await page.getByRole('link', { name: 'Back to home page' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('waiting page is not reachable without a submitted request', async ({ page }) => {
    await page.goto('/registration-waiting')
    await expect(page).toHaveURL(/\/$/)
  })

  test('light and dark themes look different on the gateway', async ({ page }) => {
    await page.goto('/')
    const bg = () => page.locator('main').first().evaluate((el) => getComputedStyle(el).backgroundImage)
    await page.evaluate(() => document.documentElement.classList.remove('dark'))
    const light = await bg()
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    const dark = await bg()
    expect(light).not.toBe(dark)
  })
})
