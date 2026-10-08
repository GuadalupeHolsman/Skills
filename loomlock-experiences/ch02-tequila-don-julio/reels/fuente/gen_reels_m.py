"""CH 02 · Tequila Don Julio — three reels with the MATTE treatment + Loomlock ident + global layer.
Slow single images, small tracked type in corners, spaced-letter titles, bilingual lines, "a loomlock project"."""
import shutil
import gen_reels as g

LEGAL = g.LEGAL
EXTRA = """
@font-face{font-family:"Outfit";font-weight:600;src:url("assets/fonts/outfit-600.woff2") format("woff2")}
@font-face{font-family:"MontI";font-style:italic;font-weight:500;src:url("assets/fonts/montserrat-italic-500.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/spacemono-400.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/spacemono-700.woff2") format("woff2")}
.t{font-weight:600;font-size:24px;letter-spacing:.07em;text-transform:uppercase;line-height:1.4}
.tb{font-weight:700}
.it{font-family:"MontI",sans-serif;font-style:italic;font-weight:500}
.mono{font-family:"Space Mono",monospace;text-transform:uppercase;line-height:1.15}
.sp{display:flex;justify-content:space-between}
.ident{display:inline-flex;align-items:center;gap:12px;background:#3F49CC;color:#F9F9FF;border-radius:9px;padding:5px 14px;font-weight:700;font-size:20px;letter-spacing:.08em;text-transform:lowercase}
.ident .vt2{font-family:"VT323",monospace;font-size:30px;letter-spacing:.06em;border-left:1.5px solid rgba(249,249,255,.5);padding-left:12px}
.spaced{font-weight:500;letter-spacing:.38em;line-height:1}
.L{display:inline-block;opacity:0}
"""
IDENT = '<span class="ident">loomlock experiences<span class="vt2">CH 02</span></span>'
GEO = "Bogotá · 4°39′N 74°03′W · GMT−5"

def spaced(text, ids):
    return "".join(f'<span class="L" id="{ids}{i}">{c if c != " " else "&nbsp;"}</span>' for i, c in enumerate(text))

def fade(sel, t, d=.35):
    return f'tl.fromTo("{sel}", {{ opacity: 0 }}, {{ opacity: 1, duration: {d} }}, {t});\n'

