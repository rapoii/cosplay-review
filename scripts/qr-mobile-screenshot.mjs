import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:4321/qr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: '/home/ubuntu/cosplay-review/qr-mobile-spacing-final.png', fullPage: true });
} finally {
  await browser.close();
}
