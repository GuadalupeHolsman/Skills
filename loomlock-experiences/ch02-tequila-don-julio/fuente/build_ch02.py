"""Loomlock Experiences · CH 02 · Tequila Don Julio — graphic elements. Exports PNGs through build.export."""
import sys
import build
from build import KEY, page

NAVY, DEEP, ICE, SKY, AMBER = "#121b95", "#05071f", "#e7e9fb", "#9fd8ff", "#e6a33e"

CSS = f"""
@font-face{{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/spacemono-400.woff2") format("woff2")}}
@font-face{{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/spacemono-700.woff2") format("woff2")}}
.ab{{position:absolute}}
.mono{{font-family:"Space Mono",monospace;letter-spacing:.02em}}
.lw{{text-transform:lowercase}}
.sp{{display:flex;justify-content:space-between;align-items:center}}
.ctr{{left:0;right:0;text-align:center}}
.amber{{color:{AMBER}}} .sky{{color:{SKY}}}
.vig{{display:none}}
"""

def logos(h=30, dh=50, c="white", x=24, g=16, op=1):
    return (f'<div style="display:flex;align-items:center;opacity:{op}"><img src="assets/img/loomlock_{c}.png" style="height:{h}px" alt="loomlock">'
            f'<span style="margin:0 {g}px;font-weight:500;font-size:{x}px">×</span><img src="assets/img/donjulio_{c}.png" style="height:{dh}px" alt="Tequila Don Julio"></div>')

def P(w, h, body, bg, color="#fff", extra=""):
    return w, h, page(w, h, body, CSS + f".art{{background:{bg};color:{color}}} {extra}")

def key(left, top, scale=1.0, rot=-8, lab="CH 02", sub="Tequila Don Julio · 29.10"):
    k = KEY.replace("<b>Experience</b><span>29.10 · Invite only</span>", f"<b>{lab}</b><span>{sub}</span>")
    return f'<div class="kc" style="left:{left}px;top:{top}px;transform:rotate({rot}deg) scale({scale})">{k}</div>'

def chtag(size=22):
    return f'<span class="mono lw" style="font-size:{size}px">loomlock experiences · <b class="sky">ch 02</b></span>'

# ---------------------------------------------------------------- 1 · la llave (front + back)
def key_card():
    W, H = 1600, 900
    back = f'''<div class="ab" style="left:860px;top:270px;width:480px;height:300px;border-radius:30px;background:{ICE};color:{NAVY};transform:rotate(6deg) scale(1.15);box-shadow:0 40px 90px rgba(4,6,40,.6);padding:30px 34px">
      <div class="sp mono" style="font-size:15px"><span>CH 02</span><span>29.10</span></div>
      <div style="font-weight:800;font-size:44px;line-height:1;margin-top:52px;letter-spacing:-.02em" class="lw">live now.<br>post later.</div>
      <div class="mono lw" style="font-size:14px;margin-top:22px;opacity:.75">tap en la puerta · tus apps descansan</div>
      <div class="ab" style="left:34px;bottom:26px">{logos(16, 27, "dark", 14, 8)}</div></div>'''
    b = f'''{key(250, 290, 1.15, -8)}{back}
    <div class="ab mono lw" style="left:80px;top:70px;font-size:22px;opacity:.8">la llave · frente y dorso</div>
    <div class="ab mono lw" style="left:80px;bottom:70px;font-size:20px;opacity:.6">edición ch 02 · tarjeta nfc 85 × 54 mm</div>'''
    return P(W, H, b, DEEP)

# ---------------------------------------------------------------- 2 · la invitación (story + feed)
def invite(W, H):
    st = H == 1920
    b = f'''
    <div class="ab sp" style="left:64px;right:64px;top:{120 if st else 64}px">{chtag(22 if st else 20)}<span class="mono" style="font-size:20px">29.10</span></div>
    <div class="ab" style="left:{W/2-240}px;top:{H*0.30 if st else H*0.22}px">{key(0, 0, 1.55 if st else 1.3, -8)}</div>
    <div class="ab ctr lw" style="top:{H*0.58 if st else H*0.58}px;font-weight:800;font-size:{84 if st else 70}px;line-height:1.02;letter-spacing:-.03em">esta es tu<br>invitación.</div>
    <div class="ab ctr lw" style="top:{H*0.58+ (220 if st else 180)}px;font-weight:600;font-size:{34 if st else 30}px;color:{ICE}">también pausa tus apps.</div>
    <div class="ab ctr mono lw" style="top:{H-(330 if st else 190)}px;font-size:{24 if st else 21}px;color:{SKY}">jueves 29.10 · invite only · +18</div>
    <div class="ab sp" style="left:64px;right:64px;top:{H-(190 if st else 100)}px">{logos(26, 44)}<span class="mono lw" style="font-size:18px;opacity:.7">live now. post later.</span></div>'''
    return P(W, H, b, NAVY)

