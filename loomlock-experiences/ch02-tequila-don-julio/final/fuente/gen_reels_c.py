"""CH 02 · Tequila Don Julio — 'compañero' line.
Coworker's system (CRT screen, Montserrat light-italic + extra-bold, yellow accent, two-part lines,
LIVE HUD + 'LIVE NOW, POST LATER' ticker, blue grid invite) with kinetic typography inside the screen
instead of stock footage (Pinterest refs: rotated type grid, letters assembling, blur stack, redaction).
Writes three HyperFrames projects (c1-thursday, c2-channel-02, c3-not-recording) and the static pieces."""
import pathlib, shutil, json, random, subprocess

HERE = pathlib.Path(__file__).parent
SP = HERE.parent
CAMP = SP / "camp" / "assets"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
LEGAL = ("El exceso de alcohol es perjudicial para la salud.<br>"
         "Prohíbase el expendio de bebidas embriagantes a menores de edad.")
COORD = "4.6482° N · 74.0636° W"
B = 0.48  # 125 BPM

CSS = """
@font-face{font-family:"Montserrat";font-style:normal;font-weight:100 900;src:url("assets/fonts/montserrat-var.woff2") format("woff2")}
@font-face{font-family:"Montserrat";font-style:italic;font-weight:100 900;src:url("assets/fonts/montserrat-italic-var.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/spacemono-400.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/spacemono-700.woff2") format("woff2")}
:root{--bg:#060609;--blue:#2F3AD0;--blue2:#1B239A;--yel:#FCCE21;--ink:#F4F2EE}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font-family:"Montserrat",sans-serif;color:var(--ink)}
#root{position:relative;overflow:hidden;background:var(--bg)}
.ab{position:absolute}
.i{font-style:italic;font-weight:300}
.b{font-weight:800}
.y{color:var(--yel)}
.mono{font-family:"Space Mono",monospace}
.rays{position:absolute;left:50%;top:50%;width:2600px;height:2600px;margin:-1300px 0 0 -1300px;
  background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.10) 0deg 3deg,rgba(255,255,255,0) 3deg 11deg);
  filter:blur(14px);opacity:.55;-webkit-mask:radial-gradient(closest-side,rgba(0,0,0,0) 22%,#000 46%,rgba(0,0,0,0) 100%);mask:radial-gradient(closest-side,rgba(0,0,0,0) 22%,#000 46%,rgba(0,0,0,0) 100%)}
.vig{position:absolute;inset:0;background:radial-gradient(75% 60% at 50% 48%,rgba(6,6,9,0) 40%,rgba(6,6,9,.92) 100%);pointer-events:none}
.tick{position:absolute;left:0;top:26px;white-space:nowrap;font-weight:800;font-size:22px;letter-spacing:.08em;color:rgba(244,242,238,.42)}
.hud{position:absolute;display:flex;justify-content:space-between;align-items:center;font-family:"Space Mono",monospace;font-size:20px;letter-spacing:.06em;color:rgba(244,242,238,.75)}
.hud .l{display:flex;align-items:center;gap:14px}
.dot{width:14px;height:14px;border-radius:50%;background:var(--yel);box-shadow:0 0 12px var(--yel)}
.br{position:absolute;width:34px;height:34px;border-color:rgba(244,242,238,.5);border-style:solid;border-width:0}
.hl{position:absolute;left:0;right:0;text-align:center;line-height:1.08;text-shadow:0 0 22px rgba(255,255,255,.28)}
.hl span{display:block}
.crt{position:absolute;overflow:hidden;background:#09090d;border-radius:11% / 9%;
  box-shadow:0 0 0 16px #040406,0 0 0 18px #1c1c22,0 40px 90px rgba(0,0,0,.85),0 0 140px rgba(70,80,255,.12)}
.crt .scr{position:absolute;inset:0}
.crt .lay{position:absolute;inset:0;opacity:0;overflow:hidden}
.crt .scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,rgba(0,0,0,0) 2px 5px);mix-blend-mode:multiply;pointer-events:none}
.crt .glass{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 140px 40px rgba(0,0,0,.85),inset 0 0 30px 6px rgba(0,0,0,.9);
  background:radial-gradient(60% 40% at 28% 18%,rgba(255,255,255,.10),rgba(255,255,255,0) 70%);pointer-events:none}
.crt .static{position:absolute;inset:-10%;width:120%;height:120%;image-rendering:pixelated;opacity:0;filter:grayscale(1) contrast(2.2) brightness(1.25)}
.crt .fl{position:absolute;inset:0;background:#fff;opacity:0}
.ct{position:absolute;text-shadow:2px 0 rgba(255,40,80,.35),-2px 0 rgba(40,200,255,.35)}
.outl{position:absolute;left:0;right:0;text-align:center;font-weight:800;color:transparent;-webkit-text-stroke:2.5px rgba(244,242,238,.92);
  text-shadow:0 0 26px rgba(255,255,255,.35);white-space:nowrap}
.sub{position:absolute;left:0;right:0;text-align:center;line-height:1.35}
.legal{position:absolute;left:0;right:0;text-align:center;font-style:italic;font-weight:400;color:rgba(244,242,238,.55);line-height:1.35}
.grid{background-color:var(--blue);background-image:linear-gradient(rgba(255,255,255,.09) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.09) 2px,transparent 2px);background-size:64px 64px;background-position:center}
.bar{position:absolute;background:#000;transform-origin:0 50%}
.hi{position:absolute;background:var(--yel);transform-origin:0 50%}
.grain{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:overlay;opacity:0;image-rendering:pixelated;pointer-events:none}
"""

