# Genera los snippets de videoData (JS) y VideoObject (JSON-LD) para los TikTok.
import json, os

BASE = "https://www.justiexpress.com"
CHAT = "https://chat.justiexpress.com/"
def chat(cat=None): return CHAT if not cat else f"{CHAT}?categoria={cat}"

# Orden de visualización (TikTok primero). id -> (title, tag, cta_label, cta_href)
ITEMS = [
    ("7658354115797437716", "Un testamento evita peleas familiares",        "Familia",     "Consulta tu caso",        chat()),
    ("7658001775575747861", "¿Vas a hacer escrituras? Calcula el costo",    "Notarial",    "Gastos notariales",       chat("calculadora-notarial")),
    ("7657001169935404308", "+100 documentos y calculadoras en tu bolsillo","General",     "Descúbrelo",              chat()),
    ("7656789935915109653", "¿Ganaste una tutela y no cumplen? Desacato",   "Tutela",      "Haz tu desacato",         chat("tutela")),
    ("7656577260300143892", "Contratos, cartas y tutelas: todo en uno",     "General",     "Explóralos",              chat()),
    ("7655713678376979733", "Crea documentos legales en 3 pasos",           "General",     "Empieza ahora",           chat()),
    ("7655295586698087701", "Mete una tutela sin abogado",                  "Tutela",      "Haz tu tutela",           chat("tutela")),
    ("7655014000433876244", "Calcula tu liquidación tú mismo",              "Laboral",     "Saca tus cuentas",        chat("calculadora-laboral")),
    ("7654603026652581140", "Deja de googlear tus dudas legales",           "General",     "Pregúntale a la IA",      chat()),
    ("7653854050995408148", "Tu abogado, ahora en el bolsillo",             "General",     "Iniciar consulta",        chat()),
    ("7653110144452037908", "¿Te deben liquidación o cesantías?",           "Laboral",     "Saca tus cuentas",        chat("calculadora-laboral")),
    ("7652751659998727445", "Documentos con IA, validados por abogados",    "General",     "Crea el tuyo",            chat()),
    ("7652427139114863892", "Herramientas legales que todos deberían tener","General",     "Explóralas",              chat()),
    ("7651990544960343317", "¿Tu EPS te incumple? Mete una tutela",         "Salud",       "Protege tu derecho",      chat("tutela")),
    ("7651666684855487765", "Resolver tu caso legal, así de fácil",         "General",     "Iniciar consulta",        chat()),
    ("7658735599439875348", "Declarar renta siendo asalariado",             "Tributaria",  "Calcula tu renta",        chat("calculadora-tributaria")),
]

def iso_dur(s):
    s = int(s or 0); m, sec = divmod(s, 60)
    return "PT" + (f"{m}M" if m else "") + f"{sec}S"

def upload_date(idv):
    try:
        d = json.load(open(f"meta/{idv}.json", encoding="utf-8"))
        ud = d.get("upload_date")
        # ISO 8601 con hora y zona horaria (Colombia UTC-5): requisito de
        # Search Console para VideoObject.uploadDate.
        if ud and len(ud) == 8: return f"{ud[:4]}-{ud[4:6]}-{ud[6:]}T08:00:00-05:00"
    except Exception: pass
    return None

js, sch = [], []
for idv, title, tag, label, href in ITEMS:
    js.append(
        f"  {{ type: 'video', src: 'reels/tt-{idv}.mp4', poster: 'reels/tt-{idv}.jpg', "
        f"title: '{title.replace(chr(39), chr(92)+chr(39))}', tag: '{tag}',\n"
        f"    cta: {{ label: '{label}', href: '{href}' }} }},"
    )
    d = json.load(open(f"meta/{idv}.json", encoding="utf-8"))
    sch.append({
        "@type": "ListItem", "position": 0, "item": {
            "@type": "VideoObject",
            "name": title,
            "description": title,
            "thumbnailUrl": f"{BASE}/reels/tt-{idv}.jpg",
            "uploadDate": upload_date(idv) or "2026-01-01T08:00:00-05:00",
            "duration": iso_dur(d.get("duration")),
            "contentUrl": f"{BASE}/reels/tt-{idv}.mp4",
            "publisher": {"@id": f"{BASE}/#organization"},
        }
    })

open("_snippet_js.txt", "w", encoding="utf-8").write("\n".join(js))
open("_snippet_schema.json", "w", encoding="utf-8").write(json.dumps(sch, ensure_ascii=False, indent=2))
print("snippets generados:", len(js), "videoData +", len(sch), "VideoObject")
