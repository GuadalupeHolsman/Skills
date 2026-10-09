"""CH 02 · invitation flyers aligned to the team's reel: Channel 2 · Invite only (story + post, three looks)."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import gen_statics_p as S
import gen_statics_c as SC
from gen_reels_c import lockup, k_invite, COORD, HERE

RULE = ('<div class="ab" style="left:0;right:0;top:{top}px;background:var(--bg);padding:22px 0;text-align:center;font-weight:900;font-size:{fs}px">'
        'PHONE: <span class="y">IN</span> &nbsp;·&nbsp; APPS: <span class="y">OFF</span> &nbsp;·&nbsp; FEED: <span class="y">OFF</span></div>')

def info(top, lock=(46, 80), fs=36):
    return (f'<div class="sub" style="top:{top}px">{lockup(*lock)}'
            f'<div style="margin-top:24px;font-size:{fs}px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá</span></div>'
            f'<div style="margin-top:8px;font-size:{fs}px"><span class="i">Live now,</span> <span class="b y">post later.</span></div></div>')

def corners():
    return S.corners().replace("CH 02<br>", "CHANNEL 2<br>")

# 1 · giant 2
def big2():
    S.H = 1920
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:170px;text-align:center"><div class="i" style="font-size:130px;line-height:1">Channel</div></div>'
            '<div class="ab" style="left:0;right:0;top:300px;text-align:center;font-weight:900;font-size:860px;line-height:1;letter-spacing:-.06em;color:var(--yel)">2</div>'
            '<img src="assets/img/grain2.png" alt="" class="ab" style="left:0;top:330px;width:100%;height:820px;mix-blend-mode:overlay;opacity:.35;image-rendering:pixelated">'
            '<div class="ab" style="left:0;right:0;top:1150px;text-align:center"><span class="b" style="font-size:120px">Invite</span>&nbsp;<span class="i y" style="font-size:120px">only.</span></div>'
            + RULE.format(top=1330, fs=52) + info(1480))
    S.shot("flyer-ch2-story", S.page(html + corners() + S.legal(), "var(--blue)", 1080, 1920), 1080, 1920)
    S.H = 1350
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:120px;text-align:center"><span class="i" style="font-size:100px">Channel</span></div>'
            '<div class="ab" style="left:0;right:0;top:170px;text-align:center;font-weight:900;font-size:560px;line-height:1;letter-spacing:-.06em;color:var(--yel)">2</div>'
            '<div class="ab" style="left:0;right:0;top:720px;text-align:center"><span class="b" style="font-size:96px">Invite</span>&nbsp;<span class="i y" style="font-size:96px">only.</span></div>'
            + RULE.format(top=860, fs=44) + info(990, (40, 70), 32))
    S.shot("flyer-ch2-post", S.page(html + corners() + S.legal(), "var(--blue)", 1080, 1350), 1080, 1350)

# 2 · the team's TV
FOOT = ('<div class="sub" style="top:1580px">' + lockup(44, 76) +
        '<div style="margin-top:22px;font-size:30px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá</span></div>'
        '<div style="margin-top:6px;font-size:30px"><span class="i">Live now,</span> <span class="b y">post later.</span></div></div>')

def tv():
    SC.OUT = HERE / "p-statics"
    inv = lambda w, h: k_invite("g", [("Channel 2", "i", 84), ("Invite", "b", 160), ("only.", "i y", 140)], w, h)
    fix = lambda h: h.replace(COORD, "INVITE ONLY").replace("<span>CH 02</span>", "<span>CHANNEL 2</span>").replace("CH 02 · BOGOTÁ", "CHANNEL 2 · BOGOTÁ")
    SC.shot("flyer-ch2-tv-story", 1080, 1920, fix(SC.page(1080, 1920, ("loomlock", "b", 80), ("× Don Julio", "i", 70), inv(920, 1110), "", (80, 430, 920, 1110), FOOT)))
    foot = ('<div class="sub" style="top:1205px;font-size:30px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá ·</span> '
            '<span class="i">Live now,</span> <span class="b y">post later.</span></div>')
    SC.shot("flyer-ch2-tv-post", 1080, 1350, fix(SC.page(1080, 1350, ("loomlock", "b", 66), ("× Don Julio", "i", 58), inv(880, 820), "", (100, 330, 880, 820), foot)))

# 3 · redacted
TXT = ("Dear guest, this is not another post for your feed. Channel 2. Thursday, 29 October, 8 pm. Bogotá, Resto Bar Bikinis. "
       "Bring your phone, it stays in your pocket. At the door you tap the key and the apps go quiet until you leave. "
       "Tequila Don Julio, music loud, people in front of you. Invite only. Eighteen and over. "
       "Nothing gets posted tonight. Live now, post later.")
KEEP = ["Channel", "2.", "Thursday,", "29", "October,", "8", "pm.", "Bogotá,", "Resto", "Bar", "Bikinis.", "Invite", "only.", "Live", "now,", "post", "later."]

def para():
    out = ""
    ws = TXT.split(" ")
    for i, w in enumerate(ws):
        if w in KEEP and not (w == "post" and ws[i - 1] != "now,"):
            out += f'<span class="wd" style="color:#0B0B0B"><span class="hb" style="background:var(--yel)"></span>{w}</span> '
        else:
            out += f'<span class="wd"><span class="rb" style="transform:none"></span>{w}</span> '
    return out

def red(name, W, H, top, fs, foot_top):
    S.H = H
    html = (f'<div class="ab" style="inset:0;background:#E7E5E0"></div>'
            f'<div class="ab" style="left:56px;right:56px;top:{top}px;font-size:{fs}px;line-height:1.34;font-weight:700;color:#141414">{para()}</div>'
            f'<div class="ab" style="left:0;right:0;top:{foot_top}px;display:flex;justify-content:center"><div style="background:#0B0B0E;border-radius:999px;padding:18px 34px">{lockup(40, 70)}</div></div>'
            + S.corners("#141414", "#141414", "REDACTED BY<br>LOOMLOCK", "INVITE<br>ONLY").replace("CH 02<br>", "CHANNEL 2<br>")
            + S.legal("rgba(20,20,20,.75)", "rgba(231,229,224,.92)"))
    S.shot(name, S.page(html, "#E7E5E0", W, H), W, H)

if __name__ == "__main__":
    red("flyer-ch2-red-story", 1080, 1920, 230, 62, 1600)
    red("flyer-ch2-red-post", 1080, 1350, 160, 44, 1110)
