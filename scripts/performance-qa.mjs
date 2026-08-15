import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const responses = [];
page.on('response', async (response) => {
  const request = response.request();
  if (['image', 'media', 'script', 'stylesheet', 'font'].includes(request.resourceType())) {
    responses.push({ url: response.url(), type: request.resourceType(), status: response.status(), size: Number(response.headers()['content-length'] || 0) });
  }
});

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const initial = await page.evaluate(() => ({
  audioPreload: document.querySelector('audio')?.getAttribute('preload'),
  audioPaused: document.querySelector('audio')?.paused,
  imageSources: Array.from(document.images).map((image) => ({ src: image.getAttribute('src'), loading: image.getAttribute('loading'), decoding: image.getAttribute('decoding') })),
  lowPowerClass: document.documentElement.classList.contains('low-power')
}));

const totals = responses.reduce((result, item) => {
  result.requests += 1;
  result.bytes += item.size;
  result.byType[item.type] = (result.byType[item.type] || 0) + item.size;
  return result;
}, { requests: 0, bytes: 0, byType: {} });

console.log(JSON.stringify({ initial, totals, responses }, null, 2));
await browser.close();
