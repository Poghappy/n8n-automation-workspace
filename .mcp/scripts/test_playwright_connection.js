const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Connecting to Chrome...');
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    
    console.log('Getting browser version...');
    const version = await browser.version();
    console.log('Chrome version:', version);
    
    console.log('Getting browser contexts...');
    const contexts = browser.contexts();
    console.log('Number of browser contexts:', contexts.length);
    
    console.log('Creating new context...');
    const context = await browser.newContext();
    
    console.log('Creating new page...');
    const page = await context.newPage();
    
    console.log('Navigation to about:blank...');
    await page.goto('about:blank');
    
    console.log('Getting page title...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('Closing context...');
    await context.close();
    
    console.log('Disconnecting from browser...');
    await browser.disconnect();
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();