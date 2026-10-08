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


# ---------------------------------------------------------------- party-style (the reel's six-screen grid)
STILLS = ["face", "crowd", "dancer", "lights", "hands", "warm"]

def grid(W, H, cols, rows, on=(), order=None, dim=0.0, gap=4):
    tw, th = W / cols, H / rows
    order = order or STILLS
    cells = []
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            name = order[i % len(order)]
            tint = "" if i in on else '<div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:color"></div>'
            cells.append(f'''<div style="position:absolute;left:{c*tw:.0f}px;top:{r*th:.0f}px;width:{tw-gap:.0f}px;height:{th-gap:.0f}px;overflow:hidden">
              <img src="assets/stills/{name}.jpg" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.15) saturate(1.2)">{tint}</div>''')
    shade = f'<div style="position:absolute;inset:0;background:rgba(5,7,31,{dim})"></div>' if dim else ""
    return "".join(cells) + shade

def diff(txt, left, top, size, extra=""):
    return f'<div class="big" style="position:absolute;left:{left}px;top:{top}px;font-size:{size}px;color:#fff;mix-blend-mode:difference;{extra}">{txt}</div>'

def strip(top, W, txt, h=88, size=26):
    return f'''<div style="position:absolute;left:0;top:{top}px;width:{W}px;height:{h}px;background:var(--yellow);color:#05071f;display:flex;align-items:center;justify-content:space-between;padding:0 64px;font-weight:800;font-size:{size}px;letter-spacing:.24em;text-transform:uppercase">{txt}</div>'''

def flyer_party_feed():
    W, H = 1080, 1350
    b = f'''{grid(W, 1180, 2, 3, on=(2,), dim=0.15)}
    <div style="position:absolute;left:64px;right:64px;top:54px;display:flex;justify-content:space-between;align-items:center;z-index:2">{logos(32, 24, 16, 52)}<span class="meta" style="font-size:18px">Invite only</span></div>
    {diff("LEAVE YOUR", 52, 300, 132)}
    {diff("PHONE AT", 52, 420, 132)}
    {diff("THE DOOR.", 52, 540, 132)}
    {diff("29.10", 40, 800, 300, "color:#fcce21;mix-blend-mode:normal;text-shadow:0 20px 60px rgba(0,0,0,.5)")}
    {strip(1180, W, "<span>Thursday</span><span>Tap in at the door</span>", 90, 26)}
    <div style="position:absolute;left:0;top:1270px;width:{W}px;height:80px;background:#05071f"></div>
    <div class="foot" style="top:1300px;font-size:16px"><span>+18 · Please drink responsibly</span><span>Location sent to the list</span></div>'''
    return W, H, page(W, H, b)

def flyer_party_story():
    W, H = 1080, 1920
    b = f'''{grid(W, 1700, 2, 3, on=(2,), dim=0.15)}
    <div style="position:absolute;left:64px;right:64px;top:110px;display:flex;justify-content:space-between;align-items:center">{logos(34, 26, 18, 56)}<span class="meta" style="font-size:20px">Invite only</span></div>
    {diff("LEAVE", 52, 330, 200)}
    {diff("YOUR", 52, 500, 200)}
    {diff("PHONE", 52, 670, 200)}
    {diff("AT THE", 52, 840, 170)}
    {diff("DOOR.", 52, 990, 200)}
    {diff("29.10", 40, 1250, 300, "color:#fcce21;mix-blend-mode:normal;text-shadow:0 20px 60px rgba(0,0,0,.5)")}
    {strip(1700, W, "<span>Thursday</span><span>Tap in at the door</span>", 100, 28)}
    <div class="foot" style="top:1840px;font-size:17px"><span>+18 · Please drink responsibly</span><span>Location sent to the list</span></div>'''
    return W, H, page(W, H, b)

def triptych():
    """3240x1350 -> three posts that read LOCKED / IN. / 29.10 side by side on the profile grid"""
    W, H = 3240, 1350
    order = ["face", "crowd", "dancer", "lights", "warm", "hands", "crowd", "face", "hands", "dancer", "lights", "warm"]
    b = f'''{grid(W, H, 6, 2, on=(0, 9), order=order, dim=0.12)}
    {diff("LOCKED", 80, 500, 228)}
    {diff("IN<span style='color:#fcce21'>.</span>", 1080 + 210, 470, 420)}
    {diff("29.10", 2160 + 60, 470, 300, "color:#fcce21;mix-blend-mode:normal;text-shadow:0 20px 60px rgba(0,0,0,.45)")}
    <div class="meta" style="position:absolute;left:86px;top:830px;font-size:24px">Loomlock × Don Julio</div>
    <div class="meta" style="position:absolute;left:1150px;top:930px;font-size:24px">Your phone comes in. Its apps don’t.</div>
    <div class="meta" style="position:absolute;left:2230px;top:810px;font-size:24px">Thursday · Invite only</div>
    <div class="meta" style="position:absolute;left:86px;top:1260px;font-size:18px;color:rgba(255,255,255,.75)">+18 · Please drink responsibly</div>
    <div class="meta y" style="position:absolute;left:1166px;top:1260px;font-size:18px">No photos. No feed.</div>
    <div class="meta y" style="position:absolute;left:2246px;top:1260px;font-size:18px">Tap in at the door</div>'''
    return W, H, page(W, H, b)

PIECES.update({"flyer-party-feed": flyer_party_feed, "flyer-party-story": flyer_party_story, "post-5-triptych-panorama": triptych})

