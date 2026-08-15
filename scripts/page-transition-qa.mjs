import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];

try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.__transitionEvents = [];
    ['astro:before-preparation', 'astro:after-preparation', 'astro:before-swap', 'astro:after-swap', 'astro:page-load'].forEach((name) => {
      document.addEventListener(name, () => window.__transitionEvents.push(name));
    });
    window.__audioBefore = document.querySelector('audio');
  });

  const supportsNativeViewTransition = await page.evaluate(() => typeof document.startViewTransition === 'function');
  await page.locator('.nav-menu summary').click();
  await page.locator('.nav-menu-panel a[href="/qr"]').click();
  await page.waitForURL('**/qr');
  await page.waitForLoadState('networkidle');
  const qr = await page.evaluate(() => ({
    path: location.pathname,
    events: window.__transitionEvents || [],
    audioPersisted: window.__audioBefore === document.querySelector('audio'),
    routerLoaded: Boolean(document.querySelector('astro-island')),
    cssSupportsViewTransition: CSS.supports('view-transition-name: root'),
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
  }));
  results.push({ transition: 'review-to-qr', supportsNativeViewTransition, ...qr });

  await page.evaluate(() => {
    window.__transitionEvents = [];
    window.__audioBefore = document.querySelector('audio');
  });
  await page.locator('.nav-menu summary').click();
  await page.locator('.nav-menu-panel a[href="/admin"]').click();
  await page.waitForURL('**/admin');
  await page.waitForLoadState('networkidle');
  const admin = await page.evaluate(() => ({
    path: location.pathname,
    events: window.__transitionEvents || [],
    audioPersisted: window.__audioBefore === document.querySelector('audio'),
    cssSupportsViewTransition: CSS.supports('view-transition-name: root'),
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    title: getComputedStyle(document.querySelector('.admin-gate h2')).fontFamily
  }));
  results.push({ transition: 'qr-to-admin', supportsNativeViewTransition, ...admin });

  console.log(JSON.stringify({ results, pass: results.every((item) => item.path && item.events.includes('astro:after-swap') && item.events.includes('astro:page-load') && item.audioPersisted && item.scrollBehavior === 'auto' && !item.horizontalOverflow) }, null, 2));
} finally {
  await browser.close();
}
