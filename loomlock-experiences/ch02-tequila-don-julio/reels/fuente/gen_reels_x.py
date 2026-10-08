"""CH 02 · Tequila Don Julio — reels for the six out-of-the-classic directions (no photos), own music.
x1 salidas (afro) · x2 ticket (garage) · x3 windows (techno) · x4 ascii (techno) · x5 ácido (techno) · x6 1-bit (techno)."""
import shutil, pathlib, random, html
import gen_reels as g
from gen_reels_m import EXTRA, IDENT, GEO

LEGAL = g.LEGAL
MUS = pathlib.Path("/home/user/Skills/video-tap-in/locked-in/musica")
YEL, TEAL, TEAL2, CREAM, BLUE = "#FCCE21", "#0B5A6A", "#5FB1C1", "#E9E1D8", "#3F49CC"
random.seed(29)
XX = EXTRA + """
.mt{font-family:"Space Mono",monospace;text-transform:uppercase;letter-spacing:.03em}
.ctrm{position:absolute;left:0;right:0;text-align:center}
.cell{display:inline-block;position:relative;background:#1b1b1b;margin-right:5px;text-align:center;font-family:"Space Mono",monospace;font-weight:700;overflow:hidden;vertical-align:top}
.cell span{position:absolute;left:0;right:0;top:0;opacity:0}
.cell i{position:absolute;left:0;right:0;top:50%;height:2px;background:#000}
.win{position:absolute;background:#c3c3c3;border:3px solid;border-color:#fff #404040 #404040 #fff;box-shadow:6px 6px 0 rgba(0,0,0,.35);font-family:Tahoma,Verdana,sans-serif;color:#111;opacity:0}
.win .tb2{background:linear-gradient(90deg,#0b1b8c,#3F49CC);color:#fff;font-weight:700;font-size:22px;padding:6px 10px;display:flex;justify-content:space-between}
.win .bd{display:flex;gap:18px;padding:22px 22px 10px;font-size:26px;line-height:1.35}
.win .bt{text-align:right;padding:10px 22px 20px}
.win .bt span{display:inline-block;min-width:130px;padding:8px 18px;margin-left:12px;background:#c3c3c3;border:2px solid;border-color:#fff #404040 #404040 #fff;font-size:23px;text-align:center}
"""

def endc(eid, t0, bg, fg, sub, lockc="white"):
    h = f'''<div id="{eid}" class="layer" style="background:{bg};color:{fg}">
  <div class="ctrm" style="top:120px">{IDENT}</div>
  <div class="ctrm" style="top:620px">{g.lock(lockc, 28, 70)}</div>
  <div class="ctrm mt w" id="{eid}1" style="top:820px;font-size:44px;line-height:1.35">29.10 · Resto Bar Bikinis<br>Bogotá · GMT−5</div>
  <div class="ctrm mt w" id="{eid}2" style="top:1020px;font-size:22px;opacity:.85">{sub}</div>
  <div class="ctrm mt w" id="{eid}3" style="top:1400px;font-size:22px;letter-spacing:.12em">una regla, todas las ciudades<br><span style="opacity:.65">one rule, every city</span></div>
  <div class="ctrm mt w" id="{eid}4" style="top:1560px;font-size:18px;opacity:.75">70 cupos · solo +18 · a loomlock project</div>
  <div class="foot" style="color:{fg};opacity:.7">{LEGAL}</div>
</div>'''
    js = (f'tl.set("#{eid}", {{ opacity: 1 }}, {t0});\n' + "".join(f'tl.fromTo("#{eid}{i}", {{ opacity: 0 }}, {{ opacity: 1, duration: .3 }}, {t0 + .15 + i*.3:.2f});\n' for i in range(1, 5)))
    return h, js

def fade(sel, t, d=.3):
    return f'tl.fromTo("{sel}", {{ opacity: 0 }}, {{ opacity: 1, duration: {d} }}, {t:.2f});\n'

