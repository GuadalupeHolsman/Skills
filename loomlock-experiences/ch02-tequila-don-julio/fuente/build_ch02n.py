"""CH 02 · Tequila Don Julio — more image alternatives (MATTE references not used yet) + Loomlock ident + global layer."""
import sys
import build
from build import KEY
from build_ch02m import P, lock, ident, LEGAL, GEO, LLBLUE, CREAM, BLACK, TEAL, TEAL2

def legal(H, st, color, op=.7):
    return f'<div class="ab ctr" style="top:{H-(150 if st else 64)}px;color:{color};opacity:{op};font-size:13px">{LEGAL}</div>'

# A · CMYK Milán — giant stacked word + duotone photo block + list with squares
def a_salud(W, H):
    st = H == 1920
    s = 1 if not st else 1.4
    letters = "".join(f'<div style="height:{215*s:.0f}px">{c}</div>' for c in "SALUD")
    items = ["Jueves 29.10", "Resto Bar Bikinis", "Bogotá · GMT−5", "70 cupos · solo +18", "Apps en pausa"]
    li = "".join(f'<div style="display:flex;gap:14px;align-items:center;margin-bottom:{12*s:.0f}px"><span style="width:26px;height:14px;background:{CREAM};display:inline-block"></span>{t}</div>' for t in items)
    b = f'''
    <div class="ab" style="left:44px;top:{50*s:.0f}px;font-family:'League Gothic';font-size:{250*s:.0f}px;line-height:.86;color:{CREAM}">{letters}</div>
    <div class="ab t" style="left:330px;right:60px;top:{70*s:.0f}px;font-size:19px;color:{CREAM}">Loomlock, Tequila Don Julio<br>y tu llave presentan</div>
    <div class="ab" style="left:330px;right:60px;top:{190*s:.0f}px;height:{430*s:.0f}px;overflow:hidden;background:{CREAM}">
      <div class="ph" style="inset:0;background-image:url(assets/dj/brindis.jpg);background-position:center 35%;filter:grayscale(1) contrast(1.35) brightness(1.1);mix-blend-mode:multiply"></div>
      <div class="ab" style="inset:0;background:{TEAL};mix-blend-mode:screen;opacity:.55"></div></div>
    <div class="ab t" style="left:330px;right:60px;top:{(190+455)*s:.0f}px;color:{CREAM};font-size:19px">{li}</div>
    <div class="ab" style="left:330px;top:{H-(330 if st else 190)}px">{ident(15)}</div>
    <div class="ab t" style="left:330px;top:{H-(270 if st else 140)}px;font-size:15px;color:{CREAM};opacity:.8">here’s to the people in front of you</div>
    {legal(H, st, CREAM)}'''
    return P(W, H, b, TEAL, CREAM, ".22", "overlay")