# ---------------------------------------------------------------- R1 · la invitación (12 s)
def r1():
    dur = 12.0
    html = f'''
<div id="sA" class="layer" style="opacity:1;background:var(--cream);color:var(--black)">
  <div class="ph" id="phA" style="background-image:url(assets/dj/glass.jpg);background-position:center 62%"></div>
  <div class="ab sp t w" id="a1" style="left:64px;right:64px;top:120px"><div><span class="tb">Loomlock</span> y <span class="tb">Tequila Don Julio</span><br>te invitan</div><div style="text-align:right">Jueves 29 de octubre<br>Bogotá</div></div>
  <div class="ab w" id="a0" style="left:64px;top:250px">{IDENT}</div>
  <div class="ab ctr it w" id="a2" style="top:740px;font-size:66px;line-height:1.1">salud por la gente<br>que tienes al frente</div>
  <div class="ab ctr t w" id="a3" style="top:910px;font-size:18px;opacity:.8">here’s to the people in front of you</div>
  <div class="ab sp t w" id="a4" style="left:64px;right:64px;top:1640px;align-items:flex-end"><div>Resto Bar Bikinis<br>Carrera 6 # 58–48</div><div style="text-align:right">A loomlock project<br>{GEO}</div></div>
</div>
<div id="sB" class="layer" style="background:var(--teal);color:var(--cream)">
  <div class="ab ctr" style="top:120px">{IDENT}</div>
  <div class="ab ctr spaced" style="top:700px;font-size:170px;margin-left:.38em">{spaced("CH 02", "c")}</div>
  <div class="ab ctr t w" id="b1" style="top:930px;font-size:22px;letter-spacing:.3em">una fiesta con las apps en pausa</div>
  <div class="ab ctr t w" id="b2" style="top:1010px;font-size:17px;letter-spacing:.2em;opacity:.75">a party with your apps on pause</div>
  <div class="ab ctr t w" id="b3" style="top:1500px;font-size:18px;letter-spacing:.2em">una regla, todas las ciudades · one rule, every city</div>
</div>
<div id="sC" class="layer" style="background:#3F49CC;color:#F9F9FF">
  <div class="ab" style="left:0;right:0;top:420px;height:1100px;overflow:hidden">
    <div class="kc" id="kk" style="left:-200px;top:80px;transform:scale(3.4) rotate(-12deg);transform-origin:0 0;box-shadow:none">{g.KEY.replace("Tequila Don Julio · 29.10", "Bogotá · 29.10")}</div></div>
  <div class="ab sp t" style="left:64px;right:64px;top:120px"><div><span class="tb">Loomlock</span><br>experiences</div><div style="text-align:right">Una llave, muchas puertas<br>One key, many doors</div></div>
  <div class="ab ctr it w" id="k1" style="top:1420px;font-size:60px">la puerta 02 es en Bogotá</div>
  <div class="ab ctr t w" id="k2" style="top:1520px;font-size:18px;opacity:.85">door 02 opens in Bogotá</div>
</div>
<div id="end" class="layer" style="background:var(--cream);color:var(--black)">
  <div class="ab ctr" style="top:120px">{IDENT}</div>
  <div class="ab ctr" style="top:640px">{g.lock("black", 28, 70)}</div>
  <div class="ab ctr it w" id="e1" style="top:820px;font-size:64px">jueves 29.10</div>
  <div class="ab ctr t w" id="e2" style="top:930px;font-size:22px;line-height:1.7">Resto Bar Bikinis · Bogotá<br>70 cupos · solo +18</div>
  <div class="ab ctr t w" id="e3" style="top:1440px;font-size:20px;color:var(--teal)">live now, post later</div>
  <div class="ab ctr t w" id="e4" style="top:1500px;font-size:16px;opacity:.7">A loomlock project</div>
  <div class="foot" style="color:rgba(11,11,11,.7)">{LEGAL}</div>
</div>
<div class="foot" id="legalA" style="color:rgba(11,11,11,.7);z-index:21">{LEGAL}</div>
'''
    js = 'tl.fromTo("#phA", { scale: 1.06 }, { scale: 1.16, duration: 5.1, ease: "none" }, 0);\n'
    js += fade("#a0", .1) + fade("#a1", .48) + fade("#a2", 1.92, .8) + fade("#a3", 2.88) + fade("#a4", 3.84)
    js += 'tl.set("#sA", { opacity: 0 }, 5.04); tl.set("#sB", { opacity: 1 }, 5.04); tl.set("#legalA", { opacity: 0 }, 5.04); flash(5.04, .35, .2);\n'
    js += "".join(f'tl.set("#c{i}", {{ opacity: 1 }}, {5.04 + i*0.24:.2f});\n' for i in range(5))
    js += fade("#b1", 6.24) + fade("#b2", 6.6) + fade("#b3", 7.0)
    js += 'tl.set("#sB", { opacity: 0 }, 7.68); tl.set("#sC", { opacity: 1 }, 7.68);\n'
    js += 'tl.fromTo("#kk", { x: 60 }, { x: -40, duration: 1.92, ease: "none" }, 7.68);\n'
    js += fade("#k1", 8.16) + fade("#k2", 8.64)
    js += 'tl.set("#sC", { opacity: 0 }, 9.6); tl.set("#end", { opacity: 1 }, 9.6);\n'
    js += fade("#e1", 9.75) + fade("#e2", 10.1) + fade("#e3", 10.6) + fade("#e4", 10.9)
    return dur, html, js, 7.47, EXTRA

