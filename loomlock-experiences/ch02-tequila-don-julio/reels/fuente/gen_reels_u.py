"""CH 02 · Tequila Don Julio — three underground reels (CCTV, strobe, xerox), own techno track, Loomlock ident + global layer."""
import shutil, pathlib
import gen_reels as g
from gen_reels_m import EXTRA, IDENT, GEO, spaced, fade

LEGAL = g.LEGAL
TECHNO = pathlib.Path("/home/user/Skills/video-tap-in/locked-in/musica/techno.wav")
UX = EXTRA + """
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 2px,rgba(0,0,0,0) 2px 5px);z-index:19;pointer-events:none}
.cctv{filter:grayscale(1) sepia(.35) hue-rotate(60deg) saturate(1.6) contrast(1.25) brightness(.95)}
.xerox{filter:grayscale(1) contrast(3.2) brightness(1.15)}
.half{position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.55) 1.1px,rgba(0,0,0,0) 1.6px);background-size:7px 7px;mix-blend-mode:multiply;pointer-events:none}
.mt{font-family:"Space Mono",monospace;text-transform:uppercase;letter-spacing:.04em}
.ctrm{position:absolute;left:0;right:0;text-align:center}
"""

# ---------------------------------------------------------------- U1 · CCTV — "una sola cámara encendida" (12 s)
def u1():
    dur = 12.0
    shots = [("brindis", "center 30%", 0, 3.84), ("bikinis", "center", 3.84, 6.72), ("bottle", "center 25%", 6.72, 9.12)]
    imgs = "".join(f'<div class="ph cctv layer" id="sh{i}" style="background-image:url(assets/dj/{p}.jpg);background-position:{bp}"></div>' for i, (p, bp, a, b) in enumerate(shots))
    secs = "".join(f'<span class="w" id="ts{k}" style="position:absolute;right:0">23:47:{12+k:02d}</span>' for k in range(10))
    html = f'''
<div id="cam" class="layer" style="opacity:1;background:#000">
  {imgs}
  <div class="scan"></div>
  <div class="ab" style="inset:0;background:radial-gradient(100% 75% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.75));z-index:19"></div>
  <div class="ab mt" style="left:56px;top:110px;z-index:20;color:#d8f5d0;font-size:30px;line-height:1.4">CAM 02 · BIKINIS<br><span style="font-size:22px">BOGOTÁ · GMT−5</span></div>
  <div class="ab mt" style="right:56px;top:110px;z-index:20;color:#d8f5d0;font-size:30px;line-height:1.4;text-align:right;width:420px">29.10.26<br><span style="position:relative;display:inline-block;width:200px;height:40px;font-size:30px">{secs}</span></div>
  <div class="ab mt" style="left:56px;top:205px;z-index:20;color:#ff4d4d;font-size:24px;display:flex;align-items:center;gap:10px"><span class="rec" id="osd-rec"></span>REC</div>
  <div class="ctrm mt w" id="s1" style="top:1400px;z-index:20;color:#fff;font-size:34px;line-height:1.35"><span style="background:rgba(0,0,0,.78);padding:6px 14px;box-decoration-break:clone;-webkit-box-decoration-break:clone">esta noche hay una sola<br>cámara encendida.</span></div>
  <div class="ctrm mt w" id="s2" style="top:1400px;z-index:20;color:#fff;font-size:34px;line-height:1.35"><span style="background:rgba(0,0,0,.78);padding:6px 14px">y no es la tuya.</span></div>
  <div class="ctrm mt w" id="s3" style="top:1480px;z-index:20;color:#e8ffe0;font-size:20px"><span style="background:rgba(0,0,0,.78);padding:4px 12px">only one camera is on tonight. it isn’t yours.</span></div>
</div>
<div id="end" class="layer" style="background:#000;color:#d8f5d0">
  <div class="scan"></div>
  <div class="ctrm w" id="e0" style="top:760px">{IDENT}</div>
  <div class="ctrm mt w" id="e1" style="top:870px;font-size:30px;line-height:1.6">tu celular se queda contigo.<br>sus apps, en pausa.</div>
  <div class="ctrm mt w" id="e2" style="top:1060px;font-size:20px;opacity:.75">{GEO}</div>
  <div class="ctrm w" id="e3" style="top:1500px">{g.lock("white", 22, 54)}</div>
  <div class="foot" style="color:#8aa889">{LEGAL}</div>
</div>
'''
    js = 'for (let k = 0; k < 24; k++) tl.set("#osd-rec", { opacity: k % 2 ? .2 : 1 }, k * .5);\n'
    js += "".join(f'tl.set("#ts{k}", {{ opacity: 1 }}, {k}); tl.set("#ts{k}", {{ opacity: 0 }}, {k+1});\n' for k in range(10))
    for i, (p, bp, a, b) in enumerate(shots):
        js += f'tl.set("#sh{i}", {{ opacity: 1 }}, {a}); tl.set("#sh{i}", {{ opacity: 0 }}, {b});\n'
        js += f'tl.fromTo("#sh{i}", {{ scale: 1.05 }}, {{ scale: 1.12, duration: {b-a}, ease: "none" }}, {a});\n'
    # glitch jumps on cuts
    for t in [3.84, 6.72]:
        js += f'tl.set("#cam", {{ x: 18 }}, {t}); tl.set("#cam", {{ x: -10 }}, {t+0.06}); tl.set("#cam", {{ x: 0 }}, {t+0.12}); flash({t}, .35, .1);\n'
    js += fade("#s1", 1.0) + 'tl.set("#s1", { opacity: 0 }, 4.32);\n' + fade("#s2", 4.56) + fade("#s3", 5.2)
    js += 'tl.set("#s2", { opacity: 0 }, 9.12); tl.set("#s3", { opacity: 0 }, 9.12);\n'
    js += 'tl.set("#cam", { opacity: 0 }, 9.12); tl.set("#end", { opacity: 1 }, 9.12); flash(9.12, .5, .12);\n'
    js += fade("#e0", 9.2, .2) + fade("#e1", 9.5) + fade("#e2", 10.1) + fade("#e3", 10.5)
    return dur, html, js, 2.88, UX

