# Informe final del rediseño — justiexpress.com

> Rama `rediseno-landing-2026` · 23 sep 2026 · **Sin merge ni deploy**: queda para tu revisión.
> Diagnóstico previo y plan: [LANDING_AUDIT.md](LANDING_AUDIT.md). Mantenimiento: [tools/README.md](tools/README.md).

---

## 1. Resumen

| | Antes | Después |
|---|---|---|
| Identidad | Plantilla genérica de "SaaS de IA" (cuadrícula, glow cian, mockup de chat, contadores) | **"Papel y sello"**: editorial y documental, propia de una legaltech colombiana |
| Safari | Titulares rotos ("T u s  d e r e c h o s") | Correcto en WebKit, Chromium y Firefox (verificado en las 10 rutas) |
| Peso de la home (móvil) | 523 KB | **169 KB** |
| Logo del menú | PNG de 120 KB | WebP de **2 KB** |
| FCP móvil (todas) | 2,6 s | 1,2–1,7 s |
| LCP móvil de tutela | **5,3 s** | **2,0 s** |
| CLS peor caso | 0,022 | 0,034 (el resto ≤ 0,002) |
| Accesibilidad Lighthouse | 92–95 | **100** (home escritorio 100 tras el último ajuste) |
| Contenido que depende de JS para verse | 8 de 12 secciones de la home | Ninguno |
| Afirmaciones no respaldadas por el producto | 6 (ver auditoría §5) | 0 nuevas; 2 heredadas marcadas para que las confirmes (§6) |

Commits de la rama (todos pasan `check.mjs` y `render-check.mjs` en Chromium + WebKit):

```
47ecc61 content-visibility solo en el riel de videos y rol del paginador de reels
f64b33a Rendimiento y accesibilidad: CLS≈0, gtag diferido, content-visibility
700f2ca TyC y PP en el nuevo sistema, página 404 y retiro del CSS/JS antiguo
ffaf3b2 Landings de servicio en el nuevo sistema (tutela, petición, desacato, calculadoras, vivienda)
89459c4 Sistema de diseño "Papel y sello" y nueva home
bc87305 Herramientas de la landing: parciales sincronizados, verificador, render en Chromium/WebKit y OG
c932e19 Auditoría de la landing: diagnóstico y plan de rediseño
```

---

## 2. Decisiones de diseño

Capturas en `docs/rediseno/` (antes: `antes-*.webp`; después: `despues-*.webp`, incluida una de Safari/WebKit móvil y una del modo oscuro).

**Concepto — "Papel y sello".** La cultura legal colombiana es documental: el papel, el radicado, el sello, la cita al artículo. La landing deja de parecer una app de IA intercambiable y pasa a parecer lo que vende: un documento jurídico bien hecho, con la velocidad de una app.

**Paleta.** Papel marfil `#F5F2EA` y tinta `#10181B` (16:1). El verde-azulado de marca `#0A6E63` para acentos y enlaces. El cian `#00E5D4` se reserva para dos cosas: el botón principal y el *resaltador* que subraya la frase clave de cada titular, como se marca un expediente. Un bermellón de lacre `#A63A22`, solo para sellos y plazos. Modo oscuro "tinta" con los mismos roles, y el claro sigue por defecto, igual que la app.

**Tipografía.** Instrument Serif a gran tamaño para titulares: voz editorial, de código impreso. Manrope para texto e interfaz, la misma del modal de pago de la app, así que la transición landing → chat se siente continua. DM Mono para metadatos tipo radicado ("§ 02 · CATÁLOGO", "FOLIO 1 DE 6"). Sale Syne, que era la causa del bug de Safari y además es poco legible en párrafos.

**Firma visual: el documento que se redacta solo.** En cada hero, una hoja de papel (con la hoja de atrás y el renglón rojo del margen) muestra el resultado del trámite: la tutela con sus partes, la petición, el desacato con el radicado, o la tabla de la calculadora. Los renglones se escriben uno a uno, llega el **sello** ("Listo para radicar", "Cálculo al instante", "Estudio en minutos") y una nota tipo chat muestra el mensaje que lo originó. Enseña el *resultado*, no la conversación. Con `prefers-reduced-motion` la hoja aparece completa, sin animación.

