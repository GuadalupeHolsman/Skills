"""CH 02 · Tequila Don Julio — MATTE treatment on the site's Don Julio world.
Rules: one image or one flat field; small tracked type in the corners; the title as an object (spaced letters / italic);
few words; mono sheets; flash photography; signed "a loomlock project"."""
import sys
import build
from build import page

CREAM, BLACK, TEAL, TEAL2 = "#E9E1D8", "#0B0B0B", "#0B5A6A", "#5FB1C1"
LEGAL = "Disfruta con moderación. Prohibido el expendio de bebidas alcohólicas a menores de edad."

CSS = """
@font-face{font-family:"Outfit";font-weight:500;src:url("assets/fonts/outfit-500.woff2") format("woff2")}
@font-face{font-family:"Outfit";font-weight:600;src:url("assets/fonts/outfit-600.woff2") format("woff2")}
@font-face{font-family:"Outfit";font-weight:700;src:url("assets/fonts/outfit-700.woff2") format("woff2")}
@font-face{font-family:"MontI";font-style:italic;font-weight:500;src:url("assets/fonts/montserrat-italic-500.woff2") format("woff2")}
@font-face{font-family:"League Gothic";src:url("assets/fonts/leaguegothic-400.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/spacemono-400.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/spacemono-700.woff2") format("woff2")}
@font-face{font-family:"VT323";src:url("assets/fonts/vt323-400.woff2") format("woff2")}
.art{font-family:"Outfit",sans-serif}
.ab{position:absolute}
.t{font-weight:600;font-size:21px;letter-spacing:.07em;text-transform:uppercase;line-height:1.4}
.tb{font-weight:700}
.it{font-family:"MontI",sans-serif;font-style:italic;font-weight:500;letter-spacing:.01em}
.mono{font-family:"Space Mono",monospace;text-transform:uppercase;line-height:1.1}
.vt{font-family:"VT323",monospace;letter-spacing:.06em}
.sp{display:flex;justify-content:space-between}
.ctr{left:0;right:0;text-align:center}
.ph{position:absolute;background-size:cover;background-position:center}
.rule{position:absolute;height:0;border-top:1.5px solid currentColor;opacity:.4}
.vig{display:none}
"""

def P(w, h, body, bg, color, grain=".18", blend="multiply"):
    return w, h, page(w, h, body, CSS + f".art{{background:{bg};color:{color}}} .grain{{opacity:{grain};mix-blend-mode:{blend}}}")

LLBLUE = "#3F49CC"
GEO = "Bogotá · 4°39′N 74°03′W · GMT−5"

def ident(size=18):
    return (f'<span style="display:inline-flex;align-items:center;gap:10px;background:{LLBLUE};color:#F9F9FF;border-radius:8px;padding:4px 12px;'
            f'font-weight:700;font-size:{size}px;letter-spacing:.08em;text-transform:lowercase">loomlock experiences'
            f'<span class="vt" style="font-size:{size*1.45:.0f}px;letter-spacing:.06em;border-left:1.5px solid rgba(249,249,255,.5);padding-left:10px">CH 02</span></span>')

def lock(c="black", h=18, dh=42):
    ll = "loomlock_black" if c == "black" else "loomlock_white"
    return (f'<div style="display:flex;align-items:center;gap:10px"><img src="assets/img/{ll}.png" style="height:{h}px" alt="loomlock">'
            f'<span style="font-size:16px">×</span><img src="assets/img/dj_{c}.png" style="height:{dh}px" alt="Tequila Don Julio"></div>')

def corners(W, H, color, top_l, top_r, bot_l, bot_r, legal=True):
    st = H == 1920
    t, b = (120, H - 140) if st else (64, H - 72)
    out = f'''<div class="ab sp t" style="left:60px;right:60px;top:{t}px;color:{color}"><div>{top_l}</div><div style="text-align:right">{top_r}</div></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{b-110}px;color:{color};align-items:flex-end"><div>{bot_l}</div><div style="text-align:right">{bot_r}</div></div>'''
    if legal:
        out += f'<div class="ab ctr" style="top:{b+18}px;color:{color};opacity:.7;font-size:14px">{LEGAL}</div>'
    return out