# ---------------------------------------------------------------- X1 · tablero de salidas (12 s, afro)
def x1():
    dur = 12.0
    fs = 44
    rows = [("29.10 CH02 BOGOTA  ", "EMBARCANDO", True), ("12.11 CH03 MEDELLIN", "PROGRAMADO", False),
            ("21.11 CH04 MEDELLIN", "PROGRAMADO", False), ("27.11 CH05 ROOFTOP ", "PROGRAMADO", False)]
    alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    body, js = "", ""
    y0 = 560
    for r, (txt, est, on) in enumerate(rows):
        col = YEL if on else "#d8d8d8"
        cells = ""
        for c, ch in enumerate(txt):
            spans = "".join(f'<span id="f{r}_{c}_{k}">{random.choice(alpha)}</span>' for k in range(3))
            fin = html.escape(ch) if ch != " " else "&nbsp;"
            cells += (f'<span class="cell" style="width:{fs*0.78:.0f}px;height:{fs*1.3:.0f}px;line-height:{fs*1.3:.0f}px;font-size:{fs}px;color:{col}">'
                      f'{spans}<span id="f{r}_{c}_F">{fin}</span><i></i></span>')
            t = 0.7 + r * 0.48 + c * 0.03
            for k in range(3):
                js += f'tl.set("#f{r}_{c}_{k}", {{ opacity: 1 }}, {t + k*0.07:.2f}); tl.set("#f{r}_{c}_{k}", {{ opacity: 0 }}, {t + (k+1)*0.07:.2f});\n'
            js += f'tl.set("#f{r}_{c}_F", {{ opacity: 1 }}, {t + 0.21:.2f});\n'
        body += f'<div class="ab" style="left:40px;top:{y0 + r*(fs*1.3+28):.0f}px;white-space:nowrap">{cells}</div>'
        body += f'<div class="ab mt w" id="st{r}" style="right:40px;top:{y0 + r*(fs*1.3+28) + 12:.0f}px;font-size:26px;color:{"#FF3B3B" if on else "#7a7a7a"}">{est}</div>'
        js += fade(f"#st{r}", 1.4 + r * 0.48)
    js += "".join(f'tl.set("#st0", {{ opacity: {0.25 if k%2 else 1} }}, {4.32 + k*0.24:.2f});\n' for k in range(12))
    yb = y0 + 4 * (fs * 1.3 + 28) + 60
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:#0d0d0d;color:#fff">
  <div class="ab" style="left:40px;top:120px;font-weight:600;font-size:40px;line-height:1.2">Salidas<br><span style="opacity:.55">Departures</span></div>
  <div class="ab" style="right:40px;top:126px">{IDENT}</div>
  <div class="ab sp mt" style="left:40px;right:40px;top:{y0-60}px;font-size:20px;color:#8a8a8a"><span>fecha · canal · destino</span><span>estado</span></div>
  {body}
  <div class="ab" style="left:40px;right:40px;top:{yb:.0f}px;border-top:2px solid #333"></div>
  <div class="ab mt w" id="b1" style="left:40px;top:{yb+40:.0f}px;font-size:34px">Puerta 02 · Resto Bar Bikinis</div>
  <div class="ab mt w" id="b2" style="left:40px;top:{yb+100:.0f}px;font-size:34px">Equipaje de mano: tu celular</div>
  <div class="ab mt w" id="b3" style="left:40px;top:{yb+160:.0f}px;font-size:34px;color:{YEL}">Tus apps viajan en bodega.</div>
  <div class="ab mt w" id="b4" style="left:40px;top:{yb+240:.0f}px;font-size:19px;color:#8a8a8a">your apps fly in the hold · {GEO}</div>
