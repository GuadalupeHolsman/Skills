"""CH 02 · Tequila Don Julio — 'Pinterest' line: full-frame kinetic typography, no TV frame.
p1-redacted (a paragraph redacted down to the message), p2-time-is-form (rotated type columns),
p3-focus (blur stacks + giant 02). Same ident as the team line: Montserrat, Space Mono, blue/yellow,
CH 02 + Bogotá coordinates, 'Live now, post later', Colombian legal line."""
import pathlib, shutil, json, random, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_reels_c import CSS, LEGAL, COORD, B, CAMP, SP, HERE, lockup, scramble

W, H = 1080, 1920
DUR = 17.28  # 36 beats

EXTRA = """
.corner{position:absolute;font-family:"Space Mono",monospace;font-size:20px;letter-spacing:.14em;line-height:1.5;z-index:40}
.wd{position:relative;display:inline-block;isolation:isolate;padding:0 2px}
.wd .rb{position:absolute;left:-3px;right:-3px;top:8%;bottom:4%;background:#0B0B0B;transform-origin:0 50%}
.wd .hb{position:absolute;left:-4px;right:-4px;top:6%;bottom:2%;background:var(--blue);z-index:-1;transform-origin:0 50%}
.col{position:absolute;top:0;height:100%;overflow:hidden}
.strip{position:absolute;left:0;right:0;top:0;writing-mode:vertical-rl;white-space:nowrap;font-weight:900;letter-spacing:-.02em;line-height:.84}
.row{position:absolute;left:0;right:0;text-align:center;font-weight:900;letter-spacing:-.03em;white-space:nowrap}
"""

def corners(color="var(--ink)", sub="rgba(244,242,238,.6)"):
    return (f'<div class="corner" style="left:60px;top:70px;color:{color}">LOOMLOCK<br>EXPERIENCES</div>'
            f'<div class="corner" style="right:60px;top:70px;text-align:right;color:{color}">CH 02<br>29.10</div>'
            f'<div class="corner" style="left:60px;bottom:118px;color:{sub};font-size:17px">INVITE<br>ONLY</div>'
            f'<div class="corner" style="right:60px;bottom:118px;text-align:right;color:{sub};font-size:17px">LIVE NOW,<br>POST LATER</div>')

def legal(color="rgba(244,242,238,.7)", bg="rgba(6,6,9,.88)"):
    return f'<div class="legal" style="top:1838px;padding:8px 0;font-size:15px;color:{color};background:{bg};z-index:40">{LEGAL}</div>'

def endcard(eid, bg="var(--blue)", big=("Live now,", "post later."), extra=""):
    return f'''<div id="{eid}" class="ab grid" style="inset:0;opacity:0;background-color:{bg}">
  <div class="ab" style="left:0;right:0;top:560px;text-align:center">
    <div class="i" id="{eid}a" style="font-size:120px;line-height:1.05">{big[0]}</div>
    <div class="b y" id="{eid}b" style="font-size:140px;line-height:1.05">{big[1]}</div>
  </div>
  {extra}
  <div class="sub" id="{eid}c" style="top:1130px">
    {lockup(44, 76)}
    <div style="margin-top:26px;font-size:32px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá · 18+</span></div>
    <div style="margin-top:8px;font-size:30px"><span class="b y">Invite only.</span></div>
  </div>
</div>'''

def endjs(eid, t0):
    return (f'tl.set("#{eid}",{{opacity:1}},{t0:.2f});'
            f'tl.fromTo("#{eid}a",{{opacity:0,y:30}},{{opacity:1,y:0,duration:.35,ease:"power3.out"}},{t0+.1:.2f});'
            f'tl.fromTo("#{eid}b",{{opacity:0,scale:1.3}},{{opacity:1,scale:1,duration:.35,ease:"expo.out"}},{t0+B:.2f});'
            f'tl.fromTo("#{eid}c",{{opacity:0}},{{opacity:1,duration:.4}},{t0+B*3:.2f});')

def project(name, title, body, js, music, bg="var(--bg)"):
    html = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width={W}, height={H}" />
