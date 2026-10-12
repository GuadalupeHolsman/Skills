"""v2 avatar explainers: cheerful re-voice, graphics/callouts, animated face zooms."""
import json, re
exec(open('build_viral.py').read().split('# --- 10,000 steps')[0])   # reuse helpers (words, at, captions)
TXH = json.load(open('vo_happy/transcript.json'))
def hwords(n):
    out = []
    for s in TX[f"avatar/{n}.mp4"]["segs"]:   # original avatar voice
        for w in s["w"]:
            t = w[2]
            if out and not t.startswith(" ") and out[-1][2] and (t[:1] in ",-." or t[:1].isdigit() or out[-1][2][-1:] == "-"):
                a, _, prev = out[-1]; out[-1] = (a, w[1], prev + t.strip())   # glue '10' + ',000', 'MAMPO' + '-K'
            else: out.append((w[0], w[1], t.strip()))
    return out
def build2(name, src, out, head, shots, cites, callouts, fix=None):
    W = words(src); end = W[-1][1] + 0.45
    shots = sorted(shots); clips = []
    for i, (t, kind, arg) in enumerate(shots):
        nxt = shots[i + 1][0] if i + 1 < len(shots) else end; d = round(nxt - t, 3)
        if kind == "face": clips.append({"src": src, "in": round(t, 3), "dur": d, "zoom": arg, "pan": [0.5, 0.36]})
        elif kind == "image": clips.append({"image": arg, "dur": d, "zoom": [1.0, 1.05]})
        else: clips.append({"src": B + kind + ".mp4", "in": arg, "dur": d, "zoom": [1.0, 1.04]})
    caps = captions(hwords(name))
    for c in caps:
        for a, b in (fix or []): c["text"] = c["text"].replace(a, b)
    m = []
    for c in caps:   # a lone trailing word ("meter.") joins the previous caption
        if m and len(c["text"].split()) == 1 and not m[-1]["text"].rstrip().endswith((".", ",", "?", "!")):
            m[-1] = dict(m[-1], text=m[-1]["text"] + " " + c["text"], end=c["end"])
        else: m.append(c)
    caps = m
    HL = 3.0
    caps = [dict(c, start=max(c["start"], HL)) for c in caps if c["end"] > HL + 0.6]
    ovs = [{"type": "headline", "text": head, "center": True, "accent": [226, 96, 35], "start": 0.0, "end": HL, "y": 960, "size": 150, "anim": "pop"}] + caps
    ovs += [{"type": "cite", "text": tx, "start": round(a, 3), "end": round(b, 3)} for a, b, tx in cites]
    ovs += [dict({"type": "callout", "text": tx, "start": round(a, 3), "end": round(b, 3), "y": y, "size": 84}, **({"bg": bg} if bg else {})) for a, b, tx, y, bg in callouts]
    spec = {"out": out, "grade": "natural", "caption_style": "clean", "caption_size": 76, "caption_y": 1270, "watermark": False,
            "chip_color": [226, 96, 35], "global_speed": 1.06, "voice_pitch": 1.025, "auto_sfx": False, "sfx": [],
            "clips": clips, "overlays": ovs,
            "audio": [{"src": src, "in": 0, "start": 0, "dur": round(end, 3), "eq": "voice_bright", "fade_out": 0.25}]}
    json.dump(spec, open(name + "_v2.json", "w"), indent=1, ensure_ascii=False)
    print(name, round(end, 2), len(clips), "clips", len(caps), "caps")
