"""CH 02 · Tequila Don Julio — out-of-the-classic directions (no photos): departures board, bar receipt, Win98 dialogs,
ASCII, acid rave graphics, 1-bit dithered key. Loomlock ident + global layer + Colombian legal on all."""
import sys, pathlib, html
import build
from build_ch02m import P, lock, ident, LEGAL, GEO, LLBLUE, CREAM, BLACK, TEAL, TEAL2

YEL = "#FCCE21"
HERE = pathlib.Path(__file__).parent

def legal(H, st, color, op=.7, size=13):
    return f'<div class="ab ctr" style="top:{H-(150 if st else 64)}px;color:{color};opacity:{op};font-size:{size}px">{LEGAL}</div>'

# ---------------------------------------------------------------- X1 · tablero de salidas
def flap(text, n, fs, color=YEL, bg="#1b1b1b"):
    text = text.ljust(n)[:n]
    return "".join(f'<span style="display:inline-block;width:{fs*0.78:.0f}px;height:{fs*1.3:.0f}px;margin-right:4px;background:{bg};color:{color};'
                   f'text-align:center;line-height:{fs*1.3:.0f}px;font-family:\'Space Mono\',monospace;font-weight:700;font-size:{fs}px;position:relative;'
                   f'box-shadow:inset 0 -{fs*0.65:.0f}px 0 rgba(255,255,255,.03)">{html.escape(c) if c != " " else "&nbsp;"}'
                   f'<span style="position:absolute;left:0;right:0;top:50%;height:2px;background:#000"></span></span>' for c in text)

def x1_salidas(W, H):
    st = H == 1920
    fs = 44 if st else 31
    rows = [("29.10", "CH02", "BOGOTA", "EMBARCANDO", True), ("12.11", "CH03", "MEDELLIN", "PROGRAMADO", False),
            ("21.11", "CH04", "MEDELLIN", "PROGRAMADO", False), ("27.11", "CH05", "ROOFTOP", "PROGRAMADO", False)]
    y0 = 560 if st else 290
    out = ""
    for i, (d, c, dest, est, on) in enumerate(rows):
        col = YEL if on else "#d8d8d8"
        out += (f'<div class="ab" style="left:44px;top:{y0 + i*(fs*1.3+26):.0f}px;white-space:nowrap">'
                f'{flap(d, 5, fs, col)}<span style="display:inline-block;width:16px"></span>{flap(c, 4, fs, col)}<span style="display:inline-block;width:16px"></span>'
                f'{flap(dest, 8, fs, col)}</div>'
                f'<div class="ab mono" style="right:44px;top:{y0 + i*(fs*1.3+26) + fs*0.25:.0f}px;font-size:{fs*0.62:.0f}px;color:{"#FF3B3B" if on else "#7a7a7a"}">{est}</div>')
    hdr = (f'<div class="ab sp mono" style="left:44px;right:44px;top:{y0-70}px;font-size:18px;color:#8a8a8a"><span>FECHA&nbsp;&nbsp;&nbsp;CANAL&nbsp;&nbsp;DESTINO</span><span>ESTADO</span></div>')
    yb = y0 + 4 * (fs * 1.3 + 26) + 60
    b = f'''
    <div class="ab sp t" style="left:44px;right:44px;top:{120 if st else 56}px;color:#fff"><div style="font-size:{34 if st else 30}px;letter-spacing:.04em">Salidas<br><span style="opacity:.6">Departures</span></div><div style="text-align:right">{ident(15)}</div></div>
    {hdr}{out}
    <div class="ab" style="left:44px;right:44px;top:{yb:.0f}px;border-top:2px solid #333"></div>
    <div class="ab mono" style="left:44px;right:44px;top:{yb+34:.0f}px;font-size:{32 if st else 22}px;color:#fff;line-height:1.5">PUERTA 02 · RESTO BAR BIKINIS<br>EQUIPAJE DE MANO: TU CELULAR<br><span style="color:{YEL}">TUS APPS VIAJAN EN BODEGA.</span></div>
    <div class="ab mono" style="left:44px;right:44px;top:{yb+(270 if st else 190):.0f}px;font-size:18px;color:#8a8a8a">carry-on: your phone · your apps fly in the hold · {GEO}</div>
    <div class="ab sp t" style="left:44px;right:44px;top:{H-(250 if st else 135)}px;color:#fff;font-size:15px;align-items:center"><span>Tequila Don Julio · solo +18</span>{lock("white", 16, 38)}</div>
    {legal(H, st, "#fff", .55)}'''
    return P(W, H, b, "#0d0d0d", "#fff", ".1", "screen")

