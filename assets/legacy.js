/* ═══════════════════════════════════════════════════════
   Justiexpress Landing — main.js
   ═══════════════════════════════════════════════════════ */

/* ── NAV: estado al hacer scroll ── */

const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

/* ── NAV: menú móvil (burger) ── */

const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
});

drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  });
});

/* ── NAV: scroll suave con offset de nav fijo ── */

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ── STATS: animación de contadores ── */

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start    = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOut(progress) * target);
    el.textContent = target >= 1000 ? '+' + value.toLocaleString('es-CO') : value;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ── INTERSECTION OBSERVER: contadores + reveal ── */

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (entry.target.classList.contains('stat-card__num')) animateCounter(entry.target);
    if (entry.target.classList.contains('reveal')) entry.target.classList.add('visible');
    io.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.stat-card__num').forEach(el => io.observe(el));

/* ── REVEAL: animación de entrada por scroll ── */

const revealSelectors = [
  '.service-card',
  '.how__step',
  '.testimonial-card',
  '.faq__item',
  '.stat-card',
  '.about__text > *',
];

revealSelectors.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 80}ms`;
    io.observe(el);
  });
});

/* ── VIDEOS: Reels Rail ──
   Riel horizontal de verticales enmarcados como teléfono. Patrón "facade":
   por defecto solo se cargan miniaturas (rápido + bueno para SEO). Cuando la
   sección entra en viewport, la tarjeta CENTRADA se convierte en un preview en
   autoplay silenciado (un solo elemento vivo a la vez). Al hacer clic se
   reproduce con sonido. Cada video lleva un CTA de conversión (editable en `cta`).

   Cada tarjeta admite dos fuentes:
   • YouTube (por defecto):  { id: 'VIDEO_ID', title, tag, cta }
   • MP4 propio (IG/TikTok):  { type: 'video', src: 'reels/mi-reel.mp4',
                                poster: 'reels/mi-reel.jpg', title, tag, cta }
     → Exporta el reel vertical, súbelo a la carpeta y añade la línea. Da el
       mejor preview silenciado y no carga JS de terceros. Ejemplo comentado abajo. */

const videoData = [
  // ── Reels propios (TikTok @tucasolegal), auto-alojados en reels/ ──
  { type: 'video', src: 'reels/tt-7658354115797437716.mp4', poster: 'reels/tt-7658354115797437716.jpg', title: 'Un testamento evita peleas familiares', tag: 'Familia',
    cta: { label: 'Consulta tu caso', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7658001775575747861.mp4', poster: 'reels/tt-7658001775575747861.jpg', title: '¿Vas a hacer escrituras? Calcula el costo', tag: 'Notarial',
    cta: { label: 'Gastos notariales', href: 'https://chat.justiexpress.com/?categoria=calculadora-notarial' } },
  { type: 'video', src: 'reels/tt-7657001169935404308.mp4', poster: 'reels/tt-7657001169935404308.jpg', title: '+100 documentos y calculadoras en tu bolsillo', tag: 'General',
    cta: { label: 'Descúbrelo', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7656789935915109653.mp4', poster: 'reels/tt-7656789935915109653.jpg', title: '¿Ganaste una tutela y no cumplen? Desacato', tag: 'Tutela',
    cta: { label: 'Haz tu desacato', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: 'reels/tt-7656577260300143892.mp4', poster: 'reels/tt-7656577260300143892.jpg', title: 'Contratos, cartas y tutelas: todo en uno', tag: 'General',
    cta: { label: 'Explóralos', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7655713678376979733.mp4', poster: 'reels/tt-7655713678376979733.jpg', title: 'Crea documentos legales en 3 pasos', tag: 'General',
    cta: { label: 'Empieza ahora', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7655295586698087701.mp4', poster: 'reels/tt-7655295586698087701.jpg', title: 'Mete una tutela sin abogado', tag: 'Tutela',
    cta: { label: 'Haz tu tutela', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: 'reels/tt-7655014000433876244.mp4', poster: 'reels/tt-7655014000433876244.jpg', title: 'Calcula tu liquidación tú mismo', tag: 'Laboral',
    cta: { label: 'Saca tus cuentas', href: 'https://chat.justiexpress.com/?categoria=calculadora-laboral' } },
  { type: 'video', src: 'reels/tt-7654603026652581140.mp4', poster: 'reels/tt-7654603026652581140.jpg', title: 'Deja de googlear tus dudas legales', tag: 'General',
    cta: { label: 'Pregúntale a la IA', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7653854050995408148.mp4', poster: 'reels/tt-7653854050995408148.jpg', title: 'Tu abogado, ahora en el bolsillo', tag: 'General',
    cta: { label: 'Iniciar consulta', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7653110144452037908.mp4', poster: 'reels/tt-7653110144452037908.jpg', title: '¿Te deben liquidación o cesantías?', tag: 'Laboral',
    cta: { label: 'Saca tus cuentas', href: 'https://chat.justiexpress.com/?categoria=calculadora-laboral' } },
  { type: 'video', src: 'reels/tt-7652751659998727445.mp4', poster: 'reels/tt-7652751659998727445.jpg', title: 'Documentos con IA, validados por abogados', tag: 'General',
    cta: { label: 'Crea el tuyo', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7652427139114863892.mp4', poster: 'reels/tt-7652427139114863892.jpg', title: 'Herramientas legales que todos deberían tener', tag: 'General',
    cta: { label: 'Explóralas', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7651990544960343317.mp4', poster: 'reels/tt-7651990544960343317.jpg', title: '¿Tu EPS te incumple? Mete una tutela', tag: 'Salud',
    cta: { label: 'Protege tu derecho', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
  { type: 'video', src: 'reels/tt-7651666684855487765.mp4', poster: 'reels/tt-7651666684855487765.jpg', title: 'Resolver tu caso legal, así de fácil', tag: 'General',
    cta: { label: 'Iniciar consulta', href: 'https://chat.justiexpress.com/' } },
  { type: 'video', src: 'reels/tt-7658735599439875348.mp4', poster: 'reels/tt-7658735599439875348.jpg', title: 'Declarar renta siendo asalariado', tag: 'Tributaria',
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
  const rail     = document.getElementById('reels-rail');
  const dotsBox  = document.getElementById('reels-dots');
  const chipsBox = document.getElementById('reels-filters');
  if (!rail) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let cards = [];       // todas las tarjetas
  let visible = [];     // tarjetas visibles según filtro
  let activeIdx = -1;   // índice dentro de `visible`
  let sectionSeen = false;
  let raf = null;

  // ── Construir tarjetas ──
  videoData.forEach((v, i) => {
    const card = document.createElement('article');
    card.className = 'reel-card';
    card.dataset.idx = i;
    card.dataset.tag = v.tag;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Reproducir: ${v.title}`);
    const thumb = v.type === 'video' ? (v.poster || '') : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    card.innerHTML = `
      <div class="reel-phone">
        <span class="reel-notch"></span>
        <div class="reel-media">
          <img class="reel-thumb" src="${esc(thumb)}" alt="${esc(v.title)}" loading="lazy" />
          <span class="reel-tag">${esc(v.tag)}</span>
          <button class="reel-play" type="button" aria-label="Reproducir ${esc(v.title)}">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="reel-overlay">
            <h3 class="reel-title">${esc(v.title)}</h3>
            <a class="reel-cta" href="${esc(v.cta.href)}" target="_blank" rel="noopener noreferrer">${esc(v.cta.label)} →</a>
          </div>
        </div>
      </div>`;

    card.querySelector('.reel-play').addEventListener('click', (e) => { e.stopPropagation(); playFull(card, v); });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.reel-cta')) return;               // dejar navegar el CTA
      const idx = visible.indexOf(card);
      if (idx === activeIdx) playFull(card, v);                // clic en la centrada → con sonido
      else scrollToCard(idx);                                  // clic en una lateral → centrarla
    });
    card.addEventListener('keydown', (e) => {
      if (e.target.closest('.reel-cta, .reel-play')) return;   // dejar actuar al CTA / botón play
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playFull(card, v); }
    });

    rail.appendChild(card);
    cards.push(card);
  });

  // Preservar el tracking de UTM/categoría en los CTA recién creados
  if (typeof window.jeDecorarEnlacesChat === 'function') window.jeDecorarEnlacesChat(rail);

  // ── Chips de filtro por tema ──
  const tags = ['Todos', ...new Set(videoData.map((v) => v.tag))];
  tags.forEach((t, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'reels-chip' + (i === 0 ? ' active' : '');
    chip.setAttribute('role', 'tab');
    chip.textContent = t;
    chip.addEventListener('click', () => applyFilter(t, chip));
    chipsBox && chipsBox.appendChild(chip);
  });

  function applyFilter(tag, chip) {
    chipsBox.querySelectorAll('.reels-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    cards.forEach((c) => {
      revertCard(c);
      c.style.display = (tag === 'Todos' || c.dataset.tag === tag) ? '' : 'none';
    });
    visible = cards.filter((c) => c.style.display !== 'none');
    activeIdx = -1;
    buildDots();
    rail.scrollTo({ left: 0, behavior: 'auto' });
    requestAnimationFrame(updateActive);
  }

  // ── Dots ──
  function buildDots() {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    visible.forEach((c, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'reels-dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Ir al video ${i + 1}`);
      d.addEventListener('click', () => scrollToCard(i));
      dotsBox.appendChild(d);
    });
  }

  function scrollToCard(i) {
    const c = visible[i];
    if (!c) return;
    rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }

  // ── Detectar la tarjeta centrada ──
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
    dotsBox && dotsBox.querySelectorAll('.reels-dot').forEach((d, i) => d.classList.toggle('active', i === best));
    previewCard(visible[best]);
  }

  // Construye el elemento de reproducción según la fuente (YouTube o MP4 propio)
  function makeMedia(v, { sound }) {
    if (v.type === 'video') {
      const el = document.createElement('video');
      el.src = v.src;
      if (v.poster) el.poster = v.poster;
      el.playsInline = true;
      el.autoplay = true;
      if (sound) { el.controls = true; }
      else { el.muted = true; el.loop = true; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true'); }
      el.play && el.play().catch(() => {});
      return el;
    }
    const f = document.createElement('iframe');
    f.src = sound
      ? `https://www.youtube.com/embed/${v.id}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`
      : `https://www.youtube.com/embed/${v.id}?autoplay=1&mute=1&loop=1&playlist=${v.id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1`;
    f.title = sound ? v.title : 'Vista previa';
    if (sound) {
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
    } else {
      f.allow = 'autoplay; encrypted-media';
      f.tabIndex = -1;
      f.setAttribute('aria-hidden', 'true');
    }
    return f;
  }

  // Preview en movimiento (silenciado, en bucle) — solo la tarjeta centrada
  function previewCard(card) {
    if (reduce || !sectionSeen || !card) return;
    if (card.classList.contains('is-playing') || card.querySelector('iframe, video')) return;
    const v = videoData[card.dataset.idx];
    card.querySelector('.reel-media').insertBefore(makeMedia(v, { sound: false }), card.querySelector('.reel-tag'));
  }

  // Reproducción con sonido y controles
  function playFull(card, v) {
    const idx = visible.indexOf(card);
    if (idx > -1 && idx !== activeIdx) {
      if (activeIdx > -1 && visible[activeIdx]) revertCard(visible[activeIdx]); // no dejar 2 medios vivos
      scrollToCard(idx);
    }
    const old = card.querySelector('iframe, video');
    if (old) old.remove();
    card.classList.add('is-playing');
    card.querySelector('.reel-media').insertBefore(makeMedia(v, { sound: true }), card.querySelector('.reel-tag'));
  }

  // Vuelve al estado miniatura (libera el media → máx. 1 vivo)
  function revertCard(card) {
    card.classList.remove('is-playing');
    const m = card.querySelector('iframe, video');
    if (m) m.remove();
  }

  // ── Flechas ──
  document.getElementById('vid-prev')?.addEventListener('click', () => scrollToCard(Math.max(0, activeIdx - 1)));
  document.getElementById('vid-next')?.addEventListener('click', () => scrollToCard(Math.min(visible.length - 1, activeIdx + 1)));

  const onScroll = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(updateActive); };
  rail.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // ── Facade: no cargar iframes hasta que la sección se vea ──
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        sectionSeen = true;
        if (activeIdx > -1) previewCard(visible[activeIdx]);
        io.disconnect();
      }
    });
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(rail);

  // ── Init ──
  visible = cards.slice();
  buildDots();
  requestAnimationFrame(updateActive);
})();

