"""Party-style teasers built on the LOCKED IN six-screen grid.
python3 gen_teasers.py <outdir> invited|unposted
"""
import sys, pathlib

SRC = [("face", 280, 150, 540, 12.60), ("crowd", 270, 1130, 635, 4.00), ("dancer", 40, 150, 540, 5.90),
       ("lights", 270, 150, 540, 2.00), ("hands", 270, 150, 540, 7.65), ("warm", 270, 1130, 540, 12.60)]
POS = [(0, 0), (540, 0), (0, 640), (540, 640), (0, 1280), (540, 1280)]


def tiles(prefix, start, dur, rate):
    out = []
    for i, (name, sx, sy, rh, ms) in enumerate(SRC):
        k = max(640 / rh if rh < 640 else 1.0, 1.0)
        x, y = POS[i]
        out.append(f'''<div class="tile" id="{prefix}{i}" style="left:{x}px;top:{y}px">
  <div class="crop" style="transform:translate({-sx*k:.0f}px,{-sy*k:.0f}px) scale({k:.3f})" data-layout-allow-overflow>
    <video id="{prefix}v{i}" src="assets/src.mp4" muted playsinline data-start="{start}" data-duration="{dur}" data-media-start="{ms}" data-playback-rate="{rate}" data-track-index="0"></video>
  </div><div class="tint" id="{prefix}t{i}"></div></div>''')
    return "\n".join(out) + '<div class="gl-v"></div><div class="gl-h" style="top:638px"></div><div class="gl-h" style="top:1278px"></div>'


HEAD = '''<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>{title}</title><script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face {{ font-family:"Montserrat"; font-weight:600; src:url("assets/fonts/montserrat-600.woff2") format("woff2"); }}
@font-face {{ font-family:"Montserrat"; font-weight:700; src:url("assets/fonts/montserrat-700.woff2") format("woff2"); }}
@font-face {{ font-family:"Montserrat"; font-weight:800; src:url("assets/fonts/montserrat-800.woff2") format("woff2"); }}
@font-face {{ font-family:"Montserrat"; font-weight:900; src:url("assets/fonts/montserrat-900.woff2") format("woff2"); }}
:root {{ --ink:#05071f; --core:#1d29c2; --ice:#c0c8ff; --yellow:#fcce21; }}
body {{ margin:0; background:var(--ink); font-family:"Montserrat",sans-serif; color:#fff; }}
#root {{ position:relative; width:100%; height:100%; overflow:hidden; background:var(--ink); }}
.layer {{ position:absolute; inset:0; }}
.tile {{ position:absolute; width:540px; height:640px; overflow:hidden; }}
.crop {{ position:absolute; left:0; top:0; width:1080px; height:1920px; transform-origin:0 0; }}
.crop video {{ position:absolute; inset:0; width:100%; height:100%; filter:contrast(1.15) saturate(1.2); }}
.tint {{ position:absolute; inset:0; background:var(--core); mix-blend-mode:color; }}
.gl-v {{ position:absolute; left:538px; top:0; width:4px; height:1920px; background:var(--ink); }}
.gl-h {{ position:absolute; left:0; width:1080px; height:4px; background:var(--ink); }}
.dim {{ position:absolute; inset:0; background:var(--ink); }}
.meta {{ font-weight:600; letter-spacing:.32em; text-transform:uppercase; }}
.big {{ font-weight:900; text-transform:uppercase; letter-spacing:-.04em; line-height:.86; white-space:nowrap; }}
.w {{ position:absolute; left:0; right:0; text-align:center; color:#fff; opacity:0; }}
.diff {{ mix-blend-mode:difference; }}
.y {{ color:var(--yellow); }}
.flash {{ position:absolute; inset:0; background:#fff; opacity:0; }}
.grain {{ position:absolute; inset:0; width:100%; height:100%; mix-blend-mode:overlay; opacity:0; image-rendering:pixelated; }}
.vig {{ position:absolute; inset:0; background:radial-gradient(120% 85% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%); }}
.foot {{ position:absolute; left:64px; right:64px; top:1800px; display:flex; justify-content:space-between; font-weight:600; font-size:22px; letter-spacing:.3em; color:rgba(255,255,255,.78); text-shadow:0 1px 6px rgba(0,0,0,.6); }}
#end {{ opacity:0; background:radial-gradient(90% 60% at 50% 40%, #121b95 0%, #0b1060 45%, #05071f 100%); }}
.logos {{ position:absolute; left:0; right:0; top:330px; display:flex; justify-content:center; align-items:center; gap:28px; }}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{dur}">
'''

