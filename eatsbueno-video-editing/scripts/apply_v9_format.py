"""Apply video-9 format (text + audio) to the other reels -> <name>_v9.json"""
import json
HL = {
 "funfact":    "I don\u2019t live\non *salads*",
 "bm_a":       "What I ate at\n*Burning Man*",
 "bm_b":       "Burning Man:\nthe *experience*",
 "area51":     "Road trip to\n*Area 51*",
 "miscomidas": "Mis comidas\nen la *calle*",
 "videos":     "Log any meal.\n*Anywhere.*",
 "rv":         "Protein\nice cream:\n*red velvet*",
 "dk":         "*Oreo*\nprotein\nice cream",
}
HL_END = 3.2
for n, text in HL.items():
    s = json.load(open(n + ".json"))
    # clips: drop the logo outro (and its transition); keep a short tail on the last shot
    had_outro = any(c.get("outro") for c in s["clips"])
    s["clips"] = [c for c in s["clips"] if not c.get("outro")]
    if had_outro: s["clips"][-1]["dur"] = round(s["clips"][-1]["dur"] + 0.4, 3)
    # text: no chips/titles/watermark, big captions, opening headline
    caps = [o for o in s["overlays"] if o["type"] == "caption"]
    for c in caps: c.pop("y", None); c.pop("size", None)
    caps = [dict(c, start=max(c["start"], HL_END)) for c in caps if c["end"] > HL_END + 0.3]
    s["overlays"] = [{"type": "headline", "text": text, "center": True, "accent": [226, 96, 35],
                      "start": 0.0, "end": HL_END, "y": 960, "size": 156, "anim": "pop"}] + caps
    s.update({"caption_style": "clean", "caption_size": 76, "caption_y": 1270, "watermark": False,
              "chip_color": [226, 96, 35], "global_speed": 1.06, "voice_pitch": 1.025,
              "auto_sfx": False, "sfx": []})
    for a in s["audio"]:
        if a.get("eq") == "voice": a["eq"] = "voice_bright"
    json.dump(s, open(n + "_v9.json", "w"), indent=1, ensure_ascii=False)
    print(n, "clips", len(s["clips"]), "caps", len(caps), "dur", round(sum(c["dur"] for c in s["clips"]) / 1.06, 2))
