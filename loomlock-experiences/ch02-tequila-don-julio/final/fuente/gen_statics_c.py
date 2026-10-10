"""CH 02 · 'compañero' line — static pieces (4:5 feed + 9:16 story) built from the same scene kit as the reels."""
import pathlib, shutil, subprocess, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_reels_c import (CSS, LEGAL, COORD, CAMP, SP, CHROME, POCKET, k_grid, k_assemble, k_stack, k_strike,
                         k_feed, k_bignum, k_invite, invite_foot)

OUT = pathlib.Path(__file__).parent / "c-statics"

def page(W, H, a, b, scene, foot="", crt=None, extra=""):
    CX, CY, CW, CH = crt
    html = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>{CSS}
html,body{{width:{W}px;height:{H}px}} .lay{{opacity:1 !important}}</style></head><body>
<div id="root" style="width:{W}px;height:{H}px">
<div class="rays"></div><div class="vig"></div>
<div class="tick" style="left:-180px">{"LIVE NOW, POST LATER · CH 02 · BOGOTÁ · " * 4}</div>
<div class="hud" style="left:60px;right:60px;top:84px"><div class="l"><span class="dot"></span><span class="b" style="font-family:Montserrat;font-size:20px">LIVE</span><span>CH 02</span></div><span>{COORD}</span></div>
<div class="hl" style="top:{CY-200}px"><span class="{a[1]}" style="font-size:{a[2]}px">{a[0]}</span><span class="{b[1]}" style="font-size:{b[2]}px">{b[0]}</span></div>
<div class="br" style="left:{CX-28}px;top:{CY-34}px;border-left-width:3px;border-top-width:3px"></div>
<div class="br" style="right:{W-CX-CW-28}px;top:{CY-34}px;border-right-width:3px;border-top-width:3px"></div>
<div class="br" style="left:{CX-28}px;top:{CY+CH}px;border-left-width:3px;border-bottom-width:3px"></div>
<div class="br" style="right:{W-CX-CW-28}px;top:{CY+CH}px;border-right-width:3px;border-bottom-width:3px"></div>
<div class="crt" style="left:{CX}px;top:{CY}px;width:{CW}px;height:{CH}px"><div class="scr"><div class="lay">{scene[0]}</div></div><div class="scan"></div><div class="glass"></div></div>
{f'<div class="sub" style="top:{CY+CH+48}px;font-size:28px">{foot}</div>' if foot else ""}
{extra}
<div class="legal" style="top:{H-62}px;font-size:13px">{LEGAL}</div>
<img class="grain" src="assets/img/grain0.png" style="opacity:.16" alt="">
</div></body></html>'''
    return html

def shot(name, W, H, html):
    f = OUT / f"{name}.html"
    f.write_text(html)
    png = OUT / f"{name}.png"
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--hide-scrollbars", "--disable-gpu", "--force-device-scale-factor=1",
                    f"--window-size={W},{H + 200}", "--virtual-time-budget=4000", f"--screenshot={png}", f.as_uri()], check=True, capture_output=True)
    from PIL import Image
    Image.open(png).crop((0, 0, W, H)).convert("RGB").save(OUT / f"{name}.jpg", quality=92)
    png.unlink()
    print("shot", name)

def main():
    (OUT / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (OUT / "assets" / "img").mkdir(exist_ok=True)
    for f in ["montserrat-var", "montserrat-italic-var", "spacemono-400", "spacemono-700"]:
        shutil.copy(CAMP / "fonts" / f"{f}.woff2", OUT / "assets" / "fonts")
    for f in ["dj_white.png", "loomlock_white.png"]:
        shutil.copy(CAMP / "img" / f, OUT / "assets" / "img")
    shutil.copy(SP / "hf7" / "assets" / "img" / "grain0.png", OUT / "assets" / "img")

    W, H = 1080, 1350
    crt = (100, 330, 880, 820)
    w, h = crt[2], crt[3]
    feed = [
        ("cs1-thursday", ("Thursday,", "i", 66), ("7 pm.", "b", 84),
         k_grid("a", [("THURSDAY", "w"), ("19:00", "y"), ("LAPTOP", "o"), ("CLOSED.", "w")], w, h), '<span class="i">Laptop:</span> <span class="b">closed.</span>'),
        ("cs2-neat", ("Tequila,", "i", 66), ("neat.", "b y", 84),
         k_strike("c", ["tequila, with a story", "tequila, with a filter", "tequila, for the feed", "tequila, neat."], 3, w, h, fs=50, logo="dj_white.png"),
         '<span class="i">Thu 29 Oct ·</span> <span class="b">Bogotá</span>'),
        ("cs3-loud", ("Music,", "i", 66), ("loud.", "b", 84), k_stack("d", "LOUD", w, h, rows=7, fs=190, color="focus-y"),
         '<span class="i">Live now,</span> <span class="b y">post later.</span>'),
        ("cs4-feed-off", ("Feed,", "i", 66), ("off.", "b y", 84), k_feed("f", w, h), POCKET.replace("<br>", " ")),
        ("cs5-ch02", ("Loomlock", "b", 80), ("experiences.", "i", 66), k_bignum("a", "01", "02", w, h, "SERIES · GLOBAL"),
         '<span class="i">Same channel,</span> <span class="b">new city.</span>'),
    ]
    for name, a, b, sc, foot in feed:
        shot(name, W, H, page(W, H, a, b, sc, foot, crt))

    # story invite 9:16
    W, H = 1080, 1920
    crt = (80, 430, 920, 1110)
    sc = k_invite("g", [("A party", "i", 80), ("worth", "i", 80), ("remembering.", "b y", 96), ("Not recording.", "i", 46)], 920, 1110)
    shot("cs6-story-invite", W, H, page(W, H, ("You're", "i", 74), ("invited.", "b", 92), sc, "", crt, invite_foot(1580)))

if __name__ == "__main__":
    main()
