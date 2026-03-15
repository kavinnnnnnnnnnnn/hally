const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));
    
    await page.goto('http://localhost:5173/workflows/902b5a2d-7f50-48d7-9198-2563225ba5c5/steps', { waitUntil: 'networkidle0' });
    
    console.log("Page loaded.");
    await browser.close();
  } catch (err) {
    console.error("Puppeteer Error:", err);
  }
})();
