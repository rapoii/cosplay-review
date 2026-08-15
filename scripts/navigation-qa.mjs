import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];
const expectedMenuHrefs = ['/', '/qr', '/admin'];

try {
  const page = await browser.newPage();
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const menu = page.locator('.nav-menu');
    const menuItems = await menu.locator('.nav-menu-panel a').count();
    await menu.locator('summary').click();
    const opened = await menu.evaluate((node) => node.hasAttribute('open'));
    const hrefs = await menu.locator('.nav-menu-panel a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const hasHeaderReviewLink = await page.locator('.view-reviews-link').count() > 0;
    results.push({
      route: '/',
      viewport: `${viewport.width}x${viewport.height}`,
      menuItems,
      opened,
      hrefs,
      consistent: JSON.stringify(hrefs) === JSON.stringify(expectedMenuHrefs),
      hasInstagram: hrefs.some((href) => href?.includes('instagram.com')),
      hasHeaderReviewLink,
      overflow
    });
  }

  for (const route of ['/qr', '/admin']) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const menu = page.locator('.nav-menu');
    await menu.locator('summary').click();
    const hrefs = await menu.locator('.nav-menu-panel a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const hasHeaderReviewLink = await page.locator('.view-reviews-link').count() > 0;
    results.push({
      route,
      menuItems: hrefs.length,
      hrefs,
      consistent: JSON.stringify(hrefs) === JSON.stringify(expectedMenuHrefs),
      hasInstagram: hrefs.some((href) => href?.includes('instagram.com')),
      hasHeaderReviewLink,
      overflow
    });
  }

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
