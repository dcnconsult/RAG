import { test, expect } from '@playwright/test'

test.describe('Domain Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the domains page before each test
    await page.goto('/domains')
  })

  test('should create a new domain', async ({ page }) => {
    // Click create domain button
    await page.getByRole('button', { name: /create domain/i }).click()

    // Fill in domain form
    await page.getByLabel(/domain name/i).fill('Test Domain')
    await page.getByLabel(/description/i).fill('A test domain for E2E testing')
    
    // Submit the form
    await page.getByRole('button', { name: /create/i }).click()

    // Check that the domain was created
    await expect(page.getByText('Test Domain')).toBeVisible()
    await expect(page.getByText('A test domain for E2E testing')).toBeVisible()

    // Check success toast
    await expect(page.getByText(/domain created successfully/i)).toBeVisible()
  })

  test('should edit an existing domain', async ({ page }) => {
    // Find and click edit button for the first domain
    await page.getByTestId('edit-domain-button').first().click()

    // Update the domain name
    await page.getByLabel(/domain name/i).clear()
    await page.getByLabel(/domain name/i).fill('Updated Domain Name')
    
    // Submit the form
    await page.getByRole('button', { name: /update/i }).click()

    // Check that the domain was updated
    await expect(page.getByText('Updated Domain Name')).toBeVisible()

    // Check success toast
    await expect(page.getByText(/domain updated successfully/i)).toBeVisible()
  })

  test('should delete a domain', async ({ page }) => {
    // Find and click delete button for the first domain
    await page.getByTestId('delete-domain-button').first().click()

    // Confirm deletion in modal
    await page.getByRole('button', { name: /delete/i }).click()

    // Check that the domain was deleted
    await expect(page.getByText(/domain deleted successfully/i)).toBeVisible()
  })

  test('should search and filter domains', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder(/search domains/i).fill('Test')

    // Check that search results are filtered
    await expect(page.getByText('Test Domain')).toBeVisible()

    // Clear search
    await page.getByPlaceholder(/search domains/i).clear()

    // Check that all domains are visible again
    await expect(page.getByTestId('domain-item')).toHaveCount(1)
  })

  test('should view domain details', async ({ page }) => {
    // Click on a domain to view details
    await page.getByTestId('domain-item').first().click()

    // Check that we're on the domain details page
    await expect(page.getByRole('heading', { name: /domain details/i })).toBeVisible()

    // Check that domain information is displayed
    await expect(page.getByTestId('domain-name')).toBeVisible()
    await expect(page.getByTestId('domain-description')).toBeVisible()
    await expect(page.getByTestId('domain-created-at')).toBeVisible()

    // Check that documents section is visible
    await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible()
  })
})