def rnd(seed):
    return random.Random(seed)

def scramble(s, seed, n=3):
    r = rnd(seed)
    pool = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>*+%#&"
    out = []
    for k in range(n):
        out.append("".join(c if c == " " else r.choice(pool) for c in s))
    return out

# ------------------------------------------------------------------ kinetic scenes (inside the CRT)
# each returns (html, js(t0, t1)) ; markup default == final state (so statics need no JS)

def k_grid(p, cols, w, h):
    """Rotated type grid (TIME IS FORM ref). cols: list of (text, style) where style in w|y|o"""
    n = len(cols); cw = w / n; fs = cw * 0.86
    html = ""
    for i, (t, st) in enumerate(cols):
        col = {"w": "color:var(--ink)", "y": "color:var(--yel)", "o": "color:#09090d;-webkit-text-stroke:2px var(--ink)"}[st]
        rot = 180 if i % 2 == 0 else 0
        fs = min(cw * 0.86, h * 0.92 / (len(t) * 0.74))
        html += (f'<div class="ct" id="{p}c{i}" style="left:{i*cw:.0f}px;top:0;width:{cw:.0f}px;height:{h}px;display:flex;align-items:center;justify-content:center">'
                 f'<div style="writing-mode:vertical-rl;transform:rotate({rot}deg);font-weight:900;font-size:{fs:.0f}px;line-height:.82;letter-spacing:-.02em;white-space:nowrap;{col}">{t}</div></div>')
    def js(t0, t1):
        s = ""
        for i in range(n):
            d = -1 if i % 2 else 1
            s += f'tl.fromTo("#{p}c{i}",{{y:{d*h}}},{{y:0,duration:.55,ease:"power4.out"}},{t0 + .05 + i*.07:.2f});'
            s += f'tl.to("#{p}c{i}",{{y:{-d*40},duration:{t1-t0-.6:.2f},ease:"none"}},{t0 + .62 + i*.07:.2f});'
        return s
    return html, js

def k_assemble(p, word, sub, w, h, fs=230, dance=False, color="var(--ink)", sub2=""):
    """Scattered letters converge into a word (kinetic type ref); optional jitter on each beat."""
    r = rnd(p)
    letters = "".join(f'<span id="{p}l{i}" style="display:inline-block">{c if c != " " else "&nbsp;"}</span>' for i, c in enumerate(word))
    html = (f'<div class="ct" style="left:0;right:0;top:{h*.5 - fs*.62:.0f}px;text-align:center;font-weight:900;font-size:{fs}px;letter-spacing:-.03em;line-height:1;color:{color};white-space:nowrap">{letters}</div>'
            f'<div class="ct mono" id="{p}s" style="left:0;right:0;top:{h*.5 + fs*.48:.0f}px;text-align:center;font-size:26px;letter-spacing:.14em;color:var(--yel)">{sub}</div>')
    if sub2:
        html += f'<div class="ct mono" id="{p}s2" style="left:0;right:0;top:{h*.5 - fs*.62 - 70:.0f}px;text-align:center;font-size:22px;letter-spacing:.2em;color:rgba(244,242,238,.6)">{sub2}</div>'
    def js(t0, t1):
        s = ""
        for i, c in enumerate(word):
            x = r.uniform(-w * .55, w * .55); y = r.uniform(-h * .45, h * .45); ro = r.uniform(-120, 120)
            s += f'tl.fromTo("#{p}l{i}",{{x:{x:.0f},y:{y:.0f},rotation:{ro:.0f},opacity:0,scale:{r.uniform(.4,2.2):.2f}}},{{x:0,y:0,rotation:0,opacity:1,scale:1,duration:.75,ease:"expo.out"}},{t0 + .04 + i*.035:.2f});'
            if dance:
                t = t0 + 1.0; k = 0
                while t < t1 - .05:
                    s += f'tl.set("#{p}l{i}",{{y:{r.uniform(-40,40):.0f},rotation:{r.uniform(-9,9):.0f}}},{t:.2f});'
                    t += B; k += 1
        s += f'tl.fromTo("#{p}s",{{opacity:0,scaleX:1.6}},{{opacity:1,scaleX:1,duration:.6,ease:"power3.out"}},{t0 + .55:.2f});'
        if sub2:
            s += f'tl.fromTo("#{p}s2",{{opacity:0}},{{opacity:1,duration:.3}},{t0 + .7:.2f});'
        return s
    return html, js

