/* theme.js — tema claro/oscuro de las landings Justiexpress.
 *
 * Va en el <head> (script bloqueante, <1 KB) para aplicar el tema ANTES
 * del primer paint (sin parpadeo). Default: CLARO, igual que la app.
 * Persiste en localStorage('tcl_theme'), la misma clave que la app del chat.
 * Marca <html class="js"> para que el CSS solo anime lo que JS acompaña.
 * Los selectores "Claro / Oscuro" viven en el footer y en el menú móvil
 * (botones [data-theme-set]); aquí solo se conectan. */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  var theme = "light";
  try { if (localStorage.getItem("tcl_theme") === "dark") theme = "dark"; } catch (e) {}
  d.setAttribute("data-theme", theme);

  function sync() {
    var cur = d.getAttribute("data-theme");
    document.querySelectorAll("[data-theme-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === cur));
    });
  }
  function set(next, from) {
    if (d.getAttribute("data-theme") === next) return;
    var swap = function () { d.setAttribute("data-theme", next); sync(); };
    // El tema nuevo se revela en un círculo que nace del botón pulsado
    // (View Transitions); sin soporte o con movimiento reducido, cambio directo.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (from) {
        var r = from.getBoundingClientRect();
        d.style.setProperty("--vx", Math.round(r.left + r.width / 2) + "px");
        d.style.setProperty("--vy", Math.round(r.top + r.height / 2) + "px");
      }
      d.classList.add("vt-theme");
      var t = document.startViewTransition(swap);
      t.finished.then(function () { d.classList.remove("vt-theme"); }, function () { d.classList.remove("vt-theme"); });
    } else swap();
    try { localStorage.setItem("tcl_theme", next); } catch (e) { /* almacenamiento bloqueado */ }
  }
  function bind() {
    sync();
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-theme-set]");
      if (b) set(b.getAttribute("data-theme-set"), b);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