# ---------------------------------------------------------------- R2 · cómo funciona (12 s)
def r2():
    dur = 12.0
    rows = [("La<br>llave", "#5FB1C1", ["Una por invitado", "Tap en el tótem", "Tú eliges qué apps se pausan"]),
            ("El<br>celular", "#E9E1D8", ["Se queda contigo", "Cámara, llamadas y mapas funcionan", "Sin feed hasta que te vas"]),
            ("La<br>noche", "#C9A46B", ["Resto Bar Bikinis, Bogotá", "Tequila Don Julio Blanco", "Tus fotos llegan días después"])]
    sheet, y = "", 360
    for r, (name, c, items) in enumerate(rows):
        li = "".join(f'<div class="w" id="r{r}i{i}">· {t}</div>' for i, t in enumerate(items))
        sheet += (f'<div class="ab w" id="r{r}" style="left:64px;right:64px;top:{y}px;border-top:1.5px solid rgba(233,225,216,.45);padding-top:20px;display:flex">'
                  f'<div class="mono" style="width:300px;color:{c};font-size:40px;font-weight:700">{name}</div>'
                  f'<div class="mono" style="flex:1;font-size:26px;line-height:1.55">{li}</div></div>')
        y += 310
    html = f'''
<div id="sA" class="layer" style="opacity:1;background:var(--black);color:var(--cream)">
  <div class="ab sp mono" style="left:64px;right:64px;top:130px;font-size:30px"><span>Loomlock<br>× Tequila Don Julio</span><span style="text-align:right">Cómo funciona<br>How it works</span></div>
  {sheet}
  <div class="ab w" id="sid" style="left:64px;top:{y+40}px">{IDENT}</div>
  <div class="ab mono w" id="sgl" style="left:64px;right:64px;top:{y+120}px;font-size:22px;opacity:.75">La misma regla en cada ciudad.<br>The same rule in every city.</div>
</div>
<div id="sB" class="layer" style="background:var(--cream);color:var(--black)">
  <div class="ab" style="left:64px;top:120px">{IDENT}</div>
  <div class="ab ctr spaced" style="top:470px;font-size:170px;margin-left:.38em">{spaced("TAP IN", "c")}</div>
  <div class="ab ring" id="rg" style="left:390px;top:860px;width:300px;height:300px;border-radius:50%;border:5px solid var(--teal);opacity:0"></div>
  <div class="ab" id="dot" style="left:420px;top:890px;width:240px;height:240px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center">
    <svg viewBox="0 0 24 24" width="110" height="110" fill="none" stroke="#E9E1D8" stroke-width="2" stroke-linecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17"/></svg></div>
  <div class="ab ctr it w" id="t1" style="top:1260px;font-size:60px">acerca tu llave</div>
  <div class="ab ctr t w" id="t2" style="top:1360px;font-size:20px;line-height:1.6">tú eliges qué apps se pausan<br><span style="opacity:.7">you choose which apps pause</span></div>
</div>
<div id="sC" class="layer" style="background:var(--cream);color:var(--black)">
  <div class="ph" id="phC" style="background-image:url(assets/dj/glass.jpg);background-position:center 62%"></div>
  <div class="ab ctr it w" id="g1" style="top:760px;font-size:64px">un tequila se toma despacio</div>
  <div class="ab ctr t w" id="g2" style="top:860px;font-size:18px;opacity:.8">tequila is sipped slowly</div>
  <div class="ab sp t" style="left:64px;right:64px;top:1640px;align-items:flex-end"><div>{g.lock("black", 18, 44)}</div><div style="text-align:right">A loomlock project<br>{GEO}</div></div>
  <div class="foot" style="color:rgba(11,11,11,.7)">{LEGAL}</div>
</div>
'''
    js = ""
    for r in range(3):
        t0 = 0.48 + r * 1.92
        js += fade(f"#r{r}", t0, .3)
        js += "".join(f'tl.fromTo("#r{r}i{i}", {{ opacity: 0, x: -10 }}, {{ opacity: 1, x: 0, duration: .25 }}, {t0 + .36 + i*0.36:.2f});\n' for i in range(3))
    js += fade("#sid", 6.24) + fade("#sgl", 6.6)
    js += 'tl.set("#sA", { opacity: 0 }, 7.2); tl.set("#sB", { opacity: 1 }, 7.2); flash(7.2, .3, .2);\n'
    js += "".join(f'tl.set("#c{i}", {{ opacity: 1 }}, {7.2 + i*0.24:.2f});\n' for i in range(6))
    js += 'tl.fromTo("#rg", { opacity: .9, scale: .8 }, { opacity: 0, scale: 1.5, duration: .9, ease: "power2.out" }, 8.4);\n'
    js += 'tl.fromTo("#dot", { scale: 1 }, { scale: .92, duration: .12, yoyo: true, repeat: 1 }, 8.4);\n'
    js += fade("#t1", 8.64) + fade("#t2", 9.0)
    js += 'tl.set("#sB", { opacity: 0 }, 9.6); tl.set("#sC", { opacity: 1 }, 9.6);\n'
    js += 'tl.fromTo("#phC", { scale: 1.1 }, { scale: 1.04, duration: 2.4, ease: "none" }, 9.6);\n'
    js += fade("#g1", 9.84, .6) + fade("#g2", 10.4)
    return dur, html, js, 5.31, EXTRA

