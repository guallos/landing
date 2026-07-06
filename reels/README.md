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
