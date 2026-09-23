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
  function set(next) {
    var swap = function () { d.setAttribute("data-theme", next); sync(); };
    // Transición suave del cambio de tema donde el navegador la soporta.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(swap);
    else swap();
    try { localStorage.setItem("tcl_theme", next); } catch (e) { /* almacenamiento bloqueado */ }
  }
  function bind() {
    sync();
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-theme-set]");
      if (b) set(b.getAttribute("data-theme-set"));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
