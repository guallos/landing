/* theme.js — tema claro/oscuro de las landings Justiexpress.
 *
 * Va en el <head> (script bloqueante, <1 KB) para aplicar el tema ANTES
 * del primer paint (sin parpadeo). Default: CLARO, igual que la app.
 * Persiste en localStorage('tcl_theme'), la misma clave que la app del chat.
 * Marca <html class="js"> para que el CSS solo anime lo que JS acompaña.
 * El botón vive en el nav (#theme-toggle); aquí solo se conecta. */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  var theme = "light";
  try { if (localStorage.getItem("tcl_theme") === "dark") theme = "dark"; } catch (e) {}
  d.setAttribute("data-theme", theme);

  function sync(btn) {
    btn.setAttribute("aria-pressed", String(d.getAttribute("data-theme") === "dark"));
  }
  function bind() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    sync(btn);
    btn.addEventListener("click", function () {
      var next = d.getAttribute("data-theme") === "dark" ? "light" : "dark";
      d.setAttribute("data-theme", next);
      sync(btn);
      try { localStorage.setItem("tcl_theme", next); } catch (e) { /* almacenamiento bloqueado */ }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