# ---------------------------------------------------------------- INVITE ONLY (club flyer, per the boss's reference)
CREAM = "#f2ecdf"
KEYICON = '<svg viewBox="0 0 100 100" style="width:{s}px;height:{s}px;flex:0 0 {s}px"><g transform="rotate(-35 50 50)"><path d="M8 50A20 20 0 1 1 48 50A20 20 0 1 1 8 50ZM17 50A7 7 0 1 0 31 50A7 7 0 1 0 17 50ZM44 44H90V56H44ZM70 56H78V68H70ZM82 56H90V72H82Z" fill="#fcce21"/></g></svg>'

def inv_bg(W, H):
    return f'''<img src="assets/stills/bg_crowd.jpg" style="position:absolute;left:0;top:0;width:{W}px;height:{H}px;object-fit:cover;object-position:62% 50%;filter:contrast(1.1) saturate(1.15)">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,31,.88) 0%,rgba(5,7,31,.62) 48%,rgba(5,7,31,.18) 100%)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,31,.55) 0%,rgba(5,7,31,0) 22%,rgba(5,7,31,0) 70%,rgba(5,7,31,.8) 100%)"></div>'''

def rule(top, left=68, width=944, op=.7):
    return f'<div style="position:absolute;left:{left}px;top:{top}px;width:{width}px;height:2px;background:{CREAM};opacity:{op}"></div>'

def label(top, html, size=34, left=68, ls=".06em", weight=700, color=CREAM):
    return f'<div style="position:absolute;left:{left}px;top:{top}px;font-weight:{weight};font-size:{size}px;line-height:1.22;letter-spacing:{ls};text-transform:uppercase;color:{color}">{html}</div>'

def cta(top, left=60, size=38, text="Request your key"):
    return f'''<div style="position:absolute;left:{left}px;top:{top}px;display:flex;align-items:center;gap:16px;padding:20px 32px;border-radius:30px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.25);font-weight:600;font-size:{size}px;color:#fff">{KEYICON.format(s=int(size*1.25))}{text}</div>'''

def invite_story(with_cta=True):
    W, H = 1080, 1920
    b = f'''{inv_bg(W, H)}
    <div style="position:absolute;left:68px;right:68px;top:62px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:baseline;gap:18px;color:{CREAM}"><span style="font-weight:800;font-size:40px;letter-spacing:.1em">LOOMLOCK × DON JULIO</span><span style="font-weight:700;font-size:24px;letter-spacing:.14em">PRESENT</span></div>
      <img src="assets/img/loomlock_mark_white.png" style="height:58px">
    </div>
    {rule(146)}
    <div class="cond" style="position:absolute;left:58px;top:182px;font-size:340px;color:{CREAM}">INVITE</div>
    <div class="cond" style="position:absolute;left:58px;top:466px;font-size:340px;color:{CREAM}">ONLY</div>
    {rule(800, width=110)}
    {label(830, "Thursday", 40, ls=".42em")}
    <div class="cond" style="position:absolute;left:58px;top:886px;font-size:250px;color:{CREAM}">29</div>
    {label(1110, "October", 48, ls=".08em", weight=800)}
    {label(1190, "Your phone comes in<br>Its apps don’t<br>No photos<br>No feed", 38)}
    {rule(1398, width=110)}
    {label(1420, "Guestlist and<br>invite only", 34)}
    {rule(1524, width=110)}
    {label(1546, "Door policy<br>applies", 34)}
    {rule(1650, width=110)}
    {label(1672, "Venue:<br>sent to the list", 34)}
    {cta(1546, 560) if with_cta else ""}
    {rule(1800)}
    {label(1826, "+18 · Drink responsibly", 28, ls=".1em")}
    {label(1826, "Tap in at the door", 28, left=0, ls=".1em").replace("left:0px", "right:68px")}'''
    return W, H, page(W, H, b)

def invite_feed():
    W, H = 1080, 1350
    b = f'''{inv_bg(W, H)}
    <div style="position:absolute;left:64px;right:64px;top:48px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:baseline;gap:14px;color:{CREAM}"><span style="font-weight:800;font-size:32px;letter-spacing:.1em">LOOMLOCK × DON JULIO</span><span style="font-weight:700;font-size:20px;letter-spacing:.14em">PRESENT</span></div>
      <img src="assets/img/loomlock_mark_white.png" style="height:46px">
    </div>
    {rule(114, 64, 952)}
    <div class="cond" style="position:absolute;left:56px;top:140px;font-size:300px;color:{CREAM}">INVITE</div>
    <div class="cond" style="position:absolute;left:56px;top:388px;font-size:300px;color:{CREAM}">ONLY</div>
    {rule(670, 64, 100)}
    {label(694, "Thursday", 34, left=64, ls=".42em")}
    <div class="cond" style="position:absolute;left:54px;top:740px;font-size:210px;color:{CREAM}">29</div>
    {label(930, "October", 40, left=64, ls=".08em", weight=800)}
    {label(700, "Your phone comes in<br>Its apps don’t<br>No photos · No feed", 30, left=500)}
    {rule(830, 500, 90)}
    {label(850, "Guestlist and invite only", 30, left=500)}
    {rule(905, 500, 90)}
    {label(925, "Door policy applies", 30, left=500)}
    {rule(980, 500, 90)}
    {label(1000, "Venue: sent to the list", 30, left=500)}
    {cta(1060, 490, 32)}
    {rule(1240, 64, 952)}
    {label(1264, "+18 · Drink responsibly", 24, left=64, ls=".1em")}
    {label(1264, "Tap in at the door", 24, left=0, ls=".1em").replace("left:0px", "right:64px")}'''
    return W, H, page(W, H, b)

