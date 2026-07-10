# Reconstruye el bloque ItemList (VideoObject) de index.html en orden de página:
# destacado (YouTube) -> 16 TikTok (self-hosted) -> 10 shorts YouTube.
import json, re, os

BASE = "https://www.justiexpress.com"
ORG = {"@id": f"{BASE}/#organization"}

def yt(id, name, desc, date, dur):
    return {"@type": "VideoObject", "name": name, "description": desc,
            "thumbnailUrl": f"https://i.ytimg.com/vi/{id}/hqdefault.jpg",
            "uploadDate": date, "duration": dur,
            "embedUrl": f"https://www.youtube.com/embed/{id}", "publisher": ORG}

# 1) Destacado
featured = {"@type": "VideoObject",
    "name": "Declarar Renta Siendo Asalariado, Contratista, Rentista o Pensionado",
    "description": "Guía paso a paso para presentar la declaración de renta en Colombia según tu tipo de ingreso.",
    "thumbnailUrl": "https://i.ytimg.com/vi/WqyEAY59JVo/maxresdefault.jpg",
    "uploadDate": "2026-07-04T08:00:00-05:00", "duration": "PT9M41S",
    "embedUrl": "https://www.youtube.com/embed/WqyEAY59JVo", "publisher": ORG}

# 2) TikToks (ya vienen como items en _snippet_schema.json, en orden de display)
tiktoks = [x["item"] for x in json.load(open(os.path.join(os.path.dirname(__file__), "_snippet_schema.json"), encoding="utf-8"))]

# 3) Shorts YouTube educativos
shorts = [
    yt("YBZ-CSoLCss", "Tu Caso Legal", "Asesoría jurídica con inteligencia artificial para colombianos.", "2025-12-03T08:00:00-05:00", "PT35S"),
    yt("Ls6kI-jiDcA", "Si trabajas en casa, la ley cambió", "Cambios legales para el trabajo en casa en Colombia.", "2025-11-03T08:00:00-05:00", "PT28S"),
    yt("51Po7NEGzfA", "¿Vivieron juntos más de dos años?", "Unión marital de hecho: derechos tras dos años de convivencia.", "2025-11-04T08:00:00-05:00", "PT28S"),
    yt("wiyEbWDBcFM", "Prescripción de deudas en Colombia", "Cuándo prescriben las deudas en Colombia.", "2025-11-11T08:00:00-05:00", "PT28S"),
    yt("X-LUOHPSYKo", "Nueva ley de divorcio", "Qué cambia con la nueva ley de divorcio en Colombia.", "2025-11-05T08:00:00-05:00", "PT28S"),
    yt("njoVgALV9pw", "Eliminar reportes negativos", "Cómo eliminar reportes negativos en las centrales de riesgo.", "2025-11-08T08:00:00-05:00", "PT28S"),
    yt("4u7OzJJ8hlg", "Embargo de salario", "Límites legales al embargo de salario en Colombia.", "2025-11-13T08:00:00-05:00", "PT28S"),
    yt("B-SE77MnWPo", "Devoluciones por Internet", "Derecho de retracto en compras por Internet.", "2025-11-10T08:00:00-05:00", "PT28S"),
    yt("w8wRLskbR7A", "Protección laboral en el embarazo", "Estabilidad laboral reforzada durante el embarazo.", "2025-11-07T08:00:00-05:00", "PT28S"),
    yt("NGOg_5oLbuA", "Garantía de carro usado", "Garantía legal en la compra de carro usado.", "2025-11-06T08:00:00-05:00", "PT28S"),
]

items = [featured] + tiktoks + shorts
element = [{"@type": "ListItem", "position": i + 1, "item": it} for i, it in enumerate(items)]
data = {"@context": "https://schema.org", "@type": "ItemList",
        "name": "Dato Legal Diario · Justiexpress", "itemListElement": element}

block = ('  <!-- Schema JSON-LD: Videos (VideoObject) para rich results de video en Google -->\n'
         '  <script type="application/ld+json">\n  '
         + json.dumps(data, ensure_ascii=False, indent=2).replace("\n", "\n  ")
         + '\n  </script>')

idx = os.path.join(os.path.dirname(__file__), "..", "index.html")
html = open(idx, encoding="utf-8").read()
new = re.sub(r'  <!-- Schema JSON-LD: Videos \(VideoObject\)[\s\S]*?</script>', block, html, count=1)
assert new != html, "No se encontró el bloque a reemplazar"
open(idx, "w", encoding="utf-8").write(new)
print("ItemList reconstruido con", len(items), "videos (posiciones 1..%d)" % len(items))
