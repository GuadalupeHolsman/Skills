"""LOCKED IN — dirección MATTE (editorial, invite only). Usa build.py para exportar."""
import sys
import build
from build import KEY, page

LOG = '<img src="assets/img/loomlock_{c}.png" style="height:{h}px" alt="loomlock"><span style="margin:0 {g}px;font-weight:500;font-size:{x}px">×</span><img src="assets/img/donjulio_{c}.png" style="height:{dh}px" alt="Don Julio">'

def logos(c="white", h=22, dh=38, g=12, x=18):
    return f'<div style="display:flex;align-items:center">{LOG.format(c=c, h=h, dh=dh, g=g, x=x)}</div>'

CSS = """
@font-face{font-family:"Space Mono";font-weight:400;src:url("assets/fonts/spacemono-400.woff2") format("woff2")}
@font-face{font-family:"Space Mono";font-weight:700;src:url("assets/fonts/spacemono-700.woff2") format("woff2")}
.mono{font-family:"Space Mono",monospace;text-transform:uppercase;line-height:1.05;letter-spacing:.01em}
.t{font-weight:600;font-size:21px;letter-spacing:.06em;text-transform:uppercase;line-height:1.35}
.tb{font-weight:800}
.it{font-style:italic;font-weight:500;text-transform:lowercase;letter-spacing:.02em}
.ab{position:absolute}
.ph{position:absolute;background-size:cover;background-position:center}
.rule{position:absolute;height:0;border-top:1.5px solid currentColor;opacity:.55}
.sp{display:flex;justify-content:space-between}
.grain{opacity:.28}
"""

def P(w, h, body, bg, color="#fff", extra=""):
    html = page(w, h, body, CSS + f".art{{background:{bg};color:{color}}} .vig{{display:none}} {extra}")
    return w, h, html

# ------------------------------------------------ M1 · "Loomlock invites you" (rose macro → warm abstract)
def m1(W, H):
    top = 70 if H == 1350 else 120
    bot = H - (70 if H == 1350 else 130)
    b = f'''
    <div class="ph" style="inset:0;background-image:url(assets/stills/warm.jpg);filter:saturate(1.25) contrast(1.08)"></div>
    <div class="ab sp t" style="left:60px;right:60px;top:{top}px">
      <div><span class="tb">LOOMLOCK</span> INVITES YOU</div>
      <div style="text-align:right">THURSDAY, OCTOBER 29TH<br>10PM — LATE</div>
    </div>
    <div class="ab" style="left:0;right:0;top:{H/2-40}px;text-align:center">
      <div class="it" style="font-size:64px">locked in</div>
      <div class="t" style="font-size:17px;margin-top:14px;opacity:.85">a party for people, not phones</div>
    </div>
    <div class="ab t" style="left:60px;right:60px;top:{bot-150}px;font-size:19px">
      INVITE ONLY · LOCATION SENT TO THE LIST<br>
      HOSTED BY LOOMLOCK &amp; DON JULIO<br>
      TAP YOUR KEY AT THE DOOR. YOUR APPS STAY OUT.
    </div>
    <div class="ab sp t" style="left:60px;right:60px;top:{bot-30}px;font-size:15px;align-items:center">
      {logos()}<span>+18 · PLEASE DRINK RESPONSIBLY</span>
    </div>'''
    return P(W, H, b, "#2a0a00")

# ------------------------------------------------ M2 · CMYK Milan (blue field, giant stacked letters)
def m2(W, H):
    s = 1 if H == 1350 else 1.42
    letters = "".join(f'<div style="height:{170*s:.0f}px">{c}</div>' for c in "LOCKED")
    phT = 300 * s
    b = f'''
    <div class="ab" style="left:46px;top:{40*s:.0f}px;font-weight:600;font-size:{205*s:.0f}px;line-height:1;color:#0a0f5c;letter-spacing:-.02em">{letters}</div>
    <div class="ab t" style="left:330px;right:60px;top:{70*s:.0f}px;font-size:19px;color:#0a0f5c">
      LOOMLOCK, DON JULIO<br>&amp; YOUR KEY PRESENT
    </div>
    <div class="ph" style="left:330px;right:60px;top:{phT:.0f}px;height:{430*s:.0f}px;background-image:url(assets/stills/bg_crowd.jpg);background-position:center 70%;filter:grayscale(1) contrast(1.3) brightness(1.6);mix-blend-mode:multiply"></div>
    <div class="ab t" style="left:330px;right:60px;top:{phT+450*s:.0f}px;color:#0a0f5c;font-size:20px">
      {"".join(f'<div style="display:flex;gap:14px;align-items:center;margin-bottom:{12*s:.0f}px"><span style="width:26px;height:14px;background:#0a0f5c;display:inline-block"></span>{t}</div>' for t in ["IN (+ YOUR PHONE)", "APPS OUT", "THURSDAY 29TH OCTOBER", "10PM — LATE", "INVITE ONLY"])}
    </div>
    <div class="ab sp t" style="left:330px;right:60px;top:{H-90*s:.0f}px;font-size:15px;color:#0a0f5c;align-items:center">
      {logos("dark", 20, 34)}<span>+18</span>
    </div>'''
    return P(W, H, b, "#7f9fd6", "#0a0f5c", ".grain{opacity:.4}")

