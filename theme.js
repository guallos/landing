/* theme.js — tema claro/oscuro de las landings JustiExpress.
 *
 * Va en el <head> (script bloqueante) para aplicar el tema ANTES del primer
 * paint (sin parpadeo). Default: CLARO. Inyecta un toggle flotante sol/luna
 * consistente con la app del chat. Persiste en localStorage('tcl_theme'),
 * la misma clave que la app. */
(function () {
  var d = document.documentElement;

  // No-FOUC: aplicar tema lo antes posible (default claro).
  try {
    var saved = localStorage.getItem("tcl_theme");
    d.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
  } catch (e) {
    d.setAttribute("data-theme", "light");
  }

  function build() {
    if (document.getElementById("theme-toggle")) return;

    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Cambiar entre modo claro y oscuro");
    btn.setAttribute("title", "Cambiar tema");
    btn.innerHTML =
      '<svg class="tt-sun" viewBox="0 0 24 24" aria-hidden="true">' +
      '<g stroke="#F4A220" stroke-width="2" stroke-linecap="round">' +
      '<line x1="12" y1="1.6" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.4"/>' +
      '<line x1="1.6" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.4" y2="12"/>' +
      '<line x1="4.4" y1="4.4" x2="6.1" y2="6.1"/><line x1="17.9" y1="17.9" x2="19.6" y2="19.6"/>' +
      '<line x1="19.6" y1="4.4" x2="17.9" y2="6.1"/><line x1="6.1" y1="17.9" x2="4.4" y2="19.6"/>' +
      "</g>" +
      '<circle cx="12" cy="12" r="4.7" fill="#FDB72A" stroke="#F4A220" stroke-width="1"/>' +
      "</svg>" +
      '<svg class="tt-moon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 12.9A8.6 8.6 0 1 1 11.1 3.4 6.7 6.7 0 0 0 21 12.9Z" fill="#C8D4FF"/>' +
      '<circle cx="5.8" cy="7" r="0.95" fill="#EAF0FF"/>' +
      '<circle cx="8.6" cy="3.9" r="0.6" fill="#EAF0FF"/>' +
      "</svg>";

    btn.addEventListener("click", function () {
      var cur = d.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      d.setAttribute("data-theme", next);
      try {
        localStorage.setItem("tcl_theme", next);
      } catch (e) {
        /* almacenamiento bloqueado */
      }
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
