# Página por documento — plantilla y reglas

Una página por plantilla del catálogo de la app, para competir en Google con
quien hoy gana esas búsquedas (wonder.legal/co tiene 123 páginas de modelo en
Colombia). Implementación de referencia: **`/tutela-contra-eps/`**.

## Por qué así

- **El contenido vive en `www`**, donde Google ya da autoridad al dominio. La app
  (`chat.justiexpress.com`) es una sola URL: su trabajo es convertir.
- **No se copia la fórmula de wonder.legal** (las mismas 15 preguntas en todas
  las páginas). Cada página usa lo que la app YA sabe de ese documento: sus
  vías jurídicas, sus pruebas, sus plazos y su guía de radicación. Eso es
  contenido que nadie más tiene.
- **Tema legal = «tu dinero o tu vida» para Google:** exige fecha visible,
  fuentes oficiales con enlace y honestidad sobre quién redacta. Nada inventado:
  ni reseñas, ni cifras de clientes, ni «revisado por abogado» si no existe.
- **De a pocas y revisadas.** Google penaliza el contenido generado a escala
  solo para posicionar. Cada página la revisa el dueño antes de publicarla.

## Ruta

Plana y con la búsqueda real: `/tutela-contra-eps/`, `/derecho-de-peticion-datacredito/`…
(`tools/build.mjs` y `check.mjs` solo recorren carpetas de primer nivel). La
jerarquía la dan las migas y el `BreadcrumbList` (Inicio › hub › página).

## Estructura (en este orden)

| Bloque | Qué lleva | De dónde sale |
|---|---|---|
| `<head>` | title 30–60 c con la búsqueda principal · description 110–160 c · canonical · OG/Twitter con imagen propia · `og:type=article` y `article:modified_time` · **sin gtag** | — |
| JSON-LD | `LegalService` (igual en todas) · `WebSite` · `WebPage` con `datePublished`, `dateModified`, `author` y `citation` (las fuentes) · `Service` + `Offer` · `BreadcrumbList` de 3 niveles · `FAQPage` = espejo exacto del FAQ visible | — |
| `<body>` | `data-categoria` (respaldo) + **`data-plantilla`** (id exacto de la plantilla) + `data-origen` | `server/templates/index.ts` |
| Hero | eyebrow con la norma · H1 = el nombre como lo busca la gente · **respuesta directa** en el lede (qué es, cuándo procede, plazo, que no necesita abogado, precio) · CTA `data-chat` · `receipt` · confianza **sin cifras inventadas** · `<p class="actualizado">` con `<time>` | — |
| § Cuándo procede | Una tarjeta por **vía** del formulario: qué pide el escrito en esa vía | `opciones` y `dependeDe` de la plantilla |
| § Fundamento legal | La norma citada **textual** (verificada contra la fuente oficial) y los plazos con su artículo | Secretaría del Senado / relatoría de la Corte |
| § Protección reforzada (si aplica) | Las condiciones especiales que el formulario pregunta y la norma que invoca cada una | opciones de condición especial |
| § Qué anexar | Las pruebas del catálogo de la plantilla y qué hacer si no las tiene | `pruebasOpciones` / `_opcionesComunes.ts` |
| § Cómo radicarla | **Resumen** de la guía (4 pasos). La guía completa sigue siendo parte de la compra | `server/lib/radicarInstrucciones.ts` |
| § Qué recibes | Las partes del escrito, dichas para ESTE documento | `template()` de la plantilla |
| § Preguntas | 6–8 preguntas **reales** (Search Console y términos de búsqueda de Ads), respuesta corta con artículo | Search Console · Ads |
| § Sigue tu caso | 3 enlaces internos (siguiente paso, hub, alternativa) + bloque `.fuentes` con enlaces oficiales y el aviso de que es información general y la redacta IA | — |
| Cierre | CTA igual al del hero | — |

## Reglas de contenido

- **Cada afirmación jurídica, con su artículo o sentencia**, y verificada contra
  el texto oficial antes de publicar. Si no se pudo verificar el número exacto,
  se dice en general (ej.: el desacato «puede terminar en arresto y multa»).
- **Mismo dato en todas partes:** precio $19.900, «pagas cuando está lista»,
  «no somos una firma de abogados». Si cambia, cambia en todas las páginas
  (texto, `receipt`, FAQ **y** JSON-LD).
- **Sin testimonios** salvo que sean reales y verificables.
- Un enlace en el FAQ que cierra la respuesta lleva el punto **dentro** del
  enlace (`<a>…desacato.</a>`): `check.mjs` compara el texto y un punto suelto
  después de `</a>` lo descuadra.

## Al publicar una página nueva

1. Copiar `tutela-contra-eps/index.html` como base y reescribir TODO el contenido.
2. `data-plantilla` con el id exacto de la plantilla de la app.
3. Entrada en `sitemap.xml`, enlace en `partials/footer.html` y desde su hub.
4. Imagen OG: entrada en `tools/og.mjs` y `node tools/og.mjs <slug>`.
5. `node tools/build.mjs && node tools/check.mjs && node tools/render-check.mjs`.
6. **Revisión del dueño** antes del push.
7. Después del despliegue: Search Console → Inspección de URL → Solicitar
   indexación, y seguir sus impresiones semana a semana.

## Cola (prioridad del plan SEO de oct 2026)

Hechas: 1. Tutela contra la EPS · 2. Derecho de petición a Datacrédito (hub del
bloque: las 3–5 cuelgan de ella en las migas) · 3. Pagué y sigo reportado ·
4. Suplantación en centrales de riesgo (con la Ley 2573 de 2026) ·
5. Caducidad del reporte negativo · 6. Impugnar un comparendo o fotomulta (hub
del bloque de multas: la 7 cuelga de ella en las migas) · 7. Prescripción y
caducidad de multas de tránsito. Siguen: 8. Tutela por derecho de petición ·
9. Derecho de petición a la EPS · 10. ¿Cuánto cuesta una tutela? · 11. ¿Cuánto
cuesta un derecho de petición? · 12. Contrato de arrendamiento de vivienda
urbana · 13. Liquidación por despido sin justa causa · 14. Tutela de pensión ·
15. Calculadora notarial (rehacer).

## Lo que enseñaron las dos de multas (oct 2026)

- **El plazo se verifica en el texto consolidado, no en la plantilla de la app.**
  Los 5 y 20 días del artículo 136 son los del DESCUENTO y solo aplican «si el
  inculpado acepta la comisión de la infracción»; el término para comparecer es
  el del artículo 135 (3 días hábiles) más los 6 días hábiles adicionales del
  artículo 137 cuando la detección fue electrónica. La página dice eso y además
  advierte que pagar el descuento cierra la impugnación, que es la duda real.
- **Cuando las fuentes se contradicen, se muestra la contradicción.** El artículo
  159 dice que la prescripción «se interrumpirá con la presentación de la
  demanda», redacción pensada para un proceso judicial que no encaja con el cobro
  coactivo. La página tiene una sección propia para eso en vez de afirmar una
  tesis: es más honesto y es el punto donde se gana la solicitud.
- **`secretariasenado.gov.co` no siempre responde.** El texto consolidado se
  verificó en el Gestor Normativo de Función Pública
  (`funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5557` para la Ley 769),
  que es igual de oficial. Enlazar solo fuentes cuya URL se haya comprobado.