</div>
'''
    js += fade("#b1", 5.04) + fade("#b2", 6.0) + 'tl.set("#b3", { opacity: 1 }, 7.2); flash(7.2, .25, .15);\n' + fade("#b4", 7.8)
    e, ej = endc("en", 9.6, "#0d0d0d", "#fff", "embarque: tap en el tótem · boarding: tap in")
    js += 'tl.set("#sA", { opacity: 0 }, 9.6);\n' + ej
    return dur, html_ + e, js, 0.0, XX

# ---------------------------------------------------------------- X2 · ticket (12 s, garage)
def x2():
    dur = 12.0
    lines = ["RESTO BAR BIKINIS", "CRA 6 # 58-48 · BOGOTA", "LOOMLOCK EXPERIENCES · CH 02", "29/10/26  GMT-5", "-" * 28,
             "1 TEQUILA DON JULIO BLANCO", "1 GENTE AL FRENTE", "1 CONVERSACION LARGA", "-" * 28, "APPS EN PAUSA",
             "  INSTAGRAM ....... 0 MIN", "  TIKTOK .......... 0 MIN", "  WHATSAPP ........ 0 MIN", "NOTIFICACIONES ...... 0",
             "FOTOS PUBLICADAS .... 0", "-" * 28, "TOTAL: UNA NOCHE"]
    lh = 46
    txt = "".join(f'<div style="height:{lh}px;white-space:pre;text-align:{"center" if i < 4 or l.startswith("-") or l.startswith("TOTAL") else "left"}">{html.escape(l)}</div>' for i, l in enumerate(lines))
    th = len(lines) * lh + 80
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:{TEAL};color:{CREAM}">
  <div class="ab" style="left:120px;right:120px;top:300px;height:26px;background:#0b0b0b;border-radius:13px;z-index:5"></div>
  <div class="ab" id="clip" style="left:110px;right:110px;top:313px;height:0;overflow:hidden">
    <div id="tk" class="ab" style="left:0;right:0;top:0;padding:40px 30px;background:#f7f5ef;color:#151515;font-family:'Space Mono',monospace;font-size:31px;box-shadow:0 20px 40px rgba(0,0,0,.3)">{txt}</div>
  </div>
  <div id="stamp" class="ab mt" style="left:170px;top:{313+th-300}px;padding:14px 26px;border:6px solid #c0392b;color:#c0392b;font-size:40px;font-weight:700;transform:rotate(-12deg);opacity:0;z-index:6;background:rgba(247,245,239,.4)">gracias por<br>no postear</div>
  <div class="ab" style="left:60px;top:120px">{IDENT}</div>
  <div class="ab mt" style="right:60px;top:126px;font-size:20px">la barra · ch 02</div>
  <div class="ctrm mt w" id="tk2" style="top:{313+th+90}px;font-size:22px">thanks for not posting · {GEO}</div>
</div>
'''
    js = 'tl.set("#clip", { height: 0 }, 0);\n'
    for i in range(len(lines) + 2):
        js += f'tl.to("#clip", {{ height: {(i+1)*(th/(len(lines)+2)):.0f}, duration: .1, ease: "steps(3)" }}, {0.4 + i*0.36:.2f});\n'
    js += 'tl.set("#stamp", { opacity: 1 }, 7.2); tl.fromTo("#stamp", { scale: 2.2 }, { scale: 1, duration: .14, ease: "power4.in" }, 7.2); flash(7.34, .3, .12);\n'
    js += fade("#tk2", 8.0)
    e, ej = endc("en", 9.6, TEAL, CREAM, "1 tequila don julio blanco · 1 gente al frente")
    js += 'tl.set("#sA", { opacity: 0 }, 9.6);\n' + ej
    return dur, html_ + e, js, 0.0, XX

# ---------------------------------------------------------------- X3 · windows (11 s, techno)
def win(wid, x, y, w, title, body, buttons, icon, z):
    b = "".join(f'<span id="{wid}b{i}">{t}</span>' for i, t in enumerate(buttons))
    return (f'<div class="win" id="{wid}" style="left:{x}px;top:{y}px;width:{w}px;z-index:{z}"><div class="tb2"><span>{title}</span><span>✕</span></div>'
            f'<div class="bd"><span style="font-size:46px;line-height:1">{icon}</span><div>{body}</div></div><div class="bt">{b}</div></div>')

