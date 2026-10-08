"""Loomlock Experiences · CH 02 · Tequila Don Julio (Bogotá, Resto Bar Bikinis) — graphic elements in the site's Don Julio theme."""
import sys
import build
from build import KEY, page

CREAM, BLACK, TEAL, TEAL2, WHITE, REC = "#E9E1D8", "#0B0B0B", "#0B5A6A", "#5FB1C1", "#FFFFFF", "#FF3B3B"
LEGAL = "Disfruta con moderación. Prohibido el expendio de bebidas alcohólicas a menores de edad."

CSS = f"""
@font-face{{font-family:"League Gothic";src:url("assets/fonts/leaguegothic-400.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:400;src:url("assets/fonts/outfit-400.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:500;src:url("assets/fonts/outfit-500.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:600;src:url("assets/fonts/outfit-600.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:700;src:url("assets/fonts/outfit-700.woff2") format("woff2")}}
@font-face{{font-family:"VT323";src:url("assets/fonts/vt323-400.woff2") format("woff2")}}
body,.art{{font-family:"Outfit",sans-serif}}
.ab{{position:absolute}}
.disp{{font-family:"League Gothic",Impact,sans-serif;text-transform:uppercase;line-height:.9;letter-spacing:.005em;font-weight:400}}
.vt{{font-family:"VT323",monospace;letter-spacing:.06em}}
.chbox{{font-family:"VT323",monospace;border:2px solid currentColor;border-radius:8px;padding:0 10px;line-height:1.15}}
.lbl{{font-weight:700;letter-spacing:.16em;text-transform:uppercase}}
.sp{{display:flex;justify-content:space-between;align-items:center}}
.ctr{{left:0;right:0;text-align:center}}
.rec{{display:inline-block;width:14px;height:14px;border-radius:50%;background:{REC};box-shadow:0 0 10px {REC}}}
.ph{{position:absolute;background-size:cover;background-position:center}}
.vig{{display:none}}
"""

def P(w, h, body, bg, color=BLACK, extra=""):
    return w, h, page(w, h, body, CSS + f".art{{background:{bg};color:{color}}} .grain{{mix-blend-mode:multiply;opacity:.14}} {extra}")

def lock(c="black", h=26, dh=58, x=24, g=14):
    ll = "loomlock_black" if c == "black" else "loomlock_white"
    return (f'<div style="display:flex;align-items:center"><img src="assets/img/{ll}.png" style="height:{h}px" alt="loomlock">'
            f'<span style="margin:0 {g}px;font-weight:500;font-size:{x}px">×</span><img src="assets/img/dj_{c}.png" style="height:{dh}px" alt="Tequila Don Julio"></div>')

def osd(size=30, rec=True, label="en vivo"):
    r = f'<span class="rec"></span>' if rec else '<span class="rec" style="background:#555;box-shadow:none"></span>'
    return (f'<div style="display:flex;align-items:center;gap:14px"><span class="chbox" style="font-size:{size}px">CH 02</span>'
            f'{r}<span class="lbl" style="font-size:{size*0.5:.0f}px">{label}</span></div>')

def key(left, top, scale=1.0, rot=-8):
    k = KEY.replace("<b>Experience</b><span>29.10 · Invite only</span>", "<b>CH 02</b><span>Tequila Don Julio · 29.10</span>")
    return f'<div class="kc" style="left:{left}px;top:{top}px;transform:rotate({rot}deg) scale({scale})">{k}</div>'

# 1 · la llave
def llave():
    W, H = 1600, 900
    back = f'''<div class="ab" style="left:860px;top:270px;width:480px;height:300px;border-radius:30px;background:{CREAM};color:{BLACK};transform:rotate(6deg) scale(1.15);box-shadow:0 40px 90px rgba(0,0,0,.5);padding:26px 30px">
      <div class="sp"><span class="chbox" style="font-size:20px">CH 02</span><span class="vt" style="font-size:22px">29.10 · BOGOTÁ</span></div>
      <div class="disp" style="font-size:58px;margin-top:22px">Salud por la gente<br>que tienes al frente.</div>
      <div class="ab" style="left:30px;bottom:22px">{lock("black", 14, 32, 13, 8)}</div></div>'''
    b = f'''{key(250, 290, 1.15, -8)}{back}
    <div class="ab lbl" style="left:80px;top:70px;font-size:18px;color:{CREAM};opacity:.8">la llave · frente y dorso</div>
    <div class="ab lbl" style="left:80px;bottom:70px;font-size:16px;color:{CREAM};opacity:.55">tarjeta nfc 85 × 54 mm · edición ch 02</div>'''
    return P(W, H, b, "#141414", CREAM)

