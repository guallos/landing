# reels/ — Videos verticales auto-alojados

Reels propios (TikTok / Instagram / YouTube Shorts) servidos como MP4 nativo en el
carrusel de la home. Dan el mejor preview silenciado, sin JS de terceros y con
mejor rendimiento/SEO que un embed.

## Convención de archivos
Por cada reel, dos archivos con el mismo nombre base:
- `mi-reel.mp4`  → video vertical 9:16, H.264, ~720p, con `+faststart`
- `mi-reel.jpg`  → póster (primer fotograma), mismo aspecto

## Cómo añadir uno
1. Descarga tu video (ver pasos abajo) a esta carpeta como `original.mp4`.
2. Optimiza + genera el póster con ffmpeg:
   ```bash
   ffmpeg -i original.mp4 -vf "scale=720:-2" -c:v libx264 -crf 26 -preset slow \
     -c:a aac -b:a 96k -movflags +faststart mi-reel.mp4
   ffmpeg -ss 00:00:01 -i mi-reel.mp4 -frames:v 1 -q:v 3 mi-reel.jpg
   ```
3. Añade la tarjeta en `main.js` → array `videoData`:
   ```js
   { type: 'video', src: 'reels/mi-reel.mp4', poster: 'reels/mi-reel.jpg',
     title: 'Título del reel', tag: 'Laboral',
     cta: { label: 'Protege tu derecho', href: 'https://chat.justiexpress.com/?categoria=tutela' } },
   ```
4. Mantén los MP4 por debajo de ~2–4 MB para no afectar el LCP.

## Regla de indexación de vídeo (Search Console, 27 jul 2026)

**Nunca declares un `VideoObject` en una página que no sirva un reproductor real
en el HTML entregado.**

`index.html` declaraba 27 `VideoObject` mientras el carrusel lo construía `main.js`
y el `<video>` solo nacía al interactuar. Googlebot renderizaba, no encontraba
reproductor y los rechazó todos con *"El vídeo no está en una página de
visualización"*. El bloque se eliminó: hoy **ninguna página del sitio marca vídeos**,
y el carrusel sigue funcionando igual para el usuario.

Si algún día se quieren resultados enriquecidos de vídeo, la única forma correcta
es darle a cada reel su propia página con un `<video controls preload="metadata"
poster>` estático en el HTML y un solo `VideoObject` ahí. No volver a marcar la home.

`build_schema.py` quedó obsoleto por esto (imprime el motivo y sale con error).