**Componentes nuevos**
- **Triage "¿Qué te está pasando?"** (home): 9 situaciones en lenguaje de la persona ("Mi EPS me negó una cirugía") que llevan al trámite correcto. Convierte a quien no sabe cómo se llama lo que necesita, y es enlazado interno con el anchor text que usa la gente.
- **Catálogo en "tomos"**, como la tabla de contenido de un código: número, servicio, precio y flecha. Se escanea en segundos y el precio siempre está a la vista.
- **Recibo** con borde perforado: precio, "pago único" y medios de pago (Nequi, Bancolombia, PSE, Daviplata), justo bajo los CTA.
- **Fundamento legal**: el artículo en tipografía gigante (Art. 86, Art. 23, Art. 52, Art. 249, Art. 241, 1 %), la cita textual y cuatro plazos o cifras clave. Da autoridad real y contenido temático para SEO.
- **Anatomía del documento** (tutela, petición, desacato): la hoja con sus partes numeradas junto a la explicación de cada una.
- **"Lo que sí es / lo que no es"** (home): transparencia alineada con los TyC. No es representación judicial y no garantiza el resultado. Para una IA legal, esa honestidad construye confianza.
- **Bloque de cierre en tinta**, con el mismo CTA, WhatsApp y la promesa "pagas solo cuando esté listo".

**Lo que se quitó a propósito:** la barra social fija a la izquierda (las redes siguen en el footer y en la sección de videos), el logo con brillo y "respiración", el botón que late, los anillos giratorios, los contadores animados que mostraban "0" a los crawlers y el toggle de tema flotante, que ahora vive en el menú. El botón de WhatsApp aparece recién al hacer scroll, para no tapar el CTA del hero en móvil.

**Copy.** Se revisó contra los TyC y el `CLAUDE.md` de la app:
- "Un abogado experto elabora el documento" → "el asistente redacta…", porque los TyC dicen que lo genera la IA.
- "Presenta y gana" sale, porque los TyC dicen que no se garantiza el resultado.
- "Lista en segundos" → "en minutos", porque hay que responder las preguntas antes.
- La description de desacato ya no dice "obligamos al juez a sancionar".
- Se agregó el argumento más fuerte, que ninguna página tenía: **"pagas solo cuando el documento ya está redactado"**, que es como funciona el producto.
- El ejemplo de renta estaba mal calculado: mostraba $3,8 M de impuesto sobre una renta que, con la tabla del art. 241, no tributa. Se reemplazó por uno correcto con la UVT 2025.

---

## 3. Arquitectura

- **Sigue siendo HTML estático** (equivale a SSG): todo el contenido llega en el HTML, sin framework ni build en Vercel. `vercel.json` intacto.
- **Parciales sincronizados** (`tools/build.mjs`): nav, footer y WhatsApp viven en `partials/` y se copian en marcadores. Las páginas siguen siendo editables a mano; `check.mjs` avisa si un bloque compartido se desincroniza.
- **CSS único** (`styles.css`), sin `<style>` por página. **Sprite SVG** (`assets/icons.svg`) en lugar de SVG pegados.
- **Fuentes autoalojadas** (5 archivos, ~100 KB) con `preload` de las 3 críticas y fuentes de respaldo con métricas calibradas (regular, itálica, 400 y 700) para que el texto no se reacomode al cargar.
- **`main.js` con `defer`**: el riel de reels se construye solo cuando la sección se acerca. La atribución al chat es un módulo único que lee `data-categoria`/`data-origen` del `<body>`, **con los mismos valores de siempre** (`tutela`/`organico-tutela`, `derecho-peticion`/`organico-peticion`, `tutela`/`landing-desacato`, `calculadora-*`/`landing-calc-*`, `vivienda`/`landing-vivienda`). Verificado: los CTA reenvían `utm_*` y `gclid`.
- **Imágenes OG** por página (1200×630), generadas con `tools/og.mjs` desde el mismo sistema visual. Favicons livianos, `apple-touch-icon` y `site.webmanifest`.
- **404** propia con `noindex`. `.vercelignore` para no publicar herramientas ni documentos internos (antes `reels/README.md` era público).

---

## 4. Checklist de SEO técnico (estado final)

