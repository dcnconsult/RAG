const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeFrontend() {
  console.log('🔍 Analyzing RAG Explorer Frontend...');
  
  const browser = await chromium.launch({ 
    headless: true, // Run headless to avoid focus issues
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Testing desktop view...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    
    // Analyze styling
    const analysis = {
      desktop: await analyzePage(page, 'desktop'),
      mobile: null
    };
    
    console.log('📱 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    
    analysis.mobile = await analyzePage(page, 'mobile');
    
    // Save analysis
    fs.writeFileSync('frontend-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('✅ Analysis complete! Check frontend-analysis.json');
    console.log('📊 Summary:');
    console.log(`   Desktop: ${analysis.desktop.yellowElements} yellow elements, ${analysis.desktop.cards} cards`);
    console.log(`   Mobile: ${analysis.mobile.yellowElements} yellow elements, ${analysis.mobile.cards} cards`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

async function analyzePage(page, viewport) {
  const title = await page.textContent('h1').catch(() => 'Not found');
  const yellowElements = await page.locator('[class*="yellow"], [class*="primary"]').count();
  const cards = await page.locator('[class*="rounded-2xl"], [class*="card"]').count();
  const navItems = await page.locator('.nav-item, [class*="nav"]').count();
  const buttons = await page.locator('button').count();
  
  // Check for specific styling classes
  const hasYellowAccent = await page.locator('[class*="yellow-500"]').count() > 0;
  const hasRoundedCards = await page.locator('[class*="rounded-2xl"]').count() > 0;
  const hasMobileNav = await page.locator('.nav-item').count() > 0;
  
  return {
    title,
    yellowElements,
    cards,
    navItems,
    buttons,
    hasYellowAccent,
    hasRoundedCards,
    hasMobileNav,
    timestamp: new Date().toISOString()
  };
}

analyzeFrontend().catch(console.error);
