"""All-video red velvet: real speed, for each shot pick the calmest window near its planned in-point."""
import json, subprocess, numpy as np, cv2
s = json.load(open('rv_tripod.json'))
FPS = 10; W, H = 180, 320
win = cv2.createHanningWindow((W, H), cv2.CV_32F)
cache = {}
def motion_series(src, a, b):
    raw = subprocess.run(["ffmpeg","-v","error","-ss",f"{a:.2f}","-t",f"{b-a:.2f}","-i",src,"-vf",f"fps={FPS},scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
    f = np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
    d = np.array([cv2.phaseCorrelate(f[i],f[i+1],win)[0] for i in range(len(f)-1)])
    m = np.hypot(*d.T)                       # global (camera) motion per step
    diff = np.array([np.abs(f[i+1]-f[i]).mean() for i in range(len(f)-1)])  # overall change (hands, zoom)
    return m, diff
def dur_of(src):
    return float(subprocess.run(["ffmpeg" if False else "ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout)
for i, c in enumerate(s['clips']):
    c.pop('stabilize', None)
    if not c.get('src'): continue
    L = c['dur']; sd = dur_of(c['src'])
    lo = max(0, c['in'] - 1.5); hi = min(sd - L - 0.05, c['in'] + 3.0)
    if hi <= lo: c['speed'] = 1.0; c['in'] = round(max(0, min(c['in'], sd - L - 0.05)), 2); continue
    m, diff = motion_series(c['src'], lo, hi + L)
    n = int(L * FPS); best = None
    for k in range(0, max(1, len(m) - n + 1)):
        score = m[k:k+n].mean() * 3 + diff[k:k+n].mean() * 0.15 + 0.4 * abs((lo + k / FPS) - c['in'])  # prefer calm, stay near plan
        if best is None or score < best[0]: best = (score, lo + k / FPS, m[k:k+n].mean())
    print(f"#{i:2d} {c['src'][-12:]} in {c['in']:6.2f} -> {best[1]:6.2f}  dur {L:.2f}  cam {best[2]:.2f}px/step")
    c['in'] = round(best[1], 2); c['speed'] = 1.0
json.dump(s, open('rv_v9.json','w'), indent=1, ensure_ascii=False)
