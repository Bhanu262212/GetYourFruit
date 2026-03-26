import { sync_playwright } from 'playwright';

(async () => {
  const browser = await sync_playwright().chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/home');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/app/ui/screenshot.png' });
  await browser.close();
})();
