#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────
   og.mjs — genera las imágenes Open Graph (1200×630) de cada página
   en og/<slug>.png, con el sistema visual de la landing.

   Requiere Playwright (npm i en tools/: ver tools/package.json).
     node tools/og.mjs            → todas
     node tools/og.mjs tutela     → solo una

   Al agregar una landing: añadir su entrada a PAGES y referenciar
   https://www.justiexpress.com/og/<slug>.png en og:image y twitter:image.
   ───────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib.mjs';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Falta Playwright: cd tools && npm install'); process.exit(1); }

const PAGES = [
  { slug: 'home', kicker: 'Asistente legal con IA · Colombia', title: 'Defiende tus derechos <em>por escrito</em>, en minutos.', price: '$19.900', unit: 'por documento', doc: 'Acción de tutela' },
  { slug: 'tutela', kicker: 'Acción de tutela · Art. 86 C.P.', title: 'Tu tutela, <em>lista para radicar</em>.', price: '$19.900', unit: 'pago único', doc: 'Acción de tutela' },
  { slug: 'peticion', kicker: 'Derecho de petición · Art. 23 C.P.', title: 'Que te respondan, <em>por escrito</em>.', price: '$19.900', unit: 'pago único', doc: 'Derecho de petición' },
  { slug: 'desacato', kicker: 'Incidente de desacato · Decreto 2591/91', title: 'Ganaste la tutela. <em>Que la cumplan.</em>', price: '$19.900', unit: 'pago único', doc: 'Incidente de desacato' },
  { slug: 'laboral', seal: 'CÁLCULO AL INSTANTE · JUSTIEXPRESS', kicker: 'Calculadora laboral', title: 'Lo que te deben, <em>al peso</em>.', price: '$19.900', unit: 'con informe PDF', doc: 'Liquidación laboral' },
  { slug: 'tributaria', seal: 'CÁLCULO AL INSTANTE · JUSTIEXPRESS', kicker: 'Calculadora tributaria · F-210', title: 'Tu renta, <em>sin sustos</em>.', price: '$19.900', unit: 'con informe PDF', doc: 'Renta · Formulario 210' },
  { slug: 'notarial', seal: 'CÁLCULO AL INSTANTE · JUSTIEXPRESS', kicker: 'Calculadora notarial y registral', title: 'A la notaría, <em>con las cuentas claras</em>.', price: '$19.900', unit: 'con informe PDF', doc: 'Gastos de escritura' },
  { slug: 'vivienda', seal: 'ESTUDIO EN MINUTOS · JUSTIEXPRESS', kicker: 'Estudio de riesgo de arrendamiento', title: 'Antes de entregar las llaves, <em>sepa a quién</em>.', price: '$29.900', unit: 'pago único', doc: 'Estudio del arrendatario' },
  { slug: 'terminos', seal: 'JUSTIEXPRESS · COLOMBIA · 2026', kicker: 'Justiexpress · Documento legal', title: 'Términos y <em>condiciones</em>.', doc: 'Términos y condiciones' },
  { slug: 'privacidad', seal: 'JUSTIEXPRESS · COLOMBIA · 2026', kicker: 'Justiexpress · Documento legal', title: 'Política de <em>privacidad</em>.', doc: 'Política de privacidad' },
];

const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64');
const fontFace = (fam, file, style = 'normal', weight = 400) =>
  `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64('assets/fonts/' + file)}) format("woff2");font-style:${style};font-weight:${weight}}`;
const css = [
  fontFace('IS', 'instrument-serif.woff2'), fontFace('IS', 'instrument-serif-italic.woff2', 'italic'),
  fontFace('MR', 'manrope-400.woff2', 'normal', 400), fontFace('MR', 'manrope-700.woff2', 'normal', 700), fontFace('MR', 'manrope-800.woff2', 'normal', 800),
  fontFace('DM', 'dm-mono-500.woff2', 'normal', 500),
].join('\n');
const logo = `data:image/png;base64,${b64('assets/logo-114.png')}`;

