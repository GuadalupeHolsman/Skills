"""Add motion graphics over the stock shots of the avatar explainers (10, 11, 13)."""
import json, math, mg
exec(open('build_viral.py').read().split('# --- 10,000 steps')[0])
GL = lambda: None
def glued(src):
    out = []
    for s in TX[src]["segs"]:
        for w in s["w"]:
            t = w[2]
            if out and not t.startswith(" ") and (t[:1] in ",-." or t[:1].isdigit() or out[-1][2][-1:] == "-"):
                a, _, prev = out[-1]; out[-1] = (a, w[1], prev + t.strip())
            else: out.append((w[0], w[1], t.strip()))
    return out
X = lambda w: (1080 - w - 60) // 2
def add(name, items, drop_callouts):
    spec = json.load(open(name + "_v2.json"))
    spec["overlays"] = [o for o in spec["overlays"] if not (o["type"] == "callout" and o["text"] in drop_callouts)]
    for (a, b, path, w, y) in items:
        spec["overlays"].append({"type": "mgvid", "path": path, "start": round(a, 3), "end": round(b, 3), "x": X(w), "y": y})
    json.dump(spec, open(name + "_mg.json", "w"), indent=1, ensure_ascii=False); print(name, len(items), "motion graphics")
plateau = lambda x: 1 - math.exp(-x / 0.22)
# ---- 10 (steps)
W = glued("avatar/av9.mp4"); a1, b1 = at(W, "which") - 0.05, at(W, "it") - 0.15
a2, b2 = at(W, "recent") + 0.1, at(W, "so") - 0.15; a3, b3 = at(W, "add") - 0.1, at(W, "walk") - 0.15
add("av9", [
  (a1, b1, mg.counter("mg/av9_counter.mov", b1 - a1, 0, 10000, "STEPS", "= marketing"), 640, 380),
  (a2, b2, mg.chart("mg/av9_chart.mov", b2 - a2, "Health benefit vs. steps/day", [(plateau, (43, 94, 82), "")], "steps/day",
            "Illustrative · Paluch et al. 2022", marker=(10 / 12, "10,000"), band=(6 / 12, 8 / 12, "levels off"), ymax=1.15), 900, 330),
  (a3, b3, mg.counter("mg/av9_plus.mov", b3 - a3, 6000, 7000, "STEPS / DAY", "+1,000", ring_to=0.7), 640, 380)],
  {"10,000 = marketing", "Benefits start\nbelow 10,000", "+1,000 steps"})
# ---- 11 (walk after eating)
W = glued("avatar/av10.mp4"); a1, b1 = at(W, "light") - 0.05, at(W, "helps") - 0.15
a2, b2 = at(W, "helps") + 0.05, at(W, "you") - 0.15; a3, b3 = at(W, "today") + 0.1, at(W, "tag") - 0.15
add("av10", [
  (a1, b1, mg.stopwatch("mg/av10_timer.mov", b1 - a1, 120, "light walk"), 620, 380),
  (a2, b2, mg.chart("mg/av10_chart.mov", b2 - a2, "Blood sugar after a meal",
            [(lambda x: 1.0 * math.exp(-((x - 0.32) / 0.17) ** 2) + 0.08, (226, 96, 35), "No walk"),
             (lambda x: 0.7 * math.exp(-((x - 0.30) / 0.17) ** 2) + 0.08, (43, 94, 82), "2–5 min walk")],
            "time after eating", "Illustrative · Buffey et al. 2022"), 900, 300),
  (a3, b3, mg.loop_route("mg/av10_loop.mov", b3 - a3, "1 lap", "around the block"), 620, 360)],
  {"2–5 min walk", "Lower sugar spike", "After lunch:\n1 lap"})
# ---- 13 (salad)
W = glued("avatar/av12.mp4"); a1, b1 = at(W, "greatly") - 0.05, at(W, "so") - 0.15; a2, b2 = at(W, "so") + 0.05, at(W, "save") - 0.15
add("av12", [
  (a1, b1, mg.bars("mg/av12_bars.mov", b1 - a1, "Antioxidants absorbed", [("Salad only", 0.25, (200, 190, 170)), ("+ avocado", 0.95, (43, 94, 82))],
            "Illustrative · Unlu et al. 2005"), 760, 330),
  (a2, b2, mg.checklist("mg/av12_check.mov", b2 - a2, ["Avocado", "Olive oil", "Seeds"], step=0.55), 620, 360)],
  {"More antioxidants\nabsorbed", "Avocado · Olive oil · Seeds"})
