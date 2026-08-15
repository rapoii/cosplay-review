import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];
try {
  const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedPage.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await reducedPage.locator('.nav-menu summary').click();
  await reducedPage.locator('.nav-menu-panel a[href="/qr"]').click();
  await reducedPage.waitForURL('**/qr');
  await reducedPage.waitForLoadState('networkidle');
  results.push(await reducedPage.evaluate(() => ({
    mode: 'prefers-reduced-motion',
    path: location.pathname,
    nativeViewTransition: typeof document.startViewTransition === 'function',
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
  })));
  await reducedPage.close();

  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:4321/qr', { waitUntil: 'networkidle' });
  await desktopPage.locator('.nav-menu summary').click();
  await desktopPage.locator('.nav-menu-panel a[href="/"]').click();
  await desktopPage.waitForURL('**/');
  await desktopPage.waitForLoadState('networkidle');
  results.push(await desktopPage.evaluate(() => ({
    mode: 'desktop',
    path: location.pathname,
    nativeViewTransition: typeof document.startViewTransition === 'function',
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
  })));
  await desktopPage.close();

  const pass = results.every((item) => item.path && item.nativeViewTransition && item.scrollBehavior === 'auto' && !item.horizontalOverflow);
  console.log(JSON.stringify({ results, pass }, null, 2));
} finally {
  await browser.close();
}