# ---------------------------------------------------------------- X2 · ticket de barra
def x2_ticket(W, H):
    st = H == 1920
    fs = 25 if st else 21
    lines = [("RESTO BAR BIKINIS", "c"), ("CRA 6 # 58-48 · BOGOTA", "c"), ("LOOMLOCK EXPERIENCES · CH 02", "c"), ("29/10/26  GMT-5", "c"), ("-" * 30, "c"),
             ("1 TEQUILA DON JULIO BLANCO", "l"), ("1 GENTE AL FRENTE", "l"), ("1 CONVERSACION LARGA", "l"), ("-" * 30, "c"),
             ("APPS EN PAUSA", "l"), ("   INSTAGRAM ........ 0 MIN", "l"), ("   TIKTOK ........... 0 MIN", "l"), ("   WHATSAPP ......... 0 MIN", "l"),
             ("NOTIFICACIONES ....... 0", "l"), ("FOTOS PUBLICADAS ..... 0", "l"), ("-" * 30, "c"), ("TOTAL: UNA NOCHE", "c"), ("GRACIAS POR NO POSTEAR", "c"), ("THANKS FOR NOT POSTING", "c")]
    txt = "".join(f'<div style="text-align:{"center" if a=="c" else "left"};white-space:pre">{html.escape(t)}</div>' for t, a in lines)
    bars = "".join(f'<span style="display:inline-block;width:{w}px;height:70px;background:#111;margin-right:{m}px"></span>' for w, m in zip([3,6,2,4,7,2,3,5,2,6,3,2,4,6,2,3,7,2,5,3,2,6,4,2,3], [3,2,4,2,3,5,2,3,4,2,3,5,2,3,4,2,3,2,4,3,5,2,3,2,3]))
    tw = 620 if st else 560
    b = f'''
    <div class="ab" style="left:{(W-tw)/2:.0f}px;top:{90 if st else 40}px;width:{tw}px;padding:46px 34px 40px;background:#f7f5ef;color:#151515;transform:rotate(-2deg);
      box-shadow:0 30px 60px rgba(0,0,0,.35);font-family:'Space Mono',monospace;font-size:{fs}px;line-height:1.45;
      -webkit-mask:linear-gradient(#000,#000) top/100% calc(100% - 14px) no-repeat, radial-gradient(circle at 10px 100%,transparent 9px,#000 10px) bottom/20px 14px repeat-x">
      {txt}<div style="text-align:center;margin-top:22px">{bars}</div><div style="text-align:center;font-size:{fs*0.7:.0f}px;margin-top:6px">CH02 2910 4°39′N 74°03′W</div></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;color:{CREAM};font-size:15px;align-items:center">{ident(14)}{lock("white", 16, 38)}</div>
    {legal(H, st, CREAM, .7)}'''
    return P(W, H, b, TEAL, CREAM, ".2", "overlay")

# ---------------------------------------------------------------- X3 · ventanas Windows 98
def win(x, y, w, title, body, buttons, z=1, icon="⚠"):
    btns = "".join(f'<span style="display:inline-block;min-width:120px;padding:8px 18px;margin-left:12px;background:#c3c3c3;border:2px solid;border-color:#fff #404040 #404040 #fff;font-size:22px;text-align:center">{b}</span>' for b in buttons)
    return (f'<div class="ab" style="left:{x}px;top:{y}px;width:{w}px;z-index:{z};background:#c3c3c3;border:3px solid;border-color:#fff #404040 #404040 #fff;box-shadow:6px 6px 0 rgba(0,0,0,.35);font-family:Tahoma,Verdana,sans-serif;color:#111">'
            f'<div style="background:linear-gradient(90deg,#0b1b8c,{LLBLUE});color:#fff;font-weight:700;font-size:21px;padding:6px 10px;display:flex;justify-content:space-between"><span>{title}</span><span>✕</span></div>'
            f'<div style="display:flex;gap:18px;padding:22px 22px 10px;font-size:24px;line-height:1.35"><span style="font-size:44px;line-height:1">{icon}</span><div>{body}</div></div>'
            f'<div style="text-align:right;padding:10px 22px 20px">{btns}</div></div>')

