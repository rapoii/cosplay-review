import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4322';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failedRequests = [];
page.on('requestfailed', request => failedRequests.push(request.url()));
try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const initial = await page.evaluate(() => ({
    audio: Boolean(document.querySelector('audio[data-lilycosrent-audio]')),
    audioSrc: document.querySelector('audio')?.getAttribute('src') ?? null,
    autoplay: document.querySelector('audio')?.autoplay ?? null,
    loop: document.querySelector('audio')?.loop ?? null,
    controlsVisible: Boolean(document.querySelector('audio[controls]'))
  }));
  await page.mouse.click(120, 180);
  await page.waitForTimeout(250);
  const afterPlay = await page.evaluate(() => ({
    paused: document.querySelector('audio')?.paused ?? null,
    status: document.querySelector('.sr-only')?.textContent?.trim() ?? ''
  }));
  console.log(JSON.stringify({ initial, afterPlay, failedRequests, pass: initial.audio && initial.audioSrc === '/cupid-lite.mp3' && initial.autoplay && initial.loop && !initial.controlsVisible && failedRequests.length === 0 }, null, 2));
} finally {
  await browser.close();
}
