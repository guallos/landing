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
caducidad de multas de tránsito · 8. Tutela por derecho de petición ·
9. Derecho de petición a la EPS · 10. ¿Cuánto cuesta una tutela? · 11. ¿Cuánto
cuesta un derecho de petición? · 12. Contrato de arrendamiento de vivienda
urbana · 13. Liquidación por despido sin justa causa ·
14. Tutela de pensión (hub del bloque pensional: doce plantillas).
Sigue: 15. Calculadora notarial (rehacer).

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


- **La relatoría de la Corte Constitucional SÍ se puede consultar, y hay que hacerlo.**
  `corteconstitucional.gov.co/relatoria/<año>/T-XXX-YY.htm` (p. ej.
  `/relatoria/1998/T-301-98.htm`) devuelve el texto completo. Las búsquedas web NO
  confirmaron T-301 de 1998 ni el pasaje de T-357 de 2018 —una incluso sugirió que
  el año estaba mal—, y las dos resultaron correctas al abrirlas. **Ninguna
  sentencia se cita sin abrir su providencia**, y el enlace a la relatoría va en
  las fuentes, que es lo que permite al lector comprobarlo.
- **Leer el artículo completo deja regalos.** El numeral 1 del artículo 14 de la
  Ley 1755 dice que si una petición de DOCUMENTOS no se responde en diez días «se
  entenderá, para todos los efectos legales, que la respectiva solicitud ha sido
  aceptada» y las copias se entregan en tres días. Eso no estaba en ninguna de
  nuestras guías y es la respuesta exacta a «mi EPS no me da la historia clínica».



## Páginas de CONTRATO (12)

Un contrato no es adversarial, así que no tiene «vías» ni guía de radicación. Lo
que reemplaza a esas secciones es **lo que la ley fija por encima de lo que las
partes pacten** frente a **lo que sí se pacta**, que es la duda real de quien va
a firmar.

- **El gancho de arrendamiento es el art. 16 de la Ley 820** (prohibición de
  depósitos), y lo que lo hace valioso es el SEGUNDO inciso: tampoco vale
  pactarlo indirectamente, por interpuesta persona, en documento aparte ni bajo
  otra denominación. Eso mata el «mes de depósito» en recibo suelto y el «fondo
  de reparaciones», que es lo que de verdad le pasó al lector.
- Leer la ley completa dio cuatro reglas más que nadie reúne: término de un año
  a falta de pacto (art. 5), prórroga automática (art. 6), tope del canon en el
  1 % del valor comercial y ese valor topado en dos veces el avalúo catastral
  (art. 18), e incremento máximo del 100 % del IPC con deber de informarlo «so
  pena de ser inoponible» (art. 20).
- **Si el producto le quita una herramienta a una de las partes, hay que darle la
  alternativa:** como el arrendador no puede pedir depósito, la página tiene una
  sección con lo que sí permite la ley (codeudores solidarios, póliza) y enlaza
  el estudio de arrendamiento. Sin eso la página solo le dice que no.
- **La fecha se pone el día que se PUBLICA, no el día que se escribió.** Si pasa
  la medianoche entre redactar y publicar, se suben `<time>`,
  `article:modified_time`, el JSON-LD y el `lastmod` del sitemap.

## Páginas HUB de un bloque de plantillas (14)

`/tutela-de-pension/` no sirve a una plantilla sino a **doce**: el catálogo
tiene una tutela distinta para vejez, invalidez, sobrevivientes, indemnización
sustitutiva, bono pensional, prepensionado, hijo con discapacidad, mora del
empleador, acto administrativo, compatibilidad, indexación y debido proceso.

- **Cada tarjeta del § 01 entra por su `?plantilla=` exacto**, y por eso esos
  enlaces **NO llevan `data-chat`**: `main.js` reescribe TODO enlace con
  `data-chat` a la plantilla del `<body>`, así que las doce habrían caído en la
  misma. Sin `data-chat` el enlace conserva sus parámetros y solo recibe los
  utm, de modo que el `origen=` hay que escribirlo a mano.
- El `data-plantilla` del `<body>` es la plantilla **genérica**
  (`accion-tutela-ss-pension`, la que pregunta qué pensión se reclama): es la
  que abren el CTA del hero y el del cierre, que sí llevan `data-chat`.
- `?categoria=tutela` queda como respaldo aunque no liste pensiones: solo actúa
  si el id de la plantilla no existe, y los doce existen.