GREEN = [43, 94, 82]
# --- 10,000 steps
s = "avatar/av9.mp4"; W = words(s); H = hwords("av9")
build2("av9", s, "out/10_Avatar_10000StepsWasAnAd.mp4", "10,000 steps\nwas an *ad*", [
    (0.0, "face", [1.0, 1.08]),
    (at(W, "in") - 0.1, "image", "avatar/manpokei_card.jpg"),
    (at(W, "which") - 0.1, "stairs", 5.0),
    (at(W, "it") - 0.1, "face", [1.2, 1.28]),
    (at(W, "recent") - 0.1, "scientist", 1.0),
    (at(W, "so") - 0.1, "jpstreet", 3.5),
    (at(W, "walk") - 0.1, "phonewalk2", 1.0),
    (at(W, "send") - 0.1, "face", [1.06, 1.14])],
    [(at(H, "recent"), at(H, "so") - 0.15, "Paluch et al. · Lancet Public Health 2022")],
    [(at(H, "which"), at(H, "it") - 0.1, "10,000 = marketing", 470, None),
     (at(H, "it") + 0.2, at(H, "recent") - 0.1, "Not a science rule", 1060, GREEN),
     (at(H, "fewer"), at(H, "so") - 0.1, "Benefits start\nbelow 10,000", 470, GREEN),
     (at(H, "add"), at(H, "walk") - 0.1, "+1,000 steps", 470, None),
     (at(H, "walk"), at(H, "send") - 0.1, "Walk + talk", 470, None)],
    fix=[("MAMPO-K,", "Manpo-kei,"), ("Mampoke,", "Manpo-kei,"), ("Mampoke", "Manpo-kei"), ("10,000 step meter.", "10,000-step meter."), ("10,000 step meter", "10,000-step meter")])
# --- walk after eating
s = "avatar/av10.mp4"; W = words(s); H = hwords("av10")
build2("av10", s, "out/11_Avatar_Walk2MinAfterEating.mp4", "Walk *2 minutes*\nafter eating", [
    (0.0, "face", [1.0, 1.08]),
    (at(W, "a", 1, 2.5) - 0.1, "lunch", 2.0),
    (at(W, "light") - 0.1, "glucose", 0.5),
    (at(W, "helps") - 0.1, "citywalk", 0.0),
    (at(W, "you") - 0.1, "face", [1.2, 1.28]),
    (at(W, "today") - 0.1, "friendswalk", 4.0),
    (at(W, "tag") - 0.1, "face", [1.06, 1.14])],
    [(at(H, "light"), at(H, "you") - 0.2, "Buffey et al. · Sports Medicine 2022")],
    [(at(H, "review") - 0.2, at(H, "light") - 0.1, "7 studies reviewed", 470, GREEN),
     (at(H, "light"), at(H, "helps") - 0.1, "2–5 min walk", 470, None),
     (at(H, "helps"), at(H, "you") - 0.1, "Lower sugar spike", 470, GREEN),
     (at(H, "today"), at(H, "tag") - 0.1, "After lunch:\n1 lap", 470, None)],
    fix=[("two to five minutes", "2–5 minutes"), ("2-5", "2–5")])
# --- salad (B)
s = "avatar/av12.mp4"; W = words(s); H = hwords("av12")
build2("av12", s, "out/13_Avatar_FatFreeSalad_B.mp4", "Your salad\nneeds *fat*", [
    (0.0, "face", [1.0, 1.08]),
    (at(W, "some") - 0.1, "tomato", 1.0),
    (at(W, "like") - 0.1, "carrot", 2.0),
    (at(W, "need") - 0.1, "face", [1.2, 1.28]),
    (at(W, "one") - 0.35, "avocado", 1.0),
    (at(W, "greatly") - 0.1, "saladprep", 8.0),
    (at(W, "so") - 0.1, "oliveoil", 4.0),
    (at(W, "or") - 0.1, "saladbowl", 1.0),
    (at(W, "save") - 0.1, "face", [1.06, 1.14])],
    [(at(H, "one") - 0.25, at(H, "so") - 0.2, "Unlu et al. · Journal of Nutrition 2005")],
    [(at(H, "tomatoes"), at(H, "need") - 0.1, "Tomatoes · Carrots", 470, None),
     (at(H, "need") + 0.1, at(H, "one") - 0.3, "+ a little fat", 1060, GREEN),
     (at(H, "greatly"), at(H, "so") - 0.1, "More antioxidants\nabsorbed", 470, GREEN),
     (at(H, "avocado", 2), at(H, "save") - 0.1, "Avocado · Olive oil · Seeds", 470, None)],
    fix=[("people absorb.", "people absorbed.")])
