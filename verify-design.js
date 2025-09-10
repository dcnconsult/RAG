const { chromium } = require('playwright');
const fs = require('fs');

async function verifyDesign() {
  console.log('🎨 Verifying Frontend Design with Screenshots...');

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

    // Take full page screenshot
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'current-design-full.png', 
      fullPage: true 
    });

    // Take viewport screenshot
    console.log('📸 Taking viewport screenshot...');
    await page.screenshot({ 
      path: 'current-design-viewport.png' 
    });

    // Test mobile view
    console.log('📱 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'current-design-mobile.png',
      fullPage: true 
    });

    // Analyze the current design
    console.log('🔍 Analyzing current design...');
    const analysis = await page.evaluate(() => {
      const yellowElements = document.querySelectorAll('[class*="yellow-"]').length;
      const cards = document.querySelectorAll('.rounded-xl, .rounded-2xl, .rounded-lg').length;
      const buttons = document.querySelectorAll('button').length;
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      
      // Check for specific elements from your reference
      const welcomeSection = document.querySelector('h1')?.textContent?.includes('Welcome to RAG Explorer');
      const mainCard = document.querySelector('.max-w-xl') !== null;
      const statsGrid = document.querySelectorAll('[class*="grid"]').length;
      const quickActions = document.querySelector('h3')?.textContent?.includes('Quick Actions');
      
      // Check typography sizes
      const titleSize = getComputedStyle(document.querySelector('h1')).fontSize;
      const subtitleSize = getComputedStyle(document.querySelector('h2')).fontSize;
      
      return {
        yellowElements,
        cards,
        buttons,
        headings,
        welcomeSection,
        mainCard,
        statsGrid,
        quickActions,
        titleSize,
        subtitleSize,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    console.log('📊 Design Analysis Results:');
    console.log(`   Yellow elements: ${analysis.yellowElements}`);
    console.log(`   Cards: ${analysis.cards}`);
    console.log(`   Buttons: ${analysis.buttons}`);
    console.log(`   Headings: ${analysis.headings}`);
    console.log(`   Welcome section: ${analysis.welcomeSection}`);
    console.log(`   Main card: ${analysis.mainCard}`);
    console.log(`   Stats grid: ${analysis.statsGrid}`);
    console.log(`   Quick actions: ${analysis.quickActions}`);
    console.log(`   Title size: ${analysis.titleSize}`);
    console.log(`   Subtitle size: ${analysis.subtitleSize}`);
    console.log(`   Viewport: ${analysis.viewport.width}x${analysis.viewport.height}`);

    // Save analysis to file
    fs.writeFileSync('design-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('✅ Screenshots saved:');
    console.log('   - current-design-full.png (full page)');
    console.log('   - current-design-viewport.png (desktop view)');
    console.log('   - current-design-mobile.png (mobile view)');
    console.log('   - design-analysis.json (detailed analysis)');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await browser.close();
  }
}

verifyDesign().catch(console.error);