# 1 · invitación — "A Love Party": one macro image, small corners, italic title
def invita(W, H):
    st = H == 1920
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/dj/glass.jpg);background-position:center 62%;filter:saturate(1.05) contrast(1.04)"></div>
    {corners(W, H, BLACK,
             '<span class="tb">Loomlock</span> y <span class="tb">Tequila Don Julio</span><br>te invitan',
             'Jueves 29 de octubre<br>Bogotá',
             'Resto Bar Bikinis<br>Carrera 6 # 58–48<br>70 cupos · solo +18',
             'A loomlock project<br>' + GEO)}
    <div class="ab" style="left:60px;top:{(120 if st else 64)+110}px">{ident(16)}</div>
    <div class="ab ctr it" style="top:{H*0.40 if st else H*0.36}px;color:{BLACK};font-size:{60 if st else 54}px;line-height:1.1">salud por la gente<br>que tienes al frente</div>
    <div class="ab ctr t" style="top:{(H*0.40 if st else H*0.36)+(150 if st else 135)}px;color:{BLACK};font-size:16px;opacity:.75">here’s to the people in front of you</div>'''
    return P(W, H, b, CREAM, BLACK, ".12")

# 2 · CH 02 — "Veladas": flat teal field, spaced title, program grid
def veladas(W, H):
    st = H == 1920
    cy = H * (0.30 if st else 0.27)
    rows = [("Llegada", "Tap en el tótem", "Eliges qué apps se pausan"),
            ("La noche", "Tequila Don Julio Blanco", "El celular en tu bolsillo"),
            ("Después", "Tus fotos", "Días después, en la app")]
    grid = "".join(f'<div class="sp" style="padding:18px 0;border-top:1.5px solid rgba(233,225,216,.4)"><span style="width:200px">{a}</span><span style="flex:1;text-align:center">{b2}</span><span style="width:330px;text-align:right">{c}</span></div>' for a, b2, c in rows)
    b = f'''
    <div class="ab ctr" style="top:{120 if st else 64}px">{ident(18)}</div>
    <div class="ab ctr" style="top:{cy:.0f}px">
      <div style="font-weight:500;font-size:{150 if st else 128}px;letter-spacing:.38em;margin-left:.38em;line-height:1">CH 02</div>
      <div class="t" style="margin-top:34px;font-size:20px;letter-spacing:.3em">una fiesta con las apps en pausa</div>
    </div>
    <div class="ab sp t" style="left:110px;right:110px;top:{cy+(330 if st else 290):.0f}px;font-size:18px"><span>Jueves 29.10</span><span>Bogotá</span><span>GMT−5</span></div>
    <div class="ab ctr t" style="top:{cy+(400 if st else 350):.0f}px;font-size:15px;opacity:.75;letter-spacing:.2em">una regla, todas las ciudades · one rule, every city</div>
    <div class="ab t" style="left:110px;right:110px;top:{H*(0.58 if st else 0.6):.0f}px;font-size:17px">{grid}</div>
    <div class="ab sp t" style="left:110px;right:110px;top:{H-(220 if st else 130)}px;font-size:14px;align-items:center;opacity:.9"><span>Solo +18</span>{lock("white", 16, 38)}<span>A loomlock project</span></div>
    <div class="ab ctr" style="top:{H-(150 if st else 64)}px;font-size:13px;opacity:.7">{LEGAL}</div>'''
    return P(W, H, b, TEAL, CREAM, ".22", "overlay")

# 3 · hoja de reglas — mono sheet on black
def hoja(W, H):
    st = H == 1920
    fs = 24 if st else 21
    blocks = [("La<br>llave", TEAL2, ["Una por invitado", "Tap en el tótem de la entrada", "Tú eliges qué apps se pausan"]),
              ("El<br>celular", "#E9E1D8", ["Se queda contigo", "Cámara, llamadas y mapas funcionan", "Sin feed hasta que te vas"]),
              ("La<br>noche", "#C9A46B", ["Resto Bar Bikinis, Bogotá", "Tequila Don Julio Blanco", "Tus fotos llegan días después"])]
    y = 330 if st else 230
    gap = 300 if st else 240
    rows = ""
    for name, c, items in blocks:
        li = "".join(f"<div>· {t}</div>" for t in items)
        rows += (f'<div class="ab" style="left:60px;right:60px;top:{y}px;border-top:1.5px solid rgba(233,225,216,.45);padding-top:18px;display:flex">'
                 f'<div class="mono" style="width:290px;color:{c};font-size:{fs*1.6:.0f}px;font-weight:700">{name}</div>'
                 f'<div class="mono" style="flex:1;font-size:{fs}px;line-height:1.5">{li}</div></div>')
        y += gap
    b = f'''
    <div class="ab sp mono" style="left:60px;right:60px;top:{110 if st else 56}px;font-size:{fs*1.3:.0f}px"><span>Loomlock<br>× Tequila Don Julio</span><span style="text-align:right">Cómo funciona<br>How it works</span></div>
    {rows}
    <div class="ab" style="left:60px;right:60px;top:{y}px;border-top:1.5px solid rgba(233,225,216,.45)"></div>
    <div class="ab sp mono" style="left:60px;right:60px;top:{y+34}px;font-size:{fs}px">{ident(fs*0.75)}<span>29.10 · Bogotá · GMT−5</span></div>
    <div class="ab mono" style="left:60px;right:60px;top:{y+110}px;font-size:{fs*0.8:.0f}px;opacity:.7">La misma regla en cada ciudad de Loomlock Experiences.</div>
    <div class="ab ctr" style="top:{H-(150 if st else 64)}px;font-size:13px;opacity:.6">{LEGAL}</div>'''
    return P(W, H, b, BLACK, CREAM, ".12", "screen")

# 4 · S A L U D — letters spread over a blurred bottle, data rows (CMYK Brooklyn)
def salud(W, H):
    st = H == 1920
    rowsY = [0.09, 0.22, 0.35, 0.48, 0.61, 0.74]
    words = [("Loomlock", "×", "Tequila Don Julio"), ("Jueves", "29", "Octubre"), ("Resto Bar", "", "Bikinis"),
             ("Bogotá", "GMT−5", "4°39′N 74°03′W"), ("Apps", "en", "pausa"), ("Solo", "", "+18")]
    lines = ""
    for (a, m, c), yy in zip(words, rowsY):
        top = H * yy
        lines += f'<div class="rule" style="left:60px;right:60px;top:{top-14:.0f}px;color:{CREAM}"></div>'
        lines += f'<div class="ab sp t" style="left:60px;right:60px;top:{top:.0f}px;font-size:17px"><span>{a}</span><span>{m}</span><span>{c}</span></div>'
    big = [("S", 0.12, 0.135), ("A", 0.64, 0.265), ("L", 0.30, 0.395), ("U", 0.76, 0.525), ("D", 0.18, 0.655), (".", 0.55, 0.655)]
    letters = "".join(f'<div class="ab" style="left:{W*x:.0f}px;top:{H*y-6:.0f}px;font-family:\'League Gothic\';font-size:{170 if st else 140}px;line-height:1;color:{CREAM}">{c}</div>' for c, x, y in big)
    b = f'''
    <div class="ph" style="inset:-60px;background-image:url(assets/dj/bottle.jpg);filter:blur(26px) saturate(1.2) brightness(.8)"></div>
    <div class="ab" style="inset:0;background:rgba(11,90,106,.35)"></div>
    {lines}{letters}
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;font-size:16px;align-items:center">{lock("white", 16, 38)}{ident(15)}</div>
    <div class="ab ctr" style="top:{H-(150 if st else 64)}px;font-size:13px;opacity:.75">{LEGAL}</div>'''
    return P(W, H, b, TEAL, CREAM, ".18", "overlay")

# 5 · flash recap — event photo, subtitle line (Mercury / MATTE IG)
def flash(W, H):
    st = H == 1920
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/dj/brindis.jpg);background-position:center 30%;filter:contrast(1.12) saturate(1.15) brightness(1.06)"></div>
    <div class="ab" style="inset:0;background:radial-gradient(60% 45% at 50% 40%,rgba(255,240,215,.18),rgba(0,0,0,0) 70%),linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,0) 20%,rgba(0,0,0,0) 72%,rgba(0,0,0,.5))"></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 60}px;color:#fff;font-size:18px">{ident(16)}<span>29.10 · Bogotá</span></div>
    <div class="ab ctr" style="top:{H-(470 if st else 330)}px;color:#fff;font-weight:600;font-size:{42 if st else 38}px;text-shadow:0 2px 12px rgba(0,0,0,.6)">nadie aquí está revisando el celular.</div>
    <div class="ab ctr" style="top:{H-(410 if st else 275)}px;color:#fff;opacity:.8;font-weight:500;font-size:22px;text-shadow:0 2px 10px rgba(0,0,0,.6)">nobody here is checking their phone.</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:#fff;font-size:15px;align-items:center">{lock("white", 16, 38)}<span>Tus fotos llegaron · en la app</span></div>
    <div class="ab ctr" style="top:{H-(150 if st else 64)}px;color:#fff;font-size:13px;opacity:.75">{LEGAL}</div>'''
    return P(W, H, b, BLACK, "#fff", ".16", "overlay")

