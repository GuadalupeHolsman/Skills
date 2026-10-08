"""Three 9:16 reels for Loomlock Experiences · CH 02 · Tequila Don Julio (Bogotá, Resto Bar Bikinis).
Writes three HyperFrames projects: r1-invitacion, r2-ritual, r3-fuera-del-aire."""
import pathlib, shutil, json

HERE = pathlib.Path(__file__).parent
SP = HERE.parent
CAMP = SP / "camp" / "assets"
LEGAL = "Disfruta con moderación. Prohibido el expendio de bebidas alcohólicas a menores de edad."
KEY = (SP / "camp" / "keycard.html.part").read_text().replace(
    "<b>Experience</b><span>29.10 · Invite only</span>", "<b>CH 02</b><span>Tequila Don Julio · 29.10</span>")

HEAD = """<!doctype html><html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>{title}</title><script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"League Gothic";src:url("assets/fonts/leaguegothic-400.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:500;src:url("assets/fonts/outfit-500.woff2") format("woff2")}}
@font-face{{font-family:"Outfit";font-weight:700;src:url("assets/fonts/outfit-700.woff2") format("woff2")}}
@font-face{{font-family:"VT323";src:url("assets/fonts/vt323-400.woff2") format("woff2")}}
@font-face{{font-family:"Montserrat";font-weight:700;src:url("assets/fonts/montserrat-700.woff2") format("woff2")}}
@font-face{{font-family:"Montserrat";font-weight:900;src:url("assets/fonts/montserrat-900.woff2") format("woff2")}}
:root{{--cream:#E9E1D8;--black:#0B0B0B;--teal:#0B5A6A;--teal2:#5FB1C1;--rec:#FF3B3B;--key:#fcee21}}
body{{margin:0;background:var(--black);font-family:"Outfit",sans-serif;color:#fff}}
#root{{position:relative;width:100%;height:100%;overflow:hidden;background:var(--black)}}
.layer{{position:absolute;inset:0;opacity:0}}
.ab{{position:absolute}}
.ph{{position:absolute;inset:-4%;background-size:cover;background-position:center}}
.disp{{font-family:"League Gothic",sans-serif;text-transform:uppercase;line-height:.9;letter-spacing:.005em}}
.ctr{{left:0;right:0;text-align:center}}
.lbl{{font-weight:700;letter-spacing:.16em;text-transform:uppercase}}
.osd{{position:absolute;left:60px;right:60px;top:120px;display:flex;justify-content:space-between;align-items:center;color:#fff;z-index:20}}
.osd .l{{display:flex;align-items:center;gap:14px}}
.chbox{{font-family:"VT323",monospace;font-size:34px;letter-spacing:.06em;border:2.5px solid currentColor;border-radius:8px;padding:0 12px;line-height:1.15}}
.rec{{width:16px;height:16px;border-radius:50%;background:var(--rec);box-shadow:0 0 12px var(--rec)}}
.foot{{position:absolute;left:60px;right:60px;bottom:110px;text-align:center;font-size:17px;color:rgba(255,255,255,.7);z-index:20}}
.lock{{display:flex;align-items:center;justify-content:center;gap:14px;font-size:24px;font-weight:500}}
.w{{opacity:0}}
.grain{{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:overlay;opacity:0;image-rendering:pixelated;z-index:30}}
.flash{{position:absolute;inset:0;background:#fff;opacity:0;z-index:25}}
.tvline{{position:absolute;left:0;right:0;top:958px;height:4px;background:#fff;box-shadow:0 0 30px 8px rgba(255,255,255,.6);opacity:0;z-index:24;transform-origin:50% 50%}}
.kc{{position:absolute;width:480px;height:300px;border-radius:30px;overflow:hidden;color:var(--key);box-shadow:0 40px 90px rgba(0,0,0,.55),inset 0 0 0 3px rgba(252,238,33,.55);font-family:"Montserrat",sans-serif}}
.kc .face{{position:absolute;inset:0;background:radial-gradient(80% 90% at 20% 10%,rgba(143,211,244,.35),rgba(143,211,244,0) 60%),radial-gradient(70% 80% at 90% 90%,rgba(255,143,177,.35),rgba(255,143,177,0) 60%),linear-gradient(135deg,#2b34c9 0%,#121b95 60%,#070d66 100%)}}
.kc .nfc{{position:absolute;left:30px;top:30px;width:46px;height:46px}}
.kc .keyg{{position:absolute;left:250px;top:28px;width:210px;height:210px}}
.kc .lab{{position:absolute;left:34px;bottom:30px}}
.kc .lab b{{display:block;font-weight:900;font-size:30px;line-height:1;letter-spacing:.1em;text-transform:uppercase}}
.kc .lab span{{display:block;margin-top:9px;font-weight:700;font-size:21px;line-height:1;opacity:.8}}
.kc .mark{{position:absolute;right:30px;bottom:28px;width:26px;opacity:.75}}
.kc .shine{{position:absolute;top:-40px;left:250px;width:150px;height:400px;transform:skewX(-18deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0))}}
{extra}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{dur}">
"""

