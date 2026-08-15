import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const outputPath = '/tmp/lilycosrent-qr-runtime.png';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseUrl}/qr`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const canvas = document.querySelector('.qr-frame canvas');
    if (!canvas) return { error: 'canvas-not-found' };
    const rect = canvas.getBoundingClientRect();
    const frame = canvas.parentElement;
    const frameRect = frame?.getBoundingClientRect();
    const canvasStyle = getComputedStyle(canvas);
    const frameStyle = frame ? getComputedStyle(frame) : null;
    return {
      reviewUrl: document.querySelector('.qr-url strong')?.textContent ?? '',
      width: canvas.width,
      height: canvas.height,
      cssWidth: rect.width,
      cssHeight: rect.height,
      frameWidth: frameRect?.width ?? 0,
      frameHeight: frameRect?.height ?? 0,
      canvasDisplay: canvasStyle.display,
      canvasWidthStyle: canvasStyle.width,
      canvasHeightStyle: canvasStyle.height,
      frameWidthStyle: frameStyle?.width ?? '',
      frameHeightStyle: frameStyle?.height ?? '',
      inlineStyle: canvas.getAttribute('style') ?? '',
      widthAttribute: canvas.getAttribute('width') ?? '',
      heightAttribute: canvas.getAttribute('height') ?? '',
      outerHTML: canvas.outerHTML,
      dataUrl: canvas.toDataURL('image/png')
    };
  });
  if (data.dataUrl) writeFileSync(outputPath, Buffer.from(data.dataUrl.split(',')[1], 'base64'));
  delete data.dataUrl;
  console.log(JSON.stringify({ ...data, imagePath: outputPath }, null, 2));
} finally {
  await browser.close();
}