/* ── VIDEO DESTACADO 16:9 (facade: clic → carga iframe con sonido) ── */
(function initFeatured() {
  const media = document.getElementById('featured-media');
  if (!media) return;
  const play = () => {
    if (media.querySelector('iframe')) return;
    const id = media.dataset.id;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    f.title = 'Cómo declarar renta en 2026';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    media.appendChild(f);
    media.classList.add('is-playing');
  };
  media.addEventListener('click', play);
  media.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
  });
})();

/* ── TESTIMONIOS: navegación por botones ── */

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const track   = document.getElementById('testimonials-track');

if (prevBtn && nextBtn && track) {
  const cards   = Array.from(track.querySelectorAll('.testimonial-card'));
  let   current = 0;

  function getVisibleCount() {
    if (window.innerWidth >= 1100) return 4;
    if (window.innerWidth >= 600)  return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function updateNav() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
    prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
  }

  function applyScroll() {
    const visibleCount = getVisibleCount();
    if (visibleCount >= cards.length) {
      track.style.transform = '';
      return;
    }
    const cardWidth = track.offsetWidth / visibleCount;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; applyScroll(); updateNav(); }
  });

  nextBtn.addEventListener('click', () => {
    if (current < maxIndex()) { current++; applyScroll(); updateNav(); }
  });

  window.addEventListener('resize', () => {
    current = 0;
    applyScroll();
    updateNav();
  });

  updateNav();
}

/* ── MOCKUP: animación escalonada de burbujas ── */

document.querySelectorAll('.mockup__bubble, .mockup__typing').forEach((el, i) => {
  el.style.animationDelay = `${0.8 + i * 0.4}s`;
});

// Scroll con offset al cargar si hay hash en la URL
window.addEventListener('load', () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  const offset = nav.offsetHeight + 16;
  setTimeout(() => {
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  }, 80); // pequeño delay para que el browser haga su scroll nativo primero
});