PIECES.update({"invite-only-story": invite_story, "invite-only-story-sin-boton": lambda: invite_story(False), "invite-only-feed": invite_feed})

# ---------------------------------------------------------------- shared bits for round 3
def padlock(size, open_=False, color="#fcce21", hole="#05071f"):
    sh = 'transform="rotate(-28 90 70) translate(0,-16)"' if open_ else ""
    return f"""<svg viewBox="0 0 120 150" style="width:{size}px;height:{size*1.25:.0f}px;overflow:visible"><path d="M30 70 V42 a30 30 0 0 1 60 0 V70" {sh} fill="none" stroke="{color}" stroke-width="14" stroke-linecap="round"/><rect x="14" y="66" width="92" height="74" rx="16" fill="{color}"/><circle cx="60" cy="98" r="9" fill="{hole}"/><rect x="56" y="98" width="8" height="20" rx="3" fill="{hole}"/></svg>"""

def card_custom(left, top, rot, scale, label, sub):
    k = KEY.replace("<b>Experience</b><span>29.10 · Invite only</span>", f"<b>{label}</b><span>{sub}</span>")
    return f'<div class="kc" style="left:{left}px;top:{top}px;transform:rotate({rot}deg) scale({scale})">{k}</div>'

def wrule(top, left=68, width=944, op=.45):
    return f'<div style="position:absolute;left:{left}px;top:{top}px;width:{width}px;height:2px;background:#fff;opacity:{op}"></div>'

def wlabel(top, html, size=32, left=68, ls=".08em", weight=700, color="#fff", extra=""):
    return f'<div style="position:absolute;left:{left}px;top:{top}px;font-weight:{weight};font-size:{size}px;line-height:1.24;letter-spacing:{ls};text-transform:uppercase;color:{color};{extra}">{html}</div>'

def info_stack(top, left=68, size=32):
    """the reference's left stack, in campaign type"""
    return f"""{wrule(top, left, 110, .7)}
    {wlabel(top+26, "Thursday", size+6, left, ".42em")}
    <div class="big y" style="position:absolute;left:{left-8}px;top:{top+72}px;font-size:230px">29</div>
    {wlabel(top+282, "October", size+12, left, ".1em", 800)}
    {wlabel(top+352, "Your phone comes in<br>Its apps don’t<br>No photos · No feed", size, left, color="var(--ice)")}
    {wrule(top+490, left, 110, .7)}
    {wlabel(top+512, "Guestlist and invite only", size, left)}
    {wrule(top+568, left, 110, .7)}
    {wlabel(top+590, "Door policy applies", size, left)}
    {wrule(top+646, left, 110, .7)}
    {wlabel(top+668, "Venue: sent to the list", size, left)}"""

def topbar(top=62):
    return f"""<div style="position:absolute;left:68px;right:68px;top:{top}px;display:flex;justify-content:space-between;align-items:center">{logos(34, 26, 16, 56)}<span class="meta" style="font-size:20px">Present</span></div>
    {wrule(top+84)}"""

def bottombar(top):
    return f"""{wrule(top)}
    {wlabel(top+26, "+18 · Drink responsibly", 24, ls=".14em", color="rgba(255,255,255,.75)")}
    {wlabel(top+26, "Tap in at the door", 24, left=0, ls=".14em", color="var(--yellow)").replace("left:0px", "right:68px")}"""

# ---------------------------------------------------------------- INVITE ONLY, campaign look (3 versions)
def invite_grid():
    W, H = 1080, 1920
    b = f"""{grid(W, H, 2, 3, on=(), dim=0.55)}
    {topbar()}
    {diff("INVITE", 52, 196, 268)}
    {diff("ONLY<span style='color:#fcce21'>.</span>", 52, 430, 268)}
    {info_stack(760)}
    {card(520, 1470, -9, 0.82)}
    {bottombar(1790)}"""
    return W, H, page(W, H, b)

def invite_key():
    W, H = 1080, 1920
    b = f"""<div class="big outline" style="position:absolute;left:-40px;top:900px;font-size:430px">KEY</div>
    {topbar()}
    <div class="big" style="position:absolute;left:52px;top:196px;font-size:268px">INVITE</div>
    <div class="big" style="position:absolute;left:52px;top:430px;font-size:268px">ONLY<span class="y">.</span></div>
    {info_stack(760)}
    {rings(770, 1600, [170, 250, 330], 0.35)}
    {card(530, 1450, -10, 0.9)}
    {bottombar(1790)}"""
    return W, H, page(W, H, b)

def invite_crowd():
    W, H = 1080, 1920
    b = f"""<img src="assets/stills/bg_crowd.jpg" style="position:absolute;left:0;top:0;width:{W}px;height:{H}px;object-fit:cover;object-position:62% 50%;filter:grayscale(1) contrast(1.25) brightness(1.1)">
    <div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:multiply"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,31,.85) 0%,rgba(5,7,31,.45) 55%,rgba(5,7,31,.1) 100%)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,31,.5) 0%,rgba(5,7,31,0) 25%,rgba(5,7,31,0) 70%,rgba(5,7,31,.85) 100%)"></div>
    {topbar()}
    <div class="big" style="position:absolute;left:52px;top:196px;font-size:268px">INVITE</div>
    <div class="big" style="position:absolute;left:52px;top:430px;font-size:268px">ONLY<span class="y">.</span></div>
    {info_stack(760)}
    <div style="position:absolute;left:720px;top:1040px;text-align:center">{padlock(150, True)}<div class="meta y" style="margin-top:22px;font-size:22px;font-weight:800">Unlock<br>the party</div></div>
    {bottombar(1790)}"""
    return W, H, page(W, H, b)

