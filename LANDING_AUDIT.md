# Auditoría de la landing — justiexpress.com

> Fase 1 del rediseño · 23 sep 2026 · rama `rediseno-landing-2026`
> Alcance: las 10 rutas públicas (home, 7 landings de servicio, TyC, PP). No toca la app (`chat.justiexpress.com`), los pagos ni la generación de documentos.

---

## 0. Veredicto honesto

La landing **funciona**: es HTML estático (lo mejor posible para rastreo), tiene títulos con precio, canonical, JSON-LD y un sitemap al día. En SEO técnico básico ya estaba por encima del promedio de su nicho en Colombia.

En diseño **no compite con las mejores landings de producto del mundo**. Es la plantilla genérica de "SaaS de IA" de 2023: fondo con cuadrícula y resplandor cian, mockup de chat a la derecha, contadores animados, rejilla de tarjetas idénticas con icono de línea, carrusel de testimonios y FAQ. Nada en ella dice *legal*, nada dice *Colombia*, y nada se queda en la memoria. Una legaltech que le pide a la gente que confíe su tutela a una IA necesita lo contrario: una identidad sobria, editorial, con peso documental.

Calificación frente a referentes globales (Stripe, Linear, Mercury, Harvey, Clio, DoNotPay en su mejor momento):

| Dimensión | Nota | Por qué |
|---|---|---|
| Identidad visual | 4/10 | Estética de plantilla; el logo (pulgar azul/verde) y la paleta cian no conversan; animaciones decorativas en todo (logo que "respira", brillo que cruza, anillos girando, botón que late). |
| Tipografía | 3/10 | Syne (fuente de display muy ancha) usada también para texto corrido; **en Safari/WebKit los titulares se rompen** (ver §3.1). |
| Jerarquía y ritmo | 5/10 | Todas las secciones pesan igual: título centrado + rejilla. En móvil el hero apila 2 badges redundantes + píldora de precio antes del CTA. |
| Copy y conversión | 6/10 | Buen tono y precios visibles, pero promesas que el producto no respalda (§5) y el mayor argumento real de venta —**pagas cuando el documento ya está hecho**— no aparece en ninguna página. |
| Rendimiento | 7/10 | Escritorio excelente; móvil con FCP de 2,6 s en todas las páginas por una cadena de fuentes que bloquea el render. |
| SEO técnico | 7/10 | Sólido en lo esencial; fallan og:image genérica, longitudes de title/description, saltos de encabezados, FAQ de la home sin marcado, TyC/PP sin OG. |
| Accesibilidad | 6/10 | Contraste insuficiente en textos terciarios, contenido oculto hasta que JS lo revela, `prefers-reduced-motion` ignorado en la mayoría de animaciones, touch targets pequeños. |
| Mantenibilidad | 3/10 | 10 archivos con nav/footer/iconos copiados a mano; el mismo bloque `<style>` repetido en 7 páginas; SVG de WhatsApp pegado ~5 veces por página. |

---

## 1. Rutas y propósito de negocio

| Ruta | Rol en el funnel | A quién le habla | Conversión |
|---|---|---|---|
| `/` | Descubrimiento (orgánico/directo; Ads apunta al chat) | Cualquiera con un problema legal | Clic al chat (con `utm` reenviados + marca de orgánico) o WhatsApp |
| `/accion-de-tutela/` | Intención alta (búsqueda "tutela eps") | Persona con un derecho vulnerado, casi siempre salud | Chat `?categoria=tutela` · **única con gtag de Ads** (junto a petición) |
| `/derecho-de-peticion/` | Intención alta | Persona a la que una entidad no le responde | Chat `?categoria=derecho-peticion` · gtag de Ads |
| `/desacato/` | Intención alta, post-tutela | Quien ganó una tutela que no cumplen | Chat `?categoria=tutela` |
| `/calculadora-laboral/` | Intención media-alta | Trabajador despedido / fin de contrato | Chat `?categoria=calculadora-laboral` |
| `/calculadora-tributaria/` | Estacional (ago–oct renta) | Asalariado/contratista que debe declarar | Chat `?categoria=calculadora-tributaria` |
| `/calculadora-notarial/` | Intención media | Comprador/vendedor de inmueble, sucesión | Chat `?categoria=calculadora-notarial` |
| `/vivienda/` | Nuevo producto ($29.900) | Propietario que va a arrendar | Chat `?categoria=vivienda` |
| `/TyC.html`, `/PP.html` | Confianza / cumplimiento | Usuario precavido, Google (E-E-A-T) | — |

