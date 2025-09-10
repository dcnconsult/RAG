const { chromium } = require('playwright');

async function testFrontend() {
  console.log('🚀 Starting Chrome browser test...');
  
  // Launch Chrome browser
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for headless mode
    slowMo: 1000     // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to http://localhost:80...');
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'frontend-screenshot.png',
      fullPage: true 
    });
    
    console.log('🎨 Testing mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'frontend-mobile.png',
      fullPage: true 
    });
    
    console.log('🔍 Checking for yellow accent colors...');
    const yellowElements = await page.locator('[class*="yellow"], [class*="primary"]').count();
    console.log(`Found ${yellowElements} elements with yellow/primary styling`);
    
    console.log('📱 Testing bottom navigation...');
    const navItems = await page.locator('.nav-item').count();
    console.log(`Found ${navItems} navigation items`);
    
    console.log('✅ Frontend test completed successfully!');
    console.log('📁 Screenshots saved: frontend-screenshot.png, frontend-mobile.png');
    
  } catch (error) {
    console.error('❌ Error testing frontend:', error.message);
  } finally {
    await browser.close();
  }
}

testFrontend().catch(console.error);