# ---------------------------------------------------------------- UNLOCK THE PARTY posts (5)
def post_passcode():
    W, H = 1080, 1350
    keys = [("1", ""), ("2", "ABC"), ("3", "DEF"), ("4", "GHI"), ("5", "JKL"), ("6", "MNO"), ("7", "PQRS"), ("8", "TUV"), ("9", "WXYZ"), ("", ""), ("0", ""), ("", "")]
    hit = {"2", "9", "1", "0"}
    pad = []
    for i, (n, l) in enumerate(keys):
        if not n:
            pad.append('<div></div>'); continue
        on = n in hit
        st = "background:#fcce21;color:#05071f;box-shadow:0 0 50px rgba(252,206,33,.6)" if on else "background:rgba(255,255,255,.12);color:#fff"
        pad.append(f'<div style="width:150px;height:150px;border-radius:50%;{st};display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-weight:500;font-size:62px;line-height:1">{n}</span><span style="font-weight:700;font-size:15px;letter-spacing:.2em;opacity:.8">{l}</span></div>')
    b = f"""<div class="meta" style="position:absolute;left:0;right:0;top:70px;text-align:center;font-size:22px;color:var(--ice)">Enter passcode</div>
    <div style="position:absolute;left:0;right:0;top:120px;display:flex;justify-content:center;gap:34px">{''.join('<i style="width:30px;height:30px;border-radius:50%;background:#fcce21;display:block"></i>' for _ in range(4))}</div>
    <div class="big" style="position:absolute;left:0;right:0;top:196px;text-align:center;font-size:100px">THE CODE IS <span class="y">29.10</span></div>
    <div style="position:absolute;left:180px;top:370px;display:grid;grid-template-columns:repeat(3,150px);gap:36px 90px">{''.join(pad)}</div>
    <div class="big y" style="position:absolute;left:0;right:0;top:1170px;text-align:center;font-size:92px">UNLOCK THE PARTY.</div>
    <div class="foot" style="top:1296px;font-size:16px"><span>Loomlock × Don Julio · Invite only</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

def post_slide():
    W, H = 1080, 1350
    phone = f"""<div style="position:absolute;left:290px;top:270px;width:500px;height:1000px;border-radius:72px;border:6px solid rgba(255,255,255,.92);background:#03041a;box-shadow:0 60px 120px rgba(0,0,0,.7),0 0 90px rgba(29,41,194,.45)">
      <div style="position:absolute;inset:14px;border-radius:58px;overflow:hidden">
        <img src="assets/stills/bg_crowd.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2)">
        <div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:multiply"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,31,.55),rgba(5,7,31,.1) 40%,rgba(5,7,31,.75))"></div>
        <div style="position:absolute;left:50%;top:22px;width:110px;height:30px;margin-left:-55px;border-radius:15px;background:#000"></div>
        <div style="position:absolute;left:0;right:0;top:110px;text-align:center;font-weight:600;font-size:22px">Thursday, 29 October</div>
        <div style="position:absolute;left:0;right:0;top:140px;text-align:center;font-weight:500;font-size:140px;letter-spacing:-.04em;line-height:1">23:00</div>
        <div style="position:absolute;left:0;right:0;top:420px;display:flex;justify-content:center">{padlock(90, True)}</div>
        <div style="position:absolute;left:26px;right:26px;bottom:70px;height:110px;border-radius:55px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);display:flex;align-items:center;padding:0 10px">
          <div style="width:90px;height:90px;border-radius:50%;background:#fcce21;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:44px;color:#05071f">→</div>
          <div style="flex:1;text-align:center;font-weight:700;font-size:21px;letter-spacing:.04em;white-space:nowrap;background:linear-gradient(90deg,rgba(255,255,255,.5),#fff,rgba(255,255,255,.5));-webkit-background-clip:text;color:transparent">slide to unlock the party</div>
        </div>
      </div>
    </div>"""
    b = f"""<div class="big" style="position:absolute;left:64px;top:84px;font-size:88px;line-height:.9">SLIDE TO<br><span class="y">UNLOCK THE PARTY.</span></div>
    {phone}
    <div class="foot" style="top:1296px;font-size:16px"><span>Loomlock × Don Julio · 29.10</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

def post_split():
    W, H = 1080, 1350
    b = f"""<div style="position:absolute;left:0;top:0;width:{W}px;height:660px;background:radial-gradient(80% 90% at 50% 40%,#0d1150,#03041a)"></div>
    <div style="position:absolute;left:0;top:665px;width:{W}px;height:685px;overflow:hidden">{grid(W, 685, 3, 2, on=(1, 3), dim=0)}</div>
    <div style="position:absolute;left:0;top:656px;width:{W}px;height:10px;background:#fcce21"></div>
    <div style="position:absolute;left:64px;top:150px">{padlock(120, False, "#ffffff", "#03041a")}</div>
    <div class="big" style="position:absolute;left:220px;top:160px;font-size:128px;line-height:.86;white-space:nowrap">LOCK YOUR<br>PHONE.</div>
    <div class="meta" style="position:absolute;left:226px;top:420px;font-size:22px;color:var(--ice)">At the door · one tap</div>
    {diff("UNLOCK THE", 64, 800, 130, "white-space:nowrap")}
    {diff("PARTY.", 64, 920, 130, "color:#fcce21;mix-blend-mode:normal;text-shadow:0 10px 40px rgba(0,0,0,.6)")}
    <div style="position:absolute;left:640px;top:925px">{padlock(96, True)}</div>
    <div class="foot" style="top:1296px;font-size:16px;color:#fff"><span>Loomlock × Don Julio · 29.10</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

def post_keyunlock():
    W, H = 1080, 1350
    b = f"""<div class="big outline" style="position:absolute;left:-30px;top:430px;font-size:330px;-webkit-text-stroke:2px rgba(192,200,255,.12)">UNLOCK</div>
    <div class="big" style="position:absolute;left:64px;top:96px;font-size:118px">YOUR KEY<br>TO THE <span class="y">PARTY.</span></div>
    {rings(560, 720, [300, 420, 540], 0.3)}
    {card_custom(300, 560, -10, 1.55, "Unlock", "The party · 29.10")}
    <div style="position:absolute;left:64px;top:1070px;font-weight:700;font-size:46px;line-height:1.15">One tap locks your phone.<br><span class="y">The night opens.</span></div>
    <div class="foot" style="top:1262px;font-size:17px"><span>Invite only · Tap in at the door</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