# B · la llave como ventana — Kilian set-piece idea: the key card shape is the window onto the night
def b_ventana(W, H):
    st = H == 1920
    cw, ch = (900, 562) if st else (860, 537)
    top = (H - ch) / 2 - (60 if st else 40)
    b = f'''
    <div class="ab" style="left:{(W-cw)/2:.0f}px;top:{top:.0f}px;width:{cw}px;height:{ch}px;border-radius:{cw*0.0625:.0f}px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.25)">
      <div class="ph" style="inset:0;background-image:url(assets/dj/brindis.jpg);background-position:center 32%;filter:contrast(1.08) saturate(1.1)"></div>
      <svg class="ab" style="left:{cw*0.06:.0f}px;top:{cw*0.06:.0f}px" width="{cw*0.09:.0f}" height="{cw*0.09:.0f}" viewBox="0 0 24 24" fill="none" stroke="#fcee21" stroke-width="2.2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg>
      <div class="ab" style="left:{cw*0.07:.0f}px;bottom:{cw*0.06:.0f}px;color:#fcee21;font-family:Montserrat;font-weight:900;letter-spacing:.1em;font-size:{cw*0.06:.0f}px;line-height:1">CH 02<div style="font-weight:700;letter-spacing:.02em;font-size:{cw*0.04:.0f}px;margin-top:10px;opacity:.9">Bogotá · 29.10</div></div>
    </div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 60}px"><div><span class="tb">Loomlock</span> y <span class="tb">Tequila Don Julio</span><br>te invitan</div><div style="text-align:right">Una llave, muchas puertas<br>One key, many doors</div></div>
    <div class="ab" style="left:60px;top:{(120 if st else 60)+100}px">{ident(15)}</div>
    <div class="ab ctr it" style="top:{top+ch+50:.0f}px;font-size:{50 if st else 44}px">tu llave abre la noche</div>
    <div class="ab ctr t" style="top:{top+ch+(125 if st else 115):.0f}px;font-size:16px;opacity:.75">your key opens the night</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;font-size:15px;align-items:center">{lock("black", 16, 38)}<span>{GEO}</span></div>
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".12")

# C · guía de canales — 8-ball rack idea turned into channel dials: one network, many cities
def c_canales(W, H):
    st = H == 1920
    chans = [("01", "Loomlock", "Inicio", False), ("02", "Bogotá", "29.10 · Tequila Don Julio", True), ("03", "Medellín", "12.11 · Quokka", False),
             ("04", "Medellín", "21.11 · Cinemark", False), ("05", "Rooftop", "27.11 · Buchanan’s", False)]
    d = 300 if st else 250
    pos = [(0.5, 0.31), (0.27, 0.47), (0.73, 0.47), (0.27, 0.63), (0.73, 0.63)] if st else [(0.5, 0.28), (0.25, 0.46), (0.75, 0.46), (0.25, 0.64), (0.75, 0.64)]
    order = [1, 0, 2, 3, 4]
    dials = ""
    for k, (px, py) in zip(order, pos):
        num, city, sub, on = chans[k]
        bg = TEAL if on else "#1c1c1c"
        bd = "none" if on else f"2px solid #3a3a3a"
        col = CREAM if on else "#6f6c67"
        dials += (f'<div class="ab" style="left:{W*px-d/2:.0f}px;top:{H*py-d/2:.0f}px;width:{d}px;height:{d}px;border-radius:50%;background:{bg};border:{bd};color:{col};'
                  f'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center">'
                  f'<div class="vt" style="font-size:{d*0.3:.0f}px;line-height:.9">CH {num}</div><div class="t" style="font-size:{d*0.065:.0f}px">{city}</div>'
                  f'<div class="t" style="font-size:{d*0.045:.0f}px;opacity:.8;max-width:{d*0.8:.0f}px">{sub}</div>'
                  + ('<span style="width:12px;height:12px;border-radius:50%;background:#FF3B3B;box-shadow:0 0 10px #FF3B3B;margin-top:4px"></span>' if on else '') + '</div>')
    b = f'''
    <div class="ab sp mono" style="left:60px;right:60px;top:{120 if st else 60}px;font-size:{28 if st else 24}px"><span>Loomlock<br>experiences</span><span style="text-align:right">Guía de canales<br>Channel guide</span></div>
    {dials}
    <div class="ab mono" style="left:60px;top:{H-(380 if st else 250)}px;font-size:{26 if st else 22}px;line-height:1.3">Una red.<br>Muchas ciudades.<br>Una regla.</div>
    <div class="ab mono" style="right:60px;top:{H-(380 if st else 250)}px;text-align:right;font-size:{26 if st else 22}px;line-height:1.3">En vivo<br>CH 02<br>29.10</div>
    <div class="ab ctr mono" style="top:{H-(225 if st else 115)}px;font-size:15px;opacity:.6">One network · many cities · one rule</div>
    {legal(H, st, CREAM, .55)}'''
    return P(W, H, b, "#111111", CREAM, ".1", "screen")

# D · Mercury "MOVE" — small line + one giant word
def d_quedarte(W, H):
    st = H == 1920
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/dj/bikinis.jpg);filter:grayscale(.2) contrast(1.05) brightness(.62)"></div>
    <div class="ab" style="inset:0;background:{TEAL};mix-blend-mode:multiply;opacity:.55"></div>
    <div class="ab" style="left:60px;top:{120 if st else 60}px">{ident(15)}</div>
    <div class="ab ctr t" style="top:{H*0.43:.0f}px;color:{CREAM};font-size:{26 if st else 24}px">Esta es una noche hecha para</div>
    <div class="ab ctr" style="top:{H*0.43+45:.0f}px;color:{CREAM};font-family:'League Gothic';font-size:{330 if st else 300}px;line-height:.9">QUEDARTE.</div>
    <div class="ab ctr t" style="top:{H*0.43+(360 if st else 330):.0f}px;color:{CREAM};font-size:16px;opacity:.8">a night made for staying · 29.10 · Bogotá</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:{CREAM};font-size:15px;align-items:center">{lock("white", 16, 38)}<span>A loomlock project</span></div>
    {legal(H, st, CREAM)}'''
    return P(W, H, b, BLACK, CREAM, ".18", "overlay")