TAIL_COMMON = '''
<div class="flash" id="fl"></div><div class="vig"></div>
<img class="grain" id="gr0" src="assets/img/grain0.png" alt="" /><img class="grain" id="gr1" src="assets/img/grain1.png" alt="" />
<img class="grain" id="gr2" src="assets/img/grain2.png" alt="" /><img class="grain" id="gr3" src="assets/img/grain3.png" alt="" />
<div class="foot"><span>LOOMLOCK × DON JULIO</span><span>+18</span></div>
<audio id="music" src="assets/music_full.wav" data-start="0" data-duration="{dur}" data-media-start="{mstart}" data-volume="1"
 data-automation='{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.15,"v":0.95}},{{"t":{fade0},"v":1}},{{"t":{dur},"v":0}}]}}]}}'></audio>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
const B = 0.48;
const flash = (t, a = .8, d = .14) => {{ tl.set("#fl", {{ opacity: a }}, t); tl.to("#fl", {{ opacity: 0, duration: d, ease: "power2.out" }}, t); }};
for (let i = 0; i < 4; i++) tl.set("#gr" + i, {{ opacity: 0 }}, 0);
for (let f = 0, t = 0; t < {dur}; f++, t = f / 15) {{ tl.set("#gr" + (f % 4), {{ opacity: .22 }}, t); tl.set("#gr" + ((f + 3) % 4), {{ opacity: 0 }}, t); }}
const word = (s, t, end, from = 1.12) => {{ tl.set(s, {{ opacity: 1 }}, t); tl.fromTo(s, {{ scale: from }}, {{ scale: 1, duration: .2, ease: "power3.out" }}, t); if (end) tl.set(s, {{ opacity: 0 }}, end); }};
const tints = (p, on, t) => {{ for (let i = 0; i < 6; i++) tl.set("#" + p + "t" + i, {{ opacity: i === on ? 0 : 1 }}, t); }};
{script}
window.__timelines["main"] = tl;
</script></body></html>'''

END_CARD = '''<div id="end" class="layer">
  <div class="logos"><img src="assets/img/loomlock_white.png" style="height:60px" alt="loomlock" /><span style="font-weight:500;font-size:44px;color:rgba(255,255,255,.7)">×</span><img src="assets/img/donjulio_white.png" style="height:100px" alt="Don Julio" /></div>
  <div class="w big" id="e1" style="top:640px;font-size:190px">LOCKED</div>
  <div class="w big" id="e2" style="top:805px;font-size:190px">IN<span class="y">.</span></div>
  <div class="w big y" id="e3" style="top:1060px;font-size:230px">29.10</div>
  <div class="w meta" id="e4" style="top:1290px;font-size:30px">Thursday · Invite only</div>
  <div class="w meta" id="e5" style="top:1350px;font-size:24px;color:var(--ice)">Location sent to the list</div>
  <div class="w meta" style="top:1700px;font-size:20px;color:rgba(255,255,255,.6);opacity:1">Please drink responsibly</div>
</div>'''

END_JS = '''tl.set("#end", {{ opacity: 1 }}, {t}); flash({t}, .5, .2);
tl.fromTo(".logos", {{ opacity: 0, y: 16 }}, {{ opacity: 1, y: 0, duration: .35 }}, {t});
[["#e1", {t}+.05], ["#e2", {t}+.17], ["#e3", {t}+.41]].forEach(([s, t]) => word(s, t, null, 1.25));
tl.fromTo("#e4", {{ opacity: 0 }}, {{ opacity: 1, duration: .3 }}, {t}+.65);
tl.fromTo("#e5", {{ opacity: 0 }}, {{ opacity: 1, duration: .3 }}, {t}+.85);'''


