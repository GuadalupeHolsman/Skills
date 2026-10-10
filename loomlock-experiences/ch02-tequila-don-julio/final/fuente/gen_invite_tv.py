"""CH 02 · invitation in the team's style (CRT screen, LIVE HUD, two-part lines, blue grid close):
reel i2-pantalla (15.36 s) + flyers (story/feed) with the TV."""
import pathlib, sys, re
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_reels_c import (reel, k_assemble, k_grid, k_feed, k_strike, k_stack, k_bignum, k_invite, lockup, W_, H_, HERE, COORD, CAMP, SP)

FOOT = '''<div class="sub" style="top:1580px">
  {lock}
  <div style="margin-top:22px;font-size:30px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá</span></div>
  <div style="margin-top:6px;font-size:30px"><span class="i">Live now,</span> <span class="b y">post later.</span></div>
  <div style="margin-top:10px;font-size:24px"><span class="i">Next city,</span> <span class="b">yours?</span></div>
</div>'''.replace("{lock}", lockup(44, 76))

POCKET = '<span class="b">Your phone stays</span> <span class="i">in your pocket.</span><br><span class="i">The apps take</span> <span class="b">the night off.</span>'

def build_reel():
    T = [0, 2.4, 4.8, 7.2, 9.6, 12.0, 15.36]
    sc = [
        dict(a=("Channel", "i", 74), b=("2", "b y", 100), kind=k_bignum("a", "1", "2", W_, H_, "INVITE ONLY"),
             foot='<span class="b">loomlock</span> <span class="i">× Don Julio</span>'),
        dict(a=("Music,", "i", 74), b=("loud.", "b", 92), kind=k_stack("d", "LOUD", W_, H_, rows=9, fs=200, color="focus-y")),
        dict(a=("Tequila,", "i", 74), b=("neat.", "b y", 92),
             kind=k_strike("c", ["tequila, for the story", "tequila, for the feed", "tequila, for later", "tequila, neat."], 3, W_, H_, fs=54, logo="dj_white.png")),
        dict(a=("Dance like", "i", 74), b=("nobody's recording.", "b y", 80), kind=k_assemble("e", "NO REC", "● REC — OFF", W_, H_, fs=200, dance=True)),
        dict(a=("Feed,", "i", 74), b=("off.", "b y", 92), kind=k_feed("b", W_, H_), foot=POCKET),
        dict(a=("loomlock", "b", 80), b=("× Don Julio", "i", 70),
             kind=k_invite("f", [("Channel 2", "i", 80), ("Invite", "b", 150), ("only.", "i y", 130)], W_, H_)),
    ]
    for i, s in enumerate(sc):
        s["t0"], s["t1"] = T[i], T[i + 1]
    reel("i2-pantalla", sc, 15.36, "CH 02 · Invitation TV")
    p = HERE / "i2-pantalla" / "index.html"
    t = p.read_text()
    t = t.replace(COORD, "INVITE ONLY").replace("CH 02 · BOGOTÁ", "CHANNEL 2 · BOGOTÁ").replace("<span>CH 02</span>", "<span>CHANNEL 2</span>")
    t = t.replace('>CH<br>LOOMLOCK<br>EXPERIENCES<', '>CHANNEL<br>LOOMLOCK<br>EXPERIENCES<')
    t = t.replace('<div class="legal"', f'<div id="invf" style="opacity:0">{FOOT}</div>\n<div class="legal"', 1)
    t = t.replace('window.__timelines["main"] = tl;', 'tl.fromTo("#invf",{opacity:0},{opacity:1,duration:.4},13.0);\nwindow.__timelines["main"] = tl;', 1)
    p.write_text(t)

def build_flyers():
    import gen_statics_c as SC
    SC.OUT = HERE / "p-statics"
    inv = lambda w, h: k_invite("g", [("A party", "i", 84), ("worth", "i", 84), ("remembering.", "b y", 100), ("Not recording.", "i", 48)], w, h)
    # story
    html = SC.page(1080, 1920, ("You're", "i", 80), ("invited.", "b", 100), inv(920, 1110), "", (80, 430, 920, 1110), FOOT)
    SC.shot("flyer-tv-story", 1080, 1920, html.replace(COORD, "INVITE ONLY"))
    # feed
    foot = ('<div class="sub" style="top:1205px;font-size:30px"><span class="b">Thu 29 Oct</span> <span class="i">· Bogotá · 18+ ·</span> '
            '<span class="b y">Invite only.</span></div>')
    html = SC.page(1080, 1350, ("You're", "i", 66), ("invited.", "b", 84), inv(880, 820), "", (100, 330, 880, 820), foot)
    SC.shot("flyer-tv-post", 1080, 1350, html.replace(COORD, "INVITE ONLY"))

if __name__ == "__main__":
    build_reel()
