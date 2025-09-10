const { chromium } = require('playwright');
const fs = require('fs');

async function verifyLayout() {
  console.log('🔍 Verifying Layout and Style Match...');

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

    // Take detailed screenshots
    console.log('📸 Taking detailed screenshots...');
    await page.screenshot({ 
      path: 'layout-verification-desktop.png', 
      fullPage: true 
    });

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'layout-verification-mobile.png',
      fullPage: true 
    });

    // Reset to desktop viewport for analysis
    await page.setViewportSize({ width: 1280, height: 720 });

    // Analyze layout structure with desktop viewport first
    console.log('🔍 Analyzing layout structure...');
    const layoutAnalysis = await page.evaluate(() => {
      // Get main layout elements
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const nav = document.querySelector('nav');
      const sidebar = document.querySelector('[class*="lg:fixed"][class*="lg:inset-y-0"], aside');
      const bottomNav = document.querySelector('[class*="lg:hidden"][class*="fixed"][class*="bottom-0"], [data-testid="bottom-navigation"]');
      
      // Get dashboard specific elements
      const welcomeSection = document.querySelector('h1');
      const mainCard = document.querySelector('.max-w-2xl, .max-w-xl');
      const statsGrid = document.querySelectorAll('[class*="grid"]');
      const quickActions = document.querySelector('h3');
      const recentActivity = document.querySelectorAll('h3')[1];
      const systemHealth = document.querySelectorAll('h3')[2];
      
      // Get button elements
      const buttons = document.querySelectorAll('button');
      const primaryButtons = document.querySelectorAll('[class*="bg-yellow-500"]');
      const secondaryButtons = document.querySelectorAll('[class*="bg-gray-100"]');
      
      // Get card elements
      const cards = document.querySelectorAll('[class*="rounded-xl"], [class*="rounded-2xl"], [class*="rounded-lg"]');
      
      // Get spacing and layout measurements
      const getElementInfo = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const styles = getComputedStyle(element);
        return {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow
        };
      };

      return {
        layout: {
          hasHeader: !!header,
          hasMain: !!main,
          hasNav: !!nav,
          hasSidebar: !!sidebar,
          hasBottomNav: !!bottomNav,
          headerInfo: getElementInfo(header),
          mainInfo: getElementInfo(main),
          bottomNavInfo: getElementInfo(bottomNav)
        },
        dashboard: {
          welcomeSection: {
            exists: !!welcomeSection,
            text: welcomeSection?.textContent?.trim(),
            info: getElementInfo(welcomeSection)
          },
          mainCard: {
            exists: !!mainCard,
            maxWidth: mainCard?.className?.includes('max-w-2xl') ? '2xl' : mainCard?.className?.includes('max-w-xl') ? 'xl' : 'unknown',
            info: getElementInfo(mainCard)
          },
          statsGrid: {
            count: statsGrid.length,
            info: Array.from(statsGrid).map(getElementInfo)
          },
          sections: {
            quickActions: {
              exists: !!quickActions,
              text: quickActions?.textContent?.trim(),
              info: getElementInfo(quickActions)
            },
            recentActivity: {
              exists: !!recentActivity,
              text: recentActivity?.textContent?.trim(),
              info: getElementInfo(recentActivity)
            },
            systemHealth: {
              exists: !!systemHealth,
              text: systemHealth?.textContent?.trim(),
              info: getElementInfo(systemHealth)
            }
          }
        },
        elements: {
          buttons: {
            total: buttons.length,
            primary: primaryButtons.length,
            secondary: secondaryButtons.length,
            primaryInfo: Array.from(primaryButtons).map(getElementInfo),
            secondaryInfo: Array.from(secondaryButtons).map(getElementInfo)
          },
          cards: {
            total: cards.length,
            info: Array.from(cards).slice(0, 5).map(getElementInfo)
          }
        },
        colors: {
          yellowElements: document.querySelectorAll('[class*="yellow-"]').length,
          primaryElements: document.querySelectorAll('[class*="bg-yellow-500"]').length,
          accentElements: document.querySelectorAll('[class*="ring-yellow-500"]').length
        },
        typography: {
          h1Size: getElementInfo(document.querySelector('h1'))?.fontSize,
          h2Size: getElementInfo(document.querySelector('h2'))?.fontSize,
          h3Size: getElementInfo(document.querySelector('h3'))?.fontSize,
          bodySize: getElementInfo(document.querySelector('body'))?.fontSize
        },
        spacing: {
          containerPadding: getElementInfo(document.querySelector('.container'))?.paddingTop,
          cardPadding: getElementInfo(document.querySelector('[class*="p-"]'))?.paddingTop,
          sectionSpacing: getElementInfo(document.querySelector('[class*="space-y-"]'))?.marginTop
        }
      };
    });

    console.log('📊 Layout Analysis Results:');
    console.log('   Layout Structure:');
    console.log(`     Header: ${layoutAnalysis.layout.hasHeader ? '✅' : '❌'}`);
    console.log(`     Main: ${layoutAnalysis.layout.hasMain ? '✅' : '❌'}`);
    console.log(`     Navigation: ${layoutAnalysis.layout.hasNav ? '✅' : '❌'}`);
    console.log(`     Sidebar: ${layoutAnalysis.layout.hasSidebar ? '✅' : '❌'}`);
    console.log(`     Bottom Navigation: ${layoutAnalysis.layout.hasBottomNav ? '✅' : '❌'}`);
    
    console.log('   Dashboard Elements:');
    console.log(`     Welcome Section: ${layoutAnalysis.dashboard.welcomeSection.exists ? '✅' : '❌'} - "${layoutAnalysis.dashboard.welcomeSection.text}"`);
    console.log(`     Main Card: ${layoutAnalysis.dashboard.mainCard.exists ? '✅' : '❌'} - Max Width: ${layoutAnalysis.dashboard.mainCard.maxWidth}`);
    console.log(`     Stats Grid: ${layoutAnalysis.dashboard.statsGrid.count} grids found`);
    console.log(`     Quick Actions: ${layoutAnalysis.dashboard.sections.quickActions.exists ? '✅' : '❌'} - "${layoutAnalysis.dashboard.sections.quickActions.text}"`);
    console.log(`     Recent Activity: ${layoutAnalysis.dashboard.sections.recentActivity.exists ? '✅' : '❌'} - "${layoutAnalysis.dashboard.sections.recentActivity.text}"`);
    console.log(`     System Health: ${layoutAnalysis.dashboard.sections.systemHealth.exists ? '✅' : '❌'} - "${layoutAnalysis.dashboard.sections.systemHealth.text}"`);
    
    console.log('   Element Counts:');
    console.log(`     Total Buttons: ${layoutAnalysis.elements.buttons.total}`);
    console.log(`     Primary Buttons: ${layoutAnalysis.elements.buttons.primary}`);
    console.log(`     Secondary Buttons: ${layoutAnalysis.elements.buttons.secondary}`);
    console.log(`     Total Cards: ${layoutAnalysis.elements.cards.total}`);
    
    console.log('   Color Usage:');
    console.log(`     Yellow Elements: ${layoutAnalysis.colors.yellowElements}`);
    console.log(`     Primary Backgrounds: ${layoutAnalysis.colors.primaryElements}`);
    console.log(`     Accent Rings: ${layoutAnalysis.colors.accentElements}`);
    
    console.log('   Typography:');
    console.log(`     H1 Size: ${layoutAnalysis.typography.h1Size}`);
    console.log(`     H2 Size: ${layoutAnalysis.typography.h2Size}`);
    console.log(`     H3 Size: ${layoutAnalysis.typography.h3Size}`);
    console.log(`     Body Size: ${layoutAnalysis.typography.bodySize}`);

    // Save detailed analysis
    fs.writeFileSync('layout-analysis.json', JSON.stringify(layoutAnalysis, null, 2));
    
    console.log('✅ Layout verification complete!');
    console.log('   Screenshots saved:');
    console.log('     - layout-verification-desktop.png');
    console.log('     - layout-verification-mobile.png');
    console.log('   Analysis saved:');
    console.log('     - layout-analysis.json');

  } catch (error) {
    console.error('❌ Error during layout verification:', error);
  } finally {
    await browser.close();
  }
}

verifyLayout().catch(console.error);
