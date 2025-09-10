const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveStylingTest() {
  console.log('🎨 Starting Comprehensive Frontend Styling Tests...');
  
  const browser = await chromium.launch({ 
    headless: false, // Run with GUI to see issues
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Homepage/Dashboard
    console.log('🏠 Testing Homepage...');
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    await testHomepage(page);
    
    // Test 2: Domains Page
    console.log('📁 Testing Domains Page...');
    await page.goto('http://localhost:80/domains', { waitUntil: 'networkidle' });
    await testDomainsPage(page);
    
    // Test 3: Chats Page
    console.log('💬 Testing Chats Page...');
    await page.goto('http://localhost:80/chats', { waitUntil: 'networkidle' });
    await testChatsPage(page);
    
    // Test 4: Mobile Responsiveness
    console.log('📱 Testing Mobile Responsiveness...');
    await testMobileResponsiveness(page);
    
    // Generate comprehensive report
    await generateStylingReport(page);
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

async function testHomepage(page) {
  // Check main title
  const title = await page.textContent('h1');
  console.log(`   Title: ${title}`);
  
  // Check for yellow accent buttons
  const yellowButtons = await page.locator('button[class*="yellow"], .btn-primary').count();
  console.log(`   Yellow buttons: ${yellowButtons}`);
  
  // Check for modern cards
  const cards = await page.locator('[class*="rounded-2xl"]').count();
  console.log(`   Modern cards: ${cards}`);
  
  // Check for proper spacing
  const hasProperSpacing = await page.locator('[class*="space-y-"], [class*="p-4"], [class*="p-6"]').count() > 0;
  console.log(`   Proper spacing: ${hasProperSpacing}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-homepage.png', fullPage: true });
}

async function testDomainsPage(page) {
  // Check page title
  const title = await page.textContent('h1');
  console.log(`   Title: ${title}`);
  
  // Check for yellow accent elements
  const yellowElements = await page.locator('[class*="yellow"]').count();
  console.log(`   Yellow elements: ${yellowElements}`);
  
  // Check for domain cards
  const domainCards = await page.locator('[class*="card"]').count();
  console.log(`   Domain cards: ${domainCards}`);
  
  // Check for mobile grid
  const mobileGrid = await page.locator('.grid-mobile').count();
  console.log(`   Mobile grid: ${mobileGrid}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-domains.png', fullPage: true });
}

async function testChatsPage(page) {
  // Check page title
  const title = await page.textContent('h1');
  console.log(`   Title: ${title}`);
  
  // Check for chat interface
  const chatContainer = await page.locator('[class*="chat"]').count();
  console.log(`   Chat elements: ${chatContainer}`);
  
  // Check for yellow user messages
  const userMessages = await page.locator('.chat-message-user').count();
  console.log(`   User message styling: ${userMessages}`);
  
  // Check for AI messages
  const aiMessages = await page.locator('.chat-message-ai').count();
  console.log(`   AI message styling: ${aiMessages}`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-chats.png', fullPage: true });
}

async function testMobileResponsiveness(page) {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
  
  // Check mobile navigation
  const navItems = await page.locator('.nav-item').count();
  console.log(`   Mobile nav items: ${navItems}`);
  
  // Check for active nav state
  const activeNav = await page.locator('.nav-item-active').count();
  console.log(`   Active nav items: ${activeNav}`);
  
  // Check mobile spacing
  const mobileSpacing = await page.locator('[class*="sm:"]').count();
  console.log(`   Mobile responsive classes: ${mobileSpacing}`);
  
  // Take mobile screenshot
  await page.screenshot({ path: 'test-mobile.png', fullPage: true });
}

async function generateStylingReport(page) {
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      homepage: await analyzePageStyling(page, 'homepage'),
      domains: await analyzePageStyling(page, 'domains'),
      chats: await analyzePageStyling(page, 'chats'),
      mobile: await analyzePageStyling(page, 'mobile')
    },
    issues: [],
    recommendations: []
  };
  
  // Check for common issues
  await checkForIssues(page, report);
  
  // Save report
  fs.writeFileSync('styling-test-report.json', JSON.stringify(report, null, 2));
  console.log('📊 Styling test report saved to styling-test-report.json');
}

async function analyzePageStyling(page, pageType) {
  const yellowElements = await page.locator('[class*="yellow"]').count();
  const cards = await page.locator('[class*="rounded-2xl"]').count();
  const buttons = await page.locator('button').count();
  const hasInterFont = await page.locator('[style*="Inter"], [class*="font-sans"]').count() > 0;
  
  return {
    yellowElements,
    cards,
    buttons,
    hasInterFont,
    viewport: await page.viewportSize()
  };
}

async function checkForIssues(page, report) {
  // Check for missing yellow accents
  const yellowCount = await page.locator('[class*="yellow"]').count();
  if (yellowCount < 5) {
    report.issues.push('Low yellow accent usage - may need more primary color elements');
  }
  
  // Check for proper mobile navigation
  const navCount = await page.locator('.nav-item').count();
  if (navCount < 3) {
    report.issues.push('Mobile navigation may be missing items');
  }
  
  // Check for modern card styling
  const modernCards = await page.locator('[class*="rounded-2xl"]').count();
  if (modernCards < 3) {
    report.issues.push('May need more modern card styling');
  }
  
  // Add recommendations
  if (yellowCount > 0) {
    report.recommendations.push('Yellow accent colors are properly implemented');
  }
  if (navCount >= 3) {
    report.recommendations.push('Mobile navigation is properly configured');
  }
}

comprehensiveStylingTest().catch(console.error);