<title>{title}</title><script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{CSS}{EXTRA}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="{W}" data-height="{H}" data-duration="{DUR}" style="width:{W}px;height:{H}px;background:{bg}">
{body}
<img class="grain" id="gr0" src="assets/img/grain0.png" alt=""><img class="grain" id="gr1" src="assets/img/grain1.png" alt="">
<img class="grain" id="gr2" src="assets/img/grain2.png" alt=""><img class="grain" id="gr3" src="assets/img/grain3.png" alt="">
<audio id="music" src="assets/{music}" data-start="0" data-duration="{DUR}" data-media-start="0" data-volume="1"
 data-automation='{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.2,"v":0.95}},{{"t":{DUR-1.2:.2f},"v":1}},{{"t":{DUR},"v":0}}]}}]}}'></audio>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
for (let i = 0; i < 4; i++) tl.set("#gr" + i, {{ opacity: 0 }}, 0);
for (let f = 0, t = 0; t < {DUR}; f++, t = f / 12) {{ tl.set("#gr" + (f % 4), {{ opacity: .18 }}, t); tl.set("#gr" + ((f + 3) % 4), {{ opacity: 0 }}, t); }}
{js}
window.__timelines["main"] = tl;
const q = new URLSearchParams(location.search).get("t"); if (q) tl.seek(+q);
</script></body></html>'''
    d = HERE / name
    (d / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (d / "assets" / "img").mkdir(exist_ok=True)
    for f in ["montserrat-var", "montserrat-italic-var", "spacemono-400", "spacemono-700"]:
        shutil.copy(CAMP / "fonts" / f"{f}.woff2", d / "assets" / "fonts")
    for f in ["dj_white.png", "loomlock_white.png"]:
        shutil.copy(CAMP / "img" / f, d / "assets" / "img")
    for i in range(4):
        shutil.copy(SP / "hf7" / "assets" / "img" / f"grain{i}.png", d / "assets" / "img")
    shutil.copy(HERE / "c" / music, d / "assets")
    for f in ["hyperframes.json", "meta.json"]:
        shutil.copy(SP / "hf8" / f, d)
    (d / "package.json").write_text(json.dumps({"name": name, "private": True, "type": "module"}, indent=2))
    (d / "index.html").write_text(html)
    print("wrote", d)

# ------------------------------------------------------------------ P1 · Redacted
TEXT = ("Thursday, 29 October. Bogotá. Somewhere a phone is buzzing with forty notifications nobody will remember, "
        "and a story is being filmed of a party nobody is really at. Here is another idea. Your phone stays in your pocket. "
        "The apps take the night off. Tap the key at the door and Instagram, TikTok and WhatsApp go quiet until you leave. "
        "What is left is the room: music loud, tequila neat, Don Julio on the table and the people in front of you. "
        "Seventy guests, eighteen and over, invite only. No feed tonight. Live now, post later. "
        "Channel 02 of a series that travels city to city with one rule.")
KEYS = {"Thursday,": 0, "29": 0, "October.": 0, "Bogotá.": 1, "phone": 2, "pocket.": 2, "apps": 3, "night": 3, "off.": 3,
        "music": 4, "loud,": 4, "tequila": 5, "neat,": 5, "people": 6, "front": 6, "you.": 6, "Live": 7, "now,": 7, "post": 7, "later.": 7}

def p1():
    words = TEXT.split(" ")
    spans = ""; keys = []; others = []
    used_you = False
    for i, w in enumerate(words):
        k = KEYS.get(w)
        # only the first 'Live now, post later.' and the 'you.' that ends 'in front of you.'
        if w == "you." and used_you:
            k = None
        if w == "you.":
            used_you = True
        if w in ("phone",) and words[i + 1] != "stays":
            k = None
        if w in ("apps",) and words[i - 1] != "The":
            k = None
        if w == "night" and words[i - 1] != "the":
            k = None
        if w == "off." and words[i - 1] != "night":
            k = None
        if w == "post" and words[i - 1] != "now,":
            k = None
        inner = '<span class="hb"></span>' if k is not None else '<span class="rb"></span>'
        spans += f'<span class="wd" id="w{i}">{inner}{w}</span> '
        (keys if k is not None else others).append((i, k))
    body = f'''
