import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('Basic Navigation (Static HTML)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the static HTML test page
    const testPagePath = join(__dirname, 'test-pages', 'basic-navigation.html')
    await page.goto(`file://${testPagePath}`)
  })

  test('should display the main page elements', async ({ page }) => {
    // Check that the main elements are visible
    await expect(page.getByRole('heading', { name: 'RAG Explorer' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Welcome to the RAG Explorer Dashboard')).toBeVisible()
  })

  test('should navigate between pages using navigation links', async ({ page }) => {
    // Navigate to Domains page
    await page.getByRole('link', { name: 'Domains' }).click()
    await expect(page.getByRole('heading', { name: 'Domains' })).toBeVisible()
    await expect(page.getByText('Manage your knowledge domains')).toBeVisible()

    // Navigate to Documents page
    await page.getByRole('link', { name: 'Documents' }).click()
    await expect(page.getByRole('heading', { name: 'Documents', level: 2 })).toBeVisible()
    await expect(page.getByText('Manage your documents')).toBeVisible()

    // Navigate to Search page
    await page.getByRole('link', { name: 'Search' }).click()
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible()
    await expect(page.getByText('Search through your knowledge base')).toBeVisible()

    // Navigate to RAG page
    await page.getByRole('link', { name: 'RAG' }).click()
    await expect(page.getByRole('heading', { name: 'RAG', level: 2 })).toBeVisible()
    await expect(page.getByText('Retrieval-Augmented Generation')).toBeVisible()

    // Navigate to Chats page
    await page.getByRole('link', { name: 'Chats' }).click()
    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible()
    await expect(page.getByText('Chat with your AI assistant')).toBeVisible()

    // Navigate to External Models page
    await page.getByRole('link', { name: 'External Models' }).click()
    await expect(page.getByRole('heading', { name: 'External Models' })).toBeVisible()
    await expect(page.getByText('Configure external AI models')).toBeVisible()

    // Navigate to Settings page
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('Configure your application')).toBeVisible()

    // Navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Welcome to the RAG Explorer Dashboard')).toBeVisible()
  })

  test('should have working breadcrumbs', async ({ page }) => {
    // Navigate to Domains page
    await page.getByRole('link', { name: 'Domains' }).click()
    
    // Check that breadcrumbs are visible
    await expect(page.getByTestId('breadcrumbs')).toBeVisible()
    await expect(page.getByTestId('breadcrumbs').getByText('Dashboard')).toBeVisible()
    await expect(page.getByTestId('breadcrumbs').getByText('Domains')).toBeVisible()

    // Click on breadcrumb to navigate back
    await page.getByTestId('breadcrumbs').getByText('Dashboard').click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should have create domain button', async ({ page }) => {
    // Navigate to Domains page
    await page.getByRole('link', { name: 'Domains' }).click()
    
    // Check that create domain button is visible
    await expect(page.getByTestId('create-domain-button')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Domain' })).toBeVisible()
  })
})
