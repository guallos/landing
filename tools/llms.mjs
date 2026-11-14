// Genera llms.txt y llms-full.txt en la raíz del sitio (formato https://llmstxt.org).
//
// Para qué: los asistentes de IA (ChatGPT, Claude, Perplexity, Gemini, Copilot)
// y los agentes que navegan por el usuario leen mejor un Markdown corto que
// nuestro HTML con menú, estilos y scripts. Estos dos archivos les entregan:
//   · llms.txt       → el índice: qué es Justiexpress y cada página con una línea.
//   · llms-full.txt  → lo mismo + las preguntas frecuentes de cada página, con su
//                      respuesta completa (lo más citable que tenemos).
//
// NO se escribe nada a mano: todo sale del propio HTML (title, description,
// fecha de revisión y el FAQPage del JSON-LD, que check.mjs ya obliga a ser
// idéntico al FAQ visible). Si una página cambia, basta volver a correrlo.
//
//   node tools/llms.mjs           escribe los dos archivos
//   node tools/llms.mjs --check   exit 1 si quedaron viejos (lo llama check.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { root, listPages, routeOf } from './lib.mjs';

const SITE = 'https://www.justiexpress.com';
const APP = 'https://chat.justiexpress.com';

// Orden y agrupación de las páginas. Una página nueva que no esté aquí cae en
// «Otras páginas» y check avisa, para que no quede sin clasificar.
const GRUPOS = [
  ['Tutelas', ['/accion-de-tutela/', '/tutela-contra-eps/', '/tutela-de-pension/', '/tutela-derecho-de-peticion/', '/desacato/', '/cuanto-cuesta-una-tutela/']],
  ['Derechos de petición', ['/derecho-de-peticion/', '/derecho-de-peticion-eps/', '/cuanto-cuesta-un-derecho-de-peticion/']],
  ['Reporte en Datacrédito y hábeas data', ['/derecho-de-peticion-datacredito/', '/consultar-datacredito-gratis/', '/pague-y-sigo-reportado/', '/caducidad-reporte-datacredito/', '/suplantacion-datacredito/', '/ley-1266-de-2008/']],
  ['Multas de tránsito', ['/multas-de-transito/', '/impugnar-comparendo/', '/prescripcion-multas-transito/']],
  ['Laboral', ['/calculadora-laboral/', '/liquidacion-de-prestaciones-sociales/', '/liquidacion-por-despido/']],
  ['Vivienda e inmuebles', ['/vivienda/', '/contrato-de-arrendamiento-vivienda/', '/certificado-de-tradicion-y-libertad/', '/calculadora-notarial/']],
  ['Impuestos', ['/calculadora-tributaria/']],
  ['Sobre Justiexpress', ['/quienes-somos/', '/TyC.html', '/PP.html']],
];
const OMITIR = new Set(['/', '/404.html']);

