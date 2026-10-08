"""Builds experiences.html (Loomlock Experiences narrative platform) with an inline SVG chart from Google Trends JSON."""
import json, pathlib, html
HERE = pathlib.Path(__file__).parent
DATA = HERE / "datos" if (HERE / "datos").exists() else HERE.parent / "trends"

def bar_list(rows, title_id, w=640):
    vmax = max(p for _, p in rows)
    bh, gap, L, R = 22, 10, 230, 70
    h = len(rows) * (bh + gap) + 6
    pw = w - L - R
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-labelledby="{title_id}" class="chart">']
    for i, (lab, p) in enumerate(rows):
        y = i * (bh + gap) + 4
        bw = pw * p / vmax
        out.append(f'<text x="{L-10}" y="{y+bh*0.7:.1f}" class="lab2" text-anchor="end">{html.escape(lab)}</text>'
                   f'<rect x="{L}" y="{y}" width="{bw:.1f}" height="{bh}" rx="3" fill="var(--accent)"/>'
                   f'<text x="{L+bw+8:.1f}" y="{y+bh*0.7:.1f}" class="lab2 num">+{p:,}%</text>')
    out.append("</svg>")
    return "".join(out)

yd = json.load(open(DATA / "ww_yondr.json"))
want = ["yondr pouch opener", "yondr pouch magnet", "yondr pouches in schools", "what are yondr pouches", "how much is a yondr pouch"]
rows = []
for q in yd["related_queries"]["rising"]:
    if q["query"] in want:
        rows.append((q["query"], int(q["formatted_value"].replace("+", "").replace("%", "").replace(",", ""))))
rows.sort(key=lambda r: -r[1])
page = (HERE / "template.html").read_text().replace("{{CHART_YONDR}}", bar_list(rows, "c1t"))
(HERE / "experiences.html").write_text(page)
print("ok", rows)
