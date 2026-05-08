import { test, expect } from '@playwright/test'

test.describe('Storefront', () => {
  test('homepage loads and shows navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Store' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open cart' })).toBeVisible()
  })

  test('can navigate to products listing', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Products' }).click()
    await expect(page).toHaveURL('/products')
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()
  })

  test('can open and close cart drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open cart' }).click()
    await expect(page.getByRole('dialog', { name: 'Shopping cart' })).toBeVisible()
    await page.getByRole('button', { name: 'Close cart' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('cart drawer closes on Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open cart' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('can search for products', async ({ page }) => {
    await page.goto('/products')
    await page.getByPlaceholder(/search/i).fill('shirt')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/q=shirt/)
  })

  test('product detail page shows add to cart button', async ({ page }) => {
    await page.goto('/products')
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await firstProduct.click()
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible()
  })

  test('404 page shows for unknown route', async ({ page }) => {
    await page.goto('/does-not-exist')
    await expect(page.getByText(/not found/i)).toBeVisible()
  })
})

test.describe('Auth', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible()
  })

  test('register page is accessible', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible()
  })

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })
})