def k_stack(p, word, w, h, rows=9, fs=170, focus=None, pulse_from=None, color="var(--ink)"):
    """Repeated word, blurred away from the focus row (FOCUS ref). Pulses on the beat."""
    focus = rows // 2 if focus is None else focus
    rh = fs * .92
    top0 = h / 2 - rh * (focus + .5)
    html = ""
    for i in range(rows):
        d = abs(i - focus)
        st = f"filter:blur({d*3.2:.1f}px);opacity:{max(.12, 1 - d*.17):.2f}"
        c = "var(--yel)" if (i == focus and color == "focus-y") else ("var(--ink)" if color == "focus-y" else color)
        html += (f'<div class="ct" id="{p}r{i}" style="left:0;right:0;top:{top0 + i*rh:.0f}px;text-align:center;font-weight:900;font-size:{fs}px;line-height:{rh:.0f}px;'
                 f'letter-spacing:-.02em;white-space:nowrap;color:{c};{st}">{word}</div>')
    html = f'<div id="{p}st" class="ab" style="inset:0">{html}</div>'
    def js(t0, t1):
        s = f'tl.fromTo("#{p}st",{{y:{rh*3:.0f}}},{{y:0,duration:.9,ease:"power3.out"}},{t0:.2f});'
        pf = t0 + .9 if pulse_from is None else pulse_from
        t = pf; first = True
        while t < t1 - .1:
            ir = "" if first else ",immediateRender:false"
            s += f'tl.fromTo("#{p}r{focus}",{{scale:1.09}},{{scale:1,duration:.3,ease:"power2.out"{ir}}},{t:.2f});'
            for j in (focus - 1, focus + 1):
                s += f'tl.fromTo("#{p}r{j}",{{opacity:.95}},{{opacity:{max(.12, 1 - .17):.2f},duration:.3{ir}}},{t:.2f});'
            t += B; first = False
        return s
    return html, js

def k_strike(p, lines, keep, w, h, fs=50, logo=None, step=None, tail=""):
    """List of lines struck through one by one; the kept line lights up (redaction ref)."""
    lh = fs * 1.55; n = len(lines)
    top0 = h / 2 - lh * n / 2 - (60 if logo else 0)
    html = ""
    for i, t in enumerate(lines):
        y = top0 + i * lh
        if i == keep:
            html += (f'<div class="ab" id="{p}k" style="left:70px;top:{y:.0f}px;height:{lh:.0f}px;display:flex;align-items:center">'
                     f'<div class="hi" id="{p}kh" style="left:-14px;right:-14px;top:{lh*.12:.0f}px;bottom:{lh*.12:.0f}px"></div>'
                     f'<span class="ct" style="position:relative;font-weight:800;font-size:{fs}px;color:#0b0b0b;text-shadow:none">{t}</span></div>')
        else:
            html += (f'<div class="ab" style="left:70px;top:{y:.0f}px;height:{lh:.0f}px;display:flex;align-items:center">'
                     f'<span class="ct i" style="position:relative;font-size:{fs}px;color:rgba(244,242,238,.85)">{t}</span>'
                     f'<div class="bar" id="{p}b{i}" style="left:-12px;right:-12px;top:{lh*.5-3:.0f}px;height:6px;background:var(--yel);box-shadow:0 0 12px rgba(252,206,33,.6)"></div></div>')
    if logo:
        html += f'<img id="{p}lg" src="assets/img/{logo}" alt="Tequila Don Julio" class="ab" style="left:{w/2-120:.0f}px;top:{top0 + n*lh + 50:.0f}px;width:240px">'
    html += tail
    def js(t0, t1):
        st = step or min(.3, (t1 - t0 - 1.0) / max(1, n))
        s = ""; k = 0
        for i in range(n):
            if i == keep:
                continue
            s += f'tl.fromTo("#{p}b{i}",{{scaleX:0}},{{scaleX:1,duration:.16,ease:"power2.out"}},{t0 + .3 + k*st:.2f});'
            k += 1
        tk = t0 + .3 + k * st + .05
        s += f'tl.fromTo("#{p}kh",{{scaleX:0}},{{scaleX:1,duration:.22,ease:"power3.out"}},{tk:.2f});'
        if logo:
            s += f'tl.fromTo("#{p}lg",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.4}},{tk + .2:.2f});'
        return s
    return html, js