def post_gridunlock():
    W, H = 1080, 1350
    b = f"""{grid(W, H, 2, 3, on=(3,), dim=0.1)}
    <div style="position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center">{padlock(150, True)}</div>
    {diff("UNLOCK", 0, 500, 206, "left:0;right:0;text-align:center")}
    {diff("THE PARTY.", 0, 720, 156, "left:0;right:0;text-align:center;color:#fcce21;mix-blend-mode:normal;text-shadow:0 10px 40px rgba(0,0,0,.6)")}
    <div class="meta" style="position:absolute;left:0;right:0;top:920px;text-align:center;font-size:24px">29.10 · Invite only</div>
    <div class="foot" style="top:1296px;font-size:16px;color:#fff"><span>Loomlock × Don Julio</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

PIECES.update({
    "invite-only-v2-grid": invite_grid, "invite-only-v3-key": invite_key, "invite-only-v4-crowd": invite_crowd,
    "post-6-passcode": post_passcode, "post-7-slide-to-unlock": post_slide, "post-8-lock-unlock": post_split,
    "post-9-key-unlock": post_keyunlock, "post-10-grid-unlock": post_gridunlock,
})

# ================================================================ ROUND 4 — five different directions
KEYG = '<svg viewBox="0 0 100 100" style="width:{s}px;height:{s}px"><g transform="rotate(-35 50 50)"><path d="M8 50A20 20 0 1 1 48 50A20 20 0 1 1 8 50ZM17 50A7 7 0 1 0 31 50A7 7 0 1 0 17 50ZM44 44H90V56H44ZM70 56H78V68H70ZM82 56H90V72H82Z" fill="{c}"/></g></svg>'

def plain(w, h, body, bg, extra_css=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="assets/brand.css">
<style>html,body{{width:{w}px;height:{h}px}} .art{{width:{w}px;height:{h}px;background:{bg}}} {extra_css}</style></head>
<body><div class="art">{body}<div class="grain" style="opacity:.14"></div></div></body></html>"""

# ---- D1 BLACKOUT
def d1_flyer():
    W, H = 1080, 1920
    b = f"""<div class="meta" style="position:absolute;left:0;right:0;top:110px;text-align:center;font-size:20px;color:rgba(255,255,255,.75)">Loomlock × Don Julio</div>
    <div style="position:absolute;left:0;right:0;top:470px;display:flex;justify-content:center">{KEYG.format(s=90, c="#fcce21")}</div>
    <div style="position:absolute;left:330px;top:600px;width:420px;height:560px;overflow:hidden;outline:2px solid #fcce21;outline-offset:14px">
      <img src="assets/stills/bg_crowd.jpg" style="width:100%;height:100%;object-fit:cover;object-position:60% 55%;filter:grayscale(1) contrast(1.4) brightness(.9)"></div>
    <div class="meta" style="position:absolute;left:0;right:0;top:1250px;text-align:center;font-size:30px;font-weight:800;letter-spacing:.5em">Unlock the party</div>
    <div class="meta" style="position:absolute;left:0;right:0;top:1310px;text-align:center;font-size:18px;color:rgba(255,255,255,.55);letter-spacing:.4em">Your phone stays at the door</div>
    <div style="position:absolute;left:96px;right:96px;top:1640px;display:flex;justify-content:space-between;align-items:flex-end;font-weight:600;font-size:18px;letter-spacing:.3em;text-transform:uppercase;line-height:1.9;color:rgba(255,255,255,.8)">
      <div>Thursday<br><span style="color:#fcce21">29.10</span></div><div style="text-align:center">Invite only<br>Venue sent to the list</div><div style="text-align:right">+18<br>Drink responsibly</div></div>"""
    return W, H, plain(W, H, b, "#000")

def d1_post():
    W, H = 1080, 1350
    b = f"""<div style="position:absolute;left:0;right:0;top:470px;display:flex;justify-content:center">{padlock(110, True)}</div>
    <div class="meta" style="position:absolute;left:0;right:0;top:700px;text-align:center;font-size:28px;font-weight:800;letter-spacing:.48em">Unlock the party</div>
    <div class="meta" style="position:absolute;left:0;right:0;top:760px;text-align:center;font-size:17px;color:rgba(255,255,255,.55);letter-spacing:.4em">29.10 · Invite only</div>
    <div class="meta" style="position:absolute;left:0;right:0;top:1250px;text-align:center;font-size:15px;color:rgba(255,255,255,.45)">Loomlock × Don Julio · +18</div>"""
    return W, H, plain(W, H, b, "#000")

