/* ═══════════════════════════════════════════════════════════════
   Justiexpress Landing — main.js (se carga con defer)
   ───────────────────────────────────────────────────────────────
   1. Atribución hacia el chat (utm/gclid + marca de orgánico)
   2. Navegación (menú móvil, desplegable de calculadoras)
   3. Botón flotante de WhatsApp (aparece al hacer scroll)
   4. Videos: destacado 16:9 + riel de reels (solo en la home)

   Nada de lo visible depende de este archivo: si falla, la página
   se lee completa (ver reglas en styles.css).
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. ATRIBUCIÓN HACIA EL CHAT ─────────────────────────────────
   Las landings reciben SOLO tráfico orgánico/directo (los anuncios
   apuntan directo al chat). El chat ve como referrer a la landing, no
   al buscador; por eso se reenvían los utm/gclid de la URL y, si la
   persona llegó de un buscador, se marca utm_medium=organic.

   · <body data-categoria="tutela" data-origen="organico-tutela">:
     los enlaces con [data-chat] se reescriben al chat con esa
     categoría y ese origen (mismos valores que usaba cada landing —
     el embudo del chat depende de ellos: NO cambiarlos).
   · Cualquier otro enlace al chat conserva su ?categoria= y solo
     recibe los utm/gclid y la marca de orgánico.                    */
(function () {
  var body = document.body;
  var entrada = new URLSearchParams(window.location.search);
  var REENVIAR = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  var host = '';
  try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (e) {}
  var esBuscador = /(^|\.)(google|bing|yahoo|duckduckgo|ecosia|yandex|baidu|ask|aol|qwant|brave)\./i.test(host);

  function marcar(u) {
    REENVIAR.forEach(function (k) {
      var v = entrada.get(k);
      if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
    });
    if (esBuscador && !u.searchParams.has('gclid') && !u.searchParams.has('utm_medium')) {
      u.searchParams.set('utm_source', host.split('.')[0]);
      u.searchParams.set('utm_medium', 'organic');
    }
    return u;
  }

  function urlDePagina() {
    var u = new URL('https://chat.justiexpress.com/');
    u.searchParams.set('categoria', body.dataset.categoria);
    if (body.dataset.origen) u.searchParams.set('origen', body.dataset.origen);
    return marcar(u).toString();
  }

  // Expuesta para redecorar enlaces creados dinámicamente (CTA de los reels).
  window.jeDecorarEnlacesChat = function (scope) {
    (scope || document).querySelectorAll('a[href*="chat.justiexpress.com"]').forEach(function (a) {
      try {
        if (a.hasAttribute('data-chat') && body.dataset.categoria) { a.href = urlDePagina(); return; }
        a.href = marcar(new URL(a.href)).toString();
      } catch (e) {}
    });
  };
  window.jeDecorarEnlacesChat(document);
})();

/* ── 2. NAVEGACIÓN ─────────────────────────────────────────────── */
(function () {
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      drawer.classList.toggle('is-open', open);
    };
    burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }

  // Desplegable "Calculadoras": clic/teclado en todos lados, hover con puntero fino.
  document.querySelectorAll('[data-menu]').forEach(function (menu) {
    var btn = menu.querySelector('button');
    var timer, abiertoPorHover = 0;
    var set = function (open) { menu.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', function () {
      // Con mouse, el hover ya lo abrió: el clic que llega justo después no debe cerrarlo.
      if (menu.classList.contains('is-open') && Date.now() - abiertoPorHover < 600) return;
      set(!menu.classList.contains('is-open'));
    });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      menu.addEventListener('mouseenter', function () { clearTimeout(timer); if (!menu.classList.contains('is-open')) abiertoPorHover = Date.now(); set(true); });
      menu.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 180); });
    }
    menu.addEventListener('focusout', function (e) { if (!menu.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) set(false); });
  });
})();

/* ── 3. WHATSAPP FLOTANTE ──────────────────────────────────────────
   No tapa el CTA del hero en el primer pantallazo: aparece tras 360 px. */