# 6 · fuera del aire — almost nothing
def aire(W, H):
    st = H == 1920
    b = f'''
    <div class="ab ctr" style="top:{H/2-1:.0f}px;height:2px;left:{W/2-90:.0f}px;right:{W/2-90:.0f}px;background:{CREAM};box-shadow:0 0 18px 2px rgba(233,225,216,.5)"></div>
    <div class="ab ctr it" style="top:{H/2+40:.0f}px;font-size:40px;color:{CREAM}">fuera del aire</div>
    <div class="ab ctr t" style="top:{H/2+110:.0f}px;font-size:16px;color:#8d8a85">volvemos después · back later</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 60}px;color:#6f6c67;font-size:16px">{ident(15)}<span>sin señal · no signal</span></div>
    <div class="ab ctr t" style="top:{H-(170 if st else 80)}px;color:#6f6c67;font-size:14px">A loomlock project · Tequila Don Julio</div>'''
    return P(W, H, b, BLACK, CREAM, ".1", "screen")

# 7 · tótem — cream, spaced TAP IN, teal point, corners
def totem():
    W, H = 900, 2700
    b = f'''
    <div class="ab sp t" style="left:56px;right:56px;top:90px;font-size:22px">{ident(20)}<span>29.10 · Bogotá</span></div>
    <div class="ab ctr" style="top:520px;font-weight:500;font-size:130px;letter-spacing:.42em;margin-left:.42em;line-height:1">TAP</div>
    <div class="ab ctr" style="top:680px;font-weight:500;font-size:130px;letter-spacing:.42em;margin-left:.42em;line-height:1">IN</div>
    <div class="ab" style="left:330px;top:1180px;width:240px;height:240px;border-radius:50%;background:{TEAL};display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" width="110" height="110" fill="none" stroke="{CREAM}" stroke-width="2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg></div>
    <div class="ab ctr it" style="top:1560px;font-size:56px;line-height:1.2">acerca tu llave</div>
    <div class="ab ctr t" style="top:1700px;font-size:26px;line-height:1.6">Tú eliges qué apps se pausan.<br>El celular se queda contigo.</div>
    <div class="ab ctr" style="top:2280px;display:flex;justify-content:center">{lock("black", 24, 56)}</div>
    <div class="ab ctr t" style="top:2420px;font-size:20px">A loomlock project</div>
    <div class="ab ctr" style="top:2520px;font-size:18px;opacity:.7;padding:0 80px">{LEGAL}</div>'''
    return P(W, H, b, CREAM, BLACK, ".12")