TAIL = """<div class="flash" id="fl"></div>
<img class="grain" id="gr0" src="assets/img/grain0.png" alt="" /><img class="grain" id="gr1" src="assets/img/grain1.png" alt="" />
<img class="grain" id="gr2" src="assets/img/grain2.png" alt="" /><img class="grain" id="gr3" src="assets/img/grain3.png" alt="" />
<audio id="music" src="assets/music_full.wav" data-start="0" data-duration="{adur}" data-media-start="{mstart}" data-volume="1"
 data-automation='{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.25,"v":0.95}},{{"t":{fade0},"v":1}},{{"t":{adur},"v":0}}]}}]}}'></audio>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
const B = 0.48;
const flash = (t, a = .8, d = .16) => {{ tl.set("#fl", {{ opacity: a }}, t); tl.to("#fl", {{ opacity: 0, duration: d, ease: "power2.out" }}, t); }};
for (let i = 0; i < 4; i++) tl.set("#gr" + i, {{ opacity: 0 }}, 0);
for (let f = 0, t = 0; t < {dur}; f++, t = f / 12) {{ tl.set("#gr" + (f % 4), {{ opacity: {gr} }}, t); tl.set("#gr" + ((f + 3) % 4), {{ opacity: 0 }}, t); }}
const word = (s, t, from = 1.12) => {{ tl.set(s, {{ opacity: 1 }}, t); tl.fromTo(s, {{ scale: from, y: 0 }}, {{ scale: 1, duration: .22, ease: "power3.out" }}, t); }};
{js}
window.__timelines["main"] = tl;
</script></body></html>
"""

def osd(label="en vivo", rec=True, right="29.10 · Bogotá", oid="osd", color="#fff"):
    r = '<span class="rec" id="%s-rec"></span>' % oid if rec else '<span class="rec" style="background:#555;box-shadow:none"></span>'
    return (f'<div class="osd" id="{oid}" style="color:{color}"><div class="l"><span class="chbox">CH 02</span>{r}'
            f'<span class="lbl" style="font-size:17px">{label}</span></div><span class="lbl" style="font-size:16px">{right}</span></div>')

def lock(c="white", h=26, dh=60):
    ll = "loomlock_white" if c == "white" else "loomlock_black"
    return (f'<div class="lock"><img src="assets/img/{ll}.png" style="height:{h}px" alt="loomlock"><span>×</span>'
            f'<img src="assets/img/dj_{c}.png" style="height:{dh}px" alt="Tequila Don Julio"></div>')

def endcard(t0):
    html = f'''<div id="end" class="layer" style="background:var(--cream);color:var(--black)">
  {osd("reserva tu cupo", True, "29.10 · Bogotá", "osdE", "#0B0B0B")}
  <div class="ab ctr" style="top:470px">{lock("black", 34, 84)}</div>
  <div class="ab ctr disp w" id="e1" style="top:700px;font-size:300px">29.10</div>
  <div class="ab ctr disp w" id="e2" style="top:990px;font-size:96px">Resto Bar Bikinis · Bogotá</div>
  <div class="ab ctr lbl w" id="e3" style="top:1120px;font-size:26px;color:var(--teal)">70 cupos · solo +18</div>
  <div class="ab ctr disp w" id="e4" style="top:1300px;font-size:120px;color:var(--teal)">Live now, post later.</div>
  <div class="foot" style="color:rgba(11,11,11,.65)">{LEGAL}</div>
</div>'''
    js = f'''tl.set("#end", {{ opacity: 1 }}, {t0}); flash({t0}, .55, .2);
for (let k = 0; k < 8; k++) tl.set("#osdE-rec", {{ opacity: k % 2 ? .25 : 1 }}, {t0} + k * .5);
word("#e1", {t0}+.05, 1.25); word("#e2", {t0}+.45); word("#e3", {t0}+.75, 1); word("#e4", {t0}+1.2);'''
    return html, js