def x3():
    dur = 11.0
    wins = win("w1", 60, 320, 920, "loomlock.exe — CH 02", "¿Pausar Instagram, TikTok y WhatsApp<br>hasta que salgas de Bikinis?", ["Sí", "Sí, obvio"], "🔑", 10)
    wins += win("w2", 130, 700, 860, "feed.exe", "feed.exe dejó de responder.<br><span style='font-size:20px;opacity:.75'>feed.exe has stopped responding.</span>", ["Cerrar programa"], "⛔", 11)
    wins += win("w3", 40, 1060, 920, "Tequila Don Julio", "Hay gente al frente tuyo.<br>¿Brindar ahora?", ["Salud", "Salud"], "🥃", 12)
    casc = "".join(win(f"c{i}", 40 + i*36, 240 + i*70, 760, "feed.exe", "feed.exe dejó de responder.", ["OK"], "⛔", 20 + i) for i in range(14))
    final = win("w9", 110, 820, 860, "Sistema · Bogotá GMT−5", "Una regla, todas las ciudades:<br>el celular se queda contigo.", ["Aceptar"], "🌐", 60)
    cursor = ('<svg id="cur" class="ab" style="left:0;top:0;z-index:80" width="44" height="60" viewBox="0 0 12 17"><path d="M0 0 L0 14 L3.5 10.5 L6 16 L8 15 L5.6 9.8 L10 9.8 Z" fill="#fff" stroke="#000" stroke-width="1"/></svg>')
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:#008080;color:#fff">
  <div class="ab" style="left:60px;top:120px;z-index:90">{IDENT}</div>
  <div class="ab mt" style="right:60px;top:126px;font-size:22px;z-index:90">29.10.26</div>
  {wins}{casc}{final}{cursor}
  <div class="ab" style="left:0;right:0;bottom:0;height:64px;background:#c3c3c3;border-top:3px solid #fff;z-index:85;display:flex;align-items:center;gap:14px;padding-left:14px;color:#111;font-family:Tahoma,sans-serif;font-size:22px">
    <span style="padding:6px 14px;border:2px solid;border-color:#fff #404040 #404040 #fff;font-weight:700">Inicio</span><span>loomlock.exe</span><span style="margin-left:auto;margin-right:20px">23:47</span></div>
