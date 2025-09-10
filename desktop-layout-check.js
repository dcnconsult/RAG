const { chromium } = require('playwright');
const fs = require('fs');

async function checkDesktopLayout() {
  console.log('🖥️ Checking Desktop Layout and Style...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }, // Desktop viewport
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:80', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Take desktop screenshot
    await page.screenshot({ 
      path: 'desktop-layout-check.png', 
      fullPage: true 
    });

    // Check for navigation elements
    const navCheck = await page.evaluate(() => {
      // Look for different navigation patterns
      const headerNav = document.querySelector('header nav');
      const sidebarNav = document.querySelector('aside nav, .sidebar nav');
      const bottomNav = document.querySelector('[data-testid="bottom-navigation"], .bottom-nav, nav[class*="bottom"]');
      const mainNav = document.querySelector('nav');
      
      // Check for specific navigation items
      const navItems = document.querySelectorAll('nav a, nav button, [role="navigation"] a, [role="navigation"] button');
      const navTexts = Array.from(navItems).map(item => item.textContent?.trim()).filter(Boolean);
      
      // Check for dashboard layout elements
      const welcomeCard = document.querySelector('.max-w-2xl, .max-w-xl');
      const statsCards = document.querySelectorAll('[class*="grid"] > div');
      const actionCards = document.querySelectorAll('main > div > div');
      
      // Check spacing and layout
      const getSpacing = (element) => {
        if (!element) return null;
        const styles = getComputedStyle(element);
        return {
          margin: styles.margin,
          padding: styles.padding,
          gap: styles.gap
        };
      };

      return {
        navigation: {
          hasHeaderNav: !!headerNav,
          hasSidebarNav: !!sidebarNav,
          hasBottomNav: !!bottomNav,
          hasMainNav: !!mainNav,
          navItems: navTexts,
          navItemCount: navItems.length
        },
        layout: {
          welcomeCard: {
            exists: !!welcomeCard,
            classes: welcomeCard?.className,
            spacing: getSpacing(welcomeCard)
          },
          statsCards: {
            count: statsCards.length,
            spacing: Array.from(statsCards).slice(0, 3).map(getSpacing)
          },
          actionCards: {
            count: actionCards.length,
            spacing: Array.from(actionCards).slice(0, 3).map(getSpacing)
          }
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    console.log('📊 Desktop Layout Analysis:');
    console.log(`   Viewport: ${navCheck.viewport.width}x${navCheck.viewport.height}`);
    console.log('   Navigation:');
    console.log(`     Header Nav: ${navCheck.navigation.hasHeaderNav ? '✅' : '❌'}`);
    console.log(`     Sidebar Nav: ${navCheck.navigation.hasSidebarNav ? '✅' : '❌'}`);
    console.log(`     Bottom Nav: ${navCheck.navigation.hasBottomNav ? '✅' : '❌'}`);
    console.log(`     Main Nav: ${navCheck.navigation.hasMainNav ? '✅' : '❌'}`);
    console.log(`     Nav Items: ${navCheck.navigation.navItemCount} (${navCheck.navigation.navItems.join(', ')})`);
    
    console.log('   Layout Elements:');
    console.log(`     Welcome Card: ${navCheck.layout.welcomeCard.exists ? '✅' : '❌'}`);
    console.log(`     Stats Cards: ${navCheck.layout.statsCards.count}`);
    console.log(`     Action Cards: ${navCheck.layout.actionCards.count}`);

    // Check if we need to add missing navigation
    if (!navCheck.navigation.hasHeaderNav && !navCheck.navigation.hasSidebarNav) {
      console.log('⚠️  Missing navigation - checking if we need to add it');
      
      // Check what navigation should be there based on the app structure
      const expectedNavItems = ['Dashboard', 'Domains', 'Documents', 'Chats', 'Search', 'RAG', 'External Models'];
      const missingItems = expectedNavItems.filter(item => 
        !navCheck.navigation.navItems.some(navItem => 
          navItem.toLowerCase().includes(item.toLowerCase())
        )
      );
      
      if (missingItems.length > 0) {
        console.log(`   Missing nav items: ${missingItems.join(', ')}`);
      }
    }

    // Save analysis
    fs.writeFileSync('desktop-layout-analysis.json', JSON.stringify(navCheck, null, 2));
    
    console.log('✅ Desktop layout check complete!');
    console.log('   Screenshot saved: desktop-layout-check.png');
    console.log('   Analysis saved: desktop-layout-analysis.json');

  } catch (error) {
    console.error('❌ Error during desktop layout check:', error);
  } finally {
    await browser.close();
  }
}

checkDesktopLayout().catch(console.error);
