import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4322';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const failedRequests = [];
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
try {
  const opusResponse = await page.request.get(`${baseUrl}/cupid-lite.opus`);
  const opusAsset = { status: opusResponse.status(), contentType: opusResponse.headers()['content-type'] ?? null, size: Number(opusResponse.headers()['content-length'] ?? 0) };
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const initial = await page.evaluate(() => ({
    audio: Boolean(document.querySelector('audio[data-lilycosrent-audio]')),
    audioSrc: document.querySelector('audio')?.getAttribute('src') ?? null,
    audioFormat: document.querySelector('audio')?.dataset.audioFormat ?? null,
    opusFallback: '/cupid-lite.mp3',
    autoplay: document.querySelector('audio')?.autoplay ?? null,
    loop: document.querySelector('audio')?.loop ?? null,
    controlsVisible: Boolean(document.querySelector('audio[controls]'))
  }));
  await page.mouse.click(120, 180);
  await page.waitForTimeout(250);
  const afterPlay = await page.evaluate(() => ({
    paused: document.querySelector('audio')?.paused ?? null,
    ended: document.querySelector('audio')?.ended ?? null,
    currentSrc: document.querySelector('audio')?.currentSrc ?? null,
    readyState: document.querySelector('audio')?.readyState ?? null,
    networkState: document.querySelector('audio')?.networkState ?? null,
    mediaError: document.querySelector('audio')?.error?.message ?? null,
    status: document.querySelector('.sr-only')?.textContent?.trim() ?? ''
  }));
  const blockingFailures = failedRequests.filter(({ url, error }) => !url.includes('/node_modules/') && !url.includes('/@id/astro/') && error !== 'net::ERR_ABORTED');
  console.log(JSON.stringify({ initial, afterPlay, opusAsset, failedRequests, blockingFailures, pass: initial.audio && initial.audioSrc === '/cupid-lite.opus' && initial.audioFormat === 'opus' && initial.opusFallback === '/cupid-lite.mp3' && initial.autoplay && initial.loop && !initial.controlsVisible && opusAsset.status === 200 && opusAsset.contentType === 'audio/ogg' && afterPlay.currentSrc.endsWith('/cupid-lite.opus') && afterPlay.readyState >= 2 && !afterPlay.mediaError && blockingFailures.length === 0 }, null, 2));
} finally {
  await browser.close();
}
