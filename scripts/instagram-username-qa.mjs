import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
try {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => {
    const input = document.querySelector('#instagram-username');
    const label = document.querySelector('label[for="instagram-username"]');
    const cards = [...document.querySelectorAll('.review-card h3')].map((element) => element.textContent?.trim() ?? '');
    return {
      inputExists: Boolean(input),
      label: label?.textContent?.trim() ?? '',
      placeholder: input?.getAttribute('placeholder') ?? '',
      autocomplete: input?.getAttribute('autocomplete') ?? '',
      autocapitalize: input?.getAttribute('autocapitalize') ?? '',
      cardHandles: cards,
      allDemoHandlesUseAt: cards.length === 0 || cards.every((handle) => handle.startsWith('@')),
      legacyNameLabelMissing: !document.body.textContent?.includes('Nama kamu')
    };
  });
  console.log(JSON.stringify({ result, pass: result.inputExists && result.label.includes('Username Instagram') && result.placeholder.includes('@') && result.autocomplete === 'username' && result.autocapitalize === 'none' && result.allDemoHandlesUseAt && result.legacyNameLabelMissing }, null, 2));
} finally {
  await browser.close();
}
