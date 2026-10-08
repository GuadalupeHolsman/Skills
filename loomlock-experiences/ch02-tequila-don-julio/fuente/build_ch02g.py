"""CH 02 · Tequila Don Julio — photo-free graphic pieces (MATTE treatment, Loomlock ident, global layer). Everything is drawn."""
import sys, math
import build
from build import KEY
from build_ch02m import P, lock, ident, LEGAL, GEO, LLBLUE, CREAM, BLACK, TEAL, TEAL2

AMBER = "#C9A46B"
RISO_CSS = ('<div class="ab" style="inset:0;background-image:radial-gradient(rgba(11,11,11,.18) 1px,rgba(0,0,0,0) 1.4px);'
            'background-size:6px 6px;mix-blend-mode:multiply;pointer-events:none"></div>')

def legal(H, st, color, op=.7):
    return f'<div class="ab ctr" style="top:{H-(150 if st else 64)}px;color:{color};opacity:{op};font-size:13px">{LEGAL}</div>'

def topbar(W, H, color, left, right):
    st = H == 1920
    return f'<div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 60}px;color:{color}"><div>{left}</div><div style="text-align:right">{right}</div></div>'

def bottombar(W, H, color, c="black"):
    st = H == 1920
    return f'<div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:{color};font-size:15px;align-items:center">{ident(14)}{lock(c, 16, 38)}</div>'

# ---------------------------------------------------------------- 1 · agave risograph
def agave_svg(size, color, seed=0):
    leaves = []
    n = 13
    for i in range(n):
        a = -90 + (i - (n - 1) / 2) * 13 + (seed * 3)
        L = size * (0.92 - abs(i - (n - 1) / 2) * 0.045)
        w = size * 0.07
        leaves.append(f'<path d="M0 0 C {w} {-L*0.35}, {w*0.6} {-L*0.75}, 0 {-L} C {-w*0.6} {-L*0.75}, {-w} {-L*0.35}, 0 0 Z" transform="rotate({a+90:.1f})" fill="{color}"/>')
    return f'<svg viewBox="{-size} {-size} {2*size} {size*1.05}" width="{2*size}" height="{size*1.05}" style="overflow:visible">{"".join(leaves)}</svg>'

def g1_agave(W, H):
    st = H == 1920
    sz = 520 if st else 440
    top = H * (0.30 if st else 0.22)
    b = f'''
    {topbar(W, H, BLACK, '<span class="tb">Loomlock</span> y <span class="tb">Tequila Don Julio</span><br>te invitan', 'Jueves 29.10<br>Bogotá · GMT−5')}
    <div class="ab" style="left:{W/2-sz}px;top:{top:.0f}px;mix-blend-mode:multiply;opacity:.92">{agave_svg(sz, TEAL)}</div>
    <div class="ab" style="left:{W/2-sz+14}px;top:{top+10:.0f}px;mix-blend-mode:multiply;opacity:.55">{agave_svg(sz, LLBLUE, 1)}</div>
    {RISO_CSS}
    <div class="ab ctr it" style="top:{top+sz*1.05+60:.0f}px;font-size:{54 if st else 46}px;line-height:1.1">salud por la gente<br>que tienes al frente</div>
    <div class="ab ctr t" style="top:{top+sz*1.05+(200 if st else 175):.0f}px;font-size:16px;opacity:.75">here’s to the people in front of you</div>
    {bottombar(W, H, BLACK)}
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".16")

# ---------------------------------------------------------------- 2 · la llave sola (object, no photo)
def g2_llave(W, H):
    st = H == 1920
    sc = 1.75 if st else 1.6
    k = KEY.replace("<b>Experience</b><span>29.10 · Invite only</span>", "<b>CH 02</b><span>Bogotá · 29.10</span>")
    b = f'''
    {topbar(W, H, BLACK, '<span class="tb">Loomlock</span><br>experiences', 'Una llave, muchas puertas<br>One key, many doors')}
    <div class="ab" style="left:{W/2-240}px;top:{H*0.40-150:.0f}px"><div class="kc" style="left:0;top:0;transform:rotate(-9deg) scale({sc});box-shadow:0 60px 90px rgba(11,11,11,.28),0 8px 18px rgba(11,11,11,.18),inset 0 0 0 3px rgba(252,238,33,.55)">{k}</div></div>
    <div class="ab ctr it" style="top:{H*(0.64 if st else 0.66):.0f}px;font-size:{50 if st else 44}px">la puerta 02 es en Bogotá</div>
    <div class="ab ctr t" style="top:{H*(0.64 if st else 0.66)+(80 if st else 70):.0f}px;font-size:16px;opacity:.75">door 02 opens in Bogotá · with Tequila Don Julio</div>
    {bottombar(W, H, BLACK)}
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".12")