Datos del producto verificados en el `CLAUDE.md` de la app (fuente de verdad): **103 plantillas + 3 calculadoras**, $19.900 por documento o cálculo (F-210 diligenciado $25.000, estudio de arrendamiento $29.900), pago único con Wompi (Nequi, Bancolombia, PSE, Daviplata), el usuario **siempre elige la plantilla**, las preguntas son cerradas, el documento se genera **antes** del pago (el pago desbloquea la descarga), las tutelas citan jurisprudencia literal.

---

## 2. Sistema de diseño actual

- **Tipografía:** Syne 400–800 (display *y* cuerpo), Instrument Serif itálica (acentos), DM Mono (etiquetas, botones, navegación en mayúsculas espaciadas).
- **Paleta:** tema claro por defecto (`#E8EBF1` fondo) y oscuro opcional (`#07070D`); acento cian `#06B6A8` / `#00E5D4`, texto cian `#0A6E63`. El logo real (pulgar azul `#2B9AF3`, burbuja verde, punto naranja) no comparte ninguno de estos colores.
- **Componentes:** `hero` con cuadrícula + glow + mockup de chat; `stat-card` con contador animado; `service-card` (icono en caja cian, título, texto, CTA en mono); `how__step`; `testimonial-card` con estrellas; `faq__item` con `<details>`; `cta-final`. Toda sección = eyebrow mono + título con itálica + rejilla.
- **Espaciado:** `--section-gap: clamp(80px,10vw,140px)`, contenedor 1200 px. Breakpoints dispersos: 420, 560, 600, 640, 720, 768, 860, 900, 1100.
- **Elementos flotantes:** barra social fija a la izquierda, botón de WhatsApp y toggle de tema apilados abajo a la derecha (en móvil tapan contenido y compiten con el CTA).

## 3. Arquitectura frontend

- **Stack:** HTML estático por carpeta + `styles.css` (2.067 líneas) + `main.js` + `theme.js`. Vercel sirve la raíz tal cual (`vercel.json`: `trailingSlash`, redirects 308). **No hay build.** Para SEO esto equivale a SSG: todo el contenido llega en el HTML.
- **Carga:** `theme.js` bloqueante en `<head>` (correcto, evita parpadeo). `main.js` al final del body, sin `defer`. El carrusel de reels se construye 100 % en JS.
- **Duplicación:** cada landing repite nav, barra social, footer, FAB y un bloque `<style>` idéntico (`.nav__home`, `.ads-*`, `.calcmock*`, `.includes*`) — 7 copias. El SVG de WhatsApp (1,3 KB) aparece hasta 5 veces por página. Resultado: HTML de 46–73 KB para 3–5 KB de texto útil.
- **Estilos inline** en decenas de elementos (`style="display:grid;grid-template-columns:repeat(3,1fr)"` sin breakpoint → en móvil las 3 tarjetas de las landings quedaban en columnas de ~110 px, rescatadas solo porque el contenedor tiene overflow).

### 3.1 El bug de Safari
En WebKit (Playwright 26.0, equivalente a Safari 26) los titulares en **Syne 800 con `letter-spacing:-0.04em`** se dibujan con un espacio enorme entre letras ("T u s  d e r e c h o s", "A c c i ó n  d e  T u t e l a"). Chromium y Firefox los ven bien. Captura en `shots-before/webkit-*`. Se resuelve de raíz: el rediseño deja de usar Syne para titulares.

### 3.2 Contenido oculto tras JavaScript
`main.js` pone `opacity:0` a tarjetas, pasos, testimonios, FAQ y estadísticas, y solo las muestra cuando un `IntersectionObserver` las detecta. Una captura de página completa sale **en blanco** en 8 de 12 secciones. Google indexa el texto (está en el DOM), pero: si JS falla, la página queda vacía; no respeta `prefers-reduced-motion`; y los contadores muestran "0" hasta animarse (un crawler que no hace scroll ve "0 clientes").

## 4. SEO técnico (estado actual)