# E · hoja de contactos — the only photos of the night arrive later (MATTE event-photo grids)
def e_contactos(W, H):
    st = H == 1920
    photos = ["brindis", "glass", "bottle", "bikinis"]
    pos = ["center 30%", "center 60%", "center 25%", "center"]
    cw = (W - 120 - 24) / 2
    chh = cw * (1.15 if st else 0.82)
    y0 = 300 if st else 200
    cells = ""
    for i, (p, bp) in enumerate(zip(photos, pos)):
        x = 60 + (i % 2) * (cw + 24)
        y = y0 + (i // 2) * (chh + 70)
        cells += (f'<div class="ab" style="left:{x:.0f}px;top:{y:.0f}px;width:{cw:.0f}px;height:{chh:.0f}px;background:url(assets/dj/{p}.jpg) {bp}/cover;filter:contrast(1.1) saturate(1.1)"></div>'
                  f'<div class="ab mono" style="left:{x:.0f}px;top:{y+chh+10:.0f}px;font-size:16px;color:#e8a33d">▸ {i+1:02d}A · KODAK 400</div>')
    b = f'''
    <div class="ab sp mono" style="left:60px;right:60px;top:{120 if st else 60}px;font-size:{24 if st else 21}px;color:{CREAM}"><span>Tus fotos llegaron<br>Your photos are in</span><span style="text-align:right">CH 02<br>Bogotá · 29.10</span></div>
    {cells}
    <div class="ab ctr it" style="top:{H-(330 if st else 175)}px;color:{CREAM};font-size:{40 if st else 34}px">las únicas fotos de la noche</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;color:{CREAM};font-size:14px;align-items:center">{ident(13)}<span>{GEO}</span></div>
    {legal(H, st, CREAM, .55)}'''
    return P(W, H, b, "#161310", CREAM, ".14", "screen")

# F · coordenadas — global as the headline: the place is the title
def f_coordenadas(W, H):
    st = H == 1920
    b = f'''
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 60}px"><div><span class="tb">Loomlock</span> experiences<br>× <span class="tb">Tequila Don Julio</span></div><div style="text-align:right">Puerta 02<br>Door 02</div></div>
    <div class="ab" style="left:52px;top:{H*0.22:.0f}px;font-family:'League Gothic';font-size:{300 if st else 250}px;line-height:.86;color:{BLACK}">4°39′N<br><span style="color:{TEAL}">74°03′W</span></div>
    <div class="ab" style="left:60px;right:60px;top:{H*(0.62 if st else 0.66):.0f}px;border-top:1.5px solid rgba(11,11,11,.3)"></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H*(0.62 if st else 0.66)+24:.0f}px;font-size:20px"><span>Bogotá</span><span>GMT−5</span><span>Jueves 29.10</span></div>
    <div class="ab t" style="left:60px;top:{H*(0.62 if st else 0.66)+80:.0f}px;font-size:18px;opacity:.75;line-height:1.6">Resto Bar Bikinis · Carrera 6 # 58–48<br>Una regla en todas las ciudades: el celular se queda contigo.</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;font-size:15px;align-items:center">{ident(14)}{lock("black", 16, 38)}</div>
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".12")

PIECES = {}
for n, f in [("n1-salud-stack", a_salud), ("n2-ventana", b_ventana), ("n3-canales", c_canales), ("n4-quedarte", d_quedarte),
             ("n5-contactos", e_contactos), ("n6-coordenadas", f_coordenadas)]:
    PIECES[f"djn-{n}-story"] = (lambda f=f: f(1080, 1920))
    PIECES[f"djn-{n}-feed"] = (lambda f=f: f(1080, 1350))
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
