"""Builds narrativa.html (Locked In · tendencias + narrativa) with inline SVG charts from the Google Trends JSON."""
import json, pathlib, collections, html

HERE = pathlib.Path(__file__).parent
TR = HERE / "datos"

def yearly(series, key=None):
    acc = collections.defaultdict(list)
    for p in series:
        if p.get("is_partial"):
            continue
        acc[p["date"][:4]].append(p["values"][key] if key else p["value"])
    return {y: sum(v) / len(v) for y, v in sorted(acc.items())}

teq = json.load(open(TR / "ar_tequila_5y.json"))
cmp_ = json.load(open(TR / "ar_cmp_spirits.json"))
dj = json.load(open(TR / "ar_donjulio.json"))
pf = json.load(open(TR / "ww_phonefree.json"))
yd = json.load(open(TR / "ww_yondr.json"))

def line_chart(series_map, colors, ymax, title_id, w=640, h=260, unit=""):
    """series_map: {label: {year: value}}; draws to one scale."""
    years = sorted(next(iter(series_map.values())).keys())
    L, R, T, B = 44, 92, 16, 34
    pw, ph = w - L - R, h - T - B
    x = lambda i: L + pw * i / (len(years) - 1)
    y = lambda v: T + ph * (1 - v / ymax)
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-labelledby="{title_id}" class="chart">']
    for g in range(0, ymax + 1, ymax // 4 if ymax >= 4 else 1):
        out.append(f'<line x1="{L}" x2="{L+pw}" y1="{y(g):.1f}" y2="{y(g):.1f}" class="grid"/>'
                   f'<text x="{L-8}" y="{y(g)+4:.1f}" class="ax" text-anchor="end">{g}</text>')
    for i, yr in enumerate(years):
        out.append(f'<text x="{x(i):.1f}" y="{h-10}" class="ax" text-anchor="middle">{yr}</text>')
    for (lab, ser), col in zip(series_map.items(), colors):
        pts = " ".join(f"{x(i):.1f},{y(ser[yr]):.1f}" for i, yr in enumerate(years))
        out.append(f'<polyline points="{pts}" fill="none" stroke="var({col})" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>')
        for i, yr in enumerate(years):
            r = 4 if i in (0, len(years) - 1) else 2.5
            out.append(f'<circle cx="{x(i):.1f}" cy="{y(ser[yr]):.1f}" r="{r}" fill="var({col})"/>')
        last = ser[years[-1]]
        out.append(f'<text x="{x(len(years)-1)+10:.1f}" y="{y(last)+4:.1f}" class="lab" fill="var({col})">{html.escape(lab)} {last:.0f}{unit}</text>')
    out.append("</svg>")
    return "".join(out)

def bar_list(rows, title_id, w=640):
    """rows: [(label, pct, highlight)] horizontal bars to one scale."""
    vmax = max(p for _, p, _ in rows)
    bh, gap, L, R = 22, 10, 210, 70
    h = len(rows) * (bh + gap) + 6
    pw = w - L - R
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-labelledby="{title_id}" class="chart">']
    for i, (lab, p, hi) in enumerate(rows):
        yy = i * (bh + gap) + 4
        bw = pw * p / vmax
        out.append(f'<text x="{L-10}" y="{yy+bh*0.7:.1f}" class="lab2" text-anchor="end">{html.escape(lab)}</text>'
                   f'<rect x="{L}" y="{yy}" width="{bw:.1f}" height="{bh}" rx="3" fill="var({"--accent" if hi else "--muted-bar"})"/>'
                   f'<text x="{L+bw+8:.1f}" y="{yy+bh*0.7:.1f}" class="lab2 num">+{p:,}%</text>')
    out.append("</svg>")
    return "".join(out)

t_y = yearly(teq["interest_over_time"])
c_y = {k: yearly(cmp_["interest_over_time"], k) for k in ["gin", "fernet", "tequila"]}
chart_teq = line_chart({"tequila": t_y}, ["--accent"], 60, "c1t")
chart_cmp = line_chart({"gin": c_y["gin"], "fernet": c_y["fernet"], "tequila": c_y["tequila"]}, ["--ink-3", "--ink-2", "--accent"], 40, "c2t")
rising = [("tequila clase azul", 800, False), ("818 tequila", 250, False), ("patrón tequila", 250, False),
          ("mezcal vs tequila", 170, False), ("tequila don julio 1942", 130, True), ("tequila don julio", 80, True)]
chart_rise = bar_list(rising, "c3t")
pf_y = yearly(pf["interest_over_time"], "phone free")
yd_y = yearly(yd["interest_over_time"])
chart_pf = line_chart({"phone free": pf_y}, ["--accent"], 60, "c0t")
dj_top = [q["query"] for q in dj["related_queries"]["top"][:8]]

page = (HERE / "template.html").read_text()
for k, v in {"{{CHART_TEQ}}": chart_teq, "{{CHART_CMP}}": chart_cmp, "{{CHART_RISE}}": chart_rise, "{{CHART_PF}}": chart_pf, "{{PF25}}": f"{pf_y['2025']:.0f}", "{{PF26}}": f"{pf_y['2026']:.0f}", "{{YD21}}": f"{yd_y['2021']:.0f}", "{{YD26}}": f"{yd_y['2026']:.0f}",
             "{{T21}}": f"{t_y['2021']:.0f}", "{{T26}}": f"{t_y['2026']:.0f}",
             "{{GIN21}}": f"{c_y['gin']['2021']:.0f}", "{{GIN26}}": f"{c_y['gin']['2026']:.0f}",
             "{{DJ_TOP}}": "".join(f"<li>{html.escape(q)}</li>" for q in dj_top)}.items():
    page = page.replace(k, v)
(HERE / "narrativa.html").write_text(page)
print("ok", len(page))
