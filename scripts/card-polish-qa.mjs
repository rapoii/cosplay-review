import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const viewports = [
  { name: 'small-mobile', width: 320, height: 844 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 }
];
const results = [];
const runtimeErrors = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    page.on('pageerror', (error) => runtimeErrors.push({ viewport: viewport.name, message: error.message }));
    await page.goto(`${baseUrl}/qr`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const result = await page.evaluate(() => {
      const card = document.querySelector('.rental-card');
      const frame = document.querySelector('.qr-frame');
      const canvas = document.querySelector('.qr-frame canvas');
      const footer = document.querySelector('.rental-card-footer');
      const cta = document.querySelector('.rental-card-cta');
        const buttons = [...document.querySelectorAll('.qr-actions button')].map((button) => ({ text: button.textContent?.trim() ?? '', disabled: button.disabled, outerHTML: button.outerHTML }));
        const download = [...document.querySelectorAll('.qr-outline-button')].find((button) => button.textContent?.includes('Download'));
        const share = [...document.querySelectorAll('.qr-outline-button')].find((button) => button.textContent?.includes('Share'));
      const cardRect = card?.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const ctaRect = cta?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      return {
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        cardFits: Boolean(cardRect && cardRect.right <= window.innerWidth + 1 && cardRect.left >= -1),
        cardWidth: cardRect?.width ?? 0,
        cardHeight: cardRect?.height ?? 0,
        frameSquare: Boolean(frameRect && Math.abs(frameRect.width - frameRect.height) < 1),
        frameTop: frameRect?.top ?? 0,
        frameBottom: frameRect?.bottom ?? 0,
        frameWidth: frameRect?.width ?? 0,
        ctaTop: ctaRect?.top ?? 0,
        ctaBottom: ctaRect?.bottom ?? 0,
        footerTop: footerRect?.top ?? 0,
        footerBottom: footerRect?.bottom ?? 0,
        cardBottom: cardRect?.bottom ?? 0,
        footerInsideCard: Boolean(cardRect && footerRect && footerRect.bottom <= cardRect.bottom - 2),
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : '',
        canvasHasPixels: Boolean(canvas && canvas.toDataURL('image/png').length > 1000),
        footerFits: Boolean(footer && footer.getBoundingClientRect().right <= window.innerWidth + 1),
        qrToCtaGap: frameRect && ctaRect ? ctaRect.top - frameRect.bottom : 0,
        ctaToFooterGap: ctaRect && footerRect ? footerRect.top - ctaRect.bottom : 0,
        downloadEnabled: Boolean(download && !download.disabled),
        shareEnabled: Boolean(share && !share.disabled),
        qrErrorVisible: Boolean(document.querySelector('.qr-error')),
        buttons
      };
    });
    let downloadTriggered = false;
    try {
      const downloadPromise = page.waitForEvent('download', { timeout: 2000 });
      await page.getByRole('button', { name: 'Download QR PNG' }).click();
      const download = await downloadPromise;
      downloadTriggered = download.suggestedFilename() === 'lilycosrent-review-qr.png';
    } catch {
      downloadTriggered = false;
    }
    results.push({ viewport: viewport.name, ...result, downloadTriggered });
    await page.close();
  }

  const printPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await printPage.goto(`${baseUrl}/qr`, { waitUntil: 'networkidle' });
  await printPage.emulateMedia({ media: 'print' });
  const print = await printPage.evaluate(() => {
    const card = document.querySelector('.rental-card');
    const nav = document.querySelector('.qr-page .cute-nav');
    const copy = document.querySelector('.qr-page .qr-workspace-copy');
    const style = card ? getComputedStyle(card) : null;
    return {
      cardWidth: style?.width ?? '',
      cardHeight: style?.height ?? '',
      cardBorder: style?.border ?? '',
      cardRadius: style?.borderRadius ?? '',
      navHidden: nav ? getComputedStyle(nav).display === 'none' : false,
      copyHidden: copy ? getComputedStyle(copy).display === 'none' : false
    };
  });
  await printPage.close();

  const printA6Size = Math.abs(Number.parseFloat(print.cardWidth) - 396.85) < 2 && Math.abs(Number.parseFloat(print.cardHeight) - 559.37) < 2;
  const pass = results.every((result) => result.horizontalOverflow === false && result.cardFits && result.footerInsideCard && result.frameSquare && result.qrToCtaGap >= 14 && result.ctaToFooterGap >= 10 && result.canvasSize === '320x320' && result.canvasHasPixels && result.footerFits && result.downloadEnabled && result.downloadTriggered && result.shareEnabled && result.qrErrorVisible === false) && print.navHidden && print.copyHidden && printA6Size;
  console.log(JSON.stringify({ results, print, runtimeErrors, pass }, null, 2));
} finally {
  await browser.close();
}