# ------------------------------------------------ M3 · Veladas (flat field, spaced title, program grid)
def m3(W, H):
    cy = H * (0.36 if H == 1350 else 0.31)
    gy = cy + 430 if H == 1350 else H * 0.62
    rows = [("DOORS", "22:00", "TAP YOUR KEY"), ("23:00", "", "APPS LOCKED"), ("00:00", "", "THE PARTY UNLOCKS"), ("LATE", "", "NO PHOTOS · NO FEED")]
    grid = "".join(f'<div class="sp" style="padding:16px 0;border-top:1.5px solid rgba(255,255,255,.45)"><span style="width:200px">{a}</span><span style="flex:1;text-align:center">{c}</span><span style="width:200px;text-align:right">{"29.10" if i == 0 else ""}</span></div>' for i, (a, b2, c) in enumerate(rows))
    b = f'''
    <div class="ab t" style="left:0;right:0;top:{70 if H==1350 else 130}px;text-align:center;font-size:20px"><span class="tb">LOOMLOCK</span> × DON JULIO</div>
    <div class="ab" style="left:0;right:0;top:{cy:.0f}px;text-align:center">
      <div style="font-weight:500;font-size:{96 if H==1350 else 112}px;letter-spacing:.42em;margin-left:.42em">LOCKED</div>
      <div style="font-weight:500;font-size:{96 if H==1350 else 112}px;letter-spacing:.42em;margin-left:.42em;margin-top:6px">IN</div>
      <div class="t" style="margin-top:26px;font-size:19px;letter-spacing:.3em">INVITE ONLY</div>
    </div>
    <div class="ab sp t" style="left:120px;right:120px;top:{cy+(330 if H==1350 else 400):.0f}px;font-size:18px">
      <span>THURSDAY</span><span>29.10</span><span>LOCATION TBA</span>
    </div>
    <div class="ab t" style="left:120px;right:120px;top:{gy:.0f}px;font-size:18px">{grid}</div>
    <div class="ab sp t" style="left:120px;right:120px;top:{H-(110 if H==1350 else 170)}px;font-size:14px;align-items:center;opacity:.9">
      <span>+18</span>{logos(h=20, dh=34)}<span>A LOOMLOCK PROJECT</span>
    </div>'''
    return P(W, H, b, "#1d29c2")

# ------------------------------------------------ M4 · CMYK Brooklyn (yellow field, macro photo, big bottom word)
def m4(W, H):
    ph = 760 if H == 1350 else 1250
    b = f'''
    <div class="ab" style="left:0;right:0;top:0;height:{ph}px;overflow:hidden;background:#fcce21">
      <div class="ph" style="inset:0;background-image:url(assets/stills/lights.jpg);filter:grayscale(1) contrast(1.35) brightness(1.05);mix-blend-mode:multiply"></div>
    </div>
    <div class="ab t" style="left:0;right:0;top:{ph+34}px;text-align:center;font-size:17px">LOOMLOCK, DON JULIO PRESENT:</div>
    <div class="ab" style="left:0;right:0;top:{ph+(80 if H==1350 else 100)}px;text-align:center;font-weight:800;font-size:{158 if H==1350 else 166}px;letter-spacing:-.04em;white-space:nowrap;line-height:1">LOCKED IN</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(80 if H==1350 else 150)}px;font-size:16px">
      <span>THURSDAY 29TH OCT</span><span>INVITE ONLY · LOCATION TBA</span><span>+18</span>
    </div>'''
    return P(W, H, b, "#fcce21", "#16120a")

