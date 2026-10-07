import sys
out = sys.argv[1]
# clean source regions (no burned-in text): (sx, sy, sw, sh) and media start + clip
SRC = [
    # name, sx, sy, region_h, media_start
    ("face",   280, 150, 540, 12.60),
    ("crowd",  270, 1130, 635, 4.00),
    ("dancer", 40,  150, 540, 5.90),
    ("lights", 270, 150, 540, 2.00),
    ("hands",  270, 150, 540, 7.65),
    ("warm",   270, 1130, 540, 12.60),
]
TW, TH = 540, 640
POS = [(0,0),(540,0),(0,640),(540,640),(0,1280),(540,1280)]

def tiles(prefix, start, dur, rate):
    h = []
    for i,(name,sx,sy,rh,ms) in enumerate(SRC):
        k = TH / min(rh, 640) if rh < 640 else 1.0
        k = max(k, TW/540)
        x, y = POS[i]
        h.append(f'''      <div class="tile" id="{prefix}{i}" style="left:{x}px;top:{y}px">
        <div class="crop" style="transform:translate({-sx*k:.0f}px,{-sy*k:.0f}px) scale({k:.3f})" data-layout-allow-overflow>
          <video id="{prefix}v{i}" src="assets/src.mp4" muted playsinline data-start="{start}" data-duration="{dur}" data-media-start="{ms}" data-playback-rate="{rate}" data-track-index="0"></video>
        </div>
        <div class="tint" id="{prefix}t{i}"></div>
      </div>''')
    return "\n".join(h)

html = open(sys.argv[2]).read()
music = sys.argv[3] if len(sys.argv) > 3 else "assets/music_full.wav"
mstart = sys.argv[4] if len(sys.argv) > 4 else "5.31"
tint = sys.argv[5] if len(sys.argv) > 5 else "#1d29c2"
html = html.replace('src="assets/music_full.wav" data-start="0" data-duration="14.69" data-media-start="5.31"', f'src="{music}" data-start="0" data-duration="14.69" data-media-start="{mstart}"')
html = html.replace("--core: #1d29c2;", f"--core: {tint};")
impact = int(sys.argv[6]) if len(sys.argv) > 6 else 0
html = html.replace("const IMPACT = 0;", f"const IMPACT = {impact};")
html = html.replace("<!--TILES_A-->", tiles("ga", 0, 2.88, 0.3))
html = html.replace("<!--TILES_B-->", tiles("gb", 5.09, 4.99, 0.33))
open(out,"w").write(html)
print("ok")