FEED = [("instagram", "liked your story"), ("whatsapp", "47 unread messages"), ("tiktok", "you might like this"),
        ("mail", "Re: Re: Re: quick question"), ("instagram", "is live now"), ("calendar", "Sync — in 5 min"),
        ("x", "trending in Bogotá"), ("slack", "@channel urgent"), ("whatsapp", "Mamá: ¿llegaste?"),
        ("tiktok", "new followers"), ("instagram", "posted for the first time in a while"), ("mail", "Your weekly screen time report"),
        ("bank", "purchase approved"), ("x", "you have 12 new notifications"), ("slack", "3 new threads"), ("instagram", "tagged you in a reel")]

def k_feed(p, w, h, last="off.", word_fs=300, last_col="var(--yel)"):
    """Endless notification feed, then everything gets redacted and one word remains."""
    rh = 92; rows = FEED * 3
    items = ""
    for i, (a, m) in enumerate(rows):
        items += (f'<div style="position:absolute;left:56px;right:56px;top:{i*rh}px;height:{rh-14}px;border-radius:22px;background:rgba(244,242,238,.08);'
                  f'display:flex;align-items:center;gap:20px;padding:0 26px;font-size:28px">'
                  f'<span class="b" style="text-transform:uppercase;letter-spacing:.08em;font-size:22px;color:var(--yel)">{a}</span><span class="i">{m}</span></div>')
    total = len(rows) * rh
    rr = rnd(p + "bars")
    bars = "".join(f'<div class="bar" id="{p}x{i}" style="left:{rr.choice([56, 56, 150, 260])}px;width:{rr.randint(260, 620)}px;top:{i*rh+10:.0f}px;height:{rh-34}px;background:#000"></div>'
                   for i in range(int(h / rh) + 2))
    html = (f'<div class="ab" id="{p}f" style="left:0;right:0;top:{-(total - h*1.2):.0f}px;height:{total}px">{items}</div>'
            f'<div class="ab" style="inset:0">{bars}</div>'
            f'<div class="ct" id="{p}w" style="left:0;right:0;top:{h/2 - word_fs*.62:.0f}px;text-align:center;font-weight:900;font-size:{word_fs}px;line-height:1;letter-spacing:-.04em;color:{last_col}">{last}</div>')
    def js(t0, t1):
        sc = total - h * 1.2
        s = f'tl.fromTo("#{p}f",{{y:{sc:.0f}}},{{y:0,duration:{(t1-t0)*.55:.2f},ease:"power1.in"}},{t0:.2f});'
        tb = t0 + (t1 - t0) * .5
        for i in range(int(h / rh) + 2):
            s += f'tl.fromTo("#{p}x{i}",{{scaleX:0}},{{scaleX:1,duration:.12,ease:"power2.out"}},{tb + i*.035:.2f});'
        tw = tb + (int(h / rh) + 2) * .035 + .1
        s += f'tl.fromTo("#{p}w",{{opacity:0,scale:1.25}},{{opacity:1,scale:1,duration:.3,ease:"power3.out"}},{tw:.2f});'
        return s
    return html, js

def k_bignum(p, a, b, w, h, side=""):
    """Channel switch to a huge number (TONEL ref): blue, yellow numerals, mono annotations."""
    html = (f'<div class="ab grid" style="inset:0"></div>'
            f'<div class="ct" id="{p}a" style="left:0;right:0;top:{h*.5 - 330:.0f}px;text-align:center;font-weight:900;font-size:560px;line-height:1;letter-spacing:-.06em;color:var(--yel);opacity:0">{a}</div>'
            f'<div class="ct" id="{p}b" style="left:0;right:0;top:{h*.5 - 330:.0f}px;text-align:center;font-weight:900;font-size:560px;line-height:1;letter-spacing:-.06em;color:var(--yel)">{b}</div>'
            f'<div class="ct mono" style="left:58px;top:70px;font-size:24px;letter-spacing:.12em;line-height:1.5">CH<br>LOOMLOCK<br>EXPERIENCES</div>'
            f'<div class="ct mono" style="right:58px;top:70px;font-size:24px;letter-spacing:.12em;line-height:1.5;text-align:right">29.10<br>BOGOTÁ<br>CO</div>'
            f'<div class="ct mono" id="{p}c" style="left:58px;right:58px;bottom:70px;font-size:22px;letter-spacing:.12em;display:flex;justify-content:space-between"><span>{COORD}</span><span>{side}</span></div>')
    def js(t0, t1):
        s = f'tl.set("#{p}a",{{opacity:1}},{t0:.2f});tl.set("#{p}b",{{opacity:0}},{t0:.2f});'
        tm = t0 + B * 2
        s += f'tl.set("#{p}a",{{opacity:0}},{tm:.2f});tl.set("#{p}b",{{opacity:1}},{tm + .1:.2f});'
        s += f'tl.fromTo("#{p}b",{{scaleY:.02}},{{scaleY:1,duration:.25,ease:"expo.out"}},{tm + .1:.2f});'
        return s
    return html, js

