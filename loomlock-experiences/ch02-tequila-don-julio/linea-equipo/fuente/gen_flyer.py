"""CH 02 · Tequila Don Julio — invitation flyer, story 9:16 and feed 4:5."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import gen_statics_p as S
from gen_reels_c import lockup

RULE = ('<div class="ab" style="left:0;right:0;top:{top}px;background:var(--bg);padding:22px 0;text-align:center;font-weight:900;font-size:{fs}px;letter-spacing:.01em">'
        'PHONE: <span class="y">IN</span> &nbsp;·&nbsp; APPS: <span class="y">OFF</span> &nbsp;·&nbsp; FEED: <span class="y">OFF</span></div>')

def info(top, big=40):
    return (f'<div class="sub" style="top:{top}px">{lockup(46, 80)}'
            f'<div style="margin-top:24px;font-size:36px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá · 18+</span></div>'
            f'<div style="margin-top:8px;font-size:{big}px"><span class="b y">Invite only.</span></div></div>')

def story():
    W, H = 1080, 1920
    S.H = H
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:190px;text-align:center"><div class="i" style="font-size:120px;line-height:1">You\'re</div>'
            '<div class="b y" style="font-size:210px;line-height:1;font-weight:900">invited.</div></div>'
            '<div class="ab" style="left:0;right:0;top:520px;text-align:center;font-weight:900;font-size:700px;line-height:1;letter-spacing:-.08em;color:var(--yel)">02</div>'
            '<img src="assets/img/grain2.png" alt="" class="ab" style="left:0;top:520px;width:100%;height:700px;mix-blend-mode:overlay;opacity:.35;image-rendering:pixelated">'
            '<div class="ab mono" style="left:64px;top:600px;writing-mode:vertical-rl;transform:rotate(180deg);font-size:22px;letter-spacing:.24em">LOOMLOCK EXPERIENCES · CHANNEL 02</div>'
            '<div class="ab mono" style="right:64px;top:600px;writing-mode:vertical-rl;font-size:22px;letter-spacing:.24em">ONE RULE · EVERY CITY</div>'
            + RULE.format(top=1250, fs=52) + info(1420) +
            '<div class="sub" style="top:1700px"><span class="i" style="font-size:34px">Next city,</span> <span class="b" style="font-size:34px">yours?</span></div>')
    S.shot("flyer-story", S.page(html + S.corners() + S.legal(), "var(--blue)", W, H), W, H)

def feed():
    W, H = 1080, 1350
    S.H = H
    html = ('<div class="ab grid" style="inset:0"></div>'
            '<div class="ab" style="left:0;right:0;top:130px;text-align:center"><span class="i" style="font-size:96px">You\'re</span>&nbsp;&nbsp;<span class="b y" style="font-size:150px;font-weight:900">invited.</span></div>'
            '<div class="ab" style="left:0;right:0;top:300px;text-align:center;font-weight:900;font-size:470px;line-height:1;letter-spacing:-.08em;color:var(--yel)">02</div>'
            + RULE.format(top=790, fs=44) + info(930, 36))
    S.shot("flyer-feed", S.page(html + S.corners() + S.legal(), "var(--blue)", W, H), W, H)

if __name__ == "__main__":
    story(); feed()
