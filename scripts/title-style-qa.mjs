import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];

try {
  const page = await browser.newPage();
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    const review = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.form-shell h1'));
      return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing };
    });

    await page.goto('http://127.0.0.1:4321/qr', { waitUntil: 'networkidle' });
    const card = await page.evaluate(() => {
      const heading = document.querySelector('.rental-card h3');
      const style = getComputedStyle(heading);
      const box = heading.getBoundingClientRect();
      const cardElement = document.querySelector('.rental-card');
      const cardBox = cardElement.getBoundingClientRect();
      const qrBox = document.querySelector('.qr-frame').getBoundingClientRect();
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        headingWithinCard: box.top >= cardBox.top && box.bottom <= cardBox.bottom,
        qrWithinCard: qrBox.top >= cardBox.top && qrBox.bottom <= cardBox.bottom,
        contentFits: cardElement.scrollHeight <= cardElement.clientHeight + 1
      };
    });
    const { headingWithinCard, qrWithinCard, contentFits, ...cardTypography } = card;
    results.push({ viewport: `${viewport.width}x${viewport.height}`, review, card, typographyMatches: JSON.stringify(review) === JSON.stringify(cardTypography), layoutSafe: headingWithinCard && qrWithinCard && contentFits });
  }

  await page.emulateMedia({ media: 'print' });
  await page.goto('http://127.0.0.1:4321/qr', { waitUntil: 'networkidle' });
  const printCard = await page.evaluate(() => {
    const card = document.querySelector('.rental-card').getBoundingClientRect();
    const heading = document.querySelector('.rental-card h3').getBoundingClientRect();
    return { cardWidth: card.width, cardHeight: card.height, headingWithinCard: heading.top >= card.top && heading.bottom <= card.bottom };
  });
  results.push({ print: printCard });
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