# ---------------------------------------------------------------- R3 · fuera del aire (11 s)
def r3():
    dur = 11.0
    html = f'''
<div id="tvbox" class="ab" style="inset:0;transform-origin:50% 50%">
  <div id="sA" class="layer" style="opacity:1">
    <div class="ph" id="phA" style="background-image:url(assets/dj/brindis.jpg);background-position:center 30%;filter:contrast(1.12) saturate(1.15) brightness(1.06)"></div>
    <div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,0) 20%,rgba(0,0,0,0) 70%,rgba(0,0,0,.55))"></div>
    <div class="ab sp t" style="left:64px;right:64px;top:120px;align-items:center">{IDENT}<span style="display:flex;align-items:center;gap:12px"><span class="rec" id="osd-rec"></span>en vivo · live</span></div>
    <div class="ab ctr w" id="s1" style="top:1420px;font-weight:600;font-size:46px;text-shadow:0 2px 12px rgba(0,0,0,.6)">las mejores historias de fiesta</div>
    <div class="ab ctr w" id="s2" style="top:1420px;font-weight:600;font-size:46px;text-shadow:0 2px 12px rgba(0,0,0,.6)">nunca se subieron.</div>
    <div class="ab ctr w" id="s3" style="top:1490px;font-weight:500;font-size:24px;opacity:.85;text-shadow:0 2px 10px rgba(0,0,0,.6)">the best party stories were never posted.</div>
  </div>
</div>
<div id="sOff" class="layer" style="background:var(--black);color:var(--cream)">
  <div class="ab sp t" style="left:64px;right:64px;top:120px;color:#8d8a85;align-items:center">{IDENT}<span>sin señal · no signal</span></div>
  <div class="ab w" id="o0" style="left:450px;width:180px;top:958px;height:2px;background:var(--cream);box-shadow:0 0 18px 2px rgba(233,225,216,.5)"></div>
  <div class="ab ctr it w" id="o1" style="top:1000px;font-size:50px">fuera del aire</div>
  <div class="ab ctr t w" id="o2" style="top:1080px;font-size:18px;color:#8d8a85">volvemos después · back later</div>
  <div class="ab ctr t w" id="o3" style="top:1560px;font-size:17px;color:#8d8a85">{GEO}</div>
  <div class="ab ctr t w" id="o4" style="top:1610px;font-size:17px;color:#8d8a85">A loomlock project · Tequila Don Julio</div>
  <div class="foot" style="color:#9a968f">{LEGAL}</div>
</div>
<div class="tvline" id="tv"></div>
'''
    js = 'for (let k = 0; k < 11; k++) tl.set("#osd-rec", { opacity: k % 2 ? .25 : 1 }, k * .5);\n'
    js += 'tl.fromTo("#phA", { scale: 1.0 }, { scale: 1.08, duration: 5.3, ease: "none" }, 0);\n'
    js += fade("#s1", .96) + 'tl.set("#s1", { opacity: 0 }, 2.4);\n' + fade("#s2", 2.4) + fade("#s3", 2.9)
    js += '''tl.to("#tvbox", { scaleY: .004, duration: .22, ease: "power3.in" }, 5.04);
tl.set("#tv", { opacity: 1, scaleX: 1 }, 5.26); tl.set("#tvbox", { opacity: 0 }, 5.26);
tl.to("#tv", { scaleX: 0, duration: .28, ease: "power3.in" }, 5.26); tl.set("#tv", { opacity: 0 }, 5.56);
tl.set("#sOff", { opacity: 1 }, 6.0);
'''
    js += fade("#o0", 6.3) + fade("#o1", 6.7, .6) + fade("#o2", 7.4) + fade("#o3", 8.4) + fade("#o4", 8.8)
    return dur, html, js, 2.43, EXTRA

if __name__ == "__main__":
    g.write("m1-invitacion", r1)
    g.write("m2-como-funciona", r2)
    g.write("m3-fuera-del-aire", r3, adur_override=5.3, fade_at=5.2)
    for n in ["m1-invitacion", "m2-como-funciona", "m3-fuera-del-aire"]:
        for f in ["outfit-600", "montserrat-italic-500", "spacemono-400", "spacemono-700"]:
            shutil.copy(g.CAMP / "fonts" / f"{f}.woff2", g.HERE / n / "assets" / "fonts")