# ---------------------------------------------------------------- 3 · lima = señal NFC
def lime_arc(r, thick, cx, cy):
    # a half-lime slice bent as one NFC arc: rind (teal), pith (cream), pulp segments (pale green)
    a0, a1 = -55, 55
    def pt(rad, a):
        return cx + rad * math.cos(math.radians(a)), cy + rad * math.sin(math.radians(a))
    def arc(rad, col, w):
        x0, y0 = pt(rad, a0); x1, y1 = pt(rad, a1)
        return f'<path d="M{x0:.1f} {y0:.1f} A{rad} {rad} 0 0 1 {x1:.1f} {y1:.1f}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'
    s = arc(r, TEAL, thick) + arc(r - thick * 0.32, "#EFE9D9", thick * 0.22) + arc(r - thick * 0.05, "#9CC9A0", thick * 0.42)
    for k in range(7):
        a = a0 + 6 + k * (a1 - a0 - 12) / 6
        xa, ya = pt(r - thick * 0.38, a); xb, yb = pt(r + thick * 0.18, a)
        s += f'<line x1="{xa:.1f}" y1="{ya:.1f}" x2="{xb:.1f}" y2="{yb:.1f}" stroke="#EFE9D9" stroke-width="{thick*0.06:.1f}" stroke-linecap="round"/>'
    return s

def g3_lima(W, H):
    st = H == 1920
    S = 760 if st else 640
    cx, cy = S * 0.18, S * 0.5
    arcs = lime_arc(S * 0.22, S * 0.075, cx, cy) + lime_arc(S * 0.42, S * 0.075, cx, cy) + lime_arc(S * 0.62, S * 0.075, cx, cy)
    dot = f'<circle cx="{cx}" cy="{cy}" r="{S*0.06}" fill="{TEAL}"/>'
    b = f'''
    {topbar(W, H, BLACK, '<span class="tb">Loomlock</span> experiences<br>× <span class="tb">Tequila Don Julio</span>', '<span class="vt" style="font-size:28px">CH 02</span><br>Bogotá · 29.10')}
    <div class="ab" style="left:{(W-S)/2:.0f}px;top:{H*(0.24 if st else 0.17):.0f}px"><svg width="{S}" height="{S}" viewBox="0 0 {S} {S}">{arcs}{dot}</svg></div>
    {RISO_CSS}
    <div class="ab ctr" style="top:{H*(0.24 if st else 0.17)+S+30:.0f}px;font-weight:500;font-size:{120 if st else 100}px;letter-spacing:.38em;margin-left:.38em;line-height:1">TAP IN</div>
    <div class="ab ctr t" style="top:{H*(0.24 if st else 0.17)+S+(190 if st else 160):.0f}px;font-size:17px;line-height:1.7">acerca tu llave · tus apps descansan<br><span style="opacity:.7">tap your key · your apps rest</span></div>
    {bottombar(W, H, BLACK)}
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".14")

# ---------------------------------------------------------------- 4 · brindis en una línea
def g4_brindis(W, H):
    st = H == 1920
    S = 820 if st else 700
    glass = ("M0 0 L18 210 Q20 230 40 230 L160 230 Q180 230 182 210 L200 0")
    liquid = "M12 120 L188 120"
    def g(x, y, rot):
        return (f'<g transform="translate({x} {y}) rotate({rot}) translate(-100 -115)">'
                f'<path d="{glass}" fill="none" stroke="{BLACK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>'
                f'<path d="{liquid}" stroke="{AMBER}" stroke-width="7" stroke-linecap="round"/>'
                f'<path d="M24 128 L176 128 L168 218 Q166 222 160 222 L40 222 Q34 222 32 218 Z" fill="{AMBER}" opacity=".35"/></g>')
    sparks = "".join(f'<line x1="{S/2 + 40*math.cos(math.radians(a)):.0f}" y1="{S*0.30 + 40*math.sin(math.radians(a)):.0f}" x2="{S/2 + 95*math.cos(math.radians(a)):.0f}" y2="{S*0.30 + 95*math.sin(math.radians(a)):.0f}" stroke="{TEAL}" stroke-width="7" stroke-linecap="round"/>' for a in [-150, -120, -90, -60, -30])
    b = f'''
    {topbar(W, H, BLACK, '<span class="tb">Loomlock</span> y <span class="tb">Tequila Don Julio</span><br>te invitan', 'Jueves 29.10<br>Resto Bar Bikinis')}
    <div class="ab" style="left:{(W-S)/2:.0f}px;top:{H*(0.26 if st else 0.2):.0f}px"><svg width="{S}" height="{S*0.8:.0f}" viewBox="0 0 {S} {S*0.8:.0f}">{sparks}{g(S/2-132, S*0.47, 14)}{g(S/2+132, S*0.47, -14)}</svg></div>
    <div class="ab ctr" style="top:{H*(0.26 if st else 0.2)+S*0.8+20:.0f}px;font-family:'League Gothic';font-size:{230 if st else 190}px;line-height:.9">SALUD.</div>
    <div class="ab ctr t" style="top:{H*(0.26 if st else 0.2)+S*0.8+(240 if st else 200):.0f}px;font-size:17px;line-height:1.7">por la gente que tienes al frente<br><span style="opacity:.7">to the people in front of you</span></div>
    {bottombar(W, H, BLACK)}
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".12")

