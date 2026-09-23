#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────
   build.mjs — sincroniza los bloques compartidos de la landing.

   Las páginas HTML siguen siendo el código fuente (se editan a mano y
   Vercel las sirve tal cual). Lo que es IGUAL en todas —nav, footer,
   botón de WhatsApp— vive en partials/ y se copia dentro de marcadores:

       <!-- @partial nav -->  …se reemplaza…  <!-- /@partial -->
       <!-- @partial fab {"wa":"Hola%20..."} -->  …  <!-- /@partial -->

   Variables en el parcial: {{nombre|valor por defecto}}.
   En el nav se marca aria-current="page" en el enlace de la ruta actual.

   Uso:
     node tools/build.mjs          → reescribe las páginas desincronizadas
     node tools/build.mjs --check  → no escribe; sale con 1 si algo difiere
   ───────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPages, routeOf } from './lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const partialCache = {};
function partial(name) {
  if (!(name in partialCache)) {
    const p = path.join(root, 'partials', name + '.html');
    if (!fs.existsSync(p)) throw new Error(`Parcial inexistente: partials/${name}.html`);
    partialCache[name] = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').trim();
  }
  return partialCache[name];
}

function render(name, vars, route) {
  let out = partial(name).replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_, k, def) => (vars[k] ?? def ?? ''));
  if (name === 'nav') {
    out = out.replace(new RegExp(`(<a class="nav__link" href="${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")`, 'g'), '$1 aria-current="page"');
  }
  return out;
}

const MARK = /(<!-- @partial (\w+)((?: \{.*?\})?) -->)([\s\S]*?)(<!-- \/@partial -->)/g;

let changed = 0;
for (const file of listPages()) {
  const abs = path.join(root, file);
  const src = fs.readFileSync(abs, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const route = routeOf(file);
  const next = src.replace(MARK, (all, open, name, json, _inner, close) => {
    const vars = json.trim() ? JSON.parse(json.trim()) : {};
    const body = render(name, vars, route).replace(/\n/g, eol);
    return `${open}${eol}${body}${eol}${close}`;
  });
  if (next !== src) {
    changed++;
    if (check) console.log(`✗ desincronizado: ${file}`);
    else { fs.writeFileSync(abs, next); console.log(`↻ ${file}`); }
  }
}
if (check) {
  if (changed) { console.log(`\n${changed} página(s) con parciales desactualizados → corre: node tools/build.mjs`); process.exit(1); }
  console.log('✓ parciales sincronizados');
} else {
  console.log(changed ? `\n${changed} página(s) actualizadas` : '✓ nada que actualizar');
}
