import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = {};

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  results.normal = await page.evaluate(() => ({
    motion60: document.documentElement.classList.contains('motion-60'),
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    revealTransitionDuration: getComputedStyle(document.querySelector('[data-reveal]')).transitionDuration,
    hasWheelHandlerMarker: Boolean(document.querySelector('[data-custom-scroll]'))
  }));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  results.reducedMotion = await page.evaluate(() => ({
    motion60: document.documentElement.classList.contains('motion-60'),
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior
  }));

  const lowPowerPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await lowPowerPage.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 });
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 2 });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '2g' } });
  });
  await lowPowerPage.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await lowPowerPage.waitForTimeout(250);
  results.lowPower = await lowPowerPage.evaluate(() => ({
    motion60: document.documentElement.classList.contains('motion-60'),
    lowPower: document.documentElement.classList.contains('low-power'),
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    revealTransitionDuration: getComputedStyle(document.querySelector('[data-reveal]')).transitionDuration
  }));
  await lowPowerPage.close();

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
