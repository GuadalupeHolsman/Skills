"""CH 02 · Tequila Don Julio — the invitation reel (15.36 s, 32 beats at 125 BPM, drop at 7.2 s).
Power-on hook -> one word per beat -> drop: giant 02 -> HERE blur stack -> redacted line -> end card.
Same kit as the full-screen type line (screen texture, Montserrat, Space Mono, blue/yellow)."""
import pathlib, sys, json, random
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import gen_reels_p as P
from gen_reels_c import B, scramble, lockup

P.DUR = 15.36
DUR = P.DUR

def card(i, bg, inner, color="var(--ink)"):
    return f'<div class="ab" id="cd{i}" style="inset:0;background:{bg};color:{color};opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center">{inner}</div>'

CARDS = [
    ("var(--bg)", '<div class="b" style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:300px;font-weight:900;letter-spacing:-.02em;line-height:.85">THURSDAY</div>'),
    ("var(--blue)", '<div class="b y" style="font-size:330px;font-weight:900;letter-spacing:-.05em">29.10</div>'),
    ("var(--bg)", '<div style="font-size:220px;font-weight:900;color:var(--bg);-webkit-text-stroke:3px var(--ink);letter-spacing:-.02em">BOGOTÁ</div>'),
    ("var(--bg)", '<div style="font-size:215px;font-weight:900;line-height:.9;text-align:center">PHONE:<br><span class="y">IN.</span></div>'),
    ("var(--yel)", '<div style="font-size:250px;font-weight:900;line-height:.9;text-align:center;color:#0B0B0B">APPS:<br>OFF.</div>'),
    ("#E7E5E0", '<div style="font-size:290px;font-weight:900;line-height:1;color:#141414;text-align:center"><span class="wd"><span class="rb" style="transform:none"></span>FEED</span><br><span class="wd"><span class="hb" style="background:var(--yel);transform:none"></span>OFF.</span></div>'),
    ("var(--bg)", '<div class="i" style="font-size:150px">Tequila,</div><div class="b" style="font-size:300px;line-height:1">neat.</div><img src="assets/img/dj_white.png" alt="Tequila Don Julio" style="width:230px;margin-top:40px">'),
    ("var(--blue)", '<div class="i" style="font-size:150px">Music,</div><div class="b y" style="font-size:265px;line-height:1;font-weight:900">LOUD.</div>'),
    ("var(--bg)", '<div style="font-size:150px;font-weight:900;line-height:1.05;text-align:center"><span style="color:var(--bg);-webkit-text-stroke:2.5px var(--ink)">NO STORY</span><br>NO REEL<br><span style="color:var(--bg);-webkit-text-stroke:2.5px var(--ink)">NO FEED</span></div>'),
    ("var(--bg)", '<div class="y" id="inv" style="font-size:250px;font-weight:900;line-height:.9;text-align:center">INVITE<br>ONLY.</div>'),
]

LINE = "No phones out, no stories, no reels. The night stays in the room. Live now, post later."
KEEP = {"Live", "now,", "post", "later."}