</div>
'''
    js = fade("#w1", .4, .05)
    js += 'tl.fromTo("#cur", { x: 900, y: 1500 }, { x: 760, y: 560, duration: .8, ease: "power2.inOut" }, .6);\n'
    js += 'tl.set("#w1b1", { borderColor: "#404040 #fff #fff #404040" }, 1.45); tl.set("#w1b1", { borderColor: "#fff #404040 #404040 #fff" }, 1.6);\n'
    js += fade("#w2", 2.16, .05) + 'tl.fromTo("#w2", { x: -8 }, { x: 8, duration: .05, repeat: 5, yoyo: true }, 2.2);\n'
    js += fade("#w3", 3.12, .05)
    js += 'tl.to("#cur", { x: 690, y: 1270, duration: .5, ease: "power2.inOut" }, 3.4);\n'
    js += 'tl.set("#w3b1", { borderColor: "#404040 #fff #fff #404040" }, 4.0); tl.set("#w3b1", { borderColor: "#fff #404040 #404040 #fff" }, 4.12);\n'
    js += "".join(f'tl.set("#c{i}", {{ opacity: 1 }}, {4.32 + i*0.12:.2f});\n' for i in range(14))
    js += 'flash(4.32, .3, .1);\n'
    js += 'tl.set(["#w1","#w2","#w3"' + "".join(f',"#c{i}"' for i in range(14)) + '], { opacity: 0 }, 6.24);\n'
    js += fade("#w9", 6.48, .05) + 'tl.to("#cur", { x: 860, y: 1010, duration: .5, ease: "power2.inOut" }, 6.8);\n'
    js += 'tl.set("#w9b0", { borderColor: "#404040 #fff #fff #404040" }, 7.5);\n'
    e, ej = endc("en", 8.16, "#008080", "#fff", "apps off · people on")
    js += 'tl.set("#sA", { opacity: 0 }, 8.16);\n' + ej
    return dur, html_ + e, js, 2.88, XX

# ---------------------------------------------------------------- X4 · ascii (11 s, techno)
def x4():
    dur = 11.0
    art = (g.CAMP / "dj" / "ascii_toast.txt").read_text().split("\n")
    banner = [" ___   _   _    _   _ ___ ", "/ __| /_\\ | |  | | | |   \\", "\\__ \\/ _ \\| |__| |_| | |) |", "|___/_/ \\_\\____|\\___/|___/ "]
    cmd = ["$ loomlock tap --canal 02 --ciudad bogota", "> instagram ...... pausado", "> tiktok ......... pausado", "> whatsapp ....... pausado", "> gente al frente  ENCENDIDA"]
    cmds = "".join(f'<div class="ab" style="left:60px;top:{130 + i*44}px;height:40px;overflow:hidden;white-space:pre;width:0" id="k{i}">{html.escape(t)}</div>' for i, t in enumerate(cmd))
    rows = "".join(f'<div class="w" id="a{i}" style="white-space:pre;height:15px">{html.escape(r)}</div>' for i, r in enumerate(art))
    ban = "".join(f'<div style="white-space:pre">{html.escape(r)}</div>' for r in banner)
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:#050505;color:{TEAL2};font-family:'Space Mono',monospace;font-size:26px">
  {cmds}
  <div class="ab" style="left:0;right:0;top:470px;text-align:center;font-family:'Space Mono',monospace;font-size:14.5px;line-height:15px;color:#e9e1d8;display:flex;justify-content:center"><div style="text-align:left">{rows}</div></div>
  <div class="ab w" id="ban" style="left:0;right:0;top:1150px;display:flex;justify-content:center;font-family:'Space Mono',monospace;font-size:42px;line-height:1.05;color:{YEL}"><div>{ban}</div></div>
  <div class="ctrm w" id="sub" style="top:1420px;font-size:22px;color:#e9e1d8;line-height:1.6">por la gente que tienes al frente<br><span style="opacity:.6">to the people in front of you</span></div>
  <div class="ab" style="left:60px;top:1700px">{IDENT}</div>
  <div class="ab" style="right:60px;top:1706px;font-size:18px;color:#e9e1d8">{GEO}</div>
</div>
'''
    js = ""
    for i, t in enumerate(cmd):
        st = 0.3 if i == 0 else 1.7 + (i-1) * 0.36
        d = 1.2 if i == 0 else 0.3
        js += f'tl.fromTo("#k{i}", {{ width: 0 }}, {{ width: {len(t)*15.7+20:.0f}, duration: {d}, ease: "steps({len(t)})" }}, {st:.2f});\n'
    js += 'tl.set("#k4", { color: "#ffffff" }, 2.9);\n'
    for i in range(len(art)):
        js += f'tl.set("#a{i}", {{ opacity: 1 }}, {3.2 + i*0.1:.2f});\n'
    js += 'tl.set("#ban", { opacity: 1 }, 7.2); flash(7.2, .3, .12);\n'
    js += "".join(f'tl.set("#ban", {{ opacity: {0.2 if k%2 else 1} }}, {7.32 + k*0.06:.2f});\n' for k in range(6))
    js += fade("#sub", 7.9)
    e, ej = endc("en", 9.0, "#050505", "#e9e1d8", "$ loomlock tap · apps off · people on")
    js += 'tl.set("#sA", { opacity: 0 }, 9.0);\n' + ej
    return dur, html_ + e, js, 0.0, XX