def k_invite(p, lines, w, h, extra=""):
    """Blue grid invite (coworker's closing card). lines: list of (html, cls, size)."""
    lh_tot = sum(sz * 1.18 for _, _, sz in lines)
    y = h / 2 - lh_tot / 2
    html = '<div class="ab grid" style="inset:0"></div>'
    for i, (t, c, sz) in enumerate(lines):
        html += f'<div class="ct {c}" id="{p}t{i}" style="left:40px;right:40px;top:{y:.0f}px;text-align:center;font-size:{sz}px;line-height:1.1">{t}</div>'
        y += sz * 1.18
    html += extra
    def js(t0, t1):
        s = ""
        for i in range(len(lines)):
            s += f'tl.fromTo("#{p}t{i}",{{opacity:0,y:18}},{{opacity:1,y:0,duration:.3,ease:"power3.out"}},{t0 + .2 + i*B:.2f});'
        return s
    return html, js

# ------------------------------------------------------------------ frame (9:16 reel)

def lockup(h=30, dh=58, gap=16, op=1):
    return (f'<div style="display:flex;align-items:center;justify-content:center;gap:{gap}px;opacity:{op}">'
            f'<img src="assets/img/loomlock_white.png" style="height:{h}px" alt="loomlock"><span class="i" style="font-size:{h*.95:.0f}px">×</span>'
            f'<img src="assets/img/dj_white.png" style="height:{dh}px" alt="Tequila Don Julio"></div>')

def invite_foot(top, big=False):
    return f'''<div class="sub" style="top:{top}px">
  {lockup(44, 76)}
  <div style="margin-top:22px;font-size:28px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá · 70 spots · 18+</span></div>
  <div style="margin-top:6px;font-size:26px"><span class="b">Sign up</span> <span class="i">via WhatsApp</span></div>
  <div style="margin-top:6px;font-size:26px"><span class="i">Live now,</span> <span class="b y">post later.</span></div>
</div>'''

