"""CH 02 · full-screen type line — feed posts (4:5) + stories (frames of the reels)."""
import pathlib, shutil, subprocess, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_reels_c import CSS, LEGAL, CAMP, SP, HERE, CHROME, lockup
from gen_reels_p import EXTRA, TEXT, KEYS

OUT = HERE / "p-statics"
W, H = 1080, 1350

def corners(c="var(--ink)", sub="rgba(244,242,238,.65)", bl="INVITE<br>ONLY", br="LIVE NOW,<br>POST LATER"):
    return (f'<div class="corner" style="left:56px;top:52px;color:{c}">LOOMLOCK<br>EXPERIENCES</div>'
            f'<div class="corner" style="right:56px;top:52px;text-align:right;color:{c}">CH 02<br>29.10</div>'
            f'<div class="corner" style="left:56px;bottom:96px;color:{sub};font-size:17px">{bl}</div>'
            f'<div class="corner" style="right:56px;bottom:96px;text-align:right;color:{sub};font-size:17px">{br}</div>')

def legal(c="rgba(244,242,238,.7)", bg="rgba(6,6,9,.88)"):
    return f'<div class="legal" style="top:{H-62}px;padding:8px 0;font-size:13px;color:{c};background:{bg};z-index:40">{LEGAL}</div>'

def page(body, bg="var(--bg)", w=W, h=H):
    return f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>{CSS}{EXTRA}