const html = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#F5F2EA;color:#10181B;font-family:MR;position:relative;overflow:hidden}
.frame{position:absolute;inset:0;padding:64px 70px;display:grid;grid-template-columns:1.25fr .75fr;gap:40px}
.k{font-family:DM;font-size:19px;letter-spacing:.14em;text-transform:uppercase;color:#0A6E63;display:flex;align-items:center;gap:14px}
.k:before{content:"";width:36px;height:2px;background:#0A6E63}
h1{font-family:IS;font-weight:400;font-size:${p.title.length > 58 ? 76 : 88}px;line-height:.98;letter-spacing:-.01em;margin-top:30px}
h1 em{font-style:italic;background:linear-gradient(transparent 60%,rgba(0,229,212,.45) 60%,rgba(0,229,212,.45) 92%,transparent 92%)}
.foot{position:absolute;left:70px;bottom:56px;display:flex;align-items:center;gap:22px}
.foot img{height:52px;padding:8px 12px;background:#fff;border-radius:10px;box-shadow:0 0 0 1px rgba(16,24,27,.14)}
.foot span{font-family:DM;font-size:18px;letter-spacing:.08em;color:#5F6769}
.price{position:absolute;right:70px;bottom:56px;background:#10181B;color:#F5F2EA;border-radius:16px;padding:18px 26px;text-align:right}
.price b{display:block;font-weight:800;font-size:46px;letter-spacing:-.03em;line-height:1}
.price small{font-family:DM;font-size:15px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.sheet{position:absolute;right:92px;top:58px;width:330px;height:380px;background:#FFFEFA;border-radius:6px;transform:rotate(3deg);
  box-shadow:0 30px 60px -30px rgba(16,24,27,.45),0 0 0 1px rgba(16,24,27,.06);padding:34px 30px}
.sheet:before{content:"";position:absolute;inset:0;background:#FFFEFA;border-radius:6px;transform:rotate(-5deg) translate(-14px,10px);z-index:-1;box-shadow:0 0 0 1px rgba(16,24,27,.08)}
.sheet .m{font-family:DM;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#5F6769}
.sheet .r{font-family:IS;font-style:italic;font-size:32px;line-height:1.05;margin:14px 0 18px}
.ln{height:9px;border-radius:5px;background:rgba(16,24,27,.12);margin:10px 0}
.seal{position:absolute;right:-34px;bottom:-40px;width:150px;height:150px;color:#A63A22;transform:rotate(-14deg)}
.seal text{font-family:DM;font-size:10.5px;letter-spacing:2.6px;fill:currentColor}
</style></head><body><div class="frame"><div>
<p class="k">${p.kicker}</p><h1>${p.title}</h1></div></div>
<div class="sheet"><p class="m">Ref.</p><p class="r">${p.doc}</p>
<div class="ln" style="width:92%"></div><div class="ln" style="width:78%"></div><div class="ln" style="width:85%"></div><div class="ln" style="width:55%"></div>
<div class="ln" style="width:90%;margin-top:26px"></div><div class="ln" style="width:70%"></div>
<div class="seal"><svg viewBox="0 0 140 140" width="150" height="150"><defs><path id="c" d="M70 70m-52 0a52 52 0 1 1 104 0a52 52 0 1 1-104 0"/></defs><circle cx="70" cy="70" r="66" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="70" cy="70" r="40" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3"/><text><textPath href="#c">${(p.seal || 'LISTO PARA RADICAR · JUSTIEXPRESS') + ' ·'}</textPath></text><path d="m54 71 11 11 22-24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
<div class="foot"><img src="${logo}" alt=""><span>justiexpress.com</span></div>
${p.price ? `<div class="price"><b>${p.price}</b><small>${p.unit}</small></div>` : ''}
</body></html>`;

const only = process.argv[2];
fs.mkdirSync(path.join(root, 'og'), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const p of PAGES.filter(p => !only || p.slug === only)) {
  await page.setContent(html(p), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(root, 'og', p.slug + '.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log('✓ og/' + p.slug + '.png', Math.round(fs.statSync(out).size / 1024) + ' KB');
}
await browser.close();
