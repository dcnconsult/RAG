import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the documents page before each test
    await page.goto('/documents')
  })

  test('should upload a document', async ({ page }) => {
    // Click upload document button
    await page.getByRole('button', { name: /upload document/i }).click()

    // Select a domain
    await page.getByLabel(/select domain/i).click()
    await page.getByRole('option', { name: /test domain/i }).click()

    // Upload a test file
    const filePath = path.join(__dirname, 'fixtures', 'test-document.txt')
    await page.setInputFiles('input[type="file"]', filePath)

    // Submit the form
    await page.getByRole('button', { name: /upload/i }).click()

    // Check that the document was uploaded
    await expect(page.getByText('test-document.txt')).toBeVisible()

    // Check success toast
    await expect(page.getByText(/document uploaded successfully/i)).toBeVisible()
  })

  test('should view document details', async ({ page }) => {
    // Click on a document to view details
    await page.getByTestId('document-item').first().click()

    // Check that we're on the document details page
    await expect(page.getByRole('heading', { name: /document details/i })).toBeVisible()

    // Check that document information is displayed
    await expect(page.getByTestId('document-name')).toBeVisible()
    await expect(page.getByTestId('document-size')).toBeVisible()
    await expect(page.getByTestId('document-type')).toBeVisible()
    await expect(page.getByTestId('document-uploaded-at')).toBeVisible()

    // Check that document content is visible
    await expect(page.getByTestId('document-content')).toBeVisible()
  })

  test('should delete a document', async ({ page }) => {
    // Find and click delete button for the first document
    await page.getByTestId('delete-document-button').first().click()

    // Confirm deletion in modal
    await page.getByRole('button', { name: /delete/i }).click()

    // Check that the document was deleted
    await expect(page.getByText(/document deleted successfully/i)).toBeVisible()
  })

  test('should search and filter documents', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder(/search documents/i).fill('test')

    // Check that search results are filtered
    await expect(page.getByText('test-document.txt')).toBeVisible()

    // Clear search
    await page.getByPlaceholder(/search documents/i).clear()

    // Check that all documents are visible again
    await expect(page.getByTestId('document-item')).toHaveCount(1)
  })

  test('should filter documents by domain', async ({ page }) => {
    // Select a domain filter
    await page.getByLabel(/filter by domain/i).click()
    await page.getByRole('option', { name: /test domain/i }).click()

    // Check that only documents from that domain are visible
    await expect(page.getByTestId('document-item')).toHaveCount(1)
    await expect(page.getByText('test-document.txt')).toBeVisible()

    // Clear filter
    await page.getByLabel(/filter by domain/i).click()
    await page.getByRole('option', { name: /all domains/i }).click()

    // Check that all documents are visible again
    await expect(page.getByTestId('document-item')).toHaveCount(1)
  })

  test('should handle document processing status', async ({ page }) => {
    // Check that processing status is displayed
    await expect(page.getByTestId('processing-status')).toBeVisible()

    // Wait for processing to complete
    await page.waitForSelector('[data-testid="processing-status"][data-status="completed"]', { timeout: 30000 })

    // Check that processing is complete
    await expect(page.getByTestId('processing-status')).toHaveAttribute('data-status', 'completed')
  })
})