# ---- D2 SCREEN TIME
def st_card(left, top, w):
    bars = [6, 4, 8, 5, 7, 9, 0]
    days = ["M", "T", "W", "T", "F", "S", "T"]
    bh = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div style="width:58px;height:{max(b*22,6)}px;border-radius:8px;background:{"#fcce21" if b == 0 else "rgba(255,255,255,.35)"}"></div><span style="font-weight:700;font-size:20px;color:{"#fcce21" if i == 6 else "rgba(255,255,255,.6)"}">{d}</span></div>' for i, (b, d) in enumerate(zip(bars, days)))
    rows = [("Dancing", "5h 12m", "#fcce21", 1.0), ("Talking", "3h 40m", "#9fd8ff", 0.72), ("Laughing", "2h 05m", "#ff97d5", 0.44), ("Social media", "0m · locked", "#6e6f75", 0.02)]
    rr = "".join(f'<div style="display:flex;align-items:center;gap:22px;padding:16px 0;border-top:1px solid rgba(255,255,255,.15)"><i style="width:44px;height:44px;border-radius:12px;background:{c};display:block"></i><div style="flex:1"><div style="font-weight:700;font-size:28px">{n}</div><div style="margin-top:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.12)"><div style="width:{f*100:.0f}%;height:8px;border-radius:4px;background:{c}"></div></div></div><div style="font-weight:600;font-size:26px;color:rgba(255,255,255,.8)">{v}</div></div>' for n, v, c, f in rows)
    return f"""<div style="position:absolute;left:{left}px;top:{top}px;width:{w}px;border-radius:44px;background:rgba(20,24,70,.72);border:1px solid rgba(255,255,255,.18);padding:44px 48px;box-shadow:0 40px 90px rgba(0,0,0,.5)">
      <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:22px;letter-spacing:.14em;color:rgba(255,255,255,.7)"><span>SCREEN TIME</span><span>THU 29.10</span></div>
      <div style="margin-top:18px;font-weight:800;font-size:150px;letter-spacing:-.05em;line-height:1">0h <span style="color:#fcce21">00m</span></div>
      <div style="font-weight:600;font-size:24px;color:rgba(255,255,255,.65)">100% less than your daily average</div>
      <div style="margin-top:34px;height:240px;display:flex;align-items:flex-end;justify-content:space-between">{bh}</div>
      <div style="margin-top:28px;font-weight:700;font-size:20px;letter-spacing:.14em;color:rgba(255,255,255,.6)">MOST USED</div>
      {rr}
    </div>"""

def d2_flyer():
    W, H = 1080, 1920
    b = f"""<img src="assets/stills/bg_crowd.jpg" style="position:absolute;inset:0;width:{W}px;height:{H}px;object-fit:cover;filter:grayscale(1) blur(14px) brightness(.9)">
    <div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:multiply"></div><div style="position:absolute;inset:0;background:rgba(5,7,31,.35)"></div>
    <div class="big" style="position:absolute;left:68px;top:110px;font-size:120px;line-height:.9">YOUR BEST<br>SCREEN TIME<br><span class="y">YET.</span></div>
    {st_card(68, 520, 944)}
    <div style="position:absolute;left:68px;right:68px;top:1720px;display:flex;justify-content:space-between;align-items:center">{logos(32, 24, 14, 52)}<span class="meta" style="font-size:18px">Invite only · +18</span></div>"""
    return W, H, plain(W, H, b, "#05071f")

def d2_post():
    W, H = 1080, 1350
    notes = [("SCREEN TIME", "Weekly report", "Your screen time was down 100% on Thursday."), ("LOOMLOCK", "now", "Party unlocked. Your apps are resting until 04:00."), ("SCREEN TIME", "04:01", "Welcome back. You missed nothing online.")]
    nn = "".join(f'<div style="margin-top:22px;border-radius:34px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22);padding:26px 30px"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:20px;letter-spacing:.12em;color:rgba(255,255,255,.75)"><span>{a}</span><span style="letter-spacing:0">{b}</span></div><div style="margin-top:10px;font-weight:700;font-size:32px;line-height:1.22">{c}</div></div>' for a, b, c in notes)
    b = f"""<img src="assets/stills/bg_crowd.jpg" style="position:absolute;inset:0;width:{W}px;height:{H}px;object-fit:cover;filter:grayscale(1) blur(12px)">
    <div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:multiply"></div><div style="position:absolute;inset:0;background:rgba(5,7,31,.3)"></div>
    <div style="position:absolute;left:0;right:0;top:110px;text-align:center;font-weight:600;font-size:26px">Thursday, 29 October</div>
    <div style="position:absolute;left:0;right:0;top:140px;text-align:center;font-weight:500;font-size:190px;letter-spacing:-.04em;line-height:1">0h 00m</div>
    <div style="position:absolute;left:80px;right:80px;top:420px">{nn}</div>
    <div class="foot" style="top:1290px;font-size:16px;color:#fff"><span>Loomlock × Don Julio</span><span>+18</span></div>"""
    return W, H, plain(W, H, b, "#05071f")