# ------------------------------------------------ M5 · spread letters on blurred light
def m5(W, H):
    rowsY = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8]
    words = [("LOOMLOCK", "&amp;", "DON JULIO"), ("PRESENT", "", ""), ("THURSDAY", "29", "OCTOBER"), ("INVITE", "", "ONLY"), ("YOUR APPS", "STAY", "OUTSIDE"), ("LOCATION", "", "TBA"), ("TAP", "IN", "AT THE DOOR")]
    lines = ""
    for (a, m, c), y in zip(words, rowsY):
        top = H * y
        lines += f'<div class="rule" style="left:60px;right:60px;top:{top-14:.0f}px;opacity:.35"></div>'
        lines += f'<div class="ab sp t" style="left:60px;right:60px;top:{top:.0f}px;font-size:17px"><span>{a}</span><span>{m}</span><span>{c}</span></div>'
    big = [("L", 0.62, 0.115), ("O", 0.14, 0.235), ("C", 0.80, 0.355), ("K", 0.38, 0.475), ("E", 0.06, 0.595), ("D", 0.70, 0.715), ("I", 0.30, 0.835), ("N", 0.48, 0.835)]
    letters = "".join(f'<div class="ab" style="left:{W*x:.0f}px;top:{H*y-10:.0f}px;font-weight:700;font-size:{110 if H==1350 else 150}px;line-height:1;color:#ff3b2f">{c}</div>' for c, x, y in big)
    b = f'''
    <div class="ph" style="inset:-60px;background-image:url(assets/stills/lights.jpg);filter:blur(28px) saturate(1.6) brightness(1.15)"></div>
    <div class="ab" style="inset:0;background:radial-gradient(60% 45% at 65% 40%,rgba(255,120,180,.45),rgba(0,0,0,0) 70%),radial-gradient(70% 50% at 25% 75%,rgba(30,60,255,.55),rgba(0,0,0,0) 70%)"></div>
    {lines}{letters}
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(70 if H==1350 else 120)}px;font-size:14px;align-items:center">
      {logos(h=20, dh=34)}<span>A LOOMLOCK PROJECT · +18</span>
    </div>'''
    return P(W, H, b, "#4a6cff")

# ------------------------------------------------ M6 · 8-ball rack (IG: Worthless Studios × MATTE)
def m6(W, H):
    story = H == 1920
    d = 300 if story else 240
    dx, dy = d * 0.97, d * 0.86
    cx, cy0 = W / 2, (520 if story else 300)
    rows = [["L"], ["O", "C"], ["K", "E", "D"], ["I", "N"]]
    cols = ["#1d29c2", "#fcce21", "#e83852", "#5713c0", "#d87700", "#0c77b7", "#1d8a4a", "#fcce21"]
    balls, k = "", 0
    for r, row in enumerate(rows):
        for i, ch in enumerate(row):
            x = cx + (i - (len(row) - 1) / 2) * dx
            y = cy0 + r * dy
            c = cols[k]
            bg = f"linear-gradient(180deg,#f4f1ea 0 22%,{c} 22% 78%,#f4f1ea 78%)" if k % 2 else c
            rot = [-12, 8, -4, 14, -9, 5, -15, 10][k]
            balls += (f'<div class="ab" style="left:{x-d/2:.0f}px;top:{y-d/2:.0f}px;width:{d}px;height:{d}px;border-radius:50%;background:{bg};'
                      f'box-shadow:inset -18px -22px 40px rgba(0,0,0,.35),inset 14px 16px 30px rgba(255,255,255,.18);transform:rotate({rot}deg)">'
                      f'<div class="ab" style="left:{d*.3:.0f}px;top:{d*.3:.0f}px;width:{d*.4:.0f}px;height:{d*.4:.0f}px;border-radius:50%;background:#f4f1ea;color:#111;'
                      f'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:{d*.25:.0f}px">{ch}</div></div>')
            k += 1
    fs = 30 if story else 26
    tp = 120 if story else 60
    bt = H - (150 if story else 70)
    b = f"""
    <div class="ab mono" style="left:60px;top:{tp}px;font-size:{fs}px;line-height:1.05">LOOMLOCK<br>× DON JULIO</div>
    <div class="ab mono" style="right:60px;top:{tp}px;text-align:right;font-size:{fs}px">INVITE<br>ONLY<br>NIGHT</div>
    {balls}
    <div class="ab mono" style="left:60px;top:{bt-fs*4.3:.0f}px;font-size:{fs}px">LOCK<br>’EM<br>IN<br>FOR THE NIGHT</div>
    <div class="ab mono" style="right:60px;top:{bt-fs*2.2:.0f}px;text-align:right;font-size:{fs}px">OCT<br>29</div>
    <div class="ab sp mono" style="left:60px;right:60px;top:{bt+fs*0.6:.0f}px;font-size:{fs*.55:.0f}px;opacity:.75"><span>LOCATION SENT TO THE LIST</span><span>A LOOMLOCK PROJECT · +18</span></div>"""
    return P(W, H, b, "#141414", "#f4f1ea")

