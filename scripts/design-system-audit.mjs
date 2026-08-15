import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const routes = [
  { route: '/', roles: { title: '.form-shell h1', body: '.form-intro', label: '.field-group label', button: '.submit-button', shell: '.form-shell', brand: '.brand-word strong' } },
  { route: '/qr', roles: { title: '.qr-workspace h2', body: '.qr-workspace-copy > p:not(.mini-label):not(.qr-url)', label: '.qr-url', button: '.submit-button', shell: '.qr-workspace', brand: '.rental-card-brand strong' } },
  { route: '/admin', roles: { title: '.admin-gate h2', body: '.admin-gate > p:not(.mini-label):not(.admin-error):not(.admin-disclaimer)', label: '.admin-key-form label', button: '.submit-button', shell: '.admin-gate', brand: '.brand-word strong' } }
];

const readStyle = (element) => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    fontStyle: style.fontStyle,
    textTransform: style.textTransform,
    color: style.color,
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    borderTopWidth: style.borderTopWidth,
    boxShadow: style.boxShadow,
    width: Math.round(rect.width * 100) / 100,
    height: Math.round(rect.height * 100) / 100
  };
};

const results = [];
try {
  for (const item of routes) {
    await page.goto(`http://127.0.0.1:4321${item.route}`, { waitUntil: 'networkidle' });
    const roles = await page.evaluate((selectors) => Object.fromEntries(Object.entries(selectors).map(([role, selector]) => {
      const element = document.querySelector(selector);
      if (!element) return [role, null];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return [role, {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        fontStyle: style.fontStyle,
        textTransform: style.textTransform,
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderTopWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100
      }];
    })), item.roles);
    results.push({ route: item.route, roles });
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