# ---- D3 ACCESS PASS
def badge(left, top, scale=1.0, rot=0):
    strap = "".join('<span style="margin:0 22px">LOOMLOCK × DON JULIO</span>' for _ in range(6))
    return f"""<div style="position:absolute;left:{left}px;top:{top}px;transform:rotate({rot}deg) scale({scale});transform-origin:50% 0">
      <div style="position:absolute;left:225px;top:-700px;width:110px;height:760px;background:#fcce21;overflow:hidden;display:flex;align-items:center;justify-content:center"><div style="transform:rotate(90deg);white-space:nowrap;font-weight:900;font-size:30px;letter-spacing:.12em;color:#05071f">{strap}</div></div>
      <div style="position:absolute;left:250px;top:40px;width:60px;height:70px;border-radius:12px;background:linear-gradient(#e8ebf5,#8a90b0)"></div>
      <div style="position:relative;top:96px;width:560px;height:820px;border-radius:40px;background:linear-gradient(160deg,#2b34c9,#121b95 60%,#070d66);box-shadow:0 50px 100px rgba(0,0,0,.6),inset 0 0 0 3px rgba(252,238,33,.55);overflow:hidden">
        <div style="position:absolute;left:230px;top:30px;width:100px;height:22px;border-radius:11px;background:#05071f"></div>
        <img src="assets/img/loomlock_white.png" style="position:absolute;left:48px;top:90px;height:46px">
        <div class="cond" style="position:absolute;left:44px;top:180px;font-size:170px;color:#fff">ALL</div>
        <div class="cond" style="position:absolute;left:44px;top:322px;font-size:150px;color:#fff">ACCESS</div>
        <div style="position:absolute;left:48px;top:500px;font-weight:800;font-size:30px;letter-spacing:.16em;color:#fcce21">EXCEPT YOUR APPS</div>
        <div style="position:absolute;left:48px;right:48px;top:570px;height:2px;background:rgba(255,255,255,.4)"></div>
        <div style="position:absolute;left:48px;top:600px;font-weight:700;font-size:24px;letter-spacing:.14em;line-height:1.6">THU · 29.10<br>INVITE ONLY</div>
        <div style="position:absolute;right:44px;top:590px;color:#fcce21">{KEYG.format(s=150, c="#fcce21")}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:90px;background:#fcce21;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px;letter-spacing:.3em;color:#05071f">UNLOCK THE PARTY</div>
      </div></div>"""

def d3_flyer():
    W, H = 1080, 1920
    b = f"""<img src="assets/stills/bg_crowd.jpg" style="position:absolute;inset:0;width:{W}px;height:{H}px;object-fit:cover;filter:grayscale(1) contrast(1.2) brightness(.55)">
    <div style="position:absolute;inset:0;background:#1d29c2;mix-blend-mode:multiply;opacity:.8"></div>
    {badge(260, 240, 1.22, -3)}
    <div class="meta" style="position:absolute;left:68px;top:1640px;font-size:22px">Lanyard at the door · Phone locked till 04:00</div>
    <div style="position:absolute;left:68px;right:68px;top:1720px;display:flex;justify-content:space-between;align-items:center">{logos(32, 24, 14, 52)}<span class="meta" style="font-size:18px">+18 · Drink responsibly</span></div>"""
    return W, H, plain(W, H, b, "#05071f")

def d3_post():
    W, H = 1080, 1350
    band = " · ".join(["UNLOCK THE PARTY", "29.10", "INVITE ONLY"] * 4)
    b = f"""<div style="position:absolute;left:-200px;top:520px;width:1480px;height:230px;background:#fcce21;transform:rotate(-12deg);box-shadow:0 30px 60px rgba(0,0,0,.5);display:flex;align-items:center;overflow:hidden">
      <div style="white-space:nowrap;font-weight:900;font-size:62px;letter-spacing:.04em;color:#05071f">{band}</div></div>
    <div style="position:absolute;left:-200px;top:540px;width:1480px;height:12px;background:rgba(5,7,31,.18);transform:rotate(-12deg)"></div>
    {card(560, 820, 8, 0.9)}
    <div class="big" style="position:absolute;left:64px;top:96px;font-size:110px">WEAR THE<br><span class="y">WRISTBAND.</span><br>LOCK THE PHONE.</div>
    <div class="foot" style="top:1290px;font-size:16px"><span>Loomlock × Don Julio</span><span>+18</span></div>"""
    return W, H, page(W, H, b)

# ---- D4 FLASH
def print_photo(src, left, top, w, h, rot, pos="50% 50%", cap=""):
    return f"""<div style="position:absolute;left:{left}px;top:{top}px;width:{w+36}px;padding:18px 18px 70px;background:#f3f2ec;transform:rotate({rot}deg);box-shadow:0 30px 60px rgba(0,0,0,.55)">
      <div style="width:{w}px;height:{h}px;overflow:hidden"><img src="{src}" style="width:100%;height:100%;object-fit:cover;object-position:{pos};filter:contrast(1.35) saturate(1.35) brightness(1.15)"></div>
      <div style="position:absolute;left:22px;bottom:18px;font-weight:700;font-size:24px;letter-spacing:.04em;color:#14163a">{cap}</div>
      <div style="position:absolute;left:{w/2-60:.0f}px;top:-18px;width:140px;height:40px;background:rgba(252,206,33,.85);transform:rotate(-4deg)"></div></div>"""

def d4_flyer():
    W, H = 1080, 1920
    b = f"""<div style="position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 45%,#2a1508,#0a0604 70%)"></div>
    {print_photo("assets/stills/face.jpg", 110, 360, 520, 600, -6, "50% 40%", "29.10 · 23:41")}
    {print_photo("assets/stills/warm.jpg", 520, 620, 420, 500, 7, "50% 50%", "don’t post this")}
    {print_photo("assets/stills/lights.jpg", 160, 1060, 460, 380, 3, "50% 30%", "you had to be there")}
    <div class="big" style="position:absolute;left:68px;top:110px;font-size:96px;line-height:.92">THE ONLY PHOTOS<br><span class="y">YOU’LL GET.</span></div>
    <div style="position:absolute;left:68px;top:1600px;font-weight:700;font-size:34px;line-height:1.3">Phones lock at the door.<br><span class="y">Unlock the party.</span></div>
    <div style="position:absolute;left:68px;right:68px;top:1760px;display:flex;justify-content:space-between;align-items:center">{logos(30, 22, 14, 48)}<span class="meta" style="font-size:18px">Thu 29.10 · Invite only · +18</span></div>"""
    return W, H, plain(W, H, b, "#0a0604")

