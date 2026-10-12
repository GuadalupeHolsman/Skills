"""Talking head (avatar or real) + word-synced B-roll cutaways, video-9 format."""
import json, re
TX = json.load(open('avatar/transcript.json')); TX.update(json.load(open('up2/transcript.json')))
B = "broll/"
def words(src): return [(w[0], w[1], w[2].strip()) for s in TX[src]["segs"] for w in s["w"]]
def at(W, word, nth=1, after=0.0):
    k = 0
    for s, e, w in W:
        if s >= after and re.sub(r"[^\w']", "", w.lower()) == word.lower():
            k += 1
            if k == nth: return s
    raise KeyError(word)
def captions(W, maxw=4):
    out = []; cur = []
    for s, e, w in W:
        cur.append((s, e, w))
        if len(cur) >= maxw or w.endswith((".", ",", "?", "!")):
            out.append(cur); cur = []
    if cur: out.append(cur)
    caps = []
    for i, g in enumerate(out):
        st = g[0][0]; en = out[i + 1][0][0] if i + 1 < len(out) else g[-1][1] + 0.3
        caps.append({"type": "caption", "text": " ".join(x[2] for x in g), "start": round(st - 0.05, 3), "end": round(min(en, g[-1][1] + 0.6) - 0.02, 3)})
    return caps
def build(name, src, out, head, shots, cites, t0=0.0, t1=None, fix=None):
    W = [w for w in words(src) if w[0] >= t0 - 0.05]
    end = t1 or (W[-1][1] + 0.35)
    shots = sorted(shots); clips = []
    for i, (t, kind, arg) in enumerate(shots):
        nxt = shots[i + 1][0] if i + 1 < len(shots) else end
        d = round(nxt - t, 3)
        if kind == "face":
            z = arg if isinstance(arg, list) else [arg, arg]
            clips.append({"src": src, "in": round(t, 3), "dur": d, "zoom": z, "pan": [0.5, 0.38]})
        elif kind == "card": clips.append(dict(arg, card=True, dur=d, zoom=[1.0, 1.0]))
        else: clips.append({"src": B + kind + ".mp4", "in": arg, "dur": d, "zoom": [1.0, 1.0]})
    caps = captions(W)
    if fix:
        for c in caps:
            for a, b in fix: c["text"] = c["text"].replace(a, b)
    for c in caps: c["start"] -= t0; c["end"] -= t0
    HL = 3.0
    caps = [dict(c, start=max(c["start"], HL)) for c in caps if c["end"] > HL + 0.3]
    ovs = [{"type": "headline", "text": head, "center": True, "accent": [226, 96, 35], "start": 0.0, "end": HL, "y": 960, "size": 150, "anim": "pop"}] + caps
    ovs += [{"type": "cite", "text": tx, "start": round(a - t0, 3), "end": round(b - t0, 3)} for a, b, tx in cites]
    spec = {"out": out, "grade": "natural", "caption_style": "clean", "caption_size": 76, "caption_y": 1270, "watermark": False,
            "chip_color": [226, 96, 35], "global_speed": 1.06, "voice_pitch": 1.025, "auto_sfx": False, "sfx": [],
            "clips": clips, "overlays": ovs,
            "audio": [{"src": src, "in": t0, "start": 0, "dur": round(end - t0, 3), "eq": "voice_bright", "fade_out": 0.25}]}
    json.dump(spec, open(name + ".json", "w"), indent=1, ensure_ascii=False)
    print(name, "dur", round(end - t0, 2), "shots", len(clips), "caps", len(caps))

# --- 10,000 steps
s = "avatar/av9.mp4"; W = words(s)
build("av9", s, "out/10_Avatar_10000StepsWasAnAd.mp4", "10,000 steps\nwas an *ad*", [
    (0.0, "face", 1.0),
    (at(W, "in") - 0.1, "card", {"palette": "green", "kicker": "1965 · Japan", "title": "Manpo-kei\n“10,000-step meter”"}),
    (at(W, "which") - 0.1, "stairs", 5.0),
    (at(W, "it") - 0.1, "face", 1.18),
    (at(W, "recent") - 0.1, "scientist", 1.0),
    (at(W, "so") - 0.1, "jpstreet", 3.5),
    (at(W, "walk") - 0.1, "phonewalk2", 1.0),
    (at(W, "send") - 0.1, "face", 1.1)],
    [(at(W, "recent"), at(W, "so") - 0.15, "Paluch et al. · Lancet Public Health 2022")],
    fix=[("Mampoke", "Manpo-kei"), ("10,000 step meter.", "“10,000-step meter.”")])
# --- walk after eating
s = "avatar/av10.mp4"; W = words(s)
build("av10", s, "out/11_Avatar_Walk2MinAfterEating.mp4", "Walk *2 minutes*\nafter eating", [
    (0.0, "face", 1.0),
    (at(W, "a", 1, 2.5) - 0.1, "lunch", 2.0),
    (at(W, "light") - 0.1, "glucose", 0.5),
    (at(W, "helps") - 0.1, "citywalk", 0.0),
    (at(W, "you") - 0.1, "face", 1.18),
    (at(W, "today") - 0.1, "friendswalk", 4.0),
    (at(W, "tag") - 0.1, "face", 1.08)],
    [(at(W, "light"), at(W, "you") - 0.2, "Buffey et al. · Sports Medicine 2022")])
# --- salad x3
for n, out in (("av12", "13_Avatar_FatFreeSalad_B.mp4"),):
    s = f"avatar/{n}.mp4"; W = words(s)
    build(n, s, "out/" + out, "Your salad\nneeds *fat*", [
        (0.0, "face", 1.0),
        (at(W, "some") - 0.1, "tomato", 1.0),
        (at(W, "like") - 0.1, "carrot", 2.0),
        (at(W, "need") - 0.1, "face", 1.18),
        (at(W, "one") - 0.35, "avocado", 1.0),
        (at(W, "greatly") - 0.1, "saladprep", 8.0),
        (at(W, "so") - 0.1, "oliveoil", 4.0),
        (at(W, "or") - 0.1, "saladbowl", 1.0),
        (at(W, "save") - 0.1, "face", 1.08)],
        [(at(W, "one") - 0.25, at(W, "so") - 0.2, "Unlu et al. · Journal of Nutrition 2005")])
# --- real take (WhatsApp)
s = "up2/v1747.mp4"; W = words(s); t0 = 1.75
build("take1747", s, "out/15_InvestInYourself.mp4", "*Invest*\nin yourself", [
    (t0, "face", [1.0, 1.0]),
    (at(W, "it's", 1) - 0.08, "face", [1.22, 1.22]),
    (at(W, "rush") - 0.3, "exhausted", 2.0),
    (at(W, "true") - 0.1, "face", [1.0, 1.0]),
    (at(W, "it's", 1, at(W, "true")) - 0.08, "face", [1.28, 1.28]),
    (at(W, "creating") - 0.1, "sunwalk", 8.0),
    (at(W, "protecting") - 0.1, "stretch", 3.0),
    (at(W, "when") - 0.1, "face", [1.3, 1.3]),
    (at(W, "everything") - 0.1, "face", [1.0, 1.0]),
    (at(W, "falls") - 0.08, "face", [1.2, 1.2]),
    (at(W, "breath") - 0.35, "breath", 2.0),
    (at(W, "invest") - 0.15, "face", [1.25, 1.25]),
    (at(W, "you", 1, at(W, "invest") + 0.5) - 0.1, "face", [1.0, 1.0])],
    [], t0=t0, fix=[("well -being", "well-being")])
