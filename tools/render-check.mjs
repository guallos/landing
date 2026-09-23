#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────
   render-check.mjs — abre cada página en Chromium y WebKit (motor de
   Safari), a 390 px y 1440 px, sobre un servidor local que imita a
   Vercel (trailingSlash + redirects de vercel.json). Falla si hay:
   errores de consola o de JS, recursos locales 4xx/5xx, o scroll
   horizontal. Con --shots=<carpeta> guarda capturas.

     cd tools && npm install     (una vez)
     node tools/render-check.mjs [--shots=../_shots] [--browsers=chromium,webkit,firefox]
   ───────────────────────────────────────────────────────────────── */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { root, listPages, routeOf } from './lib.mjs';

let pw;
try { pw = await import('playwright'); } catch { console.error('Falta Playwright: cd tools && npm install'); process.exit(1); }

const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const shots = arg('shots', '');
const browsers = arg('browsers', 'chromium,webkit').split(',');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json' };
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  for (const r of vercel.redirects || []) {
    const m = p.match(new RegExp('^' + r.source.replace(/:path/g, '(.+?)') + '$'));
    if (m) { res.writeHead(308, { Location: r.destination.replace(':path', m[1] || '') }); return res.end(); }
  }
  let file = path.join(root, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(308, { Location: p + '/' }); return res.end(); }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) {
    const nf = path.join(root, '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const EXTERNAL_OK = /youtube|ytimg|googletagmanager|google-analytics|doubleclick|google\.com\/rmkt|googleadservices/;
const viewports = [{ name: 'movil', width: 390, height: 844 }, { name: 'escritorio', width: 1440, height: 900 }];
const routes = listPages().map(routeOf).filter(r => r !== '/404.html').concat(['/ruta-que-no-existe/']);
if (shots) fs.mkdirSync(path.resolve(shots), { recursive: true });

let problems = 0;
for (const bn of browsers) {
  const browser = await pw[bn].launch();
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
    for (const r of routes) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', m => { if (m.type() === 'error' && !/404 \(Not Found\)/.test(m.text()) ) errs.push('consola: ' + m.text()); });
      page.on('pageerror', e => errs.push('JS: ' + e.message));
      page.on('response', resp => { if (resp.status() >= 400 && resp.url().startsWith(base) && !resp.url().includes('ruta-que-no-existe')) errs.push(`HTTP ${resp.status()} ${resp.url().replace(base, '')}`); });
      page.on('requestfailed', q => { if (!EXTERNAL_OK.test(q.url())) errs.push('falló: ' + q.url()); });
      await page.goto(base + r, { waitUntil: 'load', timeout: 30000 }).catch(e => errs.push('navegación: ' + e.message));
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth).catch(() => 0);
      if (overflow > 1) errs.push(`scroll horizontal de ${overflow}px`);
      if (shots) await page.screenshot({ path: path.join(path.resolve(shots), `${bn}-${vp.name}-${r.replace(/[\/.]+/g, '_').replace(/^_|_$/g, '') || 'home'}.png`) });
      if (errs.length) { problems += errs.length; console.log(`✗ ${bn} ${vp.name} ${r}\n    ${errs.join('\n    ')}`); }
      else console.log(`✓ ${bn} ${vp.name} ${r}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
}
server.close();
console.log(problems ? `\n✗ ${problems} problema(s)` : '\n✓ render sin errores');
process.exit(problems ? 1 : 0);