# ---------------------------------------------------------------- 3 · la regla (feed)
def regla():
    W, H = 1080, 1350
    b = f'''
    <div class="ab sp" style="left:64px;right:64px;top:64px">{chtag(20)}<span class="mono" style="font-size:20px">29.10</span></div>
    <div class="ab lw" style="left:64px;top:300px;font-weight:600;font-size:40px;color:{SKY}">una regla:</div>
    <div class="ab lw" style="left:58px;top:370px;right:60px;font-weight:800;font-size:128px;line-height:.98;letter-spacing:-.04em">el celular<br>se queda<br>contigo.</div>
    <div class="ab lw" style="left:64px;top:800px;width:820px;font-weight:600;font-size:34px;line-height:1.35;color:{ICE}">lo que descansa son las apps.<br>cámara, llamadas y mapas siguen funcionando.</div>
    <div class="ab" style="left:64px;right:64px;top:1150px;height:2px;background:rgba(231,233,251,.3)"></div>
    <div class="ab sp" style="left:64px;right:64px;top:1200px">{logos(26, 44)}<span class="mono lw" style="font-size:18px;opacity:.7">+18</span></div>'''
    return P(W, H, b, NAVY)

# ---------------------------------------------------------------- 4 · tótem de entrada (60 × 180 cm)
def totem():
    W, H = 900, 2700
    rings = "".join(f'<div class="ab" style="left:{450-r}px;top:{1450-r}px;width:{2*r}px;height:{2*r}px;border-radius:50%;border:6px solid {AMBER};opacity:{o}"></div>' for r, o in [(170, 1), (240, .55), (310, .28)])
    b = f'''
    <div class="ab ctr" style="top:120px;display:flex;justify-content:center">{logos(44, 74)}</div>
    <div class="ab ctr mono lw" style="top:260px;font-size:30px;color:{SKY}">loomlock experiences · ch 02</div>
    <div class="ab ctr lw" style="top:520px;font-weight:800;font-size:250px;line-height:.9;letter-spacing:-.05em">tap<br>in.</div>
    {rings}
    <div class="ab" style="left:310px;top:1310px;width:280px;height:280px;border-radius:50%;background:{AMBER};display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" width="130" height="130" fill="none" stroke="{DEEP}" stroke-width="2.2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg></div>
    <div class="ab ctr lw" style="top:1830px;font-weight:700;font-size:54px;line-height:1.15">acerca tu llave<br>o tu celular aquí.</div>
    <div class="ab ctr lw" style="top:2040px;font-weight:600;font-size:40px;color:{ICE};line-height:1.3">el celular se queda contigo.<br>las apps descansan.</div>
    <div class="ab ctr lw" style="top:2400px;font-weight:800;font-size:58px;color:{SKY}">live now. post later.</div>
    <div class="ab ctr mono lw" style="top:2560px;font-size:24px;opacity:.7">+18 · beber con moderación</div>'''
    return P(W, H, b, NAVY)

# ---------------------------------------------------------------- 5 · fuera del aire (feed + story)
def aire(W, H):
    st = H == 1920
    b = f'''
    <div class="ab sp" style="left:64px;right:64px;top:{120 if st else 64}px"><span class="mono lw" style="font-size:20px;color:#7d84c4">ch 02 · tequila don julio</span>
      <span class="mono lw" style="font-size:20px;color:#7d84c4;display:flex;align-items:center;gap:10px"><span style="width:14px;height:14px;border-radius:50%;background:#3a3f6e;display:inline-block"></span>sin transmisión</span></div>
    <div class="ab ctr lw" style="top:{H/2-120}px;font-weight:800;font-size:{120 if st else 112}px;letter-spacing:-.04em;line-height:1">fuera<br>del aire.</div>
    <div class="ab ctr lw" style="top:{H/2+150}px;font-weight:600;font-size:34px;color:{SKY}">volvemos después.</div>
    <div class="ab ctr mono lw" style="top:{H-(200 if st else 110)}px;font-size:18px;color:#7d84c4">live now. post later.</div>'''
    return P(W, H, b, DEEP, extra=".grain{opacity:.35}")

# ---------------------------------------------------------------- 6 · posavasos (Ø 10 cm, dos caras)
def coaster():
    W, H = 1600, 800
    a = f'''<div class="ab" style="left:60px;top:40px;width:720px;height:720px;border-radius:50%;background:{NAVY};overflow:hidden">
      <div class="ab ctr lw" style="top:250px;font-weight:800;font-size:92px;line-height:1;letter-spacing:-.03em">live now.<br><span class="sky">post later.</span></div>
      <div class="ab ctr mono lw" style="top:560px;font-size:20px;opacity:.7">ch 02 · 29.10</div></div>'''
    bb = f'''<div class="ab" style="left:820px;top:40px;width:720px;height:720px;border-radius:50%;background:{ICE};color:{NAVY};overflow:hidden">
      <div class="ab" style="left:40px;top:40px;width:640px;height:640px;border-radius:50%;border:5px solid {AMBER}"></div>
      <div class="ab ctr lw" style="top:230px;font-weight:800;font-size:60px;line-height:1.1;letter-spacing:-.02em">un trago<br>se toma<br>mirando a alguien.</div>
      <div class="ab" style="left:0;right:0;top:520px;display:flex;justify-content:center">{logos(22, 37, "dark", 18, 10)}</div>
      <div class="ab ctr mono lw" style="top:600px;font-size:16px;opacity:.7">+18 · beber con moderación</div></div>'''
    return P(W, H, a + bb, DEEP)

