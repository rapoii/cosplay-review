import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const results = [];

for (const viewport of [
  { name: 'chibi-desktop', width: 1440, height: 1000 },
  { name: 'chibi-mobile', width: 390, height: 844 }
]) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => {
    const form = document.querySelector('.form-shell');
    const chibi = document.querySelector('.chibi-greeting');
    const image = document.querySelector('.chibi-art img');
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasForm: Boolean(form),
      hasChibiPanel: Boolean(chibi),
      hasWall: Boolean(document.querySelector('.wall-section')),
      starButtons: document.querySelectorAll('.star-button').length,
      chibiLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
      formTop: form?.getBoundingClientRect().top ?? null,
      chibiTop: chibi?.getBoundingClientRect().top ?? null,
      overflowers: Array.from(document.querySelectorAll('*'))
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 12)
        .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) }))
    };
  });

  await page.screenshot({ path: `/home/ubuntu/cosplay-review/qa-${viewport.name}.png`, fullPage: true });
  results.push({ viewport: viewport.name, layout, consoleErrors });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