(function () {
  var fab = document.querySelector('.fab-wa');
  if (!fab) return;
  var ticking = false;
  var update = function () { fab.classList.toggle('is-visible', window.scrollY > 360); ticking = false; };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ── 4. VIDEOS ─────────────────────────────────────────────────────
   Riel horizontal de verticales enmarcados como teléfono. Patrón "facade":
   solo miniaturas hasta que la sección se acerca; entonces la tarjeta
   CENTRADA se vuelve un preview silenciado (un solo medio vivo a la vez).
   Clic → con sonido. Cada video lleva un CTA de conversión (`cta`).

   Fuentes admitidas por tarjeta:
   • YouTube:     { id: 'VIDEO_ID', title, tag, cta }
   • MP4 propio:  { type: 'video', src: 'reels/x.mp4', poster: 'reels/x.jpg', title, tag, cta }

   ⚠️ NO declarar VideoObject por estos videos (GSC, jul 2026): el riel
   lo construye JS y no hay reproductor en el HTML entregado.          */
const videoData = [
  // ── Reels propios (TikTok @tucasolegal), auto-alojados en reels/ ──
  { type: 'video', src: '/reels/tt-7658354115797437716.mp4', poster: '/reels/tt-7658354115797437716.jpg', title: 'Un testamento evita peleas familiares', tag: 'Familia',
    cta: { label: 'Consulta tu caso', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7658001775575747861.mp4', poster: '/reels/tt-7658001775575747861.jpg', title: '¿Vas a hacer escrituras? Calcula el costo', tag: 'Notarial',
    cta: { label: 'Gastos notariales', href: 'https://chat.justiexpress.com/?categoria=calculadora-notarial' } },
  { type: 'video', src: '/reels/tt-7657001169935404308.mp4', poster: '/reels/tt-7657001169935404308.jpg', title: '+100 documentos y calculadoras en tu bolsillo', tag: 'General',
    cta: { label: 'Descúbrelo', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7656789935915109653.mp4', poster: '/reels/tt-7656789935915109653.jpg', title: '¿Ganaste una tutela y no cumplen? Desacato', tag: 'Tutela',
    cta: { label: 'Haz tu desacato', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: '/reels/tt-7656577260300143892.mp4', poster: '/reels/tt-7656577260300143892.jpg', title: 'Contratos, cartas y tutelas: todo en uno', tag: 'General',
    cta: { label: 'Explóralos', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7655713678376979733.mp4', poster: '/reels/tt-7655713678376979733.jpg', title: 'Crea documentos legales en 3 pasos', tag: 'General',
    cta: { label: 'Empieza ahora', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7655295586698087701.mp4', poster: '/reels/tt-7655295586698087701.jpg', title: 'Mete una tutela sin abogado', tag: 'Tutela',
    cta: { label: 'Haz tu tutela', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: '/reels/tt-7655014000433876244.mp4', poster: '/reels/tt-7655014000433876244.jpg', title: 'Calcula tu liquidación tú mismo', tag: 'Laboral',
    cta: { label: 'Saca tus cuentas', href: 'https://chat.justiexpress.com/?categoria=calculadora-laboral' } },
  { type: 'video', src: '/reels/tt-7654603026652581140.mp4', poster: '/reels/tt-7654603026652581140.jpg', title: 'Deja de googlear tus dudas legales', tag: 'General',
    cta: { label: 'Pregúntale a la IA', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7653854050995408148.mp4', poster: '/reels/tt-7653854050995408148.jpg', title: 'Tu abogado, ahora en el bolsillo', tag: 'General',
    cta: { label: 'Iniciar consulta', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7653110144452037908.mp4', poster: '/reels/tt-7653110144452037908.jpg', title: '¿Te deben liquidación o cesantías?', tag: 'Laboral',
    cta: { label: 'Saca tus cuentas', href: 'https://chat.justiexpress.com/?categoria=calculadora-laboral' } },
  { type: 'video', src: '/reels/tt-7652751659998727445.mp4', poster: '/reels/tt-7652751659998727445.jpg', title: 'Documentos con IA, validados por abogados', tag: 'General',
    cta: { label: 'Crea el tuyo', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7652427139114863892.mp4', poster: '/reels/tt-7652427139114863892.jpg', title: 'Herramientas legales que todos deberían tener', tag: 'General',
    cta: { label: 'Explóralas', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7651990544960343317.mp4', poster: '/reels/tt-7651990544960343317.jpg', title: '¿Tu EPS te incumple? Mete una tutela', tag: 'Salud',
    cta: { label: 'Protege tu derecho', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: '/reels/tt-7651666684855487765.mp4', poster: '/reels/tt-7651666684855487765.jpg', title: 'Resolver tu caso legal, así de fácil', tag: 'General',
    cta: { label: 'Iniciar consulta', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: '/reels/tt-7658735599439875348.mp4', poster: '/reels/tt-7658735599439875348.jpg', title: 'Declarar renta siendo asalariado', tag: 'Tributaria',
    cta: { label: 'Calcula tu renta', href: 'https://chat.justiexpress.com/?categoria=calculadora-tributaria' } },

  // ── Shorts educativos (YouTube) ──
  { id: 'YBZ-CSoLCss', title: 'Tu Caso Legal', tag: 'General',
    cta: { label: 'Iniciar consulta', href: 'https://chat.justiexpress.com/' } },
  { id: 'Ls6kI-jiDcA', title: '¡Pilas! Si trabajas en casa, la ley cambió', tag: 'Laboral',
    cta: { label: 'Haz tu petición', href: 'https://chat.justiexpress.com/?categoria=derecho-peticion' } },
  { id: '51Po7NEGzfA', title: '¿Vivieron juntos más de dos años?', tag: 'Familia',
    cta: { label: 'Consulta tu caso', href: 'https://chat.justiexpress.com/' } },
  { id: 'wiyEbWDBcFM', title: 'Prescripción de deudas en Colombia', tag: 'Deudas',
    cta: { label: 'Consulta tu caso', href: 'https://chat.justiexpress.com/' } },
  { id: 'X-LUOHPSYKo', title: 'Nueva ley de divorcio', tag: 'Familia',
    cta: { label: 'Consulta tu caso', href: 'https://chat.justiexpress.com/' } },
  { id: 'njoVgALV9pw', title: 'Eliminar reportes negativos', tag: 'Crédito',
    cta: { label: 'Haz tu petición', href: 'https://chat.justiexpress.com/?categoria=derecho-peticion' } },
  { id: '4u7OzJJ8hlg', title: 'Embargo de salario', tag: 'Laboral',
    cta: { label: 'Protege tu derecho', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { id: 'B-SE77MnWPo', title: 'Devoluciones por Internet', tag: 'Consumidor',
    cta: { label: 'Haz tu petición', href: 'https://chat.justiexpress.com/?categoria=derecho-peticion' } },
  { id: 'w8wRLskbR7A', title: 'Protección laboral embarazo', tag: 'Laboral',
    cta: { label: 'Protege tu derecho', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { id: 'NGOg_5oLbuA', title: 'Garantía carro usado', tag: 'Consumidor',
    cta: { label: 'Haz tu petición', href: 'https://chat.justiexpress.com/?categoria=derecho-peticion' } },
];

(function initReels() {
  const rail = document.getElementById('reels-rail');
  if (!rail) return;
  const dotsBox = document.getElementById('reels-dots');
  const chipsBox = document.getElementById('reels-filters');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let cards = [], visible = [], activeIdx = -1, built = false, raf = null;

  function build() {
    if (built) return;
    built = true;
    const frag = document.createDocumentFragment();
    videoData.forEach((v, i) => {
      const card = document.createElement('article');
      card.className = 'reel-card';
      card.dataset.idx = i;
      card.dataset.tag = v.tag;
      const thumb = v.type === 'video' ? (v.poster || '') : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
      card.innerHTML = `
        <div class="reel-phone">
          <span class="reel-notch"></span>
          <div class="reel-media">
            <img src="${esc(thumb)}" alt="" width="240" height="427" loading="lazy" decoding="async" />
            <span class="reel-tag">${esc(v.tag)}</span>
            <button class="reel-play" type="button" aria-label="Reproducir: ${esc(v.title)}">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>
            </button>
            <div class="reel-overlay">
              <h3 class="reel-title">${esc(v.title)}</h3>
              <a class="reel-cta" href="${esc(v.cta.href)}" target="_blank" rel="noopener noreferrer">${esc(v.cta.label)} →</a>
            </div>
          </div>
        </div>`;
      card.querySelector('.reel-play').addEventListener('click', (e) => { e.stopPropagation(); playFull(card, v); });
      card.addEventListener('click', (e) => {
        if (e.target.closest('.reel-cta')) return;
        const idx = visible.indexOf(card);
        if (idx === activeIdx) playFull(card, v); else scrollToCard(idx);
      });
      frag.appendChild(card);
      cards.push(card);
    });
    rail.appendChild(frag);
    if (typeof window.jeDecorarEnlacesChat === 'function') window.jeDecorarEnlacesChat(rail);

    if (chipsBox) {
      ['Todos', ...new Set(videoData.map((v) => v.tag))].forEach((t, i) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'reels-chip' + (i === 0 ? ' active' : '');
        chip.setAttribute('aria-pressed', String(i === 0));
        chip.textContent = t;
        chip.addEventListener('click', () => applyFilter(t, chip));
        chipsBox.appendChild(chip);
      });
    }
    visible = cards.slice();
    buildDots();
    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    requestAnimationFrame(updateActive);
  }

  function applyFilter(tag, chip) {
    chipsBox.querySelectorAll('.reels-chip').forEach((c) => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
    cards.forEach((c) => { revertCard(c); c.hidden = !(tag === 'Todos' || c.dataset.tag === tag); });
    visible = cards.filter((c) => !c.hidden);
    activeIdx = -1;
    buildDots();
    rail.scrollTo({ left: 0, behavior: 'auto' });
    requestAnimationFrame(updateActive);
  }

  function buildDots() {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    visible.forEach((c, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'reels-dot';
      d.setAttribute('aria-label', `Ir al video ${i + 1}`);
      d.addEventListener('click', () => scrollToCard(i));
      dotsBox.appendChild(d);
    });
  }

  function scrollToCard(i) {
    const c = visible[i];
    if (c) rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }

  function updateActive() {
    if (!visible.length) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    visible.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best === activeIdx) return;
    if (activeIdx > -1 && visible[activeIdx]) revertCard(visible[activeIdx]);
    activeIdx = best;
    visible.forEach((c, i) => c.classList.toggle('is-active', i === best));
    if (dotsBox) dotsBox.querySelectorAll('.reels-dot').forEach((d, i) => { d.classList.toggle('active', i === best); d.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    previewCard(visible[best]);
  }

  function makeMedia(v, sound) {
    if (v.type === 'video') {
      const el = document.createElement('video');
      el.src = v.src;
      if (v.poster) el.poster = v.poster;
      el.playsInline = true;
      el.autoplay = true;
      if (sound) el.controls = true;
      else { el.muted = true; el.loop = true; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); }
      if (el.play) el.play().catch(() => {});
      return el;
    }
    const f = document.createElement('iframe');
    f.src = sound
      ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`
      : `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=1&loop=1&playlist=${v.id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1`;
    f.title = sound ? v.title : 'Vista previa';
    f.allow = sound ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : 'autoplay; encrypted-media';
    if (sound) f.allowFullscreen = true; else { f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); }
    return f;
  }

  function previewCard(card) {
    if (reduce || !card || card.classList.contains('is-playing') || card.querySelector('iframe, video')) return;
    card.querySelector('.reel-media').insertBefore(makeMedia(videoData[card.dataset.idx], false), card.querySelector('.reel-tag'));
  }

  function playFull(card, v) {
    const idx = visible.indexOf(card);
    if (idx > -1 && idx !== activeIdx) {
      if (activeIdx > -1 && visible[activeIdx]) revertCard(visible[activeIdx]);
      scrollToCard(idx);
    }
    const old = card.querySelector('iframe, video');
    if (old) old.remove();
    card.classList.add('is-playing');
    card.querySelector('.reel-media').insertBefore(makeMedia(v, true), card.querySelector('.reel-tag'));
  }

  function revertCard(card) {
    card.classList.remove('is-playing');
    const m = card.querySelector('iframe, video');
    if (m) m.remove();
  }

  function onScroll() { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(updateActive); }

  document.getElementById('vid-prev')?.addEventListener('click', () => scrollToCard(Math.max(0, activeIdx - 1)));
  document.getElementById('vid-next')?.addEventListener('click', () => scrollToCard(Math.min(visible.length - 1, activeIdx + 1)));

  // Construir el riel solo cuando la sección se acerca (no cuesta nada en la carga).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); build(); }
    }, { rootMargin: '600px 0px' });
    io.observe(rail);
  } else build();
})();

/* Video destacado 16:9 (facade: clic → iframe con sonido) */
(function initFeatured() {
  const media = document.getElementById('featured-media');
  if (!media) return;
  const play = () => {
    if (media.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${media.dataset.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = media.dataset.title || 'Video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    media.appendChild(f);
    media.classList.add('is-playing');
  };
  media.addEventListener('click', play);
  media.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
})();