<div class="ab" style="inset:0;background:#E7E5E0"></div>
<div class="ab" id="para" style="left:64px;right:64px;top:230px;font-size:52px;line-height:1.34;font-weight:500;color:#141414;text-align:left">{spans}</div>
<div class="corner" style="left:60px;top:70px;color:#141414">LOOMLOCK<br>EXPERIENCES</div>
<div class="corner" style="right:60px;top:70px;text-align:right;color:#141414">CH 02<br>29.10</div>
<div class="corner" id="redl" style="left:60px;bottom:118px;color:#141414;font-size:17px">REDACTED BY<br>LOOMLOCK</div>
<div class="corner" style="right:60px;bottom:118px;text-align:right;color:#141414;font-size:17px">INVITE<br>ONLY</div>
{endcard("end")}
{legal("rgba(20,20,20,.75)", "rgba(231,229,224,.92)")}
'''
    js = ""
    # 1) keywords light up in reading order, one group per beat
    groups = {}
    for i, k in keys:
        groups.setdefault(k, []).append(i)
    for g, ids in sorted(groups.items()):
        t = .48 + g * B * 1.5
        for j, i in enumerate(ids):
            js += f'tl.fromTo("#w{i} .hb",{{scaleX:0}},{{scaleX:1,duration:.16,ease:"power2.out"}},{t + j*.06:.2f});tl.to("#w{i}",{{color:"#F4F2EE",duration:.1}},{t + j*.06:.2f});'
    # 2) on the drop everything else is redacted
    r = random.Random(7)
    order = [i for i, _ in others]; r.shuffle(order)
    for n, i in enumerate(order):
        js += f'tl.fromTo("#w{i} .rb",{{scaleX:0}},{{scaleX:1,duration:.1,ease:"power2.out"}},{7.2 + n*.016:.3f});'
    # 3) the message pulses yellow on the beat
    t = 9.6; k = 0
    gl = sorted(groups.items())
    while t < 12.4:
        g, ids = gl[k % len(gl)]
        for i in ids:
            js += f'tl.to("#w{i} .hb",{{backgroundColor:"#FCCE21",duration:.05}},{t:.2f});tl.to("#w{i}",{{color:"#0B0B0B",duration:.05}},{t:.2f});'
        t += B / 1.5; k += 1
    js += 'tl.to("#para",{y:-60,duration:5,ease:"none"},7.2);'
    js += 'tl.set("#para",{opacity:0},13.0);'
    js += endjs("end", 12.96)
    project("p1-redacted", "CH 02 · Redacted", body, js, "garage_long.wav")

# ------------------------------------------------------------------ P2 · Time is form
PHASES = [
    [("THURSDAY", "w"), ("29.10", "y"), ("BOGOTÁ", "o"), ("CH 02", "b"), ("7 PM", "w")],
    [("PHONE: IN", "w"), ("APPS: OFF", "y"), ("FEED: OFF", "o"), ("TAP IN", "b"), ("TUNE OUT", "w")],
    [("MUSIC", "w"), ("LOUD", "y"), ("TEQUILA", "o"), ("NEAT", "b"), ("DON JULIO", "w")],
    [("NO STORY", "o"), ("NO REEL", "w"), ("NO FEED", "o"), ("JUST", "y"), ("HERE", "w")],
]
ANNO = ["LOOMLOCK EXPERIENCES · SERIES", "INVITE ONLY · 18+", "70 GUESTS · NO FEED", "ONE RULE · EVERY CITY"]

def style_of(st):
    return {"w": "color:var(--ink)", "y": "color:var(--yel)", "o": "color:var(--bg);-webkit-text-stroke:2.5px var(--ink)",
            "b": "color:#5C68FF"}[st]

def p2():
    n = 5; cw = W / n; fs = 230
    cols = ""
    for i in range(n):
        rot = "transform:rotate(180deg);" if i % 2 == 0 else ""
        txt = " ".join([PHASES[0][i][0]] * 6)
        cols += (f'<div class="col" style="left:{i*cw:.0f}px;width:{cw:.0f}px">'
                 f'<div class="strip" id="s{i}" style="font-size:{fs}px;{rot}{style_of(PHASES[0][i][1])}">{txt}</div></div>')
    annos = ""
    for j, a in enumerate(ANNO):
        x = cw * (j + 1) - 18
        annos += (f'<div class="ab mono" id="an{j}" style="left:{x:.0f}px;top:300px;writing-mode:vertical-rl;font-size:20px;letter-spacing:.2em;'
                  f'color:rgba(244,242,238,.75);background:var(--bg);padding:10px 4px">{a}</div>')
    body = f'''