# ---------------------------------------------------------------- X5 · ácido (10 s, techno, starts at the build)
def x5():
    dur = 10.0
    stars = "".join(f'<svg class="ab star" id="s{i}" style="left:{x}px;top:{y}px" width="{s}" height="{s}" viewBox="-10 -10 20 20"><path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2Z" fill="{c}"/></svg>'
                    for i, (x, y, s, c) in enumerate([(80, 420, 80, YEL), (900, 560, 56, "#fff"), (140, 1260, 100, "#fff"), (860, 1360, 70, YEL), (520, 300, 40, "#fff")]))
    spec = ("CH—02 / BGT / 4°39′N 74°03′W / GMT−5 / 29.10.26 / TQL-DJ-BLANCO / APPS:OFF / PEOPLE:ON / ONE RULE EVERY CITY / UNA REGLA TODAS LAS CIUDADES / ") * 4
    words = ["APPS OFF", "PEOPLE ON", "SALUD", "CH 02", "BOGOTÁ"]
    ws = "".join(f'<div class="ctrm mt w" id="t{i}" style="top:1460px;font-size:56px;color:#fff;letter-spacing:.2em">{w}</div>' for i, w in enumerate(words))
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:#070712;color:#fff">
  <div class="ab" id="blob1" style="left:-200px;top:200px;width:1100px;height:1100px;border-radius:50%;background:radial-gradient(circle,{BLUE},rgba(0,0,0,0) 65%)"></div>
  <div class="ab" id="blob2" style="left:300px;top:900px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,{TEAL},rgba(0,0,0,0) 65%)"></div>
  {stars}
  <div class="ctrm" id="big" style="top:420px;font-family:'League Gothic';font-size:520px;line-height:.8;color:#fff;transform-origin:50% 50%">CH02</div>
  <div class="ab mt" style="left:0;top:1240px;width:3000px;font-size:19px;color:{YEL};white-space:nowrap" id="tick">{spec}</div>
  {ws}
  <div class="ab" style="left:60px;top:120px">{IDENT}</div>
  <div class="ab mt" style="right:60px;top:126px;font-size:20px">Resto Bar Bikinis</div>
</div>
'''
    js = 'tl.fromTo("#tick", { x: 0 }, { x: -1800, duration: 8, ease: "none" }, 0);\n'
    js += 'tl.fromTo("#blob1", { x: 0, y: 0 }, { x: 260, y: 120, duration: 8, ease: "sine.inOut" }, 0); tl.fromTo("#blob2", { x: 0 }, { x: -320, duration: 8, ease: "sine.inOut" }, 0);\n'
    js += "".join(f'tl.fromTo("#s{i}", {{ rotation: 0 }}, {{ rotation: {180 if i%2 else -180}, duration: 8, ease: "none" }}, 0);\n' for i in range(5))
    js += 'tl.fromTo("#big", { scaleX: 1.2, scaleY: .2, opacity: 0 }, { scaleX: 1.25, scaleY: 1.35, opacity: 1, duration: 1.2, ease: "power3.out" }, .2);\n'
    t = 2.16
    k = 0
    while t < 7.9:
        js += f'tl.fromTo("#big", {{ scaleY: 1.55 }}, {{ scaleY: 1.35, duration: .3, ease: "power2.out" }}, {t:.2f});\n'
        wi = k % len(words)
        js += f'tl.set("#t{wi}", {{ opacity: 1 }}, {t:.2f}); tl.set("#t{wi}", {{ opacity: 0 }}, {t+0.36:.2f});\n'
        t += 0.48; k += 1
    js += 'flash(2.16, .5, .15);\n'
    e, ej = endc("en", 8.0, "#070712", "#fff", "apps off · people on · salud")
    js += 'tl.set("#sA", { opacity: 0 }, 8.0);\n' + ej
    return dur, html_ + e, js, 5.04, XX

# ---------------------------------------------------------------- X6 · 1-bit (11 s, techno)
def x6():
    dur = 11.0
    html_ = f'''
