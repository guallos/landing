// Utilidades compartidas por build.mjs y check.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function listPages() {
  const pages = [];
  for (const f of ['index.html', 'TyC.html', 'PP.html', '404.html']) if (fs.existsSync(path.join(root, f))) pages.push(f);
  for (const d of fs.readdirSync(root, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('.') || ['assets', 'partials', 'tools', 'reels', 'og', 'node_modules'].includes(d.name)) continue;
    const f = path.join(d.name, 'index.html');
    if (fs.existsSync(path.join(root, f))) pages.push(f.replace(/\\/g, '/'));
  }
  return pages;
}

export function routeOf(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return '/' + file.replace(/index\.html$/, '');
  return '/' + file;
}

