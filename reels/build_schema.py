# -*- coding: utf-8 -*-
"""
OBSOLETO (27 jul 2026). No usar.

Este script reconstruía un ItemList con 27 VideoObject dentro de index.html.
Search Console lo rechazó entero con "El vídeo no está en una página de
visualización": el carrusel de reels lo construye main.js y el <video> real solo
aparece tras interactuar, así que Googlebot renderizaba la home, no encontraba
reproductor y descartaba los 27 vídeos. El bloque se eliminó de index.html, así
que este script ya no tiene dónde escribir.

Regla vigente: un VideoObject solo se declara en una página que sirva un
reproductor real en el HTML entregado. Si en el futuro se quieren resultados
enriquecidos de vídeo, hay que crear una página por reel con su <video>
estático y su VideoObject; no volver a marcar la home.
"""
import sys

print(__doc__.strip())
sys.exit(1)