| Ítem | Estado | Detalle |
|---|---|---|
| Title único por página, ≤ 60 c | ✅ | 10/10. Todos con palabra clave, y precio en las comerciales. Se acortaron desacato, tributaria, notarial y vivienda (antes truncados). |
| Meta description 110–160 c | ✅ | 10/10, con precio y el argumento de "pagas cuando esté listo". |
| Canonical autorreferente | ✅ | Coincide con `og:url` y con el sitemap. |
| Open Graph + Twitter Cards | ✅ | Completos en las 10, con **imagen propia por página** y `og:image:alt`. TyC y PP no tenían ninguno. |
| JSON-LD | ✅ | `@graph` por página: `LegalService` (organización, `@id` estable), `WebSite`, `WebPage`, `Service` + `Offer` (u `OfferCatalog` en tributaria y vivienda), `BreadcrumbList` y `FAQPage`. |
| FAQPage = FAQ visible | ✅ | Espejo exacto en las 8 páginas con FAQ, incluida la home, que antes no lo tenía. `check.mjs` lo exige. |
| Sin `aggregateRating` ni `VideoObject` | ✅ | Se respetan las reglas vigentes: nada de ratings sin reseñas visibles ni vídeos sin reproductor en el HTML. |
| sitemap.xml | ✅ | 10 URLs reales, `lastmod` 2026-09-23. |
| robots.txt | ✅ | Sin cambios (permite todo y apunta al sitemap). 404 con `noindex`. |
| Un solo H1 y jerarquía lógica | ✅ | Sin saltos de nivel (verificado automáticamente). |
| HTML semántico | ✅ | `header`/`nav`/`main`/`footer`, secciones con encabezado propio, migas visibles como `nav` con `aria-current`, FAQ con `details`, citas con `blockquote`. |
| Imágenes | ✅ | Todas con `alt`, `width` y `height`. |
| Enlaces internos con anchor text relevante | ✅ | Triage, catálogo, "También te puede servir" en cada landing, enlaces dentro del FAQ y nav/footer completos. |
| Indexable sin JS | ✅ | Todo el texto está en el HTML. Nada se oculta esperando JS. `content-visibility` solo en el riel de videos. |
| Core Web Vitals | ✅ (lab) | LCP móvil 1,7–2,1 s y CLS ≤ 0,034 en las 10 rutas. INP no se mide en laboratorio: el JS es mínimo y está diferido. |
| `meta keywords`, `geo.*` | ℹ️ | Se conservan por la regla del proyecto; Google no los usa. |

### Lighthouse 12 (local, gzip, perfil móvil simulado)

| Ruta | Perf. móvil antes → después | LCP móvil | Perf. escritorio |
|---|---|---|---|
| `/` | 85 → **98** | 3,6 → 2,0 s | 99 → 100 |
| `/accion-de-tutela/` | 64 → **82–100** | 5,3 → 2,0 s | 99 → 100 |
| `/derecho-de-peticion/` | 91 → **89–97** | 2,7 → 2,0 s | 99 → 99 |
| `/desacato/` | 91 → **89–98** | 2,8 → 2,1 s | 99 → 100 |
| `/calculadora-laboral/` | 91 → **99** | 2,8 → 2,0 s | 99 → 100 |
| `/calculadora-tributaria/` | 91 → **90–98** | 2,8 → 2,1 s | 99 → 100 |
| `/calculadora-notarial/` | 91 → **98** | 2,8 → 2,0 s | 99 → 100 |
| `/vivienda/` | 91 → **98–99** | 2,8 → 2,0 s | 99 → 100 |
| `/TyC.html` | 91 → **99** | 2,9 → 1,8 s | 99 → 100 |
| `/PP.html` | 91 → **100** | 2,9 → 1,7 s | 99 → 100 |

Los rangos son la variación entre corridas en esta máquina: el TBT de laboratorio oscila hasta ±360 ms sin cambios de código. LCP y CLS fueron estables en todas las corridas. En tutela y petición, lo que queda de TBT es gtag ejecutándose *después* del `load`. SEO 100 en todas; Best Practices 100, salvo tutela y petición (77) por las cookies de terceros de Google Ads.

---

## 5. Seguridad del cambio

- **Sin tocar** la app, los pagos ni la generación de documentos. Todos los CTA siguen apuntando a `chat.justiexpress.com` con las mismas `categoria` y `origen`.
- Texto legal de TyC y PP **idéntico** al original (comparado palabra a palabra antes de escribir).
- Precios sin cambios: $19.900 documentos y calculadoras, $25.000 F-210, $29.900 estudio.
- Probado en Chromium, **WebKit (Safari)** y Firefox, a 390 px y 1440 px: sin errores de consola, sin recursos rotos, sin scroll horizontal. También se probaron el menú móvil, el desplegable, el cambio de tema y su persistencia, el FAQ, el riel de reels con sus filtros, el salto al contenido y los enlaces con atribución.

---

## 6. Lo que necesito que decidas antes del merge

