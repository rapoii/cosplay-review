import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failedRequests = [];
page.on('requestfailed', request => failedRequests.push(request.url()));
await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });

const initial = await page.evaluate(() => ({
  player: !document.querySelector('.music-player'),
    audio: Boolean(document.querySelector('audio[data-lilycosrent-audio]')),
    audioSrc: document.querySelector('audio')?.getAttribute('src') ?? null,
    audioFormat: document.querySelector('audio')?.dataset.audioFormat ?? null,
    opusFallback: '/cupid-lite.mp3',
    autoplay: document.querySelector('audio')?.autoplay ?? null,
  loop: document.querySelector('audio')?.loop ?? null,
  controlsVisible: Boolean(document.querySelector('audio[controls]')),
  paused: document.querySelector('audio')?.paused ?? null
}));

await page.mouse.click(120, 180);
await page.waitForTimeout(250);
const afterPlay = await page.evaluate(() => ({
  paused: document.querySelector('audio')?.paused ?? null,
  ended: document.querySelector('audio')?.ended ?? null,
  status: document.querySelector('.sr-only')?.textContent?.trim() ?? ''
}));

console.log(JSON.stringify({ initial, afterPlay, failedRequests }, null, 2));
await browser.close();
