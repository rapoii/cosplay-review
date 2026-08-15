import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];
try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  results.push(await page.evaluate(() => ({
    route: '/',
    demoNote: document.querySelector('.demo-data-note')?.textContent?.includes('Data demo sementara') ?? false,
    reviewCards: document.querySelectorAll('.review-card').length,
    emptyState: Boolean(document.querySelector('.empty-reviews')),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1
  })));

  await page.goto('http://127.0.0.1:4321/admin', { waitUntil: 'networkidle' });
  await page.locator('#admin-key').fill('lilyreview');
  await page.locator('.admin-key-form button[type="submit"]').click();
  await page.waitForTimeout(800);
  results.push(await page.evaluate(() => ({
    route: '/admin',
    demoNote: document.querySelector('.admin-demo-note')?.textContent?.includes('Data demo sementara') ?? false,
    totalReviews: document.querySelector('.admin-total-card strong')?.textContent?.trim() ?? '',
    metricCards: document.querySelectorAll('.admin-metric-card').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1
  })));

  console.log(JSON.stringify({ results, pass: results[0].demoNote && results[0].reviewCards === 6 && !results[0].emptyState && results[1].demoNote && results[1].totalReviews === '6' && results[1].metricCards === 3 && results.every((item) => !item.overflow) }, null, 2));
} finally {
  await browser.close();
}
