import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];
try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  const nav = await page.evaluate(() => {
    const summary = document.querySelector('.nav-menu summary');
    const chevron = document.querySelector('.nav-chevron');
    const panel = document.querySelector('.nav-menu-panel');
    const style = getComputedStyle(chevron);
    const before = getComputedStyle(chevron, '::before');
    const after = getComputedStyle(chevron, '::after');
    const panelStyle = getComputedStyle(panel);
    return {
      hasChevron: Boolean(chevron),
      chevronTransition: style.transition,
      chevronBeforeRotate: before.transform,
      chevronAfterRotate: after.transform,
      panelAnimation: panelStyle.animation,
      panelOrigin: panelStyle.transformOrigin
    };
  });
  results.push({ route: '/', ...nav });

  await page.locator('.nav-menu summary').click();
  await page.waitForTimeout(300);
  const opened = await page.evaluate(() => {
    const chevron = document.querySelector('.nav-chevron');
    const style = getComputedStyle(chevron);
    const before = getComputedStyle(chevron, '::before');
    const after = getComputedStyle(chevron, '::after');
    return {
      chevronRotate: style.transform,
      chevronBeforeRotate: before.transform,
      chevronAfterRotate: after.transform
    };
  });
  results.push({ route: '/', state: 'opened', ...opened });

  console.log(JSON.stringify({ results, pass: results[0].hasChevron && results[0].chevronTransition.includes('transform') && results[0].panelAnimation.includes('nav-menu-enter') && results[0].chevronBeforeRotate !== results[1].chevronBeforeRotate && results[0].chevronAfterRotate !== results[1].chevronAfterRotate }, null, 2));
} finally {
  await browser.close();
}