# ---------------------------------------------------------------- R1 · la invitación (12 s)
def r1():
    dur = 12.0
    end_html, end_js = endcard(8.64)
    html = f'''
<div id="sA" class="layer" style="opacity:1">
  <div class="ph" id="phA" style="background-image:url(assets/dj/bottle.jpg);background-position:center 20%"></div>
  <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0) 22%,rgba(0,0,0,.08) 48%,rgba(0,0,0,.82) 76%)"></div>
  <div class="ab ctr disp w" id="h1" style="top:1060px;font-size:190px">Salud por</div>
  <div class="ab ctr disp w" id="h2" style="top:1230px;font-size:190px">la gente que</div>
  <div class="ab ctr disp w" id="h3" style="top:1400px;font-size:190px">tienes al frente.</div>
</div>
<div id="sB" class="layer">
  <div class="ph" id="phB" style="background-image:url(assets/dj/brindis.jpg);background-position:center 30%"></div>
  <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,0) 25%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.85) 78%)"></div>
  <div class="ab ctr disp w" id="b1" style="top:1180px;font-size:150px">Una fiesta en Bogotá</div>
  <div class="ab ctr disp w" id="b2" style="top:1330px;font-size:150px;color:var(--teal2)">con las apps en pausa.</div>
  <div class="ab ctr w" id="b3" style="top:1510px;font-size:34px;font-weight:500">con tequila Don Julio</div>
</div>
{end_html}
{osd()}
<div class="tvline" id="tv"></div>
<div class="foot" id="legalA">{LEGAL}</div>
'''
    js = f'''
// TV turns on
tl.set("#tv", {{ opacity: 1, scaleX: 0 }}, 0.05);
tl.to("#tv", {{ scaleX: 1, duration: .25, ease: "power3.out" }}, 0.05);
tl.fromTo("#sA", {{ clipPath: "inset(50% 0 50% 0)" }}, {{ clipPath: "inset(0% 0 0% 0)", duration: .38, ease: "power2.inOut" }}, .3);
tl.to("#tv", {{ opacity: 0, duration: .2 }}, .55);
for (let k = 0; k < 24; k++) tl.set("#osd-rec", {{ opacity: k % 2 ? .25 : 1 }}, k * .5);
tl.fromTo("#phA", {{ scale: 1.12 }}, {{ scale: 1.0, duration: 4.5, ease: "none" }}, 0);
word("#h1", 1.44); word("#h2", 2.4); word("#h3", 3.36, 1.25); flash(3.36, .25, .2);
tl.set("#sA", {{ opacity: 0 }}, 5.04); tl.set("#sB", {{ opacity: 1 }}, 5.04); flash(5.04, .8, .22);
tl.fromTo("#phB", {{ scale: 1.0 }}, {{ scale: 1.1, duration: 3.6, ease: "none" }}, 5.04);
word("#b1", 5.3); word("#b2", 6.0); word("#b3", 6.7, 1);
tl.set("#sB", {{ opacity: 0 }}, 8.64);
tl.set("#osd", {{ opacity: 0 }}, 8.64); tl.set("#legalA", {{ opacity: 0 }}, 8.64);
{end_js}'''
    return dur, html, js, 7.47, ".end{}"

