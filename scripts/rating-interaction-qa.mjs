import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 }
];
const results = [];
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, hasTouch: viewport.name === 'mobile' });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const rows = page.locator('.rating-row');
    const rowResults = [];
    for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
      const row = rows.nth(rowIndex);
      const buttons = row.locator('.star-button');
      const values = [];
      for (const target of [1, 3, 5]) {
        await buttons.nth(target - 1).click();
        await page.waitForTimeout(60);
        values.push(await row.evaluate((element) => ({
          activeCount: element.querySelectorAll('.star-button.active').length,
          ratingValue: element.querySelector('.rating-value')?.textContent?.trim() ?? '',
          checkedCount: element.querySelectorAll('.star-button[aria-checked="true"]').length
        })));
      }
      rowResults.push({ rowIndex, values });
    }
    results.push({ viewport: viewport.name, rows: rowResults });
    await page.close();
  }
  const pass = results.every(({ rows }) => rows.every(({ values }) => values.every((value, index) => value.activeCount === [1, 3, 5][index] && value.checkedCount === 1 && value.ratingValue.includes(`${[1, 3, 5][index]}/5`))));
  console.log(JSON.stringify({ results, pass }, null, 2));
} finally {
  await browser.close();
}