1. **gtag diferido (tutela y petición).** Para bajar el LCP móvil de 5,3 s a 2,0 s, `gtag.js` ahora se carga justo después del `load` (o con la primera interacción). Mismo ID y misma config. Verifiqué que siguen saliendo los hits de remarketing y view-through (~1 s después de cargar). El único cambio posible es que no se registre a quien cierre la página en menos de ~1 s. Las conversiones no cambian: se disparan en la app. Si prefieres la carga inmediata, el comentario en el `<head>` de ambas páginas explica cómo revertirlo en una línea.
2. **Testimonios y "+2.000 clientes".** Se conservan porque son del negocio, pero no encontré su fuente. Si no son reales y verificables, conviene quitarlos o reemplazarlos por las opiniones reales que ya recoge la app (`/api/feedback/resumen`): el Estatuto del Consumidor sanciona la publicidad engañosa. La banda de cifras de la home ya solo usa datos verificables del producto (+100 plantillas, 3 calculadoras, $19.900, 24/7).
3. **Títulos acortados** (desacato, tributaria, notarial, vivienda): mantienen la palabra clave y el precio. Google tardará unos días en reflejarlos.

## 7. Después del merge (recomendado)

- Ver el **preview de Vercel** de la rama en un iPhone real. WebKit de Playwright es el mismo motor, pero no reemplaza a un dispositivo.
- **Rich Results Test** y **Search Console → Inspección de URL → Solicitar indexación** para home, tutela y petición.
- Revisar en 28 días los **Core Web Vitals de campo** (CrUX / Search Console). Aquí solo pude medir en laboratorio.
- Actualizar el mapa `TCL_PRERENDER` de la app solo si cambias el pitch de los anuncios. Las landings no lo afectan.

## 8. Lo que no se hizo (y por qué)

- **Páginas de video por reel:** descartadas antes por ti (contenido delgado). No se tocó.
- **Framework o SSR:** no se justifica. El HTML estático ya es la estrategia óptima para estas rutas, y un build en Vercel agregaría riesgo de despliegue sin ganar SEO.
- **Medición de campo e INP real:** requieren tráfico real; queda para el seguimiento del punto 7.

---

## 9. Segunda iteración de diseño: efectos 3D y de agencia (23 sep 2026, rama `efectos-3d`)

| Efecto | Técnica | Protección de rendimiento |
|---|---|---|
| Pila de documentos en 3D en cada hero, que se inclina con el cursor y cuyo papel refleja la luz | CSS 3D real (`perspective` + `preserve-3d` + `translateZ` por capa) | Solo con mouse; la animación se detiene al llegar a su posición; en táctil, una "respiración" lenta solo con CSS |
| Sello de lacre (cera) que cae girando | SVG con borde orgánico generado y relieve | Animación de entrada solo con `transform` |
| Tinta que fluye detrás del hero | Shader WebGL propio (~3 KB, sin librerías) | Carga después del `load`; se pausa fuera de pantalla; se omite con movimiento reducido, ahorro de datos, renderizado por software o menos de 4 GB de RAM |
| Tomos del catálogo con numeral romano de capítulo (I–IV) y **vista previa flotante del documento** que sigue al cursor por el índice, con su fundamento legal, precio y sello (se inclina con la velocidad) | CSS + `fx.js` | Solo con mouse; sin movimiento reducido |
| Franja cinética de dos capas: los servicios en serif y los fundamentos legales en mono, en direcciones opuestas; se inclina y acelera con la velocidad del scroll | CSS + Web Animations (`playbackRate`) | Decorativa (`aria-hidden`); amortiguación por tiempo real; se pausa al pasar el cursor |
| Tarjetas que se apilan en "Cómo funciona" | `position: sticky` | Solo CSS, desde 900 px |
| Revelado al hacer scroll | Animaciones ligadas al scroll (`animation-timeline: view()`) | Solo CSS; usa `translate`, así que no pisa los efectos hover |
| Transiciones entre páginas y al cambiar el tema | View Transitions API | Apagadas con movimiento reducido |
| Textura de papel | WebP con transparencia de 8 KB | Sin `mix-blend-mode` (lo medí: costaba 700 ms de TBT); se activa después de la carga |
| Luz que sigue al cursor en tarjetas y botones magnéticos | CSS custom properties desde `fx.js` | Solo con mouse |

- **Tema:** el sol sale del menú y pasa a un selector "Claro / Oscuro" en el footer y en el menú móvil.
- **Contenido:** la home dice **5 calculadoras y herramientas con 11 módulos** (laboral 5, tributaria 3, notarial 3, más el estudio de arrendamiento y el verificador de reporte), como las presenta la app.
- **Rendimiento:** mediana de 5 corridas de Lighthouse móvil. Home: 97 publicada → 97 nueva (LCP 2,3 s, TBT 42 ms). Tutela: 97 → 93 (LCP 2,1 s); la diferencia es gtag más los efectos. Todas las rutas quedan en rango "bueno".