# ---------------------------------------------------------------- R2 · el ritual (13 s)
def r2():
    dur = 13.0
    end_html, end_js = endcard(9.6)
    apps = "".join(f'<div class="ab app" id="ap{i}" style="left:{300 + i*170}px;top:1370px;width:130px;text-align:center"><div style="width:110px;height:110px;margin:0 auto;border-radius:28px;background:{c}"></div><div class="lbl" style="font-size:15px;margin-top:12px;color:var(--black)">{n}</div></div>'
                   for i, (n, c) in enumerate([("Instagram", "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"), ("TikTok", "#111"), ("WhatsApp", "#25D366")]))
    rings = "".join(f'<div class="ab ring" id="rg{i}" style="left:{540-r}px;top:{1020-r}px;width:{2*r}px;height:{2*r}px;border-radius:50%;border:6px solid var(--teal);opacity:0"></div>' for i, r in enumerate([170, 240, 310]))
    html = f'''
<div id="sA" class="layer" style="opacity:1;background:var(--cream);color:var(--black)">
  <div class="ab lbl w" id="a0" style="left:70px;top:330px;font-size:30px;color:var(--teal)">una regla</div>
  <div class="ab disp w" id="a1" style="transform-origin:0 50%;left:64px;top:400px;font-size:300px;line-height:.86">El celular</div>
  <div class="ab disp w" id="a2" style="transform-origin:0 50%;left:64px;top:690px;font-size:300px;line-height:.86">se queda</div>
  <div class="ab disp w" id="a3" style="transform-origin:0 50%;left:64px;top:980px;font-size:300px;line-height:.86;color:var(--teal)">contigo.</div>
  <div class="ab w" id="a4" style="left:70px;top:1330px;width:900px;font-size:44px;font-weight:500;line-height:1.3">Lo que se pausa son las apps.</div>
</div>
<div id="sB" class="layer" style="background:var(--cream);color:var(--black)">
  <div class="ab ctr disp w" id="t0" style="top:330px;font-size:200px">Tap in.</div>
  {rings}
  <div class="ab" id="nfc" style="left:400px;top:880px;width:280px;height:280px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center">
    <svg viewBox="0 0 24 24" width="130" height="130" fill="none" stroke="#E9E1D8" stroke-width="2.2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg></div>
  <div class="kc" id="key" style="left:300px;top:870px">{KEY}</div>
  {apps}
  <div class="ab ctr disp w" id="t1" style="top:1600px;font-size:110px;color:var(--teal)">En pausa.</div>
  <div class="ab ctr w" id="t2" style="top:1730px;font-size:32px;font-weight:500">Tú eliges cuáles, en el tótem de la entrada.</div>
</div>
<div id="sC" class="layer">
  <div class="ph" id="phC" style="background-image:url(assets/dj/glass.jpg);background-position:center 55%"></div>
  <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 25%,rgba(0,0,0,.05) 50%,rgba(0,0,0,.8) 78%)"></div>
  <div class="ab ctr disp w" id="c1" style="top:1200px;font-size:170px">Un tequila</div>
  <div class="ab ctr disp w" id="c2" style="top:1360px;font-size:170px;color:var(--teal2)">se toma despacio.</div>
  <div class="foot">{LEGAL}</div>
</div>
{end_html}
{osd("cómo funciona", True, "29.10 · Bogotá", "osd", "#0B0B0B")}
'''
    js = f'''
for (let k = 0; k < 26; k++) tl.set("#osd-rec", {{ opacity: k % 2 ? .25 : 1 }}, k * .5);
word("#a0", .1, 1); word("#a1", .48, 1.2); word("#a2", .96, 1.2); word("#a3", 1.44, 1.3); flash(1.44, .25, .2); word("#a4", 2.2, 1);
tl.set("#sA", {{ opacity: 0 }}, 3.36); tl.set("#sB", {{ opacity: 1 }}, 3.36);
word("#t0", 3.4, 1.2);
tl.fromTo("#key", {{ x: 420, y: 520, rotation: 18, scale: .9 }}, {{ x: 0, y: 0, rotation: -6, scale: .95, duration: .9, ease: "power3.out" }}, 3.6);
for (let i = 0; i < 3; i++) {{ tl.fromTo("#rg" + i, {{ opacity: .9, scale: .7 }}, {{ opacity: 0, scale: 1.25, duration: .8, ease: "power2.out" }}, 4.56 + i * .12); }}
flash(4.56, .3, .18);
tl.to("#key", {{ y: -420, x: -40, scale: .7, rotation: -10, duration: .6, ease: "power2.inOut" }}, 5.0);
for (let i = 0; i < 3; i++) {{ tl.fromTo("#ap" + i, {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: .25 }}, 5.04 + i * .12); tl.to("#ap" + i + " div:first-child", {{ filter: "grayscale(1) brightness(.6)", opacity: .35, duration: .25 }}, 5.76 + i * .24); }}
word("#t1", 6.24, 1.25); word("#t2", 6.72, 1);
tl.set("#sB", {{ opacity: 0 }}, 7.2); tl.set("#sC", {{ opacity: 1 }}, 7.2); tl.set("#osd", {{ opacity: 0 }}, 7.2); flash(7.2, .7, .2);
tl.fromTo("#phC", {{ scale: 1.1 }}, {{ scale: 1.0, duration: 2.4, ease: "power1.out" }}, 7.2);
word("#c1", 7.44); word("#c2", 8.16);
tl.set("#sC", {{ opacity: 0 }}, 9.6);
{end_js}'''
    extra = ".ring{}"
    return dur, html, js, 5.31, extra