# 8 · la llave — Loomlock's own piece: the key as the object, global line
def llave(W, H):
    st = H == 1920
    from build import KEY
    k = KEY.replace("<b>Experience</b><span>29.10 · Invite only</span>", "<b>CH 02</b><span>Bogotá · 29.10</span>")
    b = f'''
    <div class="ab" style="left:0;right:0;top:{(H-1100)/2 if st else 120:.0f}px;height:{1100 if st else 900}px;overflow:hidden">
      <div class="kc" style="left:-200px;top:{80 if st else 0}px;transform:scale(3.4) rotate(-12deg);transform-origin:0 0;box-shadow:none">{k}</div></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 50}px;color:#F9F9FF"><div><span class="tb">Loomlock</span><br>experiences</div><div style="text-align:right">Una llave, muchas puertas<br>One key, many doors</div></div>
    <div class="ab ctr it" style="top:{H-(520 if st else 330)}px;color:#F9F9FF;font-size:{54 if st else 46}px">la puerta 02 es en Bogotá</div>
    <div class="ab ctr t" style="top:{H-(430 if st else 260)}px;color:#F9F9FF;font-size:16px;opacity:.8">door 02 opens in Bogotá · 29.10 · with Tequila Don Julio</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:#F9F9FF;font-size:15px;align-items:center">{lock("white", 16, 38)}<span>{GEO}</span></div>
    <div class="ab ctr" style="top:{H-(150 if st else 64)}px;color:#F9F9FF;font-size:13px;opacity:.7">{LEGAL}</div>'''
    return P(W, H, b, LLBLUE, "#F9F9FF", ".16", "overlay")

PIECES = {}
for n, f in [("m1-invita", invita), ("m2-ch02", veladas), ("m3-hoja", hoja), ("m4-salud", salud), ("m5-flash", flash), ("m6-aire", aire), ("m8-llave", llave)]:
    PIECES[f"djm-{n}-story"] = (lambda f=f: f(1080, 1920))
    PIECES[f"djm-{n}-feed"] = (lambda f=f: f(1080, 1350))
PIECES["djm-m7-totem"] = totem
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
