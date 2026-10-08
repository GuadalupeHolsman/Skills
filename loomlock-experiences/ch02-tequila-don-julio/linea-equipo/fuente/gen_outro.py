"""2.9 s outro card appended to the team's reels: the series moves to other cities."""
import sys, pathlib, re
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from gen_reels_c import reel, k_invite, W_, H_, HERE
sc = [dict(t0=0, t1=2.88, a=("Loomlock", "b", 88), b=("experiences.", "i", 74),
           kind=k_invite("g", [("One rule,", "i", 80), ("every city.", "b", 96), ("Next city:", "i", 64), ("yours?", "b y", 120)], W_, H_),
           foot='<span class="i">Same channel,</span> <span class="b">new city.</span>')]
reel("o1-next-city", sc, 2.88, "Next city")
p = HERE / "o1-next-city" / "index.html"
t = p.read_text()
t = re.sub(r'<audio id="music".*?</audio>\n', '', t, flags=re.S)
t = t.replace("LIVE NOW, POST LATER · CH 02 · BOGOTÁ · ", "LIVE NOW, POST LATER · NEXT CITY · ")
p.write_text(t)