**El gancho fueron los PLAZOS, y son tres normas distintas:** cuatro meses para
reconocer la pensión (parágrafo 1 del art. 9 de la Ley 797 de 2003), **dos** si
es de sobrevivientes (art. 1 de la Ley 717 de 2001, norma especial) y seis para
los trámites del pago de las mesadas (art. 4 de la Ley 700 de 2001). El remate
no estaba en ninguna guía: el **parágrafo** de ese art. 4 hace que el
funcionario que los incumpla sin justa causa incurra en causal de mala
conducta, responda **solidariamente** por la indemnización moratoria y cargue
con las costas si el afiliado tuvo que recurrir a los tribunales.

**Una reforma aprobada que todavía no rige se dice con su fecha, no con
adjetivos.** La Ley 2381 de 2024 fue declarada exequible por la **Sentencia
C-264 de 2026**, que difirió su vigencia **al 1º de abril de 2027** y devolvió
nueve artículos a la plenaria de la Cámara. La página le dedica una sección
corta: hoy rigen la Ley 100 de 1993, la Ley 797 de 2003 y la Ley 860 de 2003, y
eso es verificable. No se especula con cómo quedará el sistema.

⚠️ **Las compilaciones marcan como INEXEQUIBLE el numeral entero cuando la
Corte solo tumbó una frase.** La compilación de la Ley 860 de 2003 rotula así
los numerales 1 y 2 de su art. 1, y de ahí se concluiría que ya no se exigen
las 50 semanas. Lo que la **Sentencia C-428 de 2009** declaró inexequible es
solo la **fidelidad de cotización** del 20 %; las 50 semanas dentro de los tres
años quedaron exequibles. Hay que abrir el *resuelve*, no fiarse del rótulo.


## Páginas de PRECIO (10 y 11)

Responden «cuánto cuesta X» en consultas donde ya rankeábamos 3-7 sin página
propia. **Su regla es que abren diciendo que el trámite es GRATIS**, con la norma
que lo dice, y el precio del hero es `$0` (el de radicar), no $19.900. Esquivar
eso para empujar el producto es justo lo que Google degrada, y se nota: la página
se gana la posición respondiendo la pregunta, y el precio aparece después como lo
que es —el costo de redactar, no el del derecho—.

- **Tutela:** art. 14 del Decreto 2591 de 1991 («sin ninguna formalidad o
  autenticación», «no será necesario actuar por medio de apoderado», franquicia,
  y verbal si no sabe escribir o es menor). Más **quién la hace gratis**: la
  Defensoría (art. 46) y el personero municipal por delegación (art. 49). Sí, se
  nombra a la competencia: es lo que hace creíble el resto.
- **Petición:** art. 13 de la Ley 1755 («el ejercicio del derecho de petición es
  gratuito y puede realizarse sin necesidad de representación a través de
  abogado»), los seis mínimos del art. 16 y las tres negativas ilegales (no
  recibirla —art. 15 par. 2—, rechazarla por mala redacción —art. 16 par. 2— y
  cobrar el formato o el sello).
- **No se inventa el honorario de un abogado:** no hay tarifa oficial, se pactan
  libremente, y eso es lo que se dice.
- El enlace desde el hub va en el renglón de «Actualizado», no dentro del bloque
  del precio (ahí queda en una columna de 70 px y se parte en cuatro líneas). Y
  **agregar ese enlace NO es motivo para subir la fecha** del hub.

## Páginas de CONFIANZA (no de documento)

`/quienes-somos/` (oct 2026) no sigue la tabla de arriba: no tiene vías, ni
anexos, ni guía de radicación. Usa el mismo esqueleto (hero · secciones · FAQ ·
aside · cierre) y `AboutPage` en vez de `WebPage` + `Service`, sin `data-categoria`
ni `data-plantilla` (sus CTA van al chat sin preseleccionar nada, y `main.js` los
deja pasar solo con los utm).

**Su regla es más dura que la de las demás: aquí SOLO van datos verificables.**
Nada de NIT, año de fundación, número de clientes, calificaciones ni «revisado
por abogado» mientras no existan y se puedan comprobar. La página declara que no
publicamos cifras ni reseñas inventadas, así que cualquier dato sin respaldo en
el resto del sitio la contradice y le quita valor a todas.

Pendiente del dueño: el **NIT** (no está en ninguna parte del sitio, así que se
escribió sin él) y decidir si existe un revisor legal al que se pueda nombrar.