# ---------------------------------------------------------------- R3 · fuera del aire (11 s)
def r3():
    dur = 11.0
    html = f'''
<div id="tvbox" class="ab" style="inset:0;transform-origin:50% 50%">
  <div id="sA" class="layer" style="opacity:1">
    <div class="ph" id="phA" style="background-image:url(assets/dj/bikinis.jpg);background-position:center"></div>
    <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,.05) 30%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.85) 78%)"></div>
    <div class="ab ctr disp w" id="h1" style="top:1080px;font-size:150px">Las mejores historias</div>
    <div class="ab ctr disp w" id="h2" style="top:1230px;font-size:150px">de fiesta</div>
    <div class="ab ctr disp w" id="h3" style="top:1380px;font-size:150px;color:var(--teal2)">nunca se subieron.</div>
  </div>
  {osd()}
</div>
<div id="sOff" class="layer" style="background:var(--black);color:var(--cream)">
  {osd("sin señal", False, "Tequila Don Julio", "osd2", "#8d8a85")}
  <div class="ab ctr disp w" id="o1" style="top:640px;font-size:250px">Fuera</div>
  <div class="ab ctr disp w" id="o2" style="top:860px;font-size:250px">del aire.</div>
  <div class="ab ctr disp w" id="o3" style="top:1130px;font-size:120px;color:var(--teal2)">Volvemos después.</div>
  <div class="ab ctr w" id="o4" style="top:1420px">{lock("white", 26, 62)}</div>
  <div class="ab ctr lbl w" id="o5" style="top:1560px;font-size:22px;color:#8d8a85">29.10 · live now, post later.</div>
  <div class="foot" style="color:#9a968f">{LEGAL}</div>
</div>
<div class="tvline" id="tv"></div>
'''
    js = '''
for (let k = 0; k < 12; k++) tl.set("#osd-rec", { opacity: k % 2 ? .25 : 1 }, k * .5);
tl.fromTo("#phA", { scale: 1.0 }, { scale: 1.1, duration: 5.6, ease: "none" }, 0);
word("#h1", .48); word("#h2", 1.44); word("#h3", 2.4, 1.25); flash(2.4, .25, .2);
// TV switches off at 5.04
tl.to("#tvbox", { scaleY: .004, duration: .22, ease: "power3.in" }, 5.04);
tl.set("#tv", { opacity: 1, scaleX: 1 }, 5.26);
tl.set("#tvbox", { opacity: 0 }, 5.26);
tl.to("#tv", { scaleX: 0, duration: .28, ease: "power3.in" }, 5.26);
tl.set("#tv", { opacity: 0 }, 5.56);
tl.set("#sOff", { opacity: 1 }, 6.0);
word("#o1", 6.2, 1.05); word("#o2", 6.68, 1.05); word("#o3", 7.4, 1); tl.fromTo("#o4", { opacity: 0 }, { opacity: 1, duration: .4 }, 8.2); tl.fromTo("#o5", { opacity: 0 }, { opacity: 1, duration: .4 }, 8.5);
'''
    return dur, html, js, 2.43, ""

def write(name, fn, adur_override=None, fade_at=None):
    dur, body, js, mstart, extra = fn()
    d = HERE / name
    (d / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (d / "assets" / "img").mkdir(exist_ok=True)
    (d / "assets" / "dj").mkdir(exist_ok=True)
    for f in ["leaguegothic-400", "outfit-500", "outfit-700", "vt323-400", "montserrat-700", "montserrat-900"]:
        shutil.copy(CAMP / "fonts" / f"{f}.woff2", d / "assets" / "fonts")
    for f in ["dj_white.png", "dj_black.png", "loomlock_white.png", "loomlock_black.png", "loomlock_mark_white.png"]:
        shutil.copy(CAMP / "img" / f, d / "assets" / "img")
    for i in range(4):
        shutil.copy(SP / "hf7" / "assets" / "img" / f"grain{i}.png", d / "assets" / "img")
    for f in ["bottle", "brindis", "glass", "bikinis"]:
        shutil.copy(CAMP / "dj" / f"{f}.jpg", d / "assets" / "dj")
    mus = d / "assets" / "music_full.wav"
    if not mus.exists():
        shutil.copy(SP / "hf7" / "assets" / "music_full.wav", mus)
    for f in ["hyperframes.json", "meta.json"]:
        shutil.copy(SP / "hf8" / f, d)
    (d / "package.json").write_text(json.dumps({"name": name, "private": True, "type": "module"}, indent=2))
    adur = adur_override or dur
    fade0 = fade_at if fade_at else round(adur - 0.6, 2)
    gr = ".2"
    k = KEY.replace("assets/img/loomlock_mark_white.png", "assets/img/loomlock_mark_white.png")
    html = HEAD.format(title=f"CH 02 · {name}", dur=dur, extra=extra) + body + TAIL.format(adur=adur, mstart=mstart, fade0=fade0, dur=dur, gr=gr, js=js)
    (d / "index.html").write_text(html)
    print("wrote", d)

if __name__ == "__main__":
    write("r1-invitacion", r1)
    write("r2-ritual", r2)
    write("r3-fuera-del-aire", r3, adur_override=5.3, fade_at=5.2)
