import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await page.waitForTimeout(850);

const initial = await page.evaluate(() => ({
  motionReady: document.documentElement.classList.contains('motion-ready'),
  motion60: document.documentElement.classList.contains('motion-60'),
  visibleTopSections: document.querySelectorAll('[data-reveal].is-visible').length,
  revealCount: document.querySelectorAll('[data-reveal]').length
}));

await page.locator('#ulasan').scrollIntoViewIfNeeded();
await page.waitForTimeout(850);
const afterScroll = await page.evaluate(() => ({
  wallVisible: Boolean(document.querySelector('#ulasan.is-visible')),
  visibleAfterScroll: document.querySelectorAll('[data-reveal].is-visible').length
}));

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const reduced = await page.evaluate(() => ({
  motionReady: document.documentElement.classList.contains('motion-ready'),
  motion60: document.documentElement.classList.contains('motion-60'),
  lowPower: document.documentElement.classList.contains('low-power'),
  hiddenRevealElements: Array.from(document.querySelectorAll('[data-reveal]')).filter((element) => getComputedStyle(element).opacity === '0').length
}));

const lowPowerPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await lowPowerPage.addInitScript(() => {
  const nativeMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query) => query === '(update: slow)'
    ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }
    : nativeMatchMedia(query);
  Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 });
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 2 });
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '2g' } });
});
await lowPowerPage.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await lowPowerPage.waitForTimeout(250);
const lowPower = await lowPowerPage.evaluate(() => ({
  lowPower: document.documentElement.classList.contains('low-power'),
  slowUpdateSignal: window.matchMedia('(update: slow)').matches,
  motionReady: document.documentElement.classList.contains('motion-ready'),
  motion60: document.documentElement.classList.contains('motion-60'),
  mascotAnimation: getComputedStyle(document.querySelector('.chibi-art img')).animationName,
  hiddenRevealElements: Array.from(document.querySelectorAll('[data-reveal]')).filter((element) => getComputedStyle(element).opacity === '0').length
}));
await lowPowerPage.close();

console.log(JSON.stringify({ initial, afterScroll, reduced, lowPower }, null, 2));
await browser.close();