<div class="ab" id="flb" style="inset:0;background:var(--blue);opacity:0"></div>
{cols}
{annos}
{corners()}
{endcard("end")}
{legal()}
'''
    js = ""
    for i in range(n):
        d = 1 if i % 2 == 0 else -1
        js += f'tl.fromTo("#s{i}",{{y:{d*H}}},{{y:{-d*200},duration:.7,ease:"expo.out"}},{.1 + i*.12:.2f});'
        js += f'tl.to("#s{i}",{{y:{-d*200 - d*1600},duration:6.4,ease:"none"}},{.82 + i*.12:.2f});'
        js += f'tl.to("#s{i}",{{y:{-d*200 - d*1600 - d*2600},duration:5.3,ease:"none"}},{7.22 + i*.12:.2f});'
    for j in range(len(ANNO)):
        js += f'tl.fromTo("#an{j}",{{opacity:0}},{{opacity:1,duration:.3}},{.9 + j*.15:.2f});'
    # re-deal the words every two bars; on the drop, colours flip on the beat
    for p, t in ((1, 3.84), (2, 7.2), (3, 10.56)):
        for i in range(n):
            w, st = PHASES[p][i]
            sc = scramble(w, f"p2{p}{i}", 2)
            for k, s in enumerate(sc):
                js += f'tl.set("#s{i}",{{textContent:{json.dumps(" ".join([s]*6))}}},{t + k/15:.3f});'
            js += f'tl.set("#s{i}",{{textContent:{json.dumps(" ".join([w]*6))}}},{t + 2/15:.3f});'
            cp = {"w": ("#F4F2EE", "0px #F4F2EE"), "y": ("#FCCE21", "0px #FCCE21"), "o": ("#060609", "2.5px #F4F2EE"), "b": ("#5C68FF", "0px #5C68FF")}[st]
            js += f'tl.set("#s{i}",{{color:"{cp[0]}",webkitTextStroke:"{cp[1]}"}},{t:.3f});'
    t = 7.2; f = True
    while t < 12.9:
        js += f'tl.set("#flb",{{opacity:{.9 if f else 0}}},{t:.2f});'
        t += B * 2; f = not f
    js += 'tl.set("#flb",{opacity:0},12.96);'
    js += endjs("end", 12.96)
    project("p2-time-is-form", "CH 02 · Time is form", body, js, "techno_long.wav")

# ------------------------------------------------------------------ P3 · Focus
STACKS = [("FEED", "var(--ink)", "var(--bg)", "Feed,", "off."), ("OFF.", "var(--yel)", "var(--bg)", "", ""),
          ("LOUD", "var(--ink)", "var(--blue)", "Music,", "loud."), ("NEAT", "var(--yel)", "var(--bg)", "Tequila,", "neat."),
          ("HERE", "var(--ink)", "var(--blue)", "You,", "actually here.")]

def p3():
    rows = 11; fs = 210; rh = fs * .9
    T = [0, 1.92, 3.84, 7.2, 9.6, 12.0]
    body = ""
    for s, (word, col, bg, la, lb) in enumerate(STACKS):
        rs = ""
        for i in range(rows):
            rs += f'<div class="row" id="k{s}r{i}" style="top:{-rh*.5 + i*rh:.0f}px;font-size:{fs}px;line-height:{rh:.0f}px;color:{col};filter:blur(10px);opacity:.35">{word}</div>'
        body += f'<div class="ab" id="k{s}" style="inset:0;background:{bg};opacity:0">{rs}</div>'
    # giant 02 (TONEL ref)
    body += f'''<div class="ab grid" id="big" style="inset:0;opacity:0">
  <div class="ab" id="bg2" style="left:0;right:0;top:330px;text-align:center;font-weight:900;font-size:760px;line-height:1;letter-spacing:-.07em;color:var(--yel)">02</div>
  <img src="assets/img/grain2.png" alt="" class="ab" style="left:0;top:330px;width:100%;height:760px;mix-blend-mode:overlay;opacity:.35;image-rendering:pixelated">
  <div class="ab mono" style="left:60px;top:1150px;font-size:24px;letter-spacing:.16em;line-height:1.6">CHANNEL<br>02 / ∞</div>
  <div class="ab mono" style="right:60px;top:1150px;font-size:24px;letter-spacing:.16em;line-height:1.6;text-align:right">THU 29.10<br>BOGOTÁ · CO</div>
  <div class="ab" style="left:0;right:0;top:1330px;text-align:center"><span class="i" style="font-size:64px">One rule,</span> <span class="b" style="font-size:64px">every city.</span></div>