# ---------------------------------------------------------------- 5 · carta de ajuste CH 02 (TV test card)
def g5_carta(W, H):
    st = H == 1920
    bars = [CREAM, "#E8D9A8", TEAL2, "#8FB8A0", AMBER, "#C46B5B", LLBLUE]
    top, bh = (H * 0.2, H * 0.42) if st else (H * 0.16, H * 0.46)
    bw = W / len(bars)
    bs = "".join(f'<div class="ab" style="left:{i*bw:.1f}px;top:{top:.0f}px;width:{bw+1:.1f}px;height:{bh:.0f}px;background:{c}"></div>' for i, c in enumerate(bars))
    inv = [LLBLUE, BLACK, AMBER, BLACK, TEAL2, BLACK, CREAM]
    bs += "".join(f'<div class="ab" style="left:{i*bw:.1f}px;top:{top+bh:.0f}px;width:{bw+1:.1f}px;height:{H*0.05:.0f}px;background:{c}"></div>' for i, c in enumerate(inv))
    pl = [BLACK, "#1a1a1a", "#262626", TEAL, BLACK]
    bs += "".join(f'<div class="ab" style="left:{i*W/5:.1f}px;top:{top+bh+H*0.05:.0f}px;width:{W/5+1:.1f}px;height:{H*0.08:.0f}px;background:{c}"></div>' for i, c in enumerate(pl))
    cr = 190 if st else 160
    b = f'''
    {bs}
    <div class="ab" style="left:{W/2-cr}px;top:{top+bh/2-cr:.0f}px;width:{2*cr}px;height:{2*cr}px;border-radius:50%;background:{BLACK};color:{CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-shadow:0 0 0 10px {CREAM}">
      <div class="vt" style="font-size:{cr*0.62:.0f}px;line-height:.9">CH 02</div><div class="t" style="font-size:15px">Bogotá · GMT−5</div></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 50}px;color:{CREAM}"><div>{ident(14)}</div><div style="text-align:right">Prueba de señal<br>Signal test</div></div>
    <div class="ab ctr it" style="top:{top+bh+H*0.13+40:.0f}px;color:{CREAM};font-size:{46 if st else 40}px">en vivo el 29.10. sin transmisión.</div>
    <div class="ab ctr t" style="top:{top+bh+H*0.13+(115 if st else 100):.0f}px;color:{CREAM};font-size:16px;opacity:.75">live on 29.10 · no broadcast</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:{CREAM};font-size:15px;align-items:center"><span>A loomlock project</span>{lock("white", 16, 38)}</div>
    {legal(H, st, CREAM, .6)}'''
    return P(W, H, b, BLACK, CREAM, ".14", "screen")