def reel(name, scenes, dur, title):
    """scenes: list of dicts {t0,t1,a,b,kind:(html,js),foot,outl,ycls}"""
    W, H = 1080, 1920
    CX, CY, CW, CH = 80, 430, 920, 1110
    tick_unit = "LIVE NOW, POST LATER · CH 02 · BOGOTÁ · "
    tick = (tick_unit * 8)
    body = f'''
<div class="rays" id="rays"></div>
<div class="vig"></div>
<div class="tick" id="tick">{tick}</div>
<div class="hud" style="left:66px;right:66px;top:92px"><div class="l"><span class="dot" id="dot"></span><span class="b" style="font-family:Montserrat;font-size:20px">LIVE</span><span>CH 02</span></div><span id="tc">00:00:00:00</span></div>
<div class="br" style="left:52px;top:{CY-34}px;border-left-width:3px;border-top-width:3px"></div>
<div class="br" style="right:52px;top:{CY-34}px;border-right-width:3px;border-top-width:3px"></div>
<div class="br" style="left:52px;top:{CY+CH}px;border-left-width:3px;border-bottom-width:3px"></div>
<div class="br" style="right:52px;top:{CY+CH}px;border-right-width:3px;border-bottom-width:3px"></div>
'''
    crt_layers = ""; heads = ""; foots = ""; outls = ""; js = ""
    for n, s in enumerate(scenes):
        sid = f"s{n}"
        h_html, h_js = s["kind"]
        crt_layers += f'<div class="lay" id="{sid}">{h_html}</div>'
        a, bb = s["a"], s["b"]
        heads += (f'<div class="hl" id="{sid}h" style="top:{s.get("htop",190)}px;opacity:0">'
                  f'<span class="{a[1]}" id="{sid}ha" style="font-size:{a[2]}px">{a[0]}</span>'
                  f'<span class="{bb[1]}" id="{sid}hb" style="font-size:{bb[2]}px">{bb[0]}</span></div>')
        if s.get("foot"):
            foots += f'<div class="sub" id="{sid}f" style="top:{CY+CH+62}px;font-size:30px;opacity:0">{s["foot"]}</div>'
        if s.get("outl"):
            o, otop, ofs = s["outl"]
            outls += f'<div class="outl" id="{sid}o" style="top:{otop}px;font-size:{ofs}px;opacity:0">{o}</div>'
        t0, t1 = s["t0"], s["t1"]
        js += f'tl.set("#{sid}",{{opacity:1}},{t0:.2f});tl.set("#{sid}h",{{opacity:1}},{t0:.2f});'
        if n < len(scenes) - 1:
            js += f'tl.set("#{sid}",{{opacity:0}},{t1:.2f});tl.set("#{sid}h",{{opacity:0}},{t1:.2f});'
        # channel-change burst on the CRT
        js += f'burst({t0:.2f});'
        # scramble headline
        for part, txt in (("ha", a[0]), ("hb", bb[0])):
            plain = txt
            if "<" in plain:
                continue
            for k, sc in enumerate(scramble(plain, f"{name}{n}{part}")):
                js += f'tl.set("#{sid}{part}",{{textContent:{json.dumps(sc)}}},{t0 + k/15:.3f});'
            js += f'tl.set("#{sid}{part}",{{textContent:{json.dumps(plain)}}},{t0 + 3/15:.3f});'
        js += f'tl.fromTo("#{sid}h",{{y:14}},{{y:0,duration:.35,ease:"power3.out"}},{t0:.2f});'
        if s.get("foot"):
            js += f'tl.fromTo("#{sid}f",{{opacity:0}},{{opacity:1,duration:.3}},{t0 + .5:.2f});'
            if n < len(scenes) - 1:
                js += f'tl.set("#{sid}f",{{opacity:0}},{t1:.2f});'
        if s.get("outl"):
            js += f'tl.fromTo("#{sid}o",{{opacity:0,scale:1.3}},{{opacity:1,scale:1,duration:.35,ease:"power3.out"}},{t0 + .25:.2f});tl.to("#{sid}o",{{opacity:0,duration:.25}},{t1 - .3:.2f});'
        js += h_js(t0, t1)
    body += f'''
{heads}
<div class="crt" id="crt" style="left:{CX}px;top:{CY}px;width:{CW}px;height:{CH}px">
  <div class="scr">{crt_layers}</div>
  <img class="static" id="stA" src="assets/img/static0.png" alt=""><img class="static" id="stB" src="assets/img/static1.png" alt="">
  <div class="fl" id="cfl"></div><div class="scan"></div><div class="glass"></div>
</div>
{outls}
{foots}
<div class="legal" style="top:1832px;font-size:15px">{LEGAL}</div>
<img class="grain" id="gr0" src="assets/img/grain0.png" alt=""><img class="grain" id="gr1" src="assets/img/grain1.png" alt="">
<img class="grain" id="gr2" src="assets/img/grain2.png" alt=""><img class="grain" id="gr3" src="assets/img/grain3.png" alt="">
<audio id="music" src="assets/techno_long.wav" data-start="0" data-duration="{dur}" data-media-start="0" data-volume="1"
 data-automation='{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.2,"v":0.95}},{{"t":{dur-1.2:.2f},"v":1}},{{"t":{dur},"v":0}}]}}]}}'></audio>
'''
    tc = ""
    t = 0.0
    while t < dur:
        sec = int(t); fr = int(round((t - sec) * 30))
        tc += f'tl.set("#tc",{{textContent:"00:00:{sec:02d}:{fr:02d}"}},{t:.2f});'
        t += 0.1
    pre = f'''
const burst = (t) => {{ tl.set("#stA",{{opacity:.9}},t); tl.set("#stA",{{opacity:0}},t+1/15); tl.set("#stB",{{opacity:.8}},t+1/15); tl.set("#stB",{{opacity:0}},t+2/15);
  tl.set("#cfl",{{opacity:.35}},t); tl.to("#cfl",{{opacity:0,duration:.18}},t+.02); }};
for (let i = 0; i < 4; i++) tl.set("#gr" + i, {{ opacity: 0 }}, 0);
for (let f = 0, t = 0; t < {dur}; f++, t = f / 12) {{ tl.set("#gr" + (f % 4), {{ opacity: .16 }}, t); tl.set("#gr" + ((f + 3) % 4), {{ opacity: 0 }}, t); }}
for (let t = 0; t < {dur}; t += {B}) {{ tl.set("#dot", {{ opacity: 1 }}, t); tl.set("#dot", {{ opacity: .25 }}, t + {B/2}); }}
tl.fromTo("#tick", {{ x: 0 }}, {{ x: -1400, duration: {dur}, ease: "none" }}, 0);
tl.fromTo("#rays", {{ rotation: 0 }}, {{ rotation: 14, duration: {dur}, ease: "none" }}, 0);
tl.fromTo("#crt", {{ scale: 1 }}, {{ scale: 1.012, duration: {B/2}, yoyo: true, repeat: {int(dur/B*2)-1}, ease: "sine.inOut" }}, 7.2);
{tc}
'''
    html = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width={W}, height={H}" />
