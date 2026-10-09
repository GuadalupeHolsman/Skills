"""CH 02 · invitation 'Zapping': too many channels -> landing on CH 02 (the TV idea of the team + full-screen type)."""
import pathlib, sys, json
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import gen_reels_p as P
from gen_reels_c import B, scramble

P.DUR = 15.36
DUR = P.DUR
CH = [("CH 07", "FEED", "#121216"), ("CH 11", "STORIES", "#1A1020"), ("CH 13", "47 NEW", "#101A1A"), ("CH 19", "FOR YOU", "#14141C"),
      ("CH 23", "ADS", "#1C1410"), ("CH 31", "TRENDING", "#10141C"), ("CH 38", "REELS", "#16101A"), ("CH 44", "LIVE", "#1A1212"),
      ("CH 56", "SCROLL", "#101810"), ("CH 99", "MORE", "#141414")]

def osd(txt, col="var(--yel)"):
    return f'<div class="ab mono" style="left:70px;top:230px;font-size:64px;font-weight:700;letter-spacing:.06em;color:{col};text-shadow:0 0 18px rgba(252,206,33,.6)">{txt}</div>'

def build():
    noise = ('<img src="assets/img/grain{n}.png" alt="" class="ab" style="left:-10%;top:-10%;width:120%;height:120%;image-rendering:pixelated;'
             'filter:grayscale(1) contrast(2.4) brightness(1.2);opacity:{o}">')
    body = f'''<div class="ab" id="intro" style="inset:0;background:#0B0B0E">{noise.format(n=1, o=.55)}
  {osd("CH --", "rgba(244,242,238,.85)")}
  <div class="ab mono" style="left:70px;top:320px;font-size:28px;letter-spacing:.2em;color:rgba(244,242,238,.8)">SEARCHING…</div>
  <div class="ab" style="left:0;right:0;top:760px;text-align:center"><div class="i" style="font-size:130px">Too many</div><div class="b" id="tm" style="font-size:170px;font-weight:900;line-height:1">channels.</div></div>
</div>'''
    for i, (c, w, bg) in enumerate(CH):
        body += (f'<div class="ab" id="z{i}" style="inset:0;background:{bg};opacity:0">{noise.format(n=i % 4, o=.28)}{osd(c)}'
                 f'<div class="ab" style="left:0;right:0;top:820px;text-align:center;font-size:{230 if len(w) < 7 else 180}px;font-weight:900;letter-spacing:-.02em;'
                 f'color:rgba(244,242,238,.9);text-shadow:6px 0 rgba(255,40,80,.45),-6px 0 rgba(40,200,255,.45)">{w}</div></div>')
    body += f'''<div class="ab grid" id="ch02" style="inset:0;opacity:0">{osd("CH 02")}
  <div class="ab" style="left:0;right:0;top:700px;text-align:center"><div class="i" id="o1" style="font-size:130px">One channel</div><div class="b y" id="o2" style="font-size:190px;font-weight:900;line-height:1">worth it.</div></div>
  <div class="ab mono" style="left:0;right:0;top:1130px;text-align:center;font-size:26px;letter-spacing:.2em">LOOMLOCK EXPERIENCES · TEQUILA DON JULIO</div>
</div>
<div class="ab" id="pk" style="inset:0;background:var(--bg);opacity:0">
  <div class="ab" style="left:0;right:0;top:700px;text-align:center"><div class="i" style="font-size:110px">Your phone stays</div><div class="b" style="font-size:150px;font-weight:900;line-height:1.05">in your pocket.</div>
  <div style="margin-top:40px;font-size:52px"><span class="i">The apps take</span> <span class="b y">the night off.</span></div></div>
</div>'''
    body += P.endcard("end", big=("You're", "invited."))
    body += P.corners() + P.legal()
    body += (f'<audio id="music" src="assets/garage_long.wav" data-start="0" data-duration="{DUR}" data-media-start="0" data-volume="1" '
             f'data-automation=\'{{"version":1,"lanes":[{{"target":"volume","points":[{{"t":0,"v":0}},{{"t":0.15,"v":0.95}},{{"t":{DUR-1:.2f},"v":1}},{{"t":{DUR},"v":0}}]}}]}}\'></audio>')
    body += '<div class="ab" id="fl" style="inset:0;background:#fff;opacity:0;z-index:55"></div>'
    js = 'tl.fromTo("#tm",{opacity:0,scale:1.3},{opacity:1,scale:1,duration:.3,ease:"expo.out"},.9);'
    for k, s in enumerate(scramble("channels.", "zap", 4)):
        js += f'tl.set("#tm",{{textContent:{json.dumps(s)}}},{.9 + k/15:.3f});'
    js += 'tl.set("#tm",{textContent:"channels."},1.17);tl.set("#intro",{opacity:0},2.4);'
    t = 2.4
    for i in range(len(CH)):
        js += f'tl.set("#z{i}",{{opacity:1}},{t:.2f});tl.set("#z{i}",{{opacity:0}},{t + B:.2f});'
        js += f'tl.set("#fl",{{opacity:.25}},{t:.2f});tl.set("#fl",{{opacity:0}},{t + 1/15:.3f});'
        t += B
    js += 'tl.set("#fl",{opacity:.95},7.2);tl.to("#fl",{opacity:0,duration:.25},7.22);tl.set("#ch02",{opacity:1},7.2);'
    js += 'tl.fromTo("#o1",{opacity:0,y:30},{opacity:1,y:0,duration:.3},7.4);tl.fromTo("#o2",{opacity:0,scale:1.3},{opacity:1,scale:1,duration:.3,ease:"expo.out"},7.88);'
    js += 'tl.set("#ch02",{opacity:0},9.6);tl.set("#pk",{opacity:1},9.6);tl.fromTo("#pk > div",{y:40,opacity:0},{y:0,opacity:1,duration:.35,ease:"power3.out"},9.62);'
    js += 'tl.set("#pk",{opacity:0},12.0);'
    js += P.endjs("end", 12.0)
    P.project("i3-zapping", "CH 02 · Zapping", body, js, "garage_long.wav")

if __name__ == "__main__":
    build()