def x3_windows(W, H):
    st = H == 1920
    s = 1 if st else .78
    b = f'''
    {win(60, int(250*s), 900, "loomlock.exe — CH 02", "¿Pausar Instagram, TikTok y WhatsApp<br>hasta que salgas de Bikinis?", ["Sí", "Sí, obvio"], 1, "🔑")}
    {win(130, int(620*s), 860, "feed.exe", "feed.exe dejó de responder.<br><span style='font-size:19px;opacity:.75'>feed.exe has stopped responding.</span>", ["Cerrar programa"], 2, "⛔")}
    {win(40, int(950*s), 920, "Tequila Don Julio", "Hay gente al frente tuyo.<br>¿Brindar ahora?", ["Salud", "Salud"], 3, "🥃")}
    {win(160, int(1290*s), 820, "Sistema · Bogotá GMT−5", "Una regla, todas las ciudades:<br>el celular se queda contigo.", ["Aceptar"], 4, "🌐")}
    <div class="ab" style="left:60px;top:{120 if st else 50}px;z-index:5">{ident(15)}</div>
    <div class="ab mono" style="right:60px;top:{126 if st else 56}px;color:#fff;font-size:20px;z-index:5">29.10.26</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;color:#fff;font-size:15px;align-items:center;z-index:5"><span>A loomlock project</span>{lock("white", 16, 38)}</div>
    {legal(H, st, "#fff", .75)}'''
    return P(W, H, b, "#008080", "#fff", ".1", "overlay")

# ---------------------------------------------------------------- X4 · ASCII
def x4_ascii(W, H):
    st = H == 1920
    art = html.escape((HERE / "assets" / "dj" / "ascii_toast.txt").read_text())
    banner = r""" ___   _   _    _   _ ___
/ __| /_\ | |  | | | |   \
\__ \/ _ \| |__| |_| | |) |
|___/_/ \_\____|\___/|___/ """
    b = f'''
    <div class="ab mono" style="left:60px;right:60px;top:{120 if st else 50}px;font-size:{20 if st else 18}px;color:{TEAL2};line-height:1.4">$ loomlock tap --canal 02 --ciudad bogota<br>&gt; instagram ...... pausado<br>&gt; tiktok ......... pausado<br>&gt; whatsapp ....... pausado<br>&gt; gente al frente  <span style="color:#fff">ENCENDIDA</span></div>
    <pre class="ab" style="left:0;right:0;top:{H*(0.27 if st else 0.25):.0f}px;margin:0;text-align:center;font-family:'Space Mono',monospace;font-size:{14 if st else 11}px;line-height:1.05;color:#e9e1d8">{art}</pre>
    <pre class="ab" style="left:0;right:0;top:{H*(0.27 if st else 0.25)+(560 if st else 490):.0f}px;margin:0;text-align:center;font-family:'Space Mono',monospace;font-size:{40 if st else 34}px;line-height:1.05;color:{YEL}">{html.escape(banner)}</pre>
    <div class="ab ctr mono" style="top:{H*(0.27 if st else 0.25)+(800 if st else 690):.0f}px;font-size:20px;color:#e9e1d8;line-height:1.5">por la gente que tienes al frente<br><span style="opacity:.6">to the people in front of you</span></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;color:#fff;font-size:15px;align-items:center">{ident(14)}<span class="mono" style="font-size:16px">{GEO}</span></div>
    {legal(H, st, "#fff", .55)}'''
    return P(W, H, b, "#050505", "#fff", ".12", "screen")