# ---------------------------------------------------------------- U2 · strobe (11 s)
def u2():
    dur = 11.0
    S = 0.12
    photos = ["brindis", "bottle", "glass", "bikinis", "brindis", "plato"]
    pos = ["center 30%", "center 20%", "center 60%", "center", "35% 30%", "center"]
    imgs = "".join(f'<div class="ph layer" id="p{i}" style="background-image:url(assets/dj/{p}.jpg);background-position:{bp};filter:contrast(1.35) saturate(1.3) brightness(1.15)"></div>' for i, (p, bp) in enumerate(zip(photos, pos)))
    words = ["CH 02", "BOGOTÁ", "29.10", "SIN FEED", "TAP IN", "APPS OFF", "PEOPLE ON", "SALUD"]
    ws = "".join(f'<div class="ctrm mt w" id="w{i}" style="top:900px;font-size:{64 if len(w) < 8 else 56}px;letter-spacing:.3em;margin-left:.3em;color:#fff;z-index:20">{w}</div>' for i, w in enumerate(words))
    html = f'''
<div id="st" class="layer" style="opacity:1;background:#000">
  {imgs}
  {ws}
  <div class="ab" style="left:60px;top:120px;z-index:21" id="idt">{IDENT}</div>
  <div class="ab mt" style="right:60px;top:126px;z-index:21;color:#fff;font-size:20px">BOGOTÁ · GMT−5</div>
</div>
<div id="end" class="layer" style="background:#000;color:#fff">
  <div class="ctrm" style="top:120px">{IDENT}</div>
  <div class="ctrm spaced" style="top:780px;font-size:150px;margin-left:.38em;color:#fff">{spaced("LIVE", "a")}</div>
  <div class="ctrm spaced" style="top:950px;font-size:150px;margin-left:.38em;color:#5FB1C1">{spaced("NOW", "b")}</div>
  <div class="ctrm mt w" id="e1" style="top:1180px;font-size:22px;letter-spacing:.2em">post later · 29.10 · resto bar bikinis</div>
  <div class="ctrm w" id="e2" style="top:1500px">{g.lock("white", 22, 54)}</div>
  <div class="foot" style="color:#888">{LEGAL}</div>
</div>
'''
    js = ""
    # build (0 - 2.16): words on each beat, black between
    t = 0.0
    for i in range(4):
        js += f'tl.set("#w{i}", {{ opacity: 1 }}, {t:.2f}); tl.set("#w{i}", {{ opacity: 0 }}, {t+0.48:.2f});\n'
        t += 0.48
    # 16th-note strobe after the drop (2.16 - 7.92): photo flashes alternate with words
    t = 2.16
    k = 0
    while t < 7.9:
        pi = k % len(photos)
        js += f'tl.set("#p{pi}", {{ opacity: 1 }}, {t:.2f}); tl.set("#p{pi}", {{ opacity: 0 }}, {t+S*0.75:.2f});\n'
        if k % 4 == 2:
            wi = 4 + (k // 4) % 4
            js += f'tl.set("#w{wi}", {{ opacity: 1 }}, {t:.2f}); tl.set("#w{wi}", {{ opacity: 0 }}, {t+S*2:.2f});\n'
        t += S * (2 if k % 8 < 6 else 1)
        k += 1
    js += 'tl.set("#st", { opacity: 0 }, 7.92); tl.set("#end", { opacity: 1 }, 7.92); flash(7.92, .9, .15);\n'
    js += "".join(f'tl.set("#a{i}", {{ opacity: 1 }}, {7.92 + i*0.12:.2f});\n' for i in range(4))
    js += "".join(f'tl.set("#b{i}", {{ opacity: 1 }}, {8.4 + i*0.12:.2f});\n' for i in range(3))
    js += fade("#e1", 8.9) + fade("#e2", 9.3)
    return dur, html, js, 5.04, UX

# ---------------------------------------------------------------- U3 · xerox flyer (12 s)
def u3():
    dur = 12.0
    lines = ["SALUD", "POR LA GENTE", "QUE TIENES", "AL FRENTE."]
    tl_lines = "".join(f'<div class="ab w" id="l{i}" style="left:{60 + (i%2)*120}px;top:{980 + i*150}px;font-family:\'League Gothic\';font-size:160px;line-height:.9;color:#0b0b0b;background:#f2efe8;padding:0 18px;transform:rotate({[-2,1.5,-1,2][i]}deg)">{t}</div>' for i, t in enumerate(lines))
    html = f'''
<div id="xa" class="layer" style="opacity:1;background:#f2efe8;color:#0b0b0b">
  <div class="ab" id="cut1" style="left:70px;top:230px;width:620px;height:720px;overflow:hidden;transform:rotate(-3deg)"><div class="ph xerox" style="inset:0;background-image:url(assets/dj/brindis.jpg);background-position:center 30%"></div><div class="half"></div></div>
  <div class="ab" id="cut2" style="left:520px;top:520px;width:500px;height:560px;overflow:hidden;transform:rotate(4deg);opacity:0"><div class="ph xerox" style="inset:0;background-image:url(assets/dj/bottle.jpg);background-position:center 25%"></div><div class="half"></div></div>
  {tl_lines}
  <div class="ab mt" style="left:60px;top:110px;font-size:24px;line-height:1.3">LOOMLOCK EXPERIENCES<br>× TEQUILA DON JULIO</div>
  <div class="ab mt" style="right:60px;top:110px;font-size:24px;line-height:1.3;text-align:right">CH 02<br>29.10</div>
  <div class="ab mt w" id="x1" style="left:60px;top:1640px;font-size:22px;line-height:1.4">RESTO BAR BIKINIS · CRA 6 # 58–48<br>{GEO}</div>
  <div class="ab mt w" id="x2" style="right:60px;top:1640px;font-size:22px;text-align:right;line-height:1.4">SIN FEED<br>SOLO +18</div>
</div>
<div id="xb" class="layer" style="background:#0b0b0b;color:#f2efe8">
  <div class="ab" style="inset:0;overflow:hidden"><div class="ph xerox" id="pb" style="inset:0;background-image:url(assets/dj/glass.jpg);background-position:center 60%;filter:grayscale(1) contrast(3) brightness(.9) invert(1)"></div><div class="half" style="mix-blend-mode:screen;background-image:radial-gradient(rgba(255,255,255,.35) 1.1px,rgba(0,0,0,0) 1.6px)"></div></div>
  <div class="ctrm" style="top:120px">{IDENT}</div>
  <div class="ctrm mt w" id="y1" style="top:780px;font-size:56px;letter-spacing:.25em"><span style="background:#0b0b0b;padding:0 0 0 .25em">APPS OFF</span></div>
  <div class="ctrm mt w" id="y2" style="top:880px;font-size:56px;letter-spacing:.25em;color:#5FB1C1"><span style="background:#0b0b0b;padding:0 0 0 .25em">PEOPLE ON</span></div>
  <div class="ctrm mt w" id="y3" style="top:1010px;font-size:22px;letter-spacing:.15em"><span style="background:#0b0b0b;padding:4px 12px">una regla, todas las ciudades · one rule, every city</span></div>
</div>
<div id="end" class="layer" style="background:#f2efe8;color:#0b0b0b">
  <div class="ctrm" style="top:120px">{IDENT}</div>
  <div class="ctrm" style="top:760px;font-family:'League Gothic';font-size:300px;line-height:.9">29.10</div>
  <div class="ctrm mt" style="top:1040px;font-size:26px;letter-spacing:.15em">RESTO BAR BIKINIS · BOGOTÁ</div>
  <div class="ctrm mt" style="top:1100px;font-size:20px;letter-spacing:.15em;opacity:.7">70 CUPOS · SOLO +18</div>
  <div class="ctrm" style="top:1500px">{g.lock("black", 22, 54)}</div>
  <div class="foot" style="color:#555">{LEGAL}</div>
</div>
'''
    js = 'tl.fromTo("#cut1", { y: -30 }, { y: 20, duration: 7.2, ease: "none" }, 0);\n'
    js += 'tl.set("#cut2", { opacity: 1 }, 1.92); tl.fromTo("#cut2", { x: 120 }, { x: 0, duration: .25, ease: "power3.out" }, 1.92);\n'
    for i in range(4):
        t = 2.88 + i * 0.96
        js += f'tl.set("#l{i}", {{ opacity: 1 }}, {t:.2f}); tl.fromTo("#l{i}", {{ x: -60 }}, {{ x: 0, duration: .18, ease: "power3.out" }}, {t:.2f});\n'
    js += fade("#x1", 6.2, .1) + fade("#x2", 6.5, .1)
    js += 'tl.set("#xa", { opacity: 0 }, 7.2); tl.set("#xb", { opacity: 1 }, 7.2); flash(7.2, .9, .12);\n'
    for t in [7.2, 7.68, 8.16, 8.64]:
        js += f'tl.set("#pb", {{ x: 14 }}, {t}); tl.set("#pb", {{ x: 0 }}, {t+0.06});\n'
    js += 'tl.set("#y1", { opacity: 1 }, 7.44); tl.set("#y2", { opacity: 1 }, 7.92);\n' + fade("#y3", 8.6, .1)
    js += 'tl.set("#xb", { opacity: 0 }, 9.6); tl.set("#end", { opacity: 1 }, 9.6); flash(9.6, .6, .12);\n'
    return dur, html, js, 0.0, UX

def write(name, fn, adur_override=None, fade_at=None):
    g.write(name, fn, adur_override, fade_at)
    d = g.HERE / name
    for f in ["outfit-600", "montserrat-italic-500", "spacemono-400", "spacemono-700"]:
        shutil.copy(g.CAMP / "fonts" / f"{f}.woff2", d / "assets" / "fonts")
    shutil.copy(g.CAMP / "dj" / "plato.jpg", d / "assets" / "dj")
    shutil.copy(TECHNO, d / "assets" / "techno.wav")
    (d / "assets" / "music_full.wav").unlink(missing_ok=True)
    h = (d / "index.html").read_text().replace("assets/music_full.wav", "assets/techno.wav")
    (d / "index.html").write_text(h)

if __name__ == "__main__":
    write("u1-cctv", u1)
    write("u2-strobe", u2, adur_override=10.1, fade_at=9.7)
    write("u3-xerox", u3)