# 2 · invitación (foto + titular)
def invitacion(W, H):
    st = H == 1920
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/dj/bottle.jpg);background-position:center 18%"></div>
    <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,0) 22%,rgba(0,0,0,.05) 50%,rgba(0,0,0,.8) 75%,rgba(0,0,0,.88))"></div>
    <div class="ab sp" style="left:56px;right:56px;top:{110 if st else 56}px;color:{WHITE}">{osd(30)}<span class="lbl" style="font-size:15px;text-align:right">29.10 · bogotá</span></div>
    <div class="ab ctr disp" style="top:{H-(820 if st else 560)}px;color:{WHITE};font-size:{170 if st else 128}px">Salud por<br>la gente que<br>tienes al frente.</div>
    <div class="ab ctr" style="top:{H-(310 if st else 210)}px;color:{WHITE};font-weight:500;font-size:{30 if st else 26}px">Una fiesta en Resto Bar Bikinis con tequila Don Julio y las apps en pausa.</div>
    <div class="ab sp" style="left:56px;right:56px;top:{H-(210 if st else 130)}px;color:{WHITE}">{lock("white", 22, 50, 20, 10)}<span class="lbl" style="font-size:14px">70 cupos · solo +18</span></div>
    <div class="ab ctr" style="top:{H-(110 if st else 52)}px;color:rgba(255,255,255,.75);font-size:15px">{LEGAL}</div>'''
    return P(W, H, b, BLACK, WHITE, ".grain{mix-blend-mode:overlay;opacity:.16}")

# 3 · la regla (texto)
def regla():
    W, H = 1080, 1350
    b = f'''
    <div class="ab sp" style="left:56px;right:56px;top:56px">{osd(28, label="cómo funciona")}<span class="lbl" style="font-size:15px">29.10</span></div>
    <div class="ab lbl" style="left:60px;top:250px;font-size:22px;color:{TEAL}">una regla</div>
    <div class="ab disp" style="left:56px;top:300px;font-size:250px;line-height:.86">El celular<br>se queda<br>contigo.</div>
    <div class="ab" style="left:60px;top:1000px;width:900px;font-weight:500;font-size:34px;line-height:1.35">Las apps, en pausa. <span style="color:{TEAL};font-weight:700">Tú eliges cuáles</span> en el tótem de la entrada.</div>
    <div class="ab" style="left:56px;right:56px;top:1180px;height:2px;background:rgba(11,11,11,.16)"></div>
    <div class="ab sp" style="left:56px;right:56px;top:1222px">{lock("black", 20, 46, 18, 10)}<span class="lbl" style="font-size:14px">live now, post later.</span></div>'''
    return P(W, H, b, CREAM)

# 4 · tótem (60 × 180 cm)
def totem():
    W, H = 900, 2700
    rings = "".join(f'<div class="ab" style="left:{450-r}px;top:{1500-r}px;width:{2*r}px;height:{2*r}px;border-radius:50%;border:6px solid {TEAL};opacity:{o}"></div>' for r, o in [(175, 1), (245, .5), (315, .22)])
    b = f'''
    <div class="ab ctr" style="top:130px;display:flex;justify-content:center">{lock("black", 36, 84, 30, 16)}</div>
    <div class="ab ctr" style="top:310px;display:flex;justify-content:center">{osd(40, label="en vivo")}</div>
    <div class="ab ctr disp" style="top:470px;font-size:400px;line-height:.82">Tap<br>in.</div>
    {rings}
    <div class="ab" style="left:310px;top:1360px;width:280px;height:280px;border-radius:50%;background:{TEAL};display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" width="130" height="130" fill="none" stroke="{CREAM}" stroke-width="2.2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg></div>
    <div class="ab ctr disp" style="top:1880px;font-size:120px">Acerca tu llave.</div>
    <div class="ab ctr" style="top:2020px;font-weight:500;font-size:40px;line-height:1.35">Tú eliges qué apps se pausan.<br>El celular se queda contigo.</div>
    <div class="ab ctr lbl" style="top:2400px;font-size:30px;color:{TEAL}">live now, post later.</div>
    <div class="ab ctr" style="top:2500px;font-size:22px;opacity:.7;padding:0 90px;line-height:1.35">{LEGAL}</div>'''
    return P(W, H, b, CREAM)

# 5 · fuera del aire (TV apagada)
def aire(W, H):
    st = H == 1920
    b = f'''
    <div class="ab sp" style="left:56px;right:56px;top:{110 if st else 56}px;color:#8d8a85">{osd(30, rec=False, label="sin señal")}<span class="lbl" style="font-size:15px">tequila don julio</span></div>
    <div class="ab" style="left:0;right:0;top:{H/2-2}px;height:4px;background:{WHITE};box-shadow:0 0 30px 6px rgba(255,255,255,.55)"></div>
    <div class="ab ctr disp" style="top:{H/2-330}px;color:{CREAM};font-size:{230 if st else 200}px">Fuera del aire.</div>
    <div class="ab ctr disp" style="top:{H/2+70}px;color:{TEAL2};font-size:{110 if st else 96}px">Volvemos después.</div>
    <div class="ab ctr" style="top:{H-(330 if st else 190)}px;color:#8d8a85;font-weight:500;font-size:28px">Las mejores historias de fiesta nunca se subieron.</div>
    <div class="ab ctr lbl" style="top:{H-(200 if st else 100)}px;color:#5a5853;font-size:15px">live now, post later.</div>'''
    return P(W, H, b, BLACK, CREAM, ".grain{mix-blend-mode:screen;opacity:.12}")

# 6 · posavasos (Ø 10 cm)
def posavasos():
    W, H = 1600, 800
    a = f'''<div class="ab" style="left:60px;top:40px;width:720px;height:720px;border-radius:50%;background:{CREAM};color:{BLACK};overflow:hidden">
      <div class="ab ctr disp" style="top:170px;font-size:150px">Un tequila<br>se toma<br><span style="color:{TEAL}">despacio.</span></div>
      <div class="ab ctr" style="top:610px;display:flex;justify-content:center">{lock("black", 14, 34, 14, 8)}</div></div>'''
    bb = f'''<div class="ab" style="left:820px;top:40px;width:720px;height:720px;border-radius:50%;background:{BLACK};color:{CREAM};overflow:hidden">
      <div class="ab ctr" style="top:120px;display:flex;justify-content:center"><span class="chbox" style="font-size:34px">CH 02</span></div>
      <div class="ab ctr disp" style="top:220px;font-size:150px">Live now,<br><span style="color:{TEAL2}">post later.</span></div>
      <div class="ab ctr" style="top:560px;font-size:15px;opacity:.7;padding:0 140px;line-height:1.3">{LEGAL}</div></div>'''
    return P(W, H, a + bb, "#1b1b1b", CREAM)

# 7 · carta de la barra (A5)
def carta():
    W, H = 1240, 1748
    items = "".join(f'''<div style="border-top:2px solid rgba(11,11,11,.16);padding:28px 0;display:grid;grid-template-columns:1fr auto;gap:6px">
        <div class="disp" style="font-size:76px">[Cóctel {i}]</div><div class="vt" style="font-size:34px;color:{TEAL}">0{i}</div>
        <div style="font-weight:500;font-size:28px;opacity:.75">Tequila Don Julio Blanco, [ingredientes]</div></div>''' for i in (1, 2, 3))
    b = f'''
    <div class="ph" style="left:0;right:0;top:0;height:560px;background-image:url(assets/dj/glass.jpg);background-position:center 60%"></div>
    <div class="ab sp" style="left:80px;right:80px;top:48px;color:{WHITE}"><span class="chbox" style="font-size:32px">CH 02</span><span class="lbl" style="font-size:16px">la barra</span></div>
    <div class="ab disp" style="left:76px;top:610px;font-size:150px">Don Julio Blanco.</div>
    <div class="ab" style="left:80px;right:80px;top:780px">{items}</div>
    <div class="ab disp" style="left:80px;top:1440px;font-size:62px;color:{TEAL}">Un tequila se toma despacio.</div>
    <div class="ab sp" style="left:80px;right:80px;top:1560px">{lock("black", 18, 42, 16, 8)}<span class="lbl" style="font-size:13px">solo +18</span></div>
    <div class="ab" style="left:80px;right:80px;top:1650px;font-size:16px;opacity:.7">{LEGAL}</div>'''
    return P(W, H, b, CREAM)

# 8 · photocall (3 × 2 m)
def photocall():
    W, H = 1800, 1200
    cells = ""
    for r in range(5):
        for c in range(4):
            x = c * 460 + (230 if r % 2 else 0) - 120
            y = 60 + r * 230
            if (r + c) % 2 == 0:
                cells += f'<div class="ab" style="left:{x}px;top:{y}px;width:440px;display:flex;justify-content:center">{lock("black", 20, 46, 18, 10)}</div>'
            else:
                cells += f'<div class="ab disp" style="left:{x}px;top:{y-4}px;width:440px;text-align:center;font-size:60px;color:{TEAL}">Live now, post later.</div>'
    return P(W, H, cells, CREAM)

# 9 · banner de barra (ticker, 300 × 50 cm)
def ticker():
    W, H = 3000, 500
    words = ["Sin feed", "Un tequila se toma despacio", "Live now, post later", "Salud por la gente que tienes al frente"]
    row = "".join(f'<span class="disp" style="font-size:230px;margin-right:60px">{w}<i style="font-style:normal;color:{TEAL2};margin-left:60px">·</i></span>' for w in words)
    b = f'<div class="ab" style="left:-40px;top:120px;white-space:nowrap">{row}</div>'
    return P(W, H, b, BLACK, CREAM, ".grain{mix-blend-mode:screen;opacity:.1}")

# 10 · galería (se cuenta)
def galeria():
    W, H = 1080, 1350
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/dj/brindis.jpg);background-position:center 30%"></div>
    <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,0) 22%,rgba(0,0,0,0) 45%,rgba(0,0,0,.88) 75%)"></div>
    <div class="ab sp" style="left:56px;right:56px;top:56px;color:{WHITE}">{osd(28, rec=False, label="tus fotos llegaron")}<span class="lbl" style="font-size:15px">29.10 · bogotá</span></div>
    <div class="ab disp" style="left:56px;right:56px;top:760px;color:{WHITE};font-size:110px">“[Frase real de alguien que estuvo]”</div>
    <div class="ab" style="left:56px;top:1080px;display:flex;align-items:baseline;gap:16px;color:{WHITE}"><span class="disp" style="font-size:120px;color:{TEAL2}">[X]</span><span style="font-weight:500;font-size:30px">horas de apps en pausa esta noche.</span></div>
    <div class="ab sp" style="left:56px;right:56px;top:1250px;color:{WHITE}">{lock("white", 20, 46, 18, 10)}<span class="lbl" style="font-size:14px">galería de la noche · en la app</span></div>'''
    return P(W, H, b, BLACK, WHITE, ".grain{mix-blend-mode:overlay;opacity:.16}")

PIECES = {
    "dj-01-llave": llave,
    "dj-02-invitacion-story": lambda: invitacion(1080, 1920),
    "dj-02-invitacion-feed": lambda: invitacion(1080, 1350),
    "dj-03-regla-feed": regla,
    "dj-04-totem": totem,
    "dj-05-fuera-del-aire-story": lambda: aire(1080, 1920),
    "dj-05-fuera-del-aire-feed": lambda: aire(1080, 1350),
    "dj-06-posavasos": posavasos,
    "dj-07-carta-barra": carta,
    "dj-08-photocall": photocall,
    "dj-09-banner-barra": ticker,
    "dj-10-galeria-feed": galeria,
}
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
