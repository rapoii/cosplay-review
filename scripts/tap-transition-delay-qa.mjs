import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const cases = [
  { from: '/', to: '/qr' },
  { from: '/qr', to: '/admin' },
  { from: '/admin', to: '/' }
];
const results = [];
try {
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await page.goto(`${baseUrl}${item.from}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      window.__timing = { clickAt: null, transitionAt: null, called: false };
      document.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('.nav-menu-panel a')) {
          window.__timing.clickAt = performance.now();
        }
      }, true);
      if (typeof document.startViewTransition === 'function') {
        const original = document.startViewTransition.bind(document);
        document.startViewTransition = (...args) => {
          window.__timing.transitionAt = performance.now();
          window.__timing.called = true;
          return original(...args);
        };
      }
    });
    await page.locator('.nav-menu summary').click();
    await page.locator(`.nav-menu-panel a[href="${item.to}"]`).click();
    await page.waitForURL(`**${item.to}`);
    await page.waitForTimeout(40);
    const timing = await page.evaluate(() => ({ ...window.__timing, delay: window.__timing.transitionAt == null || window.__timing.clickAt == null ? null : window.__timing.transitionAt - window.__timing.clickAt }));
    results.push({ ...item, ...timing });
    await page.close();
  }
  const measured = results.filter((item) => typeof item.delay === 'number');
  const pass = measured.length === cases.length && measured.every((item) => item.called && item.delay < 120);
  console.log(JSON.stringify({ results, targetDelayMs: '<120', pass }, null, 2));
} finally {
  await browser.close();
}