<title>{title}</title><script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{CSS}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="{W}" data-height="{H}" data-duration="{dur}" style="width:{W}px;height:{H}px">
{body}
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
{pre}
{js}
window.__timelines["main"] = tl;
const q = new URLSearchParams(location.search).get("t"); if (q) tl.seek(+q);
</script></body></html>'''
    d = HERE / name
    (d / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (d / "assets" / "img").mkdir(exist_ok=True)
    for f in ["montserrat-var", "montserrat-italic-var", "spacemono-400", "spacemono-700"]:
        shutil.copy(CAMP / "fonts" / f"{f}.woff2", d / "assets" / "fonts")
    for f in ["dj_white.png", "loomlock_white.png", "donjulio_white.png"]:
        shutil.copy(CAMP / "img" / f, d / "assets" / "img")
    for i in range(4):
        shutil.copy(SP / "hf7" / "assets" / "img" / f"grain{i}.png", d / "assets" / "img")
    shutil.copy(SP / "hf7" / "assets" / "img" / "grain1.png", d / "assets" / "img" / "static0.png")
    shutil.copy(SP / "hf7" / "assets" / "img" / "grain3.png", d / "assets" / "img" / "static1.png")
    shutil.copy(HERE / "c" / "techno_long.wav", d / "assets")
    for f in ["hyperframes.json", "meta.json"]:
        shutil.copy(SP / "hf8" / f, d)
    (d / "package.json").write_text(json.dumps({"name": name, "private": True, "type": "module"}, indent=2))
    (d / "index.html").write_text(html)
    print("wrote", d)

W_, H_ = 920, 1110
POCKET = '<span class="b">Your phone stays</span> <span class="i">in your pocket.</span><br><span class="i">The apps take</span> <span class="b">the night off.</span>'

# ------------------------------------------------------------------ C1 · Thursday (the night, told in type)
def c1():
    T = [0, 2.4, 4.8, 7.2, 9.6, 12.0, 14.4, 19.68]
    sc = [
        dict(a=("Thursday,", "i", 74), b=("7 pm.", "b", 92),
             kind=k_grid("a", [("THURSDAY", "w"), ("19:00", "y"), ("LAPTOP", "o"), ("CLOSED.", "w")], W_, H_),
             foot='<span class="i">Laptop:</span> <span class="b">closed.</span>'),
        dict(a=("Bogotá,", "b", 92), b=("fully charged.", "i", 74),
             kind=k_assemble("b", "BOGOTÁ", COORD, W_, H_, fs=176, sub2="BATTERY 100% · CH 02")),
        dict(a=("Tequila,", "i", 74), b=("neat.", "b y", 92),
             kind=k_strike("c", ["tequila, with a story", "tequila, with a filter", "tequila, for the feed", "tequila, neat."], 3, W_, H_, fs=54, logo="dj_white.png")),
        dict(a=("Music,", "i", 74), b=("loud.", "b", 92),
             kind=k_stack("d", "LOUD", W_, H_, rows=9, fs=200, pulse_from=7.2, color="focus-y")),
        dict(a=("Dance like", "i", 74), b=("nobody's recording.", "b y", 80),
             kind=k_assemble("e", "NO REC", "● REC — OFF", W_, H_, fs=200, dance=True)),
        dict(a=("Feed,", "i", 74), b=("off.", "b y", 92), kind=k_feed("f", W_, H_), foot=POCKET),
        dict(a=("You're", "i", 74), b=("invited.", "b", 92),
             kind=k_invite("g", [("A party", "i", 80), ("worth", "i", 80), ("remembering.", "b y", 96), ("Not recording.", "i", 46)], W_, H_)),
    ]
    for i, s in enumerate(sc):
        s["t0"], s["t1"] = T[i], T[i + 1]
    sc[-1]["foot"] = None
    reel("c1-thursday", sc, 19.68, "CH 02 · Thursday")
    # invite footer is permanent for the last scene
    p = HERE / "c1-thursday" / "index.html"
    t = p.read_text().replace('<div class="legal"', f'<div id="invf" style="opacity:0">{invite_foot(1580)}</div>\n<div class="legal"', 1)
    t = t.replace('window.__timelines["main"] = tl;', f'tl.fromTo("#invf",{{opacity:0}},{{opacity:1,duration:.4}},{T[6] + 1.5});\nwindow.__timelines["main"] = tl;', 1)
    p.write_text(t)

# ------------------------------------------------------------------ C2 · Channel 02 (the series, global)
def c2():
    T = [0, 2.4, 4.8, 7.2, 9.6, 12.0, 14.4, 19.68]
    sc = [
        dict(a=("Loomlock", "b", 88), b=("experiences.", "i", 74), kind=k_bignum("a", "01", "02", W_, H_, "SERIES · GLOBAL")),
        dict(a=("One rule,", "i", 74), b=("every city.", "b", 92),
             kind=k_grid("b", [("PHONE: IN", "w"), ("APPS: OFF", "y"), ("CITY: ANY", "o")], W_, H_),
             foot='<span class="i">Same channel,</span> <span class="b">new city.</span>'),
        dict(a=("Bogotá,", "b", 92), b=("on air.", "i", 74),
             kind=k_assemble("c", "BOGOTÁ", COORD, W_, H_, fs=176, sub2="NOW SHOWING · CH 02")),
        dict(a=("Tap in.", "b", 92), b=("Tune out.", "i y", 80),
             kind=k_stack("d", "TAP IN", W_, H_, rows=9, fs=170, pulse_from=7.2, color="focus-y")),
        dict(a=("Tequila Don Julio,", "i", 66), b=("on the table.", "b", 88),
             kind=k_strike("e", ["stories", "reels", "check-ins", "tags", "a toast."], 4, W_, H_, fs=60, logo="dj_white.png")),
        dict(a=("Your screen,", "i", 74), b=("off air.", "b y", 92), kind=k_feed("f", W_, H_, last="CH 02", word_fs=230), foot=POCKET),
        dict(a=("Some things are", "i", 70), b=("worth being there for.", "b", 72),
             kind=k_invite("g", [("Bogotá is", "i", 80), ("CH 02.", "b y", 150), ("Your city", "i", 64), ("could be next.", "b", 64)], W_, H_)),
    ]
    for i, s in enumerate(sc):
        s["t0"], s["t1"] = T[i], T[i + 1]
    reel("c2-channel-02", sc, 19.68, "CH 02 · Channel")
    p = HERE / "c2-channel-02" / "index.html"
    t = p.read_text().replace('<div class="legal"', f'<div id="invf" style="opacity:0">{invite_foot(1580)}</div>\n<div class="legal"', 1)
    t = t.replace('window.__timelines["main"] = tl;', f'tl.fromTo("#invf",{{opacity:0}},{{opacity:1,duration:.4}},{T[6] + 1.5});\nwindow.__timelines["main"] = tl;', 1)
    p.write_text(t)

# ------------------------------------------------------------------ C3 · Not recording (the manifesto)
def c3():
    T = [0, 2.4, 4.8, 7.2, 9.6, 12.0, 14.4, 19.68]
    sc = [
        dict(a=("Everyone's busy.", "b", 80), b=("Mostly scrolling.", "i", 70), kind=k_feed("a", W_, H_, last="...", word_fs=260, last_col="var(--ink)")),
        dict(a=("We filmed the party.", "b", 72), b=("Missed the party.", "i y", 70),
             kind=k_strike("b", ["3,482 photos", "41 stories", "12 reels", "0 memories of it."], 3, W_, H_, fs=64)),
        dict(a=("Some people", "i", 74), b=("show up.", "b", 92), kind=k_assemble("c", "HERE.", "29.10 · BOGOTÁ", W_, H_, fs=250)),
        dict(a=("Loud", "i", 74), b=("songs.", "b", 92), kind=k_stack("d", "SONGS", W_, H_, rows=9, fs=190, pulse_from=7.2, color="focus-y")),
        dict(a=("Moments you", "i", 74), b=("can't refresh.", "b y", 88),
             kind=k_grid("e", [("REFRESH", "o"), ("REFRESH", "o"), ("NOW.", "y"), ("REFRESH", "o")], W_, H_)),
        dict(a=("You,", "i", 74), b=("actually there.", "b", 92), kind=k_assemble("f", "YOU", "LIVE NOW · POST LATER", W_, H_, fs=330, dance=True), foot=POCKET),
        dict(a=("Three hours", "i", 74), b=("offline.", "b y", 92),
             kind=k_invite("g", [("Three hours", "i", 76), ("OFFLINE.", "b y", 120), ("Bogotá is", "i", 64), ("still here.", "b", 64)], W_, H_)),
    ]
    for i, s in enumerate(sc):
        s["t0"], s["t1"] = T[i], T[i + 1]
    reel("c3-not-recording", sc, 19.68, "CH 02 · Not recording")
    p = HERE / "c3-not-recording" / "index.html"
    t = p.read_text().replace('<div class="legal"', f'<div id="invf" style="opacity:0">{invite_foot(1580)}</div>\n<div class="legal"', 1)
    t = t.replace('window.__timelines["main"] = tl;', f'tl.fromTo("#invf",{{opacity:0}},{{opacity:1,duration:.4}},{T[6] + 1.5});\nwindow.__timelines["main"] = tl;', 1)
    p.write_text(t)

if __name__ == "__main__":
    c1(); c2(); c3()