# ---------------------------------------------------------------- 6 · globo: una red, muchas ciudades
def g6_globo(W, H):
    st = H == 1920
    R = 400 if st else 330
    cx, cy = W / 2, H * (0.42 if st else 0.42)
    lines = ""
    for k in range(-60, 61, 20):  # parallels
        ry = R * math.cos(math.radians(k)) * 0.22
        y = cy - R * math.sin(math.radians(k)) * 0.97
        rx = R * math.cos(math.radians(k))
        lines += f'<ellipse cx="{cx}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="none" stroke="{CREAM}" stroke-opacity=".28" stroke-width="2"/>'
    for k in range(0, 180, 22):  # meridians
        rx = R * abs(math.cos(math.radians(k)))
        lines += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx:.1f}" ry="{R}" fill="none" stroke="{CREAM}" stroke-opacity=".28" stroke-width="2"/>'
    bx, by = cx - R * 0.42, cy + R * 0.12
    mx, my = cx - R * 0.44, cy + R * 0.06
    pts = (f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="16" fill="{TEAL2}"/>'
           + "".join(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{r}" fill="none" stroke="{TEAL2}" stroke-opacity="{o}" stroke-width="3"/>' for r, o in [(40, .8), (70, .45), (105, .2)])
           + f'<circle cx="{mx:.1f}" cy="{my-34:.1f}" r="9" fill="none" stroke="{CREAM}" stroke-opacity=".6" stroke-width="3"/>'
           + f'<circle cx="{cx+R*0.35:.1f}" cy="{cy-R*0.3:.1f}" r="9" fill="none" stroke="{CREAM}" stroke-opacity=".35" stroke-width="3"/>'
           + f'<circle cx="{cx+R*0.1:.1f}" cy="{cy-R*0.45:.1f}" r="9" fill="none" stroke="{CREAM}" stroke-opacity=".35" stroke-width="3"/>')
    label = (f'<div class="ab mono" style="left:{bx+60:.0f}px;top:{by+30:.0f}px;color:{TEAL2};font-size:22px;line-height:1.25">CH 02 · BOGOTÁ<br>4°39′N 74°03′W<br>EN VIVO 29.10</div>')
    b = f'''
    <svg class="ab" style="left:0;top:0" width="{W}" height="{H}"><circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{CREAM}" stroke-opacity=".6" stroke-width="2.5"/>{lines}{pts}</svg>
    {label}
    {topbar(W, H, CREAM, '<span class="tb">Loomlock</span><br>experiences', 'Una red, muchas ciudades<br>One network, many cities')}
    <div class="ab ctr it" style="top:{cy+R+(90 if st else 60):.0f}px;color:{CREAM};font-size:{50 if st else 42}px">una regla, todas las ciudades</div>
    <div class="ab ctr t" style="top:{cy+R+(170 if st else 130):.0f}px;color:{CREAM};font-size:16px;opacity:.75">el celular se queda contigo · your phone stays with you</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 150)}px;color:{CREAM};font-size:15px;align-items:center">{ident(14)}{lock("white", 16, 38)}</div>
    {legal(H, st, CREAM, .6)}'''
    return P(W, H, b, "#0E2F36", CREAM, ".2", "overlay")

PIECES = {}
for n, f in [("g1-agave", g1_agave), ("g2-llave", g2_llave), ("g3-lima", g3_lima), ("g4-brindis", g4_brindis), ("g5-carta", g5_carta), ("g6-globo", g6_globo)]:
    PIECES[f"djg-{n}-story"] = (lambda f=f: f(1080, 1920))
    PIECES[f"djg-{n}-feed"] = (lambda f=f: f(1080, 1350))
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