def build():
    body = ""
    # 0) power-on hook
    body += '''<div class="ab" id="intro" style="inset:0;background:var(--bg)">
  <div class="ab" id="pline" style="left:0;right:0;top:958px;height:4px;background:#fff;box-shadow:0 0 40px 10px rgba(255,255,255,.7)"></div>
  <div class="ab" id="pscr" style="inset:0;background:var(--blue);opacity:0" ></div>
  <div class="ab" style="left:0;right:0;top:640px;text-align:center">
    <div class="i" id="h1" style="font-size:150px;opacity:0">You're</div>
    <div class="b y" id="h2" style="font-size:250px;font-weight:900;line-height:1;opacity:0">invited.</div>
    <div class="mono" id="h3" style="margin-top:40px;font-size:26px;letter-spacing:.24em;opacity:0">CHANNEL 02 · LOOMLOCK EXPERIENCES</div>
  </div>
</div>'''
    for i, (bg, inner) in enumerate(CARDS):
        body += card(i, bg, inner)
    # drop: giant 02
    body += '''<div class="ab grid" id="big" style="inset:0;opacity:0">
  <div class="ab" id="b02" style="left:0;right:0;top:420px;text-align:center;font-weight:900;font-size:760px;line-height:1;letter-spacing:-.08em;color:var(--yel)">02</div>
  <img src="assets/img/grain2.png" alt="" class="ab" style="left:0;top:420px;width:100%;height:880px;mix-blend-mode:overlay;opacity:.4;image-rendering:pixelated">
  <div class="ab" style="left:0;right:0;top:1330px;text-align:center"><span class="i" style="font-size:64px">One rule,</span> <span class="b" style="font-size:64px">every city.</span></div>
</div>'''
    # HERE blur stack
    rows = 11; fs = 220; rh = fs * .9
    rs = "".join(f'<div class="row" id="hr{i}" style="top:{-rh*.5 + i*rh:.0f}px;font-size:{fs}px;line-height:{rh:.0f}px;color:var(--ink);filter:blur(10px);opacity:.3">HERE.</div>' for i in range(rows))
    body += f'<div class="ab" id="here" style="inset:0;background:var(--bg);opacity:0">{rs}</div>'
    # redacted line
    words = LINE.split(" ")
    sp = ""
    for i, w in enumerate(words):
        if w in KEEP:
            sp += f'<span class="wd" id="lw{i}" style="color:#0B0B0B"><span class="hb" style="background:var(--yel)"></span>{w}</span> '
        else:
            sp += f'<span class="wd" id="lw{i}"><span class="rb"></span>{w}</span> '
    body += f'<div class="ab" id="red" style="inset:0;background:#E7E5E0;opacity:0"><div class="ab" style="left:70px;right:70px;top:620px;font-size:76px;line-height:1.3;font-weight:700;color:#141414">{sp}</div></div>'
    body += P.endcard("end", big=("You're", "invited."))
    body += P.corners() + P.legal()
    body += (f'<audio id="music" src="assets/techno_long.wav" data-start="0" data-duration="{DUR}" data-media-start="0" data-volume="1" '
             f'data-automation=\'{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.15,"v":0.95}},{{"t":{DUR-1:.2f},"v":1}},{{"t":{DUR},"v":0}}]}}]}}\'></audio>')
    body += '<div class="ab" id="fl" style="inset:0;background:#fff;opacity:0;z-index:55"></div>'

    js = ""
    # power-on
    js += 'tl.fromTo("#pline",{scaleX:0},{scaleX:1,duration:.22,ease:"power3.out"},.05);'
    js += 'tl.to("#pline",{scaleY:240,opacity:0,duration:.3,ease:"power2.in"},.3);'
    js += 'tl.fromTo("#pscr",{opacity:0},{opacity:.0,duration:.01},.0);'
    js += 'tl.fromTo("#h1",{opacity:0,y:30},{opacity:1,y:0,duration:.3,ease:"power3.out"},.62);'
    js += 'tl.fromTo("#h2",{opacity:0,scale:1.4},{opacity:1,scale:1,duration:.3,ease:"expo.out"},1.1);'
    for k, s in enumerate(scramble("invited.", "inv-hook", 3)):
        js += f'tl.set("#h2",{{textContent:{json.dumps(s)}}},{1.1 + k/15:.3f});'
    js += 'tl.set("#h2",{textContent:"invited."},1.3);'
    js += 'tl.fromTo("#h3",{opacity:0},{opacity:1,duration:.3},1.58);'
    js += 'tl.set("#intro",{opacity:0},2.4);'
    # one card per beat
    t = 2.4
    for i in range(len(CARDS)):
        js += f'tl.set("#cd{i}",{{opacity:1}},{t:.2f});tl.fromTo("#cd{i} > *",{{scale:1.18}},{{scale:1,duration:.22,ease:"power3.out"}},{t:.2f});tl.set("#cd{i}",{{opacity:0}},{t + B:.2f});'
        t += B
    for k, s in enumerate(scramble("INVITE ONLY.", "inv-only", 3)):
        js += f'tl.set("#inv",{{textContent:{json.dumps(s)}}},{6.72 + k/20:.3f});'
    js += 'tl.set("#inv",{innerHTML:"INVITE<br>ONLY."},6.87);'
    # drop
    js += 'tl.set("#fl",{opacity:.9},7.2);tl.to("#fl",{opacity:0,duration:.18},7.22);'
    js += 'tl.set("#big",{opacity:1},7.2);tl.fromTo("#b02",{scaleY:.02,scaleX:1.4},{scaleY:1,scaleX:1,duration:.32,ease:"expo.out"},7.2);'
    for k in range(4):
        js += f'tl.fromTo("#b02",{{x:{random.Random(k).choice([-18,18])}}},{{x:0,duration:.2,ease:"power2.out",immediateRender:false}},{7.68 + k*B/2:.2f});'
    js += 'tl.set("#big",{opacity:0},8.16);tl.set("#here",{opacity:1},8.16);'
    # focus scan through HERE
    n = int(1.44 / .08)
    for k in range(n + 1):
        f = -2 + (5 + 2) * k / n
        tt = 8.16 + k * .08
        for i in range(rows):
            d = abs(i - f)
            js += f'tl.set("#hr{i}",{{filter:"blur({min(14, d*3.4):.1f}px)",opacity:{max(.18, 1 - d*.2):.2f}}},{tt:.2f});'
    js += 'tl.set("#here",{opacity:0},9.6);tl.set("#red",{opacity:1},9.6);'
    r = random.Random(3); idx = [i for i, w in enumerate(words) if w not in KEEP]; r.shuffle(idx)
    for k, i in enumerate(idx):
        js += f'tl.fromTo("#lw{i} .rb",{{scaleX:0}},{{scaleX:1,duration:.08}},{9.75 + k*.05:.2f});'
    keep = [i for i, w in enumerate(words) if w in KEEP]
    for k, i in enumerate(keep):
        js += f'tl.fromTo("#lw{i} .hb",{{scaleX:0}},{{scaleX:1,duration:.12,ease:"power2.out"}},{10.4 + k*.1:.2f});'
    js += 'tl.set("#red",{opacity:0},11.04);'
    js += P.endjs("end", 11.04)
    P.project("i1-invitacion", "CH 02 · Invitation", body, js, "techno_long.wav")

if __name__ == "__main__":
    build()
