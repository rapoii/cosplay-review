import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const routes = [
  { route: '/', roles: { title: '.form-shell h1', body: '.form-intro', button: '.submit-button', shell: '.form-shell', brand: '.brand-word strong' } },
  { route: '/qr', roles: { title: '.qr-workspace h2', body: '.qr-workspace-copy > p:not(.mini-label):not(.qr-url)', button: '.submit-button', shell: '.qr-workspace', brand: '.rental-card-brand strong' } },
  { route: '/admin', roles: { title: '.admin-gate h2', body: '.admin-gate > p:not(.mini-label):not(.admin-error):not(.admin-disclaimer)', button: '.submit-button', shell: '.admin-gate', brand: '.brand-word strong' } }
];
const keys = {
  title: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontStyle', 'color'],
  body: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontStyle', 'color'],
  button: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontStyle', 'borderRadius', 'boxShadow', 'color'],
  shell: ['backgroundColor', 'borderRadius', 'borderTopWidth', 'boxShadow'],
  brand: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontStyle', 'color']
};

const results = [];
try {
  for (const item of routes) {
    await page.goto(`http://127.0.0.1:4321${item.route}`, { waitUntil: 'networkidle' });
    const roles = await page.evaluate((selectors) => Object.fromEntries(Object.entries(selectors).map(([role, selector]) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return [role, {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        fontStyle: style.fontStyle,
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderTopWidth: style.borderTopWidth,
        boxShadow: style.boxShadow
      }];
    })), item.roles);
    results.push({ route: item.route, roles });
  }

  const baseline = results[0].roles;
  const consistency = Object.fromEntries(Object.entries(keys).map(([role, properties]) => [role, results.every(({ roles }) => properties.every((property) => roles[role][property] === baseline[role][property]))]));
  console.log(JSON.stringify({ consistency, results }, null, 2));
} finally {
  await browser.close();
}
