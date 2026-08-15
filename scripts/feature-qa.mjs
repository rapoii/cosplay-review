import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];

async function checkHome(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const starCount = await page.locator('.star-button').count();
  const ratingHint = await page.locator('.star-button').nth(4).getAttribute('aria-label');
  await page.locator('.star-button').nth(4).click();
  const ratingText = await page.locator('.rating-value').first().textContent();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  results.push({
    route: '/',
    viewport: `${viewport.width}x${viewport.height}`,
    starCount,
    ratingHint,
    ratingText,
    overflow
  });
}

async function checkAdmin(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  const gateVisible = await page.locator('.admin-gate').isVisible();
  await page.locator('#admin-key').fill('lilyreview');
  await page.locator('.admin-key-form button').click();
  await page.locator('.admin-dashboard').waitFor({ state: 'visible' });
  const dashboardTitle = await page.locator('#admin-title').textContent();
  const metricCards = await page.locator('.admin-metric-card').count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  results.push({
    route: '/admin',
    viewport: `${viewport.width}x${viewport.height}`,
    gateVisible,
    dashboardTitle,
    metricCards,
    overflow
  });
}

async function checkQr(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/qr`, { waitUntil: 'networkidle' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  const canvasSize = await page.locator('canvas').evaluate((canvas) => ({ width: canvas.width, height: canvas.height }));
  const buttons = await page.locator('.qr-actions button').count();
  const targetUrl = await page.locator('.qr-url strong').textContent();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: `qa-feature-qr-${viewport.width}.png`, fullPage: true });
  results.push({
    route: '/qr',
    viewport: `${viewport.width}x${viewport.height}`,
    canvasSize,
    buttons,
    targetUrl,
    overflow
  });
}

try {
  const page = await browser.newPage();
  await checkHome(page, { width: 1280, height: 900 });
  await checkHome(page, { width: 390, height: 844 });
  await checkAdmin(page, { width: 1280, height: 900 });
  await checkAdmin(page, { width: 390, height: 844 });
  await checkQr(page, { width: 1280, height: 900 });
  await checkQr(page, { width: 390, height: 844 });
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