def d4_post():
    W, H = 1080, 1350
    b = f"""<div style="position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 45%,#2a1508,#0a0604 70%)"></div>
    {print_photo("assets/stills/face.jpg", 170, 170, 700, 760, -3, "50% 40%", "the only photo of the night")}
    <div style="position:absolute;left:68px;top:1110px;font-weight:800;font-size:54px;line-height:1.1">No photos after this one.<br><span class="y">Unlock the party · 29.10</span></div>
    <div class="foot" style="top:1290px;font-size:16px"><span>Loomlock × Don Julio</span><span>+18</span></div>"""
    return W, H, plain(W, H, b, "#0a0604")

# ---- D5 YELLOW POSTER
def d5_flyer():
    W, H = 1080, 1920
    N = "#121b95"
    b = f"""<div style="position:absolute;left:64px;right:64px;top:70px;display:flex;justify-content:space-between;font-weight:800;font-size:22px;letter-spacing:.24em;color:{N}"><span>LOOMLOCK × DON JULIO</span><span>29.10</span></div>
    <div style="position:absolute;left:64px;right:64px;top:118px;height:4px;background:{N}"></div>
    <div class="big" style="position:absolute;left:52px;top:170px;font-size:330px;color:{N};line-height:.84">UN<br>LOCK</div>
    <div class="big" style="position:absolute;left:52px;top:740px;font-size:250px;color:#fff;-webkit-text-stroke:0;line-height:.84;text-shadow:none">THE</div>
    <div class="big" style="position:absolute;left:52px;top:960px;font-size:262px;color:{N};line-height:.84">PARTY.</div>
    <div style="position:absolute;left:770px;top:720px;color:{N}">{KEYG.format(s=190, c=N)}</div>
    <div style="position:absolute;left:64px;right:64px;top:1260px;height:4px;background:{N}"></div>
    <div style="position:absolute;left:64px;top:1300px;display:grid;grid-template-columns:1fr 1fr;gap:40px 60px;width:952px;font-weight:700;font-size:28px;letter-spacing:.06em;line-height:1.3;color:{N};text-transform:uppercase">
      <div><b style="font-weight:900">01</b><br>Your phone comes in. Its apps don’t.</div><div><b style="font-weight:900">02</b><br>One tap at the door locks it till 04:00.</div>
      <div><b style="font-weight:900">03</b><br>No photos. No feed. No proof.</div><div><b style="font-weight:900">04</b><br>Thursday 29.10. Invite only.</div></div>
    <div style="position:absolute;left:64px;right:64px;top:1740px;height:4px;background:{N}"></div>
    <div style="position:absolute;left:64px;right:64px;top:1770px;display:flex;justify-content:space-between;font-weight:800;font-size:20px;letter-spacing:.2em;color:{N}"><span>VENUE SENT TO THE LIST</span><span>+18 · DRINK RESPONSIBLY</span></div>"""
    return W, H, plain(W, H, b, "#fcce21", ".grain{mix-blend-mode:multiply;opacity:.08!important}")

def d5_post():
    W, H = 1080, 1350
    N = "#121b95"
    b = f"""<div class="big" style="position:absolute;left:52px;top:90px;font-size:250px;color:{N};line-height:.84">LOCK<br><span style="color:#fff">THE</span><br>PHONE.</div>
    <div style="position:absolute;left:64px;right:64px;top:750px;height:4px;background:{N}"></div>
    <div class="big" style="position:absolute;left:52px;top:800px;font-size:178px;color:{N};line-height:.84">UNLOCK<br>THE PARTY.</div>
    <div style="position:absolute;left:64px;right:64px;top:1270px;display:flex;justify-content:space-between;font-weight:800;font-size:20px;letter-spacing:.2em;color:{N}"><span>LOOMLOCK × DON JULIO · 29.10</span><span>+18</span></div>"""
    return W, H, plain(W, H, b, "#fcce21", ".grain{mix-blend-mode:multiply;opacity:.08!important}")

PIECES.update({
    "d1-blackout-flyer": d1_flyer, "d1-blackout-post": d1_post,
    "d2-screentime-flyer": d2_flyer, "d2-screentime-post": d2_post,
    "d3-pass-flyer": d3_flyer, "d3-pass-post": d3_post,
    "d4-flash-flyer": d4_flyer, "d4-flash-post": d4_post,
    "d5-yellow-flyer": d5_flyer, "d5-yellow-post": d5_post,
})

def export(name, scale=1):
    W, H, html = PIECES[name]()
    f = ROOT / f"{name}.html"
    f.write_text(html)
    out = ROOT / "out" / f"{name}{'@2x' if scale == 2 else ''}.png"
    pad = 200  # very wide windows lose some viewport height in headless Chrome: render taller, crop back
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars", "--disable-gpu", f"--force-device-scale-factor={scale}",
                    f"--window-size={W},{H + pad}", "--virtual-time-budget=3000", f"--screenshot={out}", f.as_uri()],
                   check=True, capture_output=True)
    from PIL import Image
    Image.open(out).crop((0, 0, W * scale, H * scale)).save(out)
    return out

if __name__ == "__main__":
    names = sys.argv[1:] or list(PIECES)
    for n in names:
        print(export(n))
