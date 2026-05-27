const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.stemapp.online', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: 'C:/Users/HP/AppData/Local/Temp/stem-landing.png', fullPage: false });
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Title:', title);
  console.log('Body text:', bodyText);
  await browser.close();
})();