# ------------------------------------------------ M7 · door policy sheet (IG: tournament packages)
def m7(W, H):
    story = H == 1920
    fs = 24 if story else 21
    blocks = [("THE<br>KEY", "#fcce21", ["1 LOOMLOCK KEY PER GUEST", "TAP IT AT THE DOOR TO ENTER", "YOUR APPS LOCK UNTIL CLOSE"]),
              ("THE<br>PHONE", "#7f9fd6", ["COMES IN WITH YOU", "STAYS IN YOUR POCKET", "NO PHOTOS, NO FEED, NO STORIES", "UNLOCKS WHEN YOU LEAVE"]),
              ("THE<br>NIGHT", "#e83852", ["OPEN DANCE FLOOR UNTIL LATE", "DON JULIO BAR (+18)", "LOCATION SENT TO THE LIST", "WHAT HAPPENS STAYS UNPOSTED"])]
    y = 330 if story else 250
    gap = 300 if story else 235
    rows = ""
    for name, c, items in blocks:
        li = "".join(f"<div>· {t}</div>" for t in items)
        rows += (f'<div class="ab" style="left:60px;right:60px;top:{y}px;border-top:1.5px solid rgba(244,241,234,.5);padding-top:18px;display:flex">'
                 f'<div class="mono" style="width:300px;color:{c};font-size:{fs*1.6:.0f}px;font-weight:700">{name}</div>'
                 f'<div class="mono" style="flex:1;font-size:{fs}px;line-height:1.45">{li}</div></div>')
        y += gap
    b = f"""
    <div class="ab sp mono" style="left:60px;right:60px;top:{110 if story else 60}px;font-size:{fs*1.4:.0f}px"><span>LOOMLOCK<br>× DON JULIO</span><span style="text-align:right">DOOR<br>POLICY</span></div>
    {rows}
    <div class="ab" style="left:60px;right:60px;top:{y}px;border-top:1.5px solid rgba(244,241,234,.5)"></div>
    <div class="ab" style="left:52px;top:{y+30}px;font-weight:800;font-size:{150 if story else 128}px;letter-spacing:-.04em;line-height:.9;white-space:nowrap">LOCKED IN</div>
    <div class="ab sp mono" style="left:60px;right:60px;top:{H-(140 if story else 80)}px;font-size:{fs*.8:.0f}px;opacity:.8;align-items:center"><span>OCT 29 · INVITE ONLY</span>{logos(h=20, dh=34)}<span>+18</span></div>"""
    return P(W, H, b, "#141414", "#f4f1ea")

# ------------------------------------------------ M8 · flash recap (IG: event photography + subtitle)
def m8(W, H):
    story = H == 1920
    b = f"""
    <div class="ph" style="inset:0;background-image:url(assets/stills/face.jpg);background-position:58% center;filter:sepia(.35) saturate(1.35) contrast(1.12) brightness(1.08)"></div>
    <div class="ph" style="inset:0;background-image:url(assets/stills/face.jpg);background-position:58% center;filter:blur(10px) brightness(1.4) saturate(1.5);mix-blend-mode:screen;opacity:.3;transform:translateX(22px) scale(1.02)"></div>
    <div class="ab" style="inset:0;background:radial-gradient(70% 55% at 55% 40%,rgba(255,200,120,.25),rgba(0,0,0,0) 70%),linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0) 22%,rgba(0,0,0,0) 70%,rgba(0,0,0,.55))"></div>
    <div class="ab sp mono" style="left:60px;right:60px;top:{110 if story else 60}px;font-size:22px"><span>LOCKED IN</span><span>29.10</span></div>
    <div class="ab" style="left:0;right:0;top:{H-(420 if story else 300)}px;text-align:center;font-weight:600;font-size:{44 if story else 40}px;text-shadow:0 2px 10px rgba(0,0,0,.6)">nobody here is checking their phone.</div>
    <div class="ab sp t" style="left:60px;right:60px;top:{H-(150 if story else 80)}px;font-size:15px;align-items:center">{logos()}<span>INVITE ONLY · +18</span></div>"""
    return P(W, H, b, "#200800")

PIECES = {}
for n, f in [("m1-invites-you", m1), ("m2-cmyk-blue", m2), ("m3-veladas", m3), ("m4-yellow-lights", m4), ("m5-spread", m5), ("m6-eight-ball", m6), ("m7-door-sheet", m7), ("m8-flash", m8)]:
    PIECES[f"{n}-story"] = (lambda f=f: f(1080, 1920))
    PIECES[f"{n}-feed"] = (lambda f=f: f(1080, 1350))
build.PIECES.update(PIECES)

if __name__ == "__main__":
    for n in sys.argv[1:] or PIECES:
        print(build.export(n))
