const { chromium } = require('playwright');
const fs = require('fs');

async function debugDesign() {
  console.log('🔍 Debugging Frontend Design...');

  const browser = await chromium.launch({
    headless: false, // Run with GUI to see the browser
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // Navigate to the application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    
    // Wait for the page to load completely
    await page.waitForTimeout(3000);

    // Debug the page content
    console.log('🔍 Debugging page content...');
    const debugInfo = await page.evaluate(() => {
      const h1Elements = document.querySelectorAll('h1');
      const h2Elements = document.querySelectorAll('h2');
      const h3Elements = document.querySelectorAll('h3');
      const cards = document.querySelectorAll('.rounded-xl, .rounded-2xl, .rounded-lg');
      const yellowElements = document.querySelectorAll('[class*="yellow-"]');
      
      return {
        h1Texts: Array.from(h1Elements).map(h => h.textContent?.trim()),
        h2Texts: Array.from(h2Elements).map(h => h.textContent?.trim()),
        h3Texts: Array.from(h3Elements).map(h => h.textContent?.trim()),
        cardCount: cards.length,
        yellowCount: yellowElements.length,
        cardClasses: Array.from(cards).slice(0, 5).map(c => c.className),
        yellowClasses: Array.from(yellowElements).slice(0, 10).map(e => e.className),
        bodyText: document.body.textContent?.substring(0, 500),
        title: document.title
      };
    });

    console.log('📊 Debug Results:');
    console.log(`   Title: ${debugInfo.title}`);
    console.log(`   H1 texts: ${JSON.stringify(debugInfo.h1Texts)}`);
    console.log(`   H2 texts: ${JSON.stringify(debugInfo.h2Texts)}`);
    console.log(`   H3 texts: ${JSON.stringify(debugInfo.h3Texts)}`);
    console.log(`   Card count: ${debugInfo.cardCount}`);
    console.log(`   Yellow count: ${debugInfo.yellowCount}`);
    console.log(`   Sample card classes: ${JSON.stringify(debugInfo.cardClasses)}`);
    console.log(`   Sample yellow classes: ${JSON.stringify(debugInfo.yellowClasses)}`);
    console.log(`   Body text preview: ${debugInfo.bodyText?.substring(0, 200)}...`);

    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'debug-design.png',
      fullPage: true 
    });

    // Save debug info
    fs.writeFileSync('debug-analysis.json', JSON.stringify(debugInfo, null, 2));
    
    console.log('✅ Debug complete! Check debug-design.png and debug-analysis.json');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugDesign().catch(console.error);
