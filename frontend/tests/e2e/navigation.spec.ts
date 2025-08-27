import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/')
  })

  test('should navigate to all main pages', async ({ page }) => {
    // Check that we're on the dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Navigate to Domains page
    await page.getByRole('link', { name: /domains/i }).click()
    await expect(page.getByRole('heading', { name: /domains/i })).toBeVisible()

    // Navigate to Documents page
    await page.getByRole('link', { name: /documents/i }).click()
    await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible()

    // Navigate to Search page
    await page.getByRole('link', { name: /search/i }).click()
    await expect(page.getByRole('heading', { name: /search/i })).toBeVisible()

    // Navigate to RAG page
    await page.getByRole('link', { name: /rag/i }).click()
    await expect(page.getByRole('heading', { name: /rag/i })).toBeVisible()

    // Navigate to Chats page
    await page.getByRole('link', { name: /chats/i }).click()
    await expect(page.getByRole('heading', { name: /chats/i })).toBeVisible()

    // Navigate to External Models page
    await page.getByRole('link', { name: /external models/i }).click()
    await expect(page.getByRole('heading', { name: /external models/i })).toBeVisible()

    // Navigate to Settings page
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()

    // Navigate back to Dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should have responsive mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile navigation is visible
    await expect(page.getByTestId('mobile-navigation')).toBeVisible()

    // Check that sidebar is hidden on mobile
    await expect(page.getByTestId('sidebar')).not.toBeVisible()

    // Open mobile menu
    await page.getByTestId('mobile-menu-button').click()

    // Check that mobile menu is open
    await expect(page.getByTestId('mobile-menu')).toBeVisible()

    // Navigate to a page using mobile menu
    await page.getByRole('link', { name: /domains/i }).click()
    await expect(page.getByRole('heading', { name: /domains/i })).toBeVisible()

    // Check that mobile menu is closed after navigation
    await expect(page.getByTestId('mobile-menu')).not.toBeVisible()
  })

  test('should have working breadcrumbs', async ({ page }) => {
    // Navigate to a nested page
    await page.getByRole('link', { name: /domains/i }).click()
    await page.getByRole('button', { name: /create domain/i }).click()

    // Check that breadcrumbs are visible
    await expect(page.getByTestId('breadcrumbs')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Domains')).toBeVisible()
    await expect(page.getByText('Create Domain')).toBeVisible()

    // Click on breadcrumb to navigate back
    await page.getByText('Domains').click()
    await expect(page.getByRole('heading', { name: /domains/i })).toBeVisible()
  })
})
