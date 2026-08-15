import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
const reports = [];

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'desktop-tall', width: 935, height: 2048 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small-mobile', width: 360, height: 800 }
]) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  const report = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { top: Math.round(box.top), bottom: Math.round(box.bottom), left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width), height: Math.round(box.height) };
    };
    const gap = (first, second) => first && second ? Math.round(second.top - first.bottom) : null;
    const formShell = rect('.form-shell');
    const chibi = rect('.chibi-greeting');
    const layout = rect('.form-first-layout');
    const scrollHint = rect('.review-scroll-hint');
    const wall = rect('.wall-section');
    const wallContent = rect('.review-grid') || rect('.empty-reviews');
    const emptyReviews = rect('.empty-reviews');
    const wallHeader = rect('.wall-header');
    const footer = rect('.site-footer');
    const reviewPage = rect('.review-page');
    const formHeader = rect('.form-shell-header');
    const form = rect('.review-form');
    const grid = rect('.form-grid');
    const ratings = rect('.rating-list');
    const comment = rect('#comment');
    const submitRow = rect('.form-submit-row');
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: { scrollHeight: document.documentElement.scrollHeight, bodyHeight: document.body.scrollHeight, reviewPageBottom: reviewPage?.bottom ?? null },
      boxes: { formShell, chibi, layout, scrollHint, wall, wallHeader, wallContent, emptyReviews, footer, reviewPage, formHeader, form, grid, ratings, comment, submitRow },
      gaps: {
        navToLayout: gap(rect('.cute-nav'), layout),
        layoutToScrollHint: gap(layout, scrollHint),
        scrollHintToWall: gap(scrollHint, wall),
        wallHeaderToContent: gap(wallHeader, wallContent),
        formHeaderToForm: gap(formHeader, form),
        formToGrid: gap(form, grid),
        gridToRatings: gap(grid, ratings),
        ratingsToComment: gap(ratings, comment),
        commentToSubmit: gap(comment, submitRow),
        formToChibi: gap(formShell, chibi),
        emptyToFooter: gap(emptyReviews, footer),
        wallToFooter: gap(wall, footer),
        footerToPageEnd: footer && reviewPage ? Math.round(Math.max(0, reviewPage.bottom - footer.bottom)) : null,
        viewportCanvasAfterFooter: footer ? Math.round(Math.max(0, window.innerHeight - footer.bottom)) : null
      }
    };
  });
  reports.push({ name: viewport.name, report });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(reports, null, 2));
