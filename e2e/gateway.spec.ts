import { expect, test } from '@playwright/test'

test.describe('Gateway → Guest / Employee flow', () => {
  test('gateway shows only Employee and Guest, with no sign-in links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Employee/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Guest/ })).toBeVisible()
    await expect(page.locator('a[href="/login"], a[href="/register"]')).toHaveCount(0)
  })

  test('guest reaches the company page, which has no sign-in or register links', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Guest/ }).click()
    await expect(page).toHaveURL(/\/company$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('a[href="/login"], a[href="/register"]')).toHaveCount(0)
  })

  test('company page shows English names in the English interface', async ({ page }) => {
    await page.goto('/company')
    await expect(page.getByText('Abdelhamid Elsayed')).toBeVisible()
    await expect(page.getByText('عبدالحميد')).toHaveCount(0)
  })

  test('employee can reach sign in and register', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Employee/ }).click()
    await expect(page.getByRole('link', { name: /Register/ })).toHaveAttribute('href', '/register')
    await page.getByRole('link', { name: /Sign in/ }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('employee signs in and reaches the dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('abdelhamid@masar.local')
    await page.locator('#login-password').fill('Masar@0101')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('protected pages send visitors back to the gateway', async ({ page }) => {
    await page.goto('/requests')
    await expect(page).toHaveURL(/\/$/)
  })

  test('Arabic interface is RTL and shows Arabic names', async ({ page }) => {
    await page.goto('/')
    await page.getByText('العربية').first().click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await page.getByRole('button', { name: /ادخل إلى مساحة عمل مسار/ }).click()
    await expect(page.getByRole('link', { name: /تسجيل الدخول/ })).toHaveAttribute('href', '/login')
    await page.getByRole('link', { name: /تصفّح صفحة الشركة/ }).click()
    await expect(page.getByText('عبدالحميد السيد')).toBeVisible()
    await expect(page.getByText('Abdelhamid Elsayed')).toHaveCount(0)
  })

  test('a session saved by an older build gets the current CEO name and avatar, in both languages', async ({ page }) => {
    await page.addInitScript(() => {
      const stale = {
        id: 'user-abdelhamid', employeeId: 'EMP-0008', firstName: 'Abdelhamid', lastName: 'Ibrahim',
        fullName: 'Abdelhamid Ibrahim', email: 'abdelhamid@masar.local', jobTitle: 'CEO & Company Owner',
        departmentId: 'dept-executive', managerId: null, roleIds: ['role-employee', 'role-ceo', 'role-admin', 'role-approver'],
        isActive: true, avatarUrl: '/avatars/abdelhamid-ibrahim.svg',
      }
      localStorage.setItem('masar-auth', JSON.stringify({ state: { currentUser: stale, roles: [] }, version: 3 }))
    })
    await page.goto('/dashboard')
    const avatars = page.locator('img[src*="abdelhamid"]')
    await expect(avatars.first()).toHaveAttribute('src', '/avatars/abdelhamid-elsayed.svg')
    await expect(page.getByText('Abdelhamid').first()).toBeVisible()
    await page.getByText('العربية').first().click()
    await expect(page.getByText('عبدالحميد').first()).toBeVisible()
    await expect(page.getByText('Abdelhamid')).toHaveCount(0)
  })

  test('the gateway has no "open workspace" shortcut, even when signed in', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill('abdelhamid@masar.local')
    await page.locator('#login-password').fill('Masar@0101')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await page.goto('/')
    await page.getByRole('button', { name: /Employee/ }).click()
    await expect(page.locator('a[href="/dashboard"]')).toHaveCount(0)
    await page.goto('/company')
    await expect(page.locator('a[href="/dashboard"]')).toHaveCount(0)
  })
})
