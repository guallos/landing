/* ═══════════════════════════════════════════════════════
   JustiExpress Landing — main.js
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

/* ── VIDEOS: playlist ── */

const videoData = [
  { id: 'YBZ-CSoLCss', title: 'Tu Caso Legal', tag: 'General' },
  { id: 'Ls6kI-jiDcA', title: '¡Pilas! Si trabajas en casa, la ley cambió', tag: 'Laboral' },
  { id: '51Po7NEGzfA', title: '¿Vivieron juntos más de dos años?', tag: 'Familia' },
  { id: 'wiyEbWDBcFM', title: 'Prescripción de deudas en Colombia', tag: 'Deudas' },
  { id: 'X-LUOHPSYKo', title: 'Nueva ley de divorcio', tag: 'Familia' },
  { id: 'njoVgALV9pw', title: 'Eliminar reportes negativos', tag: 'Crédito' },
  { id: '4u7OzJJ8hlg', title: 'Embargo de salario', tag: 'Laboral' },
  { id: 'B-SE77MnWPo', title: 'Devoluciones por Internet', tag: 'Consumidor' },
  { id: 'w8wRLskbR7A', title: 'Protección laboral embarazo', tag: 'Laboral' },
  { id: 'NGOg_5oLbuA', title: 'Garantía carro usado', tag: 'Consumidor' },
];

let currentVid = 0;

function buildPlaylist() {
  const pl = document.getElementById('playlist');
  if (!pl) return;
  pl.innerHTML = '';
  videoData.forEach((v, i) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `
      <span class="item-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="item-thumb">
        <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy" />
        <div class="item-play-icon">
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M4 2l8 5-8 5V2z" fill="#00E5D4"/></svg>
        </div>
      </div>
      <div class="item-info">
        <div class="item-title">${v.title}</div>
        <div class="item-tag">${v.tag}</div>
      </div>
      <div class="active-bar"></div>
    `;
    item.addEventListener('click', () => selectVideo(i));
    pl.appendChild(item);
  });
}

function selectVideo(i) {
  currentVid = i;
  const v = videoData[i];
  const frame = document.getElementById('main-video');
  const cur   = document.getElementById('vid-cur');
  const count = document.getElementById('count-label');
  if (frame) frame.src = `https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`;
  if (cur)   cur.textContent = String(i + 1).padStart(2, '0');
  if (count) count.textContent = `${i + 1} / ${videoData.length}`;
  document.querySelectorAll('.playlist-item').forEach((el, idx) => {
    el.classList.toggle('active', idx === i);
  });
  const items = document.querySelectorAll('.playlist-item');
  if (items[i]) items[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('vid-prev')?.addEventListener('click', () => {
  selectVideo((currentVid - 1 + videoData.length) % videoData.length);
});
document.getElementById('vid-next')?.addEventListener('click', () => {
  selectVideo((currentVid + 1) % videoData.length);
});

buildPlaylist();

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