import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const events = [];
try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const initial = await page.evaluate(() => ({
    path: location.pathname,
    nativeSupport: typeof document.startViewTransition === 'function',
    cssSupport: CSS.supports('view-transition-name: root'),
    clientRouterScript: [...document.scripts].some((script) => script.textContent?.includes('astro:before-preparation') || script.src.includes('transitions')),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
  }));

  await page.evaluate(() => {
    window.__vt = { called: false, ready: false, finished: false };
    if (typeof document.startViewTransition === 'function') {
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        window.__vt.called = true;
        const transition = original(...args);
        transition.ready.then(() => { window.__vt.ready = true; }).catch(() => {});
        transition.finished.then(() => { window.__vt.finished = true; }).catch(() => {});
        return transition;
      };
    }
    ['astro:before-preparation', 'astro:after-preparation', 'astro:before-swap', 'astro:after-swap', 'astro:page-load'].forEach((name) => {
      document.addEventListener(name, () => events.push(name));
    });
  });

  await page.locator('.nav-menu summary').click();
  await page.locator('.nav-menu-panel a[href="/qr"]').click();
  await page.waitForURL('**/qr');
  await page.waitForTimeout(25);
  const during = await page.evaluate(() => ({
    vt: window.__vt,
    animations: document.getAnimations().map((animation) => ({ playState: animation.playState, currentTime: animation.currentTime, effect: animation.effect?.getTiming?.() })).slice(-12),
    oldAnimation: getComputedStyle(document.documentElement, '::view-transition-old(root)').animation,
    newAnimation: getComputedStyle(document.documentElement, '::view-transition-new(root)').animation
  }));
  await page.waitForLoadState('networkidle');
  const final = await page.evaluate(() => ({ path: location.pathname, vt: window.__vt, animations: document.getAnimations().length }));
  console.log(JSON.stringify({ initial, events, during, final }, null, 2));
} finally {
  await browser.close();
}
