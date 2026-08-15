import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => ({ behavior: getComputedStyle(document.documentElement).scrollBehavior, y: window.scrollY }));
  const samples = [];
  await page.locator('a[href="#ulasan"]').click();
  const started = Date.now();
  while (Date.now() - started < 800) {
    samples.push({ elapsed: Date.now() - started, y: await page.evaluate(() => Math.round(window.scrollY)) });
    await page.waitForTimeout(40);
  }
  const firstMovement = samples.find((sample) => sample.y > 0);
  const last = samples.at(-1);
  console.log(JSON.stringify({ before, firstMovement, last, samples: samples.slice(0, 12) }, null, 2));
} finally {
  await browser.close();
}
