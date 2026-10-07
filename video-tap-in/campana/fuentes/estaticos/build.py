"""LOCKED IN campaign statics: flyers + Instagram posts. Writes HTML pages and exports PNGs with headless Chromium."""
import pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).parent
KEY = (ROOT / "keycard.html.part").read_text()
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

LOGOS = '<img src="assets/img/loomlock_white.png" style="height:{h}px" alt="loomlock" /><span style="font-weight:500;font-size:{x}px;color:rgba(255,255,255,.7);margin:0 {g}px">×</span><img src="assets/img/donjulio_white.png" style="height:{dh}px" alt="Don Julio" />'

def logos(h=34, x=26, g=18, dh=56):
    return f'<div style="display:flex;align-items:center">{LOGOS.format(h=h, x=x, g=g, dh=dh)}</div>'

def card(left, top, rot=-8, scale=1.0, extra=""):
    return f'<div class="kc" style="left:{left}px;top:{top}px;transform:rotate({rot}deg) scale({scale});{extra}">{KEY}</div>'

def rings(cx, cy, radii, op=0.5):
    return "".join(f'<div class="ring" style="left:{cx-r}px;top:{cy-r}px;width:{2*r}px;height:{2*r}px;opacity:{op*(1-i*0.28):.2f}"></div>' for i, r in enumerate(radii))