| Ítem | Estado | Detalle |
|---|---|---|
| `title` único | ⚠️ | Únicos, pero 4 superan 60 caracteres (desacato 70, tributaria 71, notarial 73, vivienda 74) y Google los trunca. |
| `meta description` | ⚠️ | Home 88 c (corta y sin palabra clave); laboral/tributaria 171, notarial 197, vivienda 240 (truncadas). |
| Canonical | ✅ | Autorreferentes en todas. |
| Open Graph / Twitter | ⚠️ | Completos en 8 páginas pero **todas comparten `logo.png`** como imagen; TyC y PP no tienen OG ni Twitter. |
| JSON-LD | ⚠️ | `LegalService` + `BreadcrumbList` + `FAQPage` en landings; home con `LegalService` + `WebSite`. Falta `FAQPage` en la home (tiene FAQ visible). Los `provider` repiten la organización en vez de referenciar `@id`. `sameAs` incompleto en 7 páginas (sin TikTok/YouTube). TyC/PP sin marcado. |
| sitemap.xml / robots.txt | ✅ | Correctos, con las 10 rutas. |
| Un solo H1 | ✅ | Sí, pero con saltos de nivel (H2→H4 en footer, H1→H3 en tarjetas que no cuelgan de un H2). |
| HTML semántico | ⚠️ | `nav`/`main`/`footer` presentes; secciones sin encabezado propio; tarjetas como `div`; sin breadcrumb visible (el BreadcrumbList no tiene espejo en pantalla). |
| Imágenes | ⚠️ | Sin `width`/`height` (riesgo de CLS); logo PNG de 120 KB precargado para mostrarse a 36 px; favicon PNG de 80 KB (512 px). |
| Enlaces internos | ⚠️ | Solo en el footer; las landings no se enlazan entre sí en el cuerpo (desacato ↔ tutela ↔ petición es el camino natural del usuario). |
| Indexabilidad | ✅ | Sin `noindex` accidentales; todo el texto en el HTML. |
| `meta keywords`, `geo.*` | ℹ️ | Google los ignora; se conservan por la regla del proyecto, sin impacto. |

### Core Web Vitals (laboratorio, Lighthouse 12, local con gzip)

| Ruta | Perf. móvil | LCP móvil | CLS | TBT móvil | Perf. escritorio |
|---|---|---|---|---|---|
| `/` | 85 | 3,6 s | 0 | 30 ms | 99 |
| `/accion-de-tutela/` | **64** | **5,3 s** | 0,005 | **450 ms** | 99 |
| `/derecho-de-peticion/` | 91 | 2,7 s | 0,005 | 130 ms | 99 |
| resto de landings | 91 | 2,8 s | ≤0,011 | 0 ms | 99 |
| TyC / PP | 91 | 2,9 s | ≤0,022 | 0 ms | 99 |

Causa principal del FCP de 2,6 s en móvil: `styles.css` hace `@import` de Google Fonts **además** del `<link>` del HTML → cadena HTML → CSS → CSS de fuentes → 7 archivos woff2 de otro origen, todo bloqueante. En tutela se suma gtag (TBT 450 ms). INP no se mide en laboratorio; el JS actual es liviano, el riesgo está en los listeners de scroll sin `passive` en algunos casos y en el carrusel.

## 5. Copy: afirmaciones que el producto no respalda

Cotejado contra los TyC publicados y el `CLAUDE.md` de la app:

| Dónde | Dice | Problema | Acción |
|---|---|---|---|
| Tutela, petición, desacato ("Cómo funciona" paso 2) | "Un abogado experto elabora el documento" | Los TyC (§4) dicen que los resultados "continúan siendo generados mediante sistemas de inteligencia artificial". | Reescribir: el asistente redacta con la estructura y la jurisprudencia de un abogado. |
| Tutela paso 3 | "Presenta y gana" | TyC §3: "No garantiza el éxito de actuaciones legales". | "Presenta tu tutela". |
| Meta description desacato | "Obligamos al juez a sancionar al incumplido" | Nadie obliga a un juez; decide él. | Reescribir. |
| Tutela contra EPS | "con mayor tasa de éxito" | Sin fuente. | Quitar la comparación. |
| Varias | "lista en segundos" | Generar exige responder preguntas; honesto es "en minutos". | Cambiar en el cuerpo. |
| Todas | Testimonios con nombre, ciudad y 5 estrellas | No hay fuente verificable en el repo. La app tiene un sistema de reseñas reales (`/api/feedback/resumen`). | Se conservan (decisión de negocio) pero **quedan marcados en el informe para que confirmes su origen**; nunca en JSON-LD. |
| Todas | "+2.000 clientes satisfechos / 4.000 asesorías" con contador | Sin fuente en el repo. | Se conserva "+2.000 clientes" como dato del negocio a confirmar; la banda de estadísticas pasa a hechos verificables del producto (103 plantillas, 3 calculadoras, $19.900, 24/7). |