html,body{{width:{w}px;height:{h}px}}</style></head><body>
<div id="root" style="width:{w}px;height:{h}px;background:{bg}">{body}
<div class="crtov"><div class="scanl"></div><div class="vigc"></div></div>
<img class="grain" src="assets/img/grain0.png" style="opacity:.16" alt=""></div></body></html>'''

def shot(name, html, w=W, h=H, url=None):
    if url is None:
        f = OUT / f"{name}.html"; f.write_text(html); url = f.as_uri()
    png = OUT / f"{name}.png"
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars", "--disable-gpu", "--force-device-scale-factor=1",
                    f"--window-size={w},{h + 200}", "--virtual-time-budget=5000", f"--screenshot={png}", url], check=True, capture_output=True)
    from PIL import Image
    Image.open(png).crop((0, 0, w, h)).convert("RGB").save(OUT / f"{name}.jpg", quality=92)
    png.unlink(); print("shot", name)

def s1_redacted():
    words = TEXT.split(" ")[:-11]  # stop before the 'Channel 02 ...' tail
    out = ""
    seen_you = False
    for i, w in enumerate(words):
        k = w in KEYS
        if w == "you.":
            k = not seen_you; seen_you = True
        if w == "phone" and words[i + 1] != "stays": k = False
        if w == "apps" and words[i - 1] != "The": k = False
        if w == "night" and words[i - 1] != "the": k = False
        if w == "off." and words[i - 1] != "night": k = False
        if w == "post" and words[i - 1] != "now,": k = False
        if k:
            out += f'<span class="wd" style="color:#0B0B0B"><span class="hb" style="background:var(--yel)"></span>{w}</span> '
        else:
            out += f'<span class="wd"><span class="rb" style="transform:none"></span>{w}</span> '
    body = (f'<div class="ab" style="inset:0;background:#E7E5E0"></div>'
            f'<div class="ab" style="left:56px;right:56px;top:165px;font-size:44px;line-height:1.36;font-weight:500;color:#141414">{out}</div>'
            + corners("#141414", "#141414", "REDACTED BY<br>LOOMLOCK", "INVITE<br>ONLY") + legal("rgba(20,20,20,.75)", "rgba(231,229,224,.92)"))
    shot("ps1-redacted", page(body, "#E7E5E0"))

def s2_columns():
    cols = [("PHONE: IN", "color:var(--ink)"), ("APPS: OFF", "color:var(--yel)"), ("FEED: OFF", "color:var(--bg);-webkit-text-stroke:2.5px var(--ink)"),
            ("TAP IN", "color:#5C68FF"), ("TUNE OUT", "color:var(--ink)")]
    cw = W / 5; html = ""
    for i, (t, st) in enumerate(cols):
        rot = "transform:rotate(180deg);" if i % 2 == 0 else ""
        off = -260 if i % 2 == 0 else -120
        html += (f'<div class="col" style="left:{i*cw:.0f}px;width:{cw:.0f}px"><div class="strip" style="top:{off}px;font-size:230px;{rot}{st}">{" ".join([t]*3)}</div></div>')
    an = ["LOOMLOCK EXPERIENCES · SERIES", "INVITE ONLY · 18+", "70 GUESTS · NO FEED", "ONE RULE · EVERY CITY"]
    for j, a in enumerate(an):
        html += (f'<div class="ab mono" style="left:{cw*(j+1)-18:.0f}px;top:250px;writing-mode:vertical-rl;font-size:20px;letter-spacing:.2em;'
                 f'color:rgba(244,242,238,.8);background:var(--bg);padding:10px 4px">{a}</div>')
    shot("ps2-time-is-form", page(html + corners() + legal()))

def s3_focus():
    rows = 9; fs = 200; rh = fs * .9; f = 4; html = ""
    for i in range(rows):
        d = abs(i - f)
        c = "var(--ink)"
        html += (f'<div class="row" style="top:{H/2 - rh*(f+.5) + i*rh:.0f}px;font-size:{fs}px;line-height:{rh:.0f}px;color:{c};'
                 f'filter:blur({min(14, d*3.4):.1f}px);opacity:{max(.18, 1 - d*.2):.2f}">LOUD</div>')
    html += '<div class="ab" style="left:0;right:0;top:1090px;text-align:center"><span class="i" style="font-size:56px">Music,</span> <span class="b y" style="font-size:56px">loud.</span></div>'
    shot("ps3-focus", page(html + corners() + legal(), "var(--blue)"))

def s4_big02():
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:230px;text-align:center;font-weight:900;font-size:640px;line-height:1;letter-spacing:-.07em;color:var(--yel)">02</div>'
            '<img src="assets/img/grain2.png" alt="" class="ab" style="left:0;top:230px;width:100%;height:640px;mix-blend-mode:overlay;opacity:.35;image-rendering:pixelated">'
            '<div class="ab mono" style="left:56px;top:900px;font-size:24px;letter-spacing:.16em;line-height:1.6">CHANNEL<br>02 / ∞</div>'
            '<div class="ab mono" style="right:56px;top:900px;font-size:24px;letter-spacing:.16em;line-height:1.6;text-align:right">THU 29.10<br>BOGOTÁ · CO</div>'
            '<div class="ab" style="left:0;right:0;top:1060px;text-align:center"><span class="i" style="font-size:60px">One rule,</span> <span class="b" style="font-size:60px">every city.</span></div>')
    shot("ps4-ch02", page(html + corners() + legal(), "var(--blue)"))

def s5_invite():
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:300px;text-align:center"><div class="i" style="font-size:110px;line-height:1.05">Live now,</div>'
            '<div class="b y" style="font-size:130px;line-height:1.05">post later.</div></div>'
            f'<div class="sub" style="top:720px">{lockup(44, 76)}'
            '<div style="margin-top:26px;font-size:34px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá · 18+</span></div>'
            '<div style="margin-top:10px;font-size:40px"><span class="b y">Invite only.</span></div></div>'
            '<div class="sub" style="top:1010px"><div class="mono" style="font-size:20px;letter-spacing:.2em;color:rgba(244,242,238,.75)">CH 02 BOGOTÁ &nbsp;→&nbsp; CH 03 ▮▮▮▮▮▮</div>'
            '<div style="margin-top:12px;font-size:36px"><span class="i">Next city,</span> <span class="b">yours?</span></div></div>')
    shot("ps5-invite", page(html + corners() + legal(), "var(--blue)"))

def s6_next():
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab mono" style="left:0;right:0;top:250px;text-align:center;font-size:24px;letter-spacing:.2em;line-height:2">CH 01 &nbsp;·&nbsp; CH 02 BOGOTÁ &nbsp;·&nbsp; CH 03 ▮▮▮▮▮▮</div>'
            '<div class="ab" style="left:0;right:0;top:400px;text-align:center"><div class="i" style="font-size:100px;line-height:1.05">One rule,</div>'
            '<div class="b" style="font-size:118px;line-height:1.05">every city.</div></div>'
            '<div class="ab" style="left:0;right:0;top:730px;text-align:center"><div class="i" style="font-size:64px">Next city:</div>'
            '<div class="b y" style="font-size:150px;line-height:1">yours?</div></div>')
    shot("ps6-next-city", page(html + corners() + legal(), "var(--blue)"))

def stories():
    for name, reel, t in (("pst1-redacted", "p1-redacted", 12.6), ("pst2-time-is-form", "p2-time-is-form", 11.0), ("pst3-focus", "p3-focus", 13.2)):
        shot(name, None, 1080, 1920, (HERE / reel / "index.html").as_uri() + f"?t={t}")

if __name__ == "__main__":
    (OUT / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (OUT / "assets" / "img").mkdir(exist_ok=True)
    for f in ["montserrat-var", "montserrat-italic-var", "spacemono-400", "spacemono-700"]:
        shutil.copy(CAMP / "fonts" / f"{f}.woff2", OUT / "assets" / "fonts")
    for f in ["dj_white.png", "loomlock_white.png"]:
        shutil.copy(CAMP / "img" / f, OUT / "assets" / "img")
    for f in ["grain0.png", "grain2.png"]:
        shutil.copy(SP / "hf7" / "assets" / "img" / f, OUT / "assets" / "img")
    s1_redacted(); s2_columns(); s3_focus(); s4_big02(); s5_invite(); s6_next(); stories()