<div id="sA" class="layer" style="opacity:1;background:{CREAM};color:#0b0b0b">
  <div class="ab sp mt" style="left:60px;right:60px;top:120px;font-size:24px"><span>Loomlock<br>experiences</span><span style="text-align:right">Hi-score<br>0 notificaciones</span></div>
  <div class="ab" id="key" style="left:40px;top:330px;width:1000px;height:770px;background:url(assets/dj/key_dither.png) center/contain no-repeat;image-rendering:pixelated"></div>
  <div class="ctrm mt" id="press" style="top:1180px;font-size:68px;font-weight:700;letter-spacing:.3em;margin-left:.3em;color:{TEAL}">PRESS TAP</div>
  <div class="ab w" id="barw" style="left:190px;top:1320px;width:700px;height:56px;border:5px solid #0b0b0b;padding:6px"><div id="bar" style="height:100%;width:0;background:{TEAL}"></div></div>
  <div class="ctrm mt w" id="load" style="top:1400px;font-size:24px">cargando nivel 02: bogotá…</div>
  <div class="ctrm mt w" id="lvl" style="top:1290px;font-size:84px;font-weight:700;color:#0b0b0b">NIVEL 02</div>
  <div class="ctrm mt w" id="lv2" style="top:1400px;font-size:26px;line-height:1.6">bogotá · 29.10 · 1 jugador<br><span style="opacity:.65">level 02 · apps paused</span></div>
  <div class="ab" style="left:60px;top:1700px">{IDENT}</div>
  <div class="ab mt" style="right:60px;top:1706px;font-size:18px">GMT−5</div>
</div>
'''
    js = 'tl.fromTo("#key", { x: 1100 }, { x: 0, duration: .8, ease: "steps(8)" }, .2);\n'
    js += "".join(f'tl.set("#press", {{ opacity: {0 if k%2 else 1} }}, {1.0 + k*0.24:.2f});\n' for k in range(12))
    js += 'tl.set("#press", { opacity: 1 }, 3.9);\n'
    js += 'tl.set("#key", { filter: "invert(1)" }, 4.0); tl.set("#key", { filter: "none" }, 4.12); flash(4.0, .4, .1);\n'
    js += 'tl.set("#press", { opacity: 0 }, 4.32); tl.set("#barw", { opacity: 1 }, 4.32); tl.set("#load", { opacity: 1 }, 4.32);\n'
    js += 'tl.fromTo("#bar", { width: 0 }, { width: "100%", duration: 2.4, ease: "steps(12)" }, 4.4);\n'
    js += 'tl.set(["#barw", "#load"], { opacity: 0 }, 7.2); tl.set("#lvl", { opacity: 1 }, 7.2); flash(7.2, .6, .12);\n'
    js += fade("#lv2", 7.6)
    e, ej = endc("en", 9.0, CREAM, "#0b0b0b", "game on · apps off", "black")
    js += 'tl.set("#sA", { opacity: 0 }, 9.0);\n' + ej
    return dur, html_ + e, js, 0.0, XX

SPECS = [("x1-salidas", x1, "afro.wav", None), ("x2-ticket", x2, "garage.wav", None), ("x3-windows", x3, "techno.wav", None),
         ("x4-ascii", x4, "techno.wav", None), ("x5-acido", x5, "techno.wav", 10.1), ("x6-bits", x6, "techno.wav", None)]

if __name__ == "__main__":
    for name, fn, mus, adur in SPECS:
        g.write(name, fn, adur_override=adur, fade_at=(adur - 0.4) if adur else None)
        d = g.HERE / name
        for f in ["outfit-600", "montserrat-italic-500", "spacemono-400", "spacemono-700"]:
            shutil.copy(g.CAMP / "fonts" / f"{f}.woff2", d / "assets" / "fonts")
        shutil.copy(g.CAMP / "dj" / "key_dither.png", d / "assets" / "dj")
        shutil.copy(MUS / mus, d / "assets" / mus)
        (d / "assets" / "music_full.wav").unlink(missing_ok=True)
        (d / "index.html").write_text((d / "index.html").read_text().replace("assets/music_full.wav", f"assets/{mus}"))