def page(w, h, body, extra_css=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="assets/brand.css">
<style>html,body{{width:{w}px;height:{h}px}} .art{{width:{w}px;height:{h}px}} {extra_css}</style></head>
<body><div class="art">{body}<div class="vig"></div><div class="grain"></div></div></body></html>"""

RULES = [
    ("01", "Your phone comes in.", "Its apps don’t."),
    ("02", "No photos. No feed.", "No proof."),
    ("03", "Tap in at the door.", "Stay in all night."),
]

def rules_block(left, top, size=34, gap=86, numsize=40, width=900):
    rows = []
    for i, (n, a, b) in enumerate(RULES):
        rows.append(f'''<div style="position:absolute;left:{left}px;top:{top + i*gap}px;width:{width}px;display:flex;gap:28px;align-items:baseline;border-top:1.5px solid rgba(192,200,255,.22);padding-top:16px">
          <span class="y" style="font-weight:800;font-size:{numsize}px;letter-spacing:-.02em;width:{numsize*1.6:.0f}px">{n}</span>
          <span style="font-weight:800;font-size:{size}px;text-transform:uppercase;letter-spacing:-.01em;line-height:1.1">{a} <span style="color:var(--ice);font-weight:600">{b}</span></span></div>''')
    return "".join(rows)

# ---------------------------------------------------------------- flyers
def flyer_feed():
    W, H = 1080, 1350
    b = f'''
    <div class="big outline" style="position:absolute;left:-30px;top:640px;font-size:300px">LOCKED</div>
    <div style="position:absolute;left:64px;right:64px;top:54px;display:flex;justify-content:space-between;align-items:center">{logos(32, 24, 16, 52)}<span class="meta" style="font-size:18px;color:var(--ice)">Invite only</span></div>
    <div class="big" style="position:absolute;left:58px;top:150px;font-size:176px">LOCKED</div>
    <div class="big" style="position:absolute;left:58px;top:304px;font-size:176px">IN<span class="y">.</span></div>
    {rings(735, 525, [190, 270, 350], 0.35)}
    {card(495, 375, -9, 0.95)}
    <div class="meta y" style="position:absolute;left:64px;top:730px;font-size:20px">Door policy</div>
    {rules_block(64, 768, 30, 78, 34, 952)}
    <div style="position:absolute;left:64px;right:64px;top:1030px;border-top:1.5px solid rgba(192,200,255,.22)"></div>
    <div class="big y" style="position:absolute;left:58px;top:1068px;font-size:160px">29.10</div>
    <div style="position:absolute;right:64px;top:1084px;text-align:right">
      <div class="meta" style="font-size:22px;font-weight:800;color:#fff">Thursday</div>
      <div class="meta" style="font-size:18px;margin-top:14px;color:var(--ice);line-height:1.6">Location sent<br>to the list</div>
    </div>
    <div class="foot" style="top:1286px;font-size:16px"><span>+18 · Please drink responsibly</span><span class="y">Tap in at the door</span></div>'''
    return W, H, page(W, H, b)

def flyer_story():
    W, H = 1080, 1920
    b = f'''
    <div class="big outline" style="position:absolute;left:-40px;top:190px;font-size:360px">LOCKED</div>
    <div class="big outline" style="position:absolute;left:560px;top:500px;font-size:360px">IN</div>
    <div style="position:absolute;left:64px;right:64px;top:120px;display:flex;justify-content:space-between;align-items:center">{logos(34, 26, 18, 56)}<span class="meta" style="font-size:20px;color:var(--ice)">Invite only</span></div>
    {rings(560, 520, [240, 340, 450], 0.35)}
    {card(300, 370, -9, 1.2)}
    <div class="big" style="position:absolute;left:58px;top:800px;font-size:190px">LOCKED</div>
    <div class="big" style="position:absolute;left:58px;top:966px;font-size:190px">IN<span class="y">.</span></div>
    <div class="meta y" style="position:absolute;left:64px;top:1190px;font-size:22px">Door policy</div>
    {rules_block(64, 1232, 32, 90, 38, 952)}
    <div style="position:absolute;left:64px;right:64px;top:1530px;border-top:1.5px solid rgba(192,200,255,.22)"></div>
    <div class="big y" style="position:absolute;left:56px;top:1572px;font-size:190px">29.10</div>
    <div style="position:absolute;right:64px;top:1590px;text-align:right">
      <div class="meta" style="font-size:24px;font-weight:800">Thursday</div>
      <div class="meta" style="font-size:19px;margin-top:16px;color:var(--ice);line-height:1.6">Location sent<br>to the list</div>
    </div>
    <div class="foot" style="top:1830px;font-size:17px"><span>+18 · Please drink responsibly</span><span class="y">Tap in at the door</span></div>'''
    return W, H, page(W, H, b)

# ---------------------------------------------------------------- posts
NAMES = ["Sofi M.", "Juani P.", "Cami R.", "Tomi G.", "Valen A.", "Mili F.", "Nacho D.", "Luli S.", "You"]

def post_list():
    W, H = 1080, 1350
    rows = []
    for i, n in enumerate(NAMES):
        hl = 'background:linear-gradient(transparent 58%, rgba(252,206,33,.75) 58%, rgba(252,206,33,.75) 88%, transparent 88%);' if n == "You" else ""
        rows.append(f'''<div style="display:flex;justify-content:space-between;align-items:center;height:70px;border-bottom:1.5px dashed rgba(20,22,60,.25);font-weight:700;font-size:34px;color:#14163a">
           <span style="{hl}padding:0 4px">{n.upper()}</span><span style="font-weight:800;color:#1d29c2;font-size:36px">✓</span></div>''')
    rows.append('''<div style="position:relative;display:flex;justify-content:space-between;align-items:center;height:78px;font-weight:800;font-size:36px;color:#14163a">
           <span style="position:relative">YOUR PHONE<i style="position:absolute;left:-10px;right:-14px;top:50%;height:7px;background:#e83852;transform:rotate(-3deg)"></i></span><span style="font-weight:900;color:#e83852;font-size:40px">✗</span></div>''')
    b = f'''
    <div class="meta" style="position:absolute;left:64px;top:64px;font-size:20px;color:var(--ice)">Locked in · 29.10</div>
    <div class="meta y" style="position:absolute;right:64px;top:64px;font-size:20px">Invite only</div>
    <div style="position:absolute;left:150px;top:150px;width:780px;height:1100px;background:#f3f2ec;border-radius:10px;transform:rotate(-2.5deg);box-shadow:0 50px 100px rgba(0,0,0,.6);padding:58px 64px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:4px solid #14163a;padding-bottom:18px;margin-bottom:10px">
        <div style="font-weight:900;font-size:58px;color:#14163a;letter-spacing:-.03em;line-height:.9">GUEST<br>LIST</div>
        <div style="text-align:right;font-weight:700;font-size:18px;letter-spacing:.2em;color:#14163a">THU · 29.10<br><span style="color:#1d29c2">LOCKED IN</span></div>
      </div>
      {"".join(rows)}
      <div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:url(assets/img/grain0.png) 0 0/540px 960px;opacity:.06;mix-blend-mode:multiply"></div>
    </div>
    <div style="position:absolute;left:470px;top:1060px;transform:rotate(-12deg);border:9px solid var(--yellow);border-radius:18px;padding:22px 34px 16px;color:var(--yellow);text-align:center;box-shadow:0 0 0 4px rgba(5,7,31,.9) inset;background:rgba(5,7,31,.88)">
      <div style="font-weight:900;font-size:68px;line-height:.9;letter-spacing:-.02em">NOT ON<br>THE LIST.</div>
    </div>'''
    return W, H, page(W, H, b)

def post_key():
    W, H = 1080, 1350
    b = f'''
    <div class="big outline" style="position:absolute;left:-40px;top:420px;font-size:420px;-webkit-text-stroke:2px rgba(192,200,255,.12)">KEY</div>
    <div class="big" style="position:absolute;left:64px;top:96px;font-size:118px">THIS IS<br>YOUR INVITE<span class="y">.</span></div>
    {rings(560, 720, [300, 420, 540], 0.3)}
    {card(300, 560, -10, 1.55)}
    <div style="position:absolute;left:64px;top:1070px;font-weight:700;font-size:46px;line-height:1.15">It also locks<br><span class="y">your apps.</span></div>
    <div class="foot" style="top:1262px;font-size:17px"><span>Tap in at the door · 29.10</span><span>+18</span></div>'''
    return W, H, page(W, H, b)

def post_lockscreen():
    W, H = 1080, 1350
    phone = f'''
    <div style="position:absolute;left:330px;top:350px;width:430px;height:880px;border-radius:66px;transform-origin:50% 50%;border:6px solid rgba(255,255,255,.92);background:#03041a;box-shadow:0 60px 120px rgba(0,0,0,.7),0 0 90px rgba(29,41,194,.45);transform:rotate(-4deg)">
      <div style="position:absolute;inset:14px;border-radius:58px;overflow:hidden;background:radial-gradient(90% 70% at 50% 30%,#2a37d6 0%,#1d29c2 40%,#0e1676 100%)">
        <div style="position:absolute;left:50%;top:22px;width:110px;height:30px;margin-left:-55px;border-radius:15px;background:#000"></div>
        <div style="position:absolute;left:0;right:0;top:110px;text-align:center;font-weight:600;font-size:22px;color:rgba(255,255,255,.85)">Thursday, 29 October</div>
        <div style="position:absolute;left:0;right:0;top:140px;text-align:center;font-weight:500;font-size:136px;letter-spacing:-.04em;line-height:1">23:41</div>
        <div style="position:absolute;left:16px;right:16px;top:340px;border-radius:28px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);padding:20px 22px;backdrop-filter:blur(10px)">
          <div style="display:flex;align-items:center;gap:12px;font-weight:700;font-size:17px;letter-spacing:.06em;color:rgba(255,255,255,.85)"><span style="width:38px;height:38px;border-radius:10px;background:#121b95;display:flex;align-items:center;justify-content:center"><img src="assets/img/loomlock_mark_white.png" style="height:24px"></span>LOOMLOCK<span style="margin-left:auto;font-weight:600;letter-spacing:0;opacity:.7">now</span></div>
          <div style="margin-top:12px;font-weight:800;font-size:25px;line-height:1.2">Your apps are locked until 04:00.</div>
          <div style="margin-top:4px;font-weight:500;font-size:22px;line-height:1.25;color:rgba(255,255,255,.85)">Go dance. We’ll keep it quiet.</div>
        </div>
        <div style="position:absolute;left:0;right:0;bottom:70px;text-align:center"><img src="assets/img/loomlock_mark_white.png" style="height:64px;opacity:.9"><div class="meta" style="margin-top:16px;font-size:16px;color:var(--ice)">Locked in</div></div>
      </div>
    </div>'''
    b = f'''
    <div class="big" style="position:absolute;left:64px;top:84px;font-size:76px;line-height:.92">THE ONLY<br>NOTIFICATION<br><span class="y">YOU’LL GET TONIGHT.</span></div>
    {phone}
    <div class="foot" style="top:1290px;font-size:16px"><span>Loomlock × Don Julio · 29.10</span><span>+18</span></div>'''
    return W, H, page(W, H, b)

def carousel():
    """one 3240x1350 canvas, sliced into three 1080x1350 slides: a velvet rope runs across all three"""
    W, H = 3240, 1350
    posts = [300, 1620, 2940]
    rope = "".join(
        f'<path d="M{a} 1010 Q{(a+b)/2} 1150 {b} 1010" fill="none" stroke="#fcce21" stroke-width="20" stroke-linecap="round"/>'
        f'<path d="M{a} 1010 Q{(a+b)/2} 1150 {b} 1010" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-linecap="round" transform="translate(0,-6)"/>'
        for a, b in zip(posts[:-1], posts[1:]))
    stanch = "".join(
        f'<g transform="translate({x},0)"><rect x="-10" y="1000" width="20" height="260" rx="6" fill="url(#steel)"/><ellipse cx="0" cy="1262" rx="70" ry="16" fill="url(#steel)"/><circle cx="0" cy="992" r="24" fill="url(#steel)"/></g>'
        for x in posts)
    svg = f'''<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}"><defs><linearGradient id="steel" x1="0" x2="1"><stop offset="0" stop-color="#7f88b8"/><stop offset=".45" stop-color="#eef0fb"/><stop offset="1" stop-color="#5a6296"/></linearGradient></defs>{rope}{stanch}</svg>'''
    def slide_txt(x, n, a, bb, size=120):
        return f'''<div class="big y" style="position:absolute;left:{x+64}px;top:430px;font-size:260px;letter-spacing:-.06em">{n}</div>
          <div class="big" style="position:absolute;left:{x+64}px;top:680px;width:950px;font-size:{size}px">{a}</div>
          <div style="position:absolute;left:{x+64}px;top:{680+int(size*0.86*2)+30}px;font-weight:700;font-size:44px;color:var(--ice)">{bb}</div>'''
    b = f'''
    <div class="meta" style="position:absolute;left:64px;top:70px;font-size:22px;color:var(--ice)">Door policy · 29.10</div>
    <div class="big" style="position:absolute;left:64px;top:120px;font-size:150px">DOOR<br><span class="y">POLICY.</span></div>
    {slide_txt(0, "01", "YOUR PHONE<br>COMES IN.", "Its apps don’t.")}
    {card(820, 90, 12, 1.0)}
    {slide_txt(1080, "02", "NO PHOTOS.<br>NO FEED.", "No proof. Just the story you tell.")}
    {slide_txt(2160, "03", "UNPOSTED.<br><span class='y'>UNFORGETTABLE.</span>", "", 104)}
    <div style="position:absolute;left:2224px;top:905px;display:flex;align-items:center;gap:40px"><span class="big y" style="font-size:96px">29.10</span><span class="meta" style="font-size:20px;line-height:1.6">Thursday<br><span style="color:var(--ice)">Tap in at the door</span></span></div>
    <div style="position:absolute;left:2224px;top:70px">{logos(30, 22, 14, 50)}</div>
    {svg}
    <div class="meta" style="position:absolute;left:{1080-64-200}px;top:1290px;width:200px;text-align:right;font-size:16px;color:var(--ice)">Swipe →</div>
    <div class="meta" style="position:absolute;left:{2160-64-200}px;top:1290px;width:200px;text-align:right;font-size:16px;color:var(--ice)">Swipe →</div>
    <div class="meta" style="position:absolute;left:2224px;top:1290px;font-size:16px;color:rgba(255,255,255,.7)">+18 · Please drink responsibly</div>'''
    return W, H, page(W, H, b)

PIECES = {
    "flyer-feed": flyer_feed, "flyer-story": flyer_story,
    "post-1-the-list": post_list, "post-2-the-key": post_key, "post-3-lock-screen": post_lockscreen,
    "post-4-door-policy-panorama": carousel,
}

def export(name, scale=1):
    W, H, html = PIECES[name]()
    f = ROOT / f"{name}.html"
    f.write_text(html)
    out = ROOT / "out" / f"{name}{'@2x' if scale == 2 else ''}.png"
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars", "--disable-gpu", f"--force-device-scale-factor={scale}",
                    f"--window-size={W},{H}", "--virtual-time-budget=3000", f"--screenshot={out}", f.as_uri()],
                   check=True, capture_output=True)
    return out

if __name__ == "__main__":
    names = sys.argv[1:] or list(PIECES)
    for n in names:
        print(export(n))
