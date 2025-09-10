const { test, expect } = require('@playwright/test');

test.describe('RAG Explorer Frontend', () => {
  test('should load the homepage with correct styling', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Welcome to RAG Explorer');
    
    // Check for yellow accent colors
    const yellowElements = page.locator('[class*="yellow"], [class*="primary"]');
    await expect(yellowElements.first()).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage-desktop.png', fullPage: true });
  });

  test('should display mobile navigation correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check for bottom navigation
    const bottomNav = page.locator('.nav-item');
    await expect(bottomNav).toHaveCount(3); // Domains, Chat, Settings
    
    // Check for yellow active states
    const activeNavItem = page.locator('.nav-item-active');
    await expect(activeNavItem).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ path: 'homepage-mobile.png', fullPage: true });
  });

  test('should have proper card layouts', async ({ page }) => {
    await page.goto('/');
    
    // Check for cards with modern styling
    const cards = page.locator('.card-modern, [class*="rounded-2xl"]');
    await expect(cards.first()).toBeVisible();
    
    // Check for proper spacing
    const cardBody = page.locator('[class*="p-4"], [class*="p-6"]');
    await expect(cardBody.first()).toBeVisible();
  });

  test('should display domain management page', async ({ page }) => {
    await page.goto('/domains');
    
    // Check for domain management title
    await expect(page.locator('h1')).toContainText('Domain Management');
    
    // Check for yellow accent button
    const addButton = page.locator('button:has-text("Add")');
    await expect(addButton).toBeVisible();
    
    // Take screenshot of domains page
    await page.screenshot({ path: 'domains-page.png', fullPage: true });
  });

  test('should display chat interface', async ({ page }) => {
    await page.goto('/chats');
    
    // Check for chat interface
    await expect(page.locator('h1')).toContainText('Chat');
    
    // Check for chat messages with yellow styling
    const userMessage = page.locator('.chat-message-user');
    await expect(userMessage).toBeVisible();
    
    // Take screenshot of chat page
    await page.screenshot({ path: 'chat-page.png', fullPage: true });
  });
});
