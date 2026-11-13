// Notifica a IndexNow (Bing, Yandex, Seznam, Naver, Yep…) las URLs de un sitemap.
// Uso:  node tools/indexnow.mjs [sitemap-url]
//   sin argumento → https://www.justiexpress.com/sitemap.xml
//   chat          → https://chat.justiexpress.com/sitemap.xml
// El archivo <KEY>.txt (con la clave dentro) debe estar publicado en la raíz del host.
// Correrlo DESPUÉS de desplegar: IndexNow comprueba que la clave exista en el sitio.
const KEY = "6ddf205d9716aefd7faf3a0071785ae2";
const arg = process.argv[2];
const sitemap =
  arg === "chat" ? "https://chat.justiexpress.com/sitemap.xml"
  : arg || "https://www.justiexpress.com/sitemap.xml";

const host = new URL(sitemap).host;
const xml = await (await fetch(sitemap)).text();
const urlList = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error(`Sin <loc> en ${sitemap}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/${KEY}.txt`, urlList }),
});
// 200 = recibido · 202 = recibido, validando la clave · 403 = clave no hallada · 422 = URLs ajenas al host
console.log(`${host}: ${urlList.length} URLs → HTTP ${res.status}`);
