# Herramientas de la landing (no se despliegan)

La landing sigue siendo HTML estático: Vercel sirve la raíz tal cual y **las páginas `.html` son el código fuente**. Estas herramientas solo ayudan a mantenerla. `.vercelignore` excluye `tools/`, `partials/`, `docs/` y los `.md`.

| Comando | Qué hace | Dependencias |
|---|---|---|
| `node tools/build.mjs` | Copia `partials/nav.html`, `footer.html` y `fab.html` dentro de los marcadores `<!-- @partial … -->` de cada página y marca `aria-current` en el nav. | ninguna |
| `node tools/check.mjs` | Verificación SEO/estructura: parciales al día, JSON-LD válido, FAQPage = FAQ visible, títulos 30–60 c, descripciones 110–160 c, canonical, OG propia, un H1 y sin saltos, imágenes con alt/width/height, enlaces internos vivos, gtag solo en tutela y petición, sitemap. | ninguna |
| `node tools/render-check.mjs` | Abre todas las páginas en Chromium y WebKit (motor de Safari) a 390 y 1440 px: errores de consola, recursos rotos, scroll horizontal y que gtag cargue en tutela/petición. `--browsers=firefox` para Firefox, `--shots=carpeta` para capturas. | Playwright |
| `node tools/og.mjs [slug]` | Regenera las imágenes Open Graph de `og/`. | Playwright |

Una vez: `cd tools && npm install` (instala Playwright; los navegadores se bajan con `npx playwright install chromium webkit`).

## Antes de cada commit

```
node tools/build.mjs && node tools/check.mjs && node tools/render-check.mjs
```

## Tareas frecuentes

- **Cambiar un enlace del menú o del footer:** editar `partials/…` y correr `build.mjs`. No editar ese bloque dentro de las páginas (el build lo sobrescribe y `check.mjs` avisa si se desincroniza).
- **Mensaje de WhatsApp del botón flotante de una página:** va en el marcador de esa página, `<!-- @partial fab {"wa":"Hola%20..."} -->`.
- **Cambiar un precio:** buscar el valor en todas las páginas (texto, `receipt`, FAQ **y** el JSON-LD: `price`, `priceRange`, FAQPage). El FAQ visible y el FAQPage deben quedar idénticos: `check.mjs` lo exige.
- **Nueva landing:** copiar una existente, cambiar `data-categoria`/`data-origen` del `<body>` (los lee `main.js` para armar el enlace al chat), agregar su entrada en `sitemap.xml`, en `partials/` (nav/footer) y en `tools/og.mjs`, y correr `og.mjs` + `build.mjs`.
- **Fuentes:** autoalojadas en `assets/fonts/`. Manrope va en instancias estáticas (WebKit en Windows ignoraba el eje variable). Si se cambia una fuente, recalibrar los `@font-face` "Fallback" de `styles.css` (evitan saltos de línea al cargar → CLS).
- **Iconos:** `assets/icons.svg` (sprite). Un comentario XML con dos guiones seguidos rompe el sprite entero.
