const { chromium } = require('playwright');

async function testFrontend() {
  console.log('🚀 Starting browser test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to http://localhost:80...');
    await page.goto('http://localhost:80');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking screenshots...');
    
    // Desktop screenshot
    await page.screenshot({ 
      path: 'desktop-view.png',
      fullPage: true 
    });
    
    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'mobile-view.png',
      fullPage: true 
    });
    
    // Check for elements
    const title = await page.textContent('h1');
    console.log('📝 Page title:', title);
    
    const yellowElements = await page.locator('[class*="yellow"]').count();
    console.log('🎨 Yellow elements found:', yellowElements);
    
    const cards = await page.locator('[class*="rounded-2xl"]').count();
    console.log('🃏 Cards found:', cards);
    
    console.log('✅ Test completed! Check desktop-view.png and mobile-view.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testFrontend();