</div>'''
    body += endcard("end")
    body += corners() + legal()
    js = ""
    def scan(s, t0, t1, steps_from=-2, steps_to=None):
        """move the sharp row down the stack between t0 and t1"""
        o = ""
        to = rows + 1 if steps_to is None else steps_to
        n = int((t1 - t0) / .08)
        for k in range(n + 1):
            f = steps_from + (to - steps_from) * k / max(1, n)
            t = t0 + k * .08
            for i in range(rows):
                d = abs(i - f)
                o += f'tl.set("#k{s}r{i}",{{filter:"blur({min(14, d*3.4):.1f}px)",opacity:{max(.18, 1 - d*.2):.2f}}},{t:.2f});'
        return o
    # 0) FEED scanning -> 1) OFF. snaps sharp; 2) LOUD pulses on the drop; 3) NEAT scan; 4) HERE settles
    js += 'tl.set("#k0",{opacity:1},0);' + scan(0, 0, 1.92)
    js += 'tl.set("#k0",{opacity:0},1.92);tl.set("#k1",{opacity:1},1.92);' + scan(1, 1.92, 3.6, rows + 1, 5)
    js += 'tl.set("#k1",{opacity:0},3.84);tl.set("#k2",{opacity:1},3.84);' + scan(2, 3.84, 7.1, -2, 5)
    t = 7.2; k = 0
    while t < 9.55:
        js += f'tl.fromTo("#k2r5",{{scale:1.12}},{{scale:1,duration:.3,ease:"power2.out"{"" if k == 0 else ",immediateRender:false"}}},{t:.2f});'
        js += f'tl.set("#k2",{{backgroundColor:"{"#2F3AD0" if k % 2 == 0 else "#060609"}"}},{t:.2f});'
        t += B; k += 1
    js += 'tl.set("#k2",{opacity:0},9.6);tl.set("#k3",{opacity:1},9.6);' + scan(3, 9.6, 11.0, rows + 1, 5)
    js += 'tl.set("#k3",{opacity:0},11.04);tl.set("#k4",{opacity:1},11.04);' + scan(4, 11.04, 12.0, -2, 5)
    js += 'tl.set("#k4",{opacity:0},12.0);tl.set("#big",{opacity:1},12.0);'
    js += 'tl.fromTo("#bg2",{scaleY:.02},{scaleY:1,duration:.3,ease:"expo.out"},12.0);'
    js += endjs("end", 14.4)
    project("p3-focus", "CH 02 · Focus", body, js, "afro_long.wav")

if __name__ == "__main__":
    p1(); p2(); p3()