# ---------------------------------------------------------------- 7 · carta de la barra (A5)
def menu():
    W, H = 1240, 1748
    items = "".join(f'''<div style="border-top:2px solid rgba(18,27,149,.2);padding:34px 0;display:grid;grid-template-columns:1fr auto;gap:8px">
        <div style="font-weight:800;font-size:48px;letter-spacing:-.02em" class="lw">[cóctel {i}]</div><div class="mono" style="font-size:22px;opacity:.6">0{i}</div>
        <div class="lw" style="font-weight:600;font-size:28px;opacity:.75">tequila don julio blanco, [ingredientes]</div></div>''' for i in (1, 2, 3))
    b = f'''
    <div class="ab sp" style="left:96px;right:96px;top:96px"><span class="mono lw" style="font-size:22px">la barra · ch 02</span><span class="mono" style="font-size:22px">29.10</span></div>
    <div class="ab lw" style="left:90px;top:230px;font-weight:800;font-size:120px;letter-spacing:-.04em;line-height:.95">tequila<br>don julio<br><span style="color:{AMBER}">blanco.</span></div>
    <div class="ab" style="left:96px;right:96px;top:700px">{items}</div>
    <div class="ab lw" style="left:96px;right:96px;top:1420px;font-weight:600;font-size:30px;opacity:.8">un trago se toma mirando a alguien.</div>
    <div class="ab sp" style="left:96px;right:96px;top:1590px">{logos(24, 40, "dark", 20, 10)}<span class="mono lw" style="font-size:18px;opacity:.7">+18 · beber con moderación</span></div>'''
    return P(W, H, b, ICE, NAVY, ".grain{opacity:.12}")

# ---------------------------------------------------------------- 8 · photocall (3 × 2 m)
def photocall():
    W, H = 1800, 1200
    cells = ""
    for r in range(6):
        for c in range(4):
            x = c * 450 + (225 if r % 2 else 0) - 100
            y = 70 + r * 190
            if (r + c) % 2 == 0:
                cells += f'<div class="ab" style="left:{x}px;top:{y}px;width:420px;display:flex;justify-content:center">{logos(26, 44, op=.95)}</div>'
            else:
                cells += f'<div class="ab lw" style="left:{x}px;top:{y+6}px;width:420px;text-align:center;font-weight:800;font-size:34px;color:{SKY}">live now. post later.</div>'
    return P(W, H, cells, NAVY)

# ---------------------------------------------------------------- 9 · la galería / se cuenta (feed)
def galeria():
    W, H = 1080, 1350
    b = f'''
    <div class="ab" style="inset:0;background:url(assets/stills/face.jpg) 58% center/cover;filter:sepia(.3) saturate(1.3) contrast(1.1)"></div>
    <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(5,7,31,.55),rgba(5,7,31,0) 25%,rgba(5,7,31,0) 50%,rgba(5,7,31,.92) 80%)"></div>
    <div class="ab sp" style="left:64px;right:64px;top:64px">{chtag(20)}<span class="mono lw" style="font-size:20px">se cuenta</span></div>
    <div class="ab lw" style="left:64px;right:64px;top:820px;font-weight:700;font-style:italic;font-size:52px;line-height:1.15">“[frase real de alguien que estuvo]”</div>
    <div class="ab" style="left:64px;right:64px;top:1040px;height:2px;background:rgba(231,233,251,.35)"></div>
    <div class="ab" style="left:64px;top:1080px;display:flex;align-items:baseline;gap:18px"><span style="font-weight:800;font-size:96px;color:{AMBER}">[x]</span><span class="lw" style="font-weight:600;font-size:30px;color:{ICE}">horas de apps en pausa esta noche.</span></div>
    <div class="ab sp" style="left:64px;right:64px;top:1250px">{logos(24, 40)}<span class="mono lw" style="font-size:18px;opacity:.75">la galería ya está en la app</span></div>'''
    return P(W, H, b, DEEP)

PIECES = {
    "ch02-1-llave": key_card,
    "ch02-2-invitacion-story": lambda: invite(1080, 1920),
    "ch02-2-invitacion-feed": lambda: invite(1080, 1350),
    "ch02-3-regla-feed": regla,
    "ch02-4-totem": totem,
    "ch02-5-fuera-del-aire-feed": lambda: aire(1080, 1350),
    "ch02-5-fuera-del-aire-story": lambda: aire(1080, 1920),
    "ch02-6-posavasos": coaster,
    "ch02-7-carta-barra": menu,
    "ch02-8-photocall": photocall,
    "ch02-9-galeria-feed": galeria,
}
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