Y lo que **falta** y sí es cierto: el documento se redacta antes de pagar (el pago solo desbloquea la descarga); el usuario elige la plantilla; la tutela cita jurisprudencia de la Corte Constitucional literalmente; se paga sin tarjeta.

---

## 6. Plan de rediseño

### Concepto: **"Papel y sello"**
La cultura legal colombiana es documental: el papel, el radicado, el sello, la cita al artículo, la nota al margen. La landing deja de parecer una app de IA genérica y pasa a parecer lo que vende: **un documento jurídico bien hecho, entregado con la velocidad de una app**.

- **Paleta:** papel marfil `#F5F2EA`, tinta `#10181B`, verde-azulado de marca `#0A6E63` para texto y enlaces, cian `#00E5D4` reservado para *resaltador* (subrayado de palabras clave) y el botón principal, y un bermellón de lacre `#A63A22` solo para sellos y plazos. Modo oscuro "tinta": `#0C1214`.
- **Tipografía:** Instrument Serif a gran tamaño para titulares (voz editorial, de código civil impreso), **Manrope** para texto e interfaz (la misma que ya usa el modal de pago de la app), DM Mono para metadatos tipo radicado. Syne sale (arregla Safari y ahorra peso). Fuentes **autoalojadas** con `preload` y métricas de respaldo ajustadas (`size-adjust`) para CLS ≈ 0.
- **Firma visual:** en cada hero, una **hoja de documento que se redacta sola** (encabezado "Señor Juez…", hechos, fundamento) y termina con un **sello** "Listo para radicar". Muestra el resultado, no la conversación.
- **Componentes nuevos:** triage "¿Qué te está pasando?" (situaciones → la landing correcta, también enlazado interno con anchor text relevante); índice de servicios estilo tabla de contenido de un código; **recibo** de precio con borde perforado ("pagas cuando esté listo"); nota de **fundamento legal** con el artículo en grande; **anatomía del documento** anotada; bloque de transparencia "Qué es y qué no es Justiexpress".
- **Movimiento:** pocas animaciones, con intención (la redacción del documento, el sello, un subrayado). Todo con `transform/opacity`, todo desactivado con `prefers-reduced-motion`. **El contenido nunca depende de JS para verse.**

### Arquitectura
- Se mantiene HTML estático (ya es la mejor estrategia para SEO y velocidad; no se justifica un framework).
- **Parciales sincronizados en sitio** (`tools/build.mjs`): nav, footer, FAB y sprite de iconos viven en `partials/` y el build los reescribe dentro de marcadores `<!-- @partial … -->` de cada página. Las páginas siguen siendo el código fuente editable; el check falla si un bloque compartido se desincroniza. Vercel no cambia (sigue sirviendo la raíz).
- **Sprite SVG** externo para iconos repetidos; CSS único sin `<style>` por página; `main.js` con `defer` y un solo módulo de atribución que lee `data-*` del `<body>` (mismas `categoria`/`origen` que hoy — el embudo del chat no cambia).
- gtag de Ads: **se deja idéntico** y solo en tutela y petición (regla del proyecto).
- `.vercelignore` para no publicar `tools/`, `partials/` ni los `.md` internos.

### SEO
- Titles ≤ 60 c y descriptions 120–155 c con palabra clave + precio.
- **Imagen OG propia por página** (1200×630, generada con el nuevo diseño).
- JSON-LD en `@graph` con `@id` estables: `Organization`/`LegalService` único referenciado por cada `Service` + `Offer`, `BreadcrumbList` con espejo visible, `FAQPage` espejo del FAQ visible (también en la home), `WebPage` en TyC/PP.
- Jerarquía de encabezados sin saltos; `article`/`section` con encabezado propio; imágenes con `width`/`height`.
- Enlaces internos contextuales entre landings ("También te puede servir") además del footer.
- Sitemap con `lastmod` real.

### Validación antes de cada commit
`node tools/check.mjs`: sincronía de parciales, JSON-LD parseable, 1 H1 y sin saltos, enlaces internos sin 404, longitudes de title/description, y render sin errores de consola ni scroll horizontal en **Chromium y WebKit** a 390 px y 1440 px.