const decodificar = (s) =>
  s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const plano = (s) => decodificar(String(s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function leerPagina(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const titulo = plano((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).replace(/\s*\|\s*Justiexpress\s*$/i, '');
  const descripcion = plano((html.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1]);
  let faq = [];
  let revisada = '';
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let datos;
    try { datos = JSON.parse(m[1]); } catch { continue; }
    for (const nodo of datos['@graph'] || [datos]) {
      const tipos = [].concat(nodo['@type'] || []);
      if (tipos.includes('FAQPage')) {
        faq = (nodo.mainEntity || []).map((q) => ({ p: plano(q.name), r: plano(q.acceptedAnswer?.text) })).filter((q) => q.p && q.r);
      }
      if (nodo.dateModified && !revisada) revisada = String(nodo.dateModified).slice(0, 10);
    }
  }
  return { ruta: routeOf(file), titulo, descripcion, faq, revisada };
}

const paginas = new Map(listPages().map((f) => [routeOf(f), leerPagina(f)]));
const home = paginas.get('/');
const clasificadas = new Set(GRUPOS.flatMap(([, rutas]) => rutas));
const sueltas = [...paginas.keys()].filter((r) => !OMITIR.has(r) && !clasificadas.has(r));
const grupos = sueltas.length ? [...GRUPOS, ['Otras páginas', sueltas]] : GRUPOS;

const CABECERA = [
  '# Justiexpress — Tu Caso Legal',
  '',
  `> ${home.descripcion} Servicio colombiano, en español: la persona cuenta su caso en ${APP}, responde preguntas guiadas y recibe el documento redactado con inteligencia artificial sobre plantillas jurídicas propias, listo para radicar o firmar, en PDF y Word. Pago único, sin suscripción, y solo cuando el documento ya está redactado.`,
  '',
  'English: Justiexpress (Tu Caso Legal) is a Colombian legal-document service. People describe their case in plain Spanish and get a ready-to-file acción de tutela, derecho de petición, contract or legal calculation, drafted by AI on proprietary legal templates, for a flat one-time fee. Colombia only.',
  '',
  '## Lo esencial',
  '',
  '- No es una firma de abogados ni presta representación judicial, y no garantiza el resultado: la persona radica o firma el documento por su cuenta. Presentar una tutela o un derecho de petición es gratis y no exige abogado; lo que se paga aquí es la redacción.',
  '- El documento se genera antes de pagar y se muestra un adelanto; el pago (Nequi, Bancolombia, PSE, Daviplata o tarjeta, procesado por Wompi) desbloquea la descarga.',
  '- Los escritos que se radican incluyen una guía paso a paso de dónde y cómo presentarlos.',
  '- Cada página de este sitio cita la norma colombiana en que se apoya y lleva su fecha de última revisión.',
  `- Catálogo completo (más de 100 documentos y herramientas), con el enlace directo para empezar cada uno: ${APP}/llms.txt`,
  '- Atención por WhatsApp: +57 318 572 5324.',
  '',
];

function construir(completo) {
  const L = [...CABECERA];
  if (!completo) {
    L.push(`Versión con las preguntas frecuentes y sus respuestas completas: ${SITE}/llms-full.txt`, '');
  }
  for (const [titulo, rutas] of grupos) {
    const items = rutas.map((r) => paginas.get(r)).filter(Boolean);
    if (!items.length) continue;
    L.push(`## ${titulo}`, '');
    for (const p of items) {
      if (!completo) {
        L.push(`- [${p.titulo}](${SITE}${p.ruta}): ${p.descripcion}`);
        continue;
      }
      L.push(`### ${p.titulo}`, '', `Página: ${SITE}${p.ruta}${p.revisada ? ` · Revisada: ${p.revisada}` : ''}`, '', p.descripcion, '');
      for (const q of p.faq) L.push(`**${q.p}**`, '', q.r, '');
    }
    if (!completo) L.push('');
  }
  if (completo && home.faq.length) {
    L.push('## Preguntas generales sobre el servicio', '');
    for (const q of home.faq) L.push(`**${q.p}**`, '', q.r, '');
  }
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

const salidas = [['llms.txt', construir(false)], ['llms-full.txt', construir(true)]];
const revisar = process.argv.includes('--check');
let viejos = 0;

for (const [nombre, texto] of salidas) {
  const destino = path.join(root, nombre);
  if (revisar) {
    const actual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8').replace(/\r\n/g, '\n') : '';
    if (actual !== texto) { viejos++; console.log(`✗ ${nombre} está desactualizado — correr: node tools/llms.mjs`); }
  } else {
    fs.writeFileSync(destino, texto, 'utf8');
    console.log(`✍️  ${nombre}: ${Buffer.byteLength(texto)} bytes`);
  }
}
if (sueltas.length) console.log(`⚠ Páginas sin grupo en tools/llms.mjs (salen en «Otras páginas»): ${sueltas.join(', ')}`);
if (revisar) {
  if (viejos) process.exit(1);
  console.log('✓ llms.txt y llms-full.txt al día');
}