# ---------------------------------------------------------------- X5 · gráfica ácida (Designers Republic / rave 90s)
def x5_acido(W, H):
    st = H == 1920
    stars = "".join(f'<svg class="ab" style="left:{x}px;top:{y}px" width="{s}" height="{s}" viewBox="-10 -10 20 20"><path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2Z" fill="{c}"/></svg>'
                    for x, y, s, c in [(80, 380, 70, YEL), (900, 520, 50, "#fff"), (140, 1180 if st else 900, 90, "#fff"), (860, 1300 if st else 980, 60, YEL), (520, 300, 36, "#fff")])
    spec = ("CH—02 / BGT / 4°39′N 74°03′W / GMT−5 / 29.10.26 / TQL-DJ-BLANCO / APPS:OFF / PEOPLE:ON / "
            "ONE RULE EVERY CITY / UNA REGLA TODAS LAS CIUDADES / LLX-0002 / ") * 3
    b = f'''
    <div class="ab" style="inset:0;background:radial-gradient(60% 40% at 30% 30%,{LLBLUE},rgba(0,0,0,0) 70%),radial-gradient(50% 40% at 75% 70%,{TEAL},rgba(0,0,0,0) 70%)"></div>
    {stars}
    <div class="ab ctr" style="top:{H*0.2:.0f}px;font-family:'League Gothic';font-size:{520 if st else 430}px;line-height:.8;color:#fff;transform:scaleX(1.25) scaleY(1.35);transform-origin:50% 0">CH02</div>
    <div class="ab mono" style="left:60px;right:60px;top:{H*(0.62 if st else 0.66):.0f}px;font-size:15px;line-height:1.5;color:{YEL};word-break:break-all">{spec}</div>
    <div class="ab" style="left:60px;top:{H*(0.62 if st else 0.66)+(180 if st else 150):.0f}px;width:230px;height:60px;background:repeating-linear-gradient(90deg,#fff 0 3px,transparent 3px 6px,#fff 6px 10px,transparent 10px 12px)"></div>
    <div class="ab mono" style="right:60px;top:{H*(0.62 if st else 0.66)+(180 if st else 150):.0f}px;text-align:right;color:#fff;font-size:22px;line-height:1.35">APPS OFF<br>PEOPLE ON<br>SALUD</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{120 if st else 50}px;color:#fff;font-size:16px">{ident(14)}<span>Resto Bar Bikinis</span></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;color:#fff;font-size:15px;align-items:center"><span>Tequila Don Julio · solo +18</span>{lock("white", 16, 38)}</div>
    {legal(H, st, "#fff", .65)}'''
    return P(W, H, b, "#070712", "#fff", ".18", "overlay")

# ---------------------------------------------------------------- X6 · llave 1-bit
def x6_bits(W, H):
    st = H == 1920
    kw = 1000 if st else 900
    b = f'''
    <div class="ab" style="left:{(W-kw)/2:.0f}px;top:{H*(0.2 if st else 0.13):.0f}px;width:{kw}px;height:{kw*0.77:.0f}px;background:url(assets/dj/key_dither.png) center/contain no-repeat;image-rendering:pixelated"></div>
    <div class="ab ctr mono" style="top:{H*(0.2 if st else 0.13)+kw*0.77+30:.0f}px;font-size:{64 if st else 56}px;font-weight:700;letter-spacing:.3em;margin-left:.3em;color:{TEAL}">PRESS TAP</div>
    <div class="ab ctr mono" style="top:{H*(0.2 if st else 0.13)+kw*0.77+(130 if st else 115):.0f}px;font-size:20px;line-height:1.6">1 jugador · 70 cupos · solo +18<br>nivel 02: bogotá · 29.10<br><span style="opacity:.65">player 1 · level 02 · apps paused</span></div>
    <div class="ab sp mono" style="left:60px;right:60px;top:{120 if st else 50}px;font-size:20px"><span>LOOMLOCK<br>EXPERIENCES</span><span style="text-align:right">HI-SCORE<br>0 NOTIFICACIONES</span></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(250 if st else 115)}px;font-size:15px;align-items:center">{ident(14)}{lock("black", 16, 38)}</div>
    {legal(H, st, BLACK)}'''
    return P(W, H, b, CREAM, BLACK, ".1")

PIECES = {}
for n, f in [("x1-salidas", x1_salidas), ("x2-ticket", x2_ticket), ("x3-windows", x3_windows), ("x4-ascii", x4_ascii), ("x5-acido", x5_acido), ("x6-bits", x6_bits)]:
    PIECES[f"djx-{n}-story"] = (lambda f=f: f(1080, 1920))
    PIECES[f"djx-{n}-feed"] = (lambda f=f: f(1080, 1350))
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
