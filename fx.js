/* ═══════════════════════════════════════════════════════════════
   fx.js — efectos visuales de la landing (sep 2026)
   ───────────────────────────────────────────────────────────────
   Lo carga main.js DESPUÉS del evento load, en tiempo libre: nada de
   esto compite con el primer render (LCP) ni con la interactividad.
   Todo es mejora progresiva: sin este archivo la página está completa.

   1. Escena 3D del hero: la pila de documentos se inclina con el puntero
      (solo mouse/trackpad) y el brillo del papel sigue la luz.
   2. Shader WebGL de "tinta que fluye" detrás del hero (sin librerías).
      Se pausa fuera de pantalla y con la pestaña oculta; se omite con
      movimiento reducido o ahorro de datos.
   3. Luz que sigue al cursor sobre tarjetas y filas del catálogo.
   4. Botones principales "magnéticos".
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  // La textura de papel (CSS) se activa aquí, ya cargada la página.
  document.documentElement.classList.add('fx-ready');

  /* ── 1. Escena 3D ───────────────────────────────────────────── */
  (function tilt() {
    if (reduce || !finePointer) return;
    var hero = document.querySelector('.hero');
    var stack = document.querySelector('.doc-stage .stack');
    var sheet = stack && stack.querySelector('.sheet:not(.sheet--back)');
    if (!hero || !stack) return;
    var base = getComputedStyle(stack);
    var rx0 = parseFloat(base.getPropertyValue('--rx')) || 7;
    var ry0 = parseFloat(base.getPropertyValue('--ry')) || -13;
    var cur = { x: rx0, y: ry0, mx: 78, my: 12 }, tgt = { x: rx0, y: ry0, mx: 78, my: 12 };
    var raf = 0;

    function loop() {
      cur.x += (tgt.x - cur.x) * 0.08;
      cur.y += (tgt.y - cur.y) * 0.08;
      cur.mx += (tgt.mx - cur.mx) * 0.1;
      cur.my += (tgt.my - cur.my) * 0.1;
      stack.style.transform = 'rotateX(' + cur.x.toFixed(2) + 'deg) rotateY(' + cur.y.toFixed(2) + 'deg) rotateZ(.4deg)';
      if (sheet) { sheet.style.setProperty('--mx', cur.mx.toFixed(1) + '%'); sheet.style.setProperty('--my', cur.my.toFixed(1) + '%'); }
      // Se detiene al llegar: el siguiente pointermove la vuelve a arrancar.
      var still = Math.abs(tgt.x - cur.x) < 0.02 && Math.abs(tgt.y - cur.y) < 0.02 && Math.abs(tgt.mx - cur.mx) < 0.1 && Math.abs(tgt.my - cur.my) < 0.1;
      raf = still ? 0 : requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
      var ny = (e.clientY - r.top) / r.height - 0.5;
      tgt.y = ry0 + nx * 22;
      tgt.x = rx0 - ny * 14;
      tgt.mx = 50 + nx * 90;
      tgt.my = 30 + ny * 80;
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      tgt.x = rx0; tgt.y = ry0; tgt.mx = 78; tgt.my = 12; kick();
    });
  })();

  /* ── 2. Shader de tinta ─────────────────────────────────────── */
  (function shader() {
    if (reduce || saveData) return;
    var hero = document.querySelector('.hero');
    if (!hero || !hero.querySelector('.doc-stage')) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-fx';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    // Sin aceleración gráfica real (renderizador por software) o con poca
    // memoria, el shader costaría CPU: se queda el fondo estático del CSS.
    var dbg = gl.getExtension('WEBGL_debug_renderer_info');
    var renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|softpipe|basic render|software/i.test(renderer) || (navigator.deviceMemory && navigator.deviceMemory < 4)) return;
    hero.prepend(canvas);

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    // Ruido de valor + fbm con deformación de dominio: manchas de tinta que
    // se mezclan lentamente en los colores de la marca.
    var FS = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform float dark;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;',
      ' float s=t*.035;',
      ' vec2 q=vec2(fbm(p+s),fbm(p+vec2(5.2,1.3)-s));',
      ' vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+s*1.3),fbm(p+3.*q+vec2(8.3,2.8)-s));',
      ' float f=fbm(p+2.5*w);',
      ' vec3 teal=vec3(.04,.43,.39),cyan=vec3(0.,.9,.83),lacre=vec3(.65,.23,.13);',
      ' vec3 c=mix(teal,cyan,clamp(f*f*2.,0.,1.));',
      ' c=mix(c,lacre,clamp(length(w)*.55-.35,0.,1.)*.55);',
      ' float a=smoothstep(.32,.92,f)*mix(.42,.62,dark);',
      ' gl_FragColor=vec4(c,a);',
      '}'
    ].join('\n');

    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); return; }
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uD = gl.getUniformLocation(prog, 'dark');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Resolución reducida a propósito: el fondo es difuso y así cuesta poco.
    var scale = innerWidth < 700 ? 0.35 : 0.5;
    function size() {
      var w = Math.max(1, Math.round(hero.clientWidth * scale)), h = Math.max(1, Math.round(hero.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    size();
    addEventListener('resize', size, { passive: true });

    var visible = true, running = false, t0 = performance.now(), last = 0;
    var interval = innerWidth < 700 ? 1000 / 24 : 1000 / 30;
    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      if (now - last >= interval) {
        last = now;
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.uniform1f(uT, (now - t0) / 1000);
        gl.uniform1f(uD, document.documentElement.dataset.theme === 'dark' ? 1 : 0);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }).observe(hero);
    document.addEventListener('visibilitychange', start);
    start();
    requestAnimationFrame(function () { canvas.classList.add('is-on'); });
  })();

  /* ── 3. Luz que sigue al cursor ─────────────────────────────── */
  (function spotlight() {
    if (!finePointer) return;
    var sel = '.case, .triage a, .index a, .related a, .quote, .truth__col, .includes li, .catalog__group';
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add('spot'); });
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.spot');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  })();

  /* ── 4. Botones magnéticos ──────────────────────────────────── */
  (function magnetic() {
    if (reduce || !finePointer) return;
    document.querySelectorAll('.btn--primary.btn--lg').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.translate = (x * 10).toFixed(1) + 'px ' + (y * 8).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  })();
})();