def invited():
    dur, mstart = 8.0, 8.67  # drop of the original track lands at 3.84
    body = f'''<div id="gA" class="layer">{tiles("ga", 0, 3.84, 0.42)}</div>
<div id="gB" class="layer" style="opacity:0">{tiles("gb", 3.84, 2.4, 0.65)}</div>
<div class="dim" id="dim" style="opacity:0"></div>
<div class="w big" id="w0" style="top:800px;font-size:240px">YOU’RE</div>
<div class="w big" id="w1" style="top:820px;font-size:190px">INVITED.</div>
<div class="w big" id="w2" style="top:790px;font-size:320px">YOUR</div>
<div class="w big" id="w3" style="top:800px;font-size:290px">PHONE</div>
<div class="w big y" id="w4" style="top:790px;font-size:300px">ISN’T.</div>
<div class="w big y" id="c3" style="top:600px;font-size:700px">3</div>
<div class="w big y" id="c2" style="top:600px;font-size:700px">2</div>
<div class="w big y" id="c1" style="top:600px;font-size:700px">1</div>
<div class="w big diff" id="d0" style="top:760px;font-size:300px">29.10</div>
<div class="w big diff" id="d1" style="top:700px;font-size:220px">LOCKED</div>
<div class="w big diff" id="d2" style="top:880px;font-size:220px">IN.</div>
{END_CARD}'''
    script = '''
tl.set("#dim", { opacity: .55 }, 0);
[["#w0", 0, .24], ["#w1", .24, .96], ["#w2", .96, 1.2], ["#w3", 1.2, 1.44], ["#w4", 1.44, 2.4]].forEach(([s, a, b]) => word(s, a, b));
flash(0, .5, .2); flash(.96, .35); flash(1.44, .6, .2);
tl.to("#dim", { opacity: .35, duration: .4 }, 1.44);
[["#c3", 2.4, 2.88], ["#c2", 2.88, 3.36], ["#c1", 3.36, 3.72]].forEach(([s, a, b]) => { word(s, a, b, 1.4); flash(a, .3, .1); });
[3.36, 3.48, 3.6, 3.72].forEach((t, i) => tints("ga", [0, 3, 5, 2][i], t));
// drop
tl.set("#gB", { opacity: 1 }, 3.84); tl.set("#gA", { opacity: 0 }, 3.84); tl.set("#dim", { opacity: 0 }, 3.84);
flash(3.84, 1, .3);
word("#d0", 3.84, 5.28, 1.35);
for (let k = 0; k < 10; k++) tints("gb", [0, 3, 5, 1, 4, 2][k % 6], 3.84 + k * .24);
word("#d1", 5.28, 6.24); word("#d2", 5.52, 6.24);
tl.to("#gB", { opacity: 0, duration: .2 }, 6.1);
''' + END_JS.format(t=6.24)
    return dur, mstart, body, script, 7.6


def unposted():
    dur, mstart = 6.0, 12.51  # starts on the drop
    body = f'''<div id="gA" class="layer">{tiles("ga", 0, 3.0, 0.55)}</div>
<div id="gB" class="layer" style="opacity:0">{tiles("gb", 3.0, 1.84, 0.85)}</div>
<div class="dim" id="dim" style="opacity:0"></div>
<div id="lit" class="layer"></div>
<div class="w big diff" id="w0" style="top:780px;font-size:300px">WHAT</div>
<div class="w big diff" id="w1" style="top:800px;font-size:200px">HAPPENS</div>
<div class="w big diff" id="w2" style="top:780px;font-size:240px">ON 29.10</div>
<div class="w big diff" id="w3" style="top:780px;font-size:300px">STAYS</div>
<div class="w big y" id="w4" style="top:810px;font-size:156px">UNPOSTED.</div>
{END_CARD}'''
    script = '''
// one screen lights up per beat, the rest stay in the dark
const spot = document.getElementById("lit");
const P = [[0,0],[540,0],[0,640],[540,640],[0,1280],[540,1280]];
const seq = [2, 1, 4, 0, 5, 3, 1, 4, 2, 0];
seq.forEach((i, k) => {
  const d = document.createElement("div"); d.id = "sp" + k;
  d.style.cssText = `position:absolute;left:${P[i][0]}px;top:${P[i][1]}px;width:536px;height:636px;box-shadow:0 0 0 9999px rgba(5,7,31,.78);border:4px solid #fcce21;opacity:0`;
  spot.appendChild(d);
});
tl.set("#dim", { opacity: 0 }, 0);
seq.forEach((i, k) => { const t = k * B; tl.set("#sp" + k, { opacity: 1 }, t); tl.set("#sp" + k, { opacity: 0 }, t + B); tints(t < 3 ? "ga" : "gb", i, t); });
tl.set("#gB", { opacity: 1 }, 3.0); tl.set("#gA", { opacity: 0 }, 3.0);
[["#w0", 0, .48], ["#w1", .48, .96], ["#w2", .96, 1.92], ["#w3", 1.92, 2.4], ["#w4", 2.4, 3.84]].forEach(([s, a, b]) => word(s, a, b, 1.2));
flash(0, .7, .2); flash(.96, .4); flash(2.4, .8, .2);
tl.to("#w4", { scale: 1.06, duration: 1.3, ease: "none" }, 2.6);
tl.to(["#gB", "#lit"], { opacity: 0, duration: .2 }, 3.7);
''' + END_JS.format(t=3.84)
    return dur, mstart, body, script, 5.6


if __name__ == "__main__":
    outdir, which = pathlib.Path(sys.argv[1]), sys.argv[2]
    dur, mstart, body, script, fade0 = {"invited": invited, "unposted": unposted}[which]()
    title = {"invited": "Locked In — teaser: You're invited", "unposted": "Locked In — teaser: Unposted"}[which]
    html = HEAD.format(title=title, dur=dur) + body + TAIL_COMMON.format(dur=dur, mstart=mstart, fade0=fade0, script=script)
    (outdir / "index.html").write_text(html)
    print("ok", which)
