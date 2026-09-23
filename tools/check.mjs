#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────
   check.mjs — verificación de la landing ANTES de cada commit.
   Sin dependencias. Sale con 1 si algo falla.

     node tools/check.mjs

   Qué revisa (por página):
   · parciales sincronizados (build.mjs --check)
   · JSON-LD parseable; FAQPage = espejo exacto del FAQ visible
   · <title> 30–60 c · meta description 110–160 c · canonical = URL real
   · Open Graph + Twitter con imagen propia que exista en /og/
   · un solo <h1> y sin saltos de nivel en los encabezados
   · <img> con alt, width y height
   · enlaces internos que existen (sin 404)
   · gtag de Google Ads SOLO en tutela y derecho de petición
   · la página está en sitemap.xml (y el sitemap no apunta a nada inexistente)

   Complemento con navegador (Chromium + WebKit, errores de consola,
   scroll horizontal): tools/render-check.mjs
   ───────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, listPages, routeOf } from './lib.mjs';

const SITE = 'https://www.justiexpress.com';
const ADS_PAGES = new Set(['/accion-de-tutela/', '/derecho-de-peticion/']);
let failures = 0;
const fail = (file, msg) => { failures++; console.log(`  ✗ ${msg}`); };

// 1) Parciales
try { execFileSync(process.execPath, [path.join(root, 'tools', 'build.mjs'), '--check'], { stdio: 'pipe' }); console.log('✓ parciales sincronizados'); }
catch (e) { failures++; console.log(e.stdout?.toString() || e.message); }

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')); return m ? m[1] : null; };
const meta = (html, key) => {
  const re = new RegExp(`<meta[^>]+(?:name|property)="${key.replace(/[.:]/g, '\\$&')}"[^>]*>`, 'i');
  const m = html.match(re); return m ? attr(m[0], 'content') : null;
};

function resolveInternal(href, fromRoute) {
  let p = href.split('#')[0].split('?')[0];
  if (!p) return true;
  if (!p.startsWith('/')) p = path.posix.join(fromRoute.endsWith('/') ? fromRoute : path.posix.dirname(fromRoute), p);
  const abs = path.join(root, decodeURIComponent(p));
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return true;
  if (fs.existsSync(path.join(abs, 'index.html'))) return true;
  return false;
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

for (const file of listPages()) {
  const route = routeOf(file);
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const legacy = html.includes('/assets/legacy.css');
  console.log(`\n${route}${legacy ? '  (pendiente de migrar: solo chequeos básicos)' : ''}`);
  const before = failures;

  // JSON-LD
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const nodes = [];
  for (const raw of lds) {
    try { const j = JSON.parse(raw); (j['@graph'] || [j]).forEach(n => nodes.push(n)); }
    catch (e) { fail(file, `JSON-LD inválido: ${e.message}`); }
  }
  if (file === '404.html') { if (failures === before) console.log('  ✓'); continue; }

  // Sitemap
  if (!sitemapLocs.includes(SITE + route)) fail(file, `no está en sitemap.xml (${SITE + route})`);

  // Ads: gtag solo donde hay campañas
  const hasGtag = /googletagmanager\.com\/gtag\/js\?id=AW-/.test(html);
  if (hasGtag && !ADS_PAGES.has(route)) fail(file, 'gtag de Google Ads en una página sin campañas');
  if (!hasGtag && ADS_PAGES.has(route)) fail(file, 'falta el gtag de Google Ads (tutela y petición lo llevan)');

  if (legacy) { if (failures === before) console.log('  ✓ básico'); continue; }

  // Meta
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length < 30 || title.length > 60) fail(file, `<title> de ${title.length} c (30–60): "${title}"`);
  const desc = meta(html, 'description') || '';
  if (desc.length < 110 || desc.length > 160) fail(file, `description de ${desc.length} c (110–160)`);
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (canon !== SITE + route) fail(file, `canonical ${canon} ≠ ${SITE + route}`);
  for (const k of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:image']) if (!meta(html, k)) fail(file, `falta ${k}`);
  const ogImg = meta(html, 'og:image') || '';
  if (!ogImg.startsWith(SITE + '/og/')) fail(file, `og:image no es propia: ${ogImg}`);
  else if (!fs.existsSync(path.join(root, ogImg.replace(SITE, '')))) fail(file, `og:image no existe: ${ogImg}`);
  if (meta(html, 'og:url') !== SITE + route) fail(file, 'og:url distinto al canonical');

  // Encabezados
  const body = html.slice(html.indexOf('<body'));
  const hs = [...body.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
  const h1 = hs.filter(h => h === 1).length;
  if (h1 !== 1) fail(file, `${h1} <h1> (debe haber uno)`);
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { fail(file, `salto de encabezado h${hs[i - 1]} → h${hs[i]}`); break; }
  if (hs[0] !== 1) fail(file, `el primer encabezado es h${hs[0]}, no h1`);

  // Imágenes
  for (const m of body.matchAll(/<img\b[^>]*>/g)) {
    const t = m[0];
    if (attr(t, 'alt') === null) fail(file, `img sin alt: ${t.slice(0, 80)}`);
    if (!attr(t, 'width') || !attr(t, 'height')) fail(file, `img sin width/height: ${t.slice(0, 80)}`);
  }

  // Enlaces internos
  const bad = new Set();
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(u)) continue;
    if (!resolveInternal(u, route)) bad.add(u);
  }
  bad.forEach(u => fail(file, `enlace/recurso interno roto: ${u}`));

  // FAQPage = espejo del FAQ visible
  const faq = nodes.find(n => n['@type'] === 'FAQPage');
  const visible = [...body.matchAll(/<details class="faq__item"><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(m => ({ q: strip(m[1]), a: strip(m[2]) }));
  if (visible.length && !faq) fail(file, 'FAQ visible sin FAQPage en JSON-LD');
  if (faq) {
    const ld = faq.mainEntity.map(q => ({ q: q.name, a: q.acceptedAnswer.text }));
    if (ld.length !== visible.length) fail(file, `FAQPage con ${ld.length} preguntas y ${visible.length} visibles`);
    ld.forEach((q, i) => {
      if (!visible[i] || visible[i].q !== q.q) fail(file, `pregunta ${i + 1} del FAQPage no coincide con la visible: "${q.q}"`);
      else if (!visible[i].a.startsWith(q.a.replace(/\s+/g, ' '))) fail(file, `respuesta ${i + 1} del FAQPage difiere de la visible`);
    });
  }

  // Breadcrumb visible ↔ BreadcrumbList
  const bc = nodes.find(n => n['@type'] === 'BreadcrumbList');
  if (route !== '/' && !bc) fail(file, 'sin BreadcrumbList');
  if (bc && !/class="crumbs"/.test(body)) fail(file, 'BreadcrumbList sin migas visibles');

  if (/Syne/.test(html)) fail(file, 'todavía referencia la fuente Syne');
  if (failures === before) console.log('  ✓');
}

// Sitemap no apunta a rutas inexistentes
for (const loc of sitemapLocs) {
  const r = loc.replace(SITE, '');
  if (!resolveInternal(r, '/')) { failures++; console.log(`✗ sitemap apunta a una ruta inexistente: ${loc}`); }
}

console.log(failures ? `\n✗ ${failures} problema(s)` : '\n✓ todo en orden');
process.exit(failures ? 1 : 0);
