import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const logs = [];
const failed = [];
page.on('requestfailed', (request) => failed.push({ url: request.url(), failure: request.failure()?.errorText ?? '' }));
page.on('response', (response) => { if (response.status() >= 400) logs.push({ type: 'response', status: response.status(), url: response.url() }); });
page.on('console', (message) => logs.push({ type: message.type(), text: message.text() }));
page.on('pageerror', (error) => logs.push({ type: 'pageerror', text: error.message }));
try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  const before = await page.locator('.rating-row').first().locator('.star-button').first().evaluate((button) => ({
    outerHTML: button.outerHTML,
    disabled: button.disabled,
    rect: button.getBoundingClientRect().toJSON(),
    pointerEvents: getComputedStyle(button).pointerEvents,
    zIndex: getComputedStyle(button).zIndex
  }));
  await page.locator('.rating-row').first().locator('.star-button').first().dispatchEvent('click');
  await page.waitForTimeout(100);
  const afterDispatch = await page.locator('.rating-row').first().evaluate((row) => ({
    active: row.querySelectorAll('.star-button.active').length,
    value: row.querySelector('.rating-value')?.textContent?.trim(),
    checked: row.querySelectorAll('.star-button[aria-checked="true"]').length
  }));
  await page.locator('.rating-row').first().locator('.star-button').first().click({ force: true });
  await page.waitForTimeout(100);
  const afterForce = await page.locator('.rating-row').first().evaluate((row) => ({
    active: row.querySelectorAll('.star-button.active').length,
    value: row.querySelector('.rating-value')?.textContent?.trim(),
    checked: row.querySelectorAll('.star-button[aria-checked="true"]').length
  }));
  console.log(JSON.stringify({ before, afterDispatch, afterForce, logs, failed }, null, 2));
} finally {
  await browser.close();
}
