"""Builds the kiosk page from the template, inlining the Loomlock logo and Locky.

    python3 src/build.py            # CH 02 (CONFIG as written in the template)
    python3 src/build.py experiences  # also <event>/index.html with src/events/<event>.json applied

Outputs:
  index.html       full standalone page (open it in the kiosk browser)
  artifact.html    same page without the document skeleton (for the claude.ai preview)
  <event>/index.html  one standalone page per event passed on the command line
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def inner_svg(path):
    svg = (ROOT / path).read_text(encoding="utf-8")
    svg = re.sub(r"<\?xml.*?\?>|<!--.*?-->", "", svg, flags=re.S)
    return re.search(r"<svg[^>]*>(.*)</svg>", svg, flags=re.S).group(1).strip()


def locky():
    body = inner_svg("locky.svg")
    css = re.search(r"<style>(.*?)</style>", body, flags=re.S).group(1)
    rules = {}
    for selectors, decls in re.findall(r"([^{}]+)\{([^}]*)\}", css):
        for sel in selectors.split(","):
            rules.setdefault(sel.strip().lstrip("."), []).append(decls.strip().rstrip(";"))
    body = re.sub(r"<defs>.*?</defs>", "", body, flags=re.S)

    def to_style(m):
        return 'style="%s"' % ";".join(rules.get(m.group(1), []))

    body = re.sub(r'class="(\w)"', to_style, body)
    # eyes: white only (no pupils), just a blink
    body = re.sub(r'<g id="i">(.*?)</g>', r'<g class="blink">\1</g>', body, flags=re.S)
    body = re.sub(r'<g id="k">(.*?)</g>', r'<g class="blink">\1</g>', body, flags=re.S)
    return re.sub(r'\s(id)="[a-z]"', "", body)


def logo():
    return re.sub(r"\s+", " ", inner_svg("logo.svg"))


tpl = (ROOT / "src/kiosk.template.html").read_text(encoding="utf-8")
import base64


def data_uri(path):
    return "data:image/png;base64," + base64.b64encode((ROOT / path).read_bytes()).decode()


def app_img(n):
    return "data:image/webp;base64," + base64.b64encode((ROOT / f"src/app-screens/app{n}.webp").read_bytes()).decode()


def key_svg(n):
    # the key: Locky + NFC waves on black (Big_locky_200_B), same art on both sides
    return "data:image/svg+xml;base64," + base64.b64encode((ROOT / "src/keys/locky-key.svg").read_bytes()).decode()


page = (tpl.replace("{{QRLIB}}", (ROOT / "src/vendor/qrcode-generator.js").read_text(encoding="utf-8")).replace("{{KEY_GIFT_BACK}}", "data:image/svg+xml;base64," + base64.b64encode((ROOT / "src/keys/gift-key-don-julio-back.svg").read_bytes()).decode()).replace("{{KEY_GIFT}}", "data:image/svg+xml;base64," + base64.b64encode((ROOT / "src/keys/gift-key-don-julio.svg").read_bytes()).decode()).replace("{{KEY_FRONT}}", key_svg("front")).replace("{{KEY_BACK}}", key_svg("back")).replace("{{LOGO}}", logo()).replace("{{LOCKY}}", locky()).replace("{{LOCKY_LIVE}}", locky()))
for i in (1, 2, 3, 4, 5, 6):
    page = page.replace("{{APP%d}}" % i, app_img(i))

def standalone(page):
    head, body = page.split("</style>", 1)
    return (
        '<!doctype html>\n<html lang="es" translate="no" class="notranslate">\n<head>\n<meta charset="utf-8">\n<meta name="google" content="notranslate">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">\n'
        + head + "</style>\n</head>\n<body>" + body + "\n</body>\n</html>\n"
    )


def with_event(page, ev):
    """Overrides CONFIG keys with the values in src/events/<ev>.json."""
    cfg = json.loads((ROOT / "src/events" / (ev + ".json")).read_text(encoding="utf-8"))
    if "titulo" in cfg:  # page title, not a CONFIG key
        page = page.replace("<title>loomlock kiosk</title>", "<title>%s</title>" % cfg.pop("titulo"), 1)
    for k, v in cfg.items():
        page, n = re.subn(r"(\n    %s: )[^\n]*?(,?)([ \t]*//[^\n]*)?\n" % k,
                          lambda m: m.group(1) + json.dumps(v, ensure_ascii=False) + m.group(2) + (m.group(3) or "") + "\n", page, count=1)
        assert n == 1, "CONFIG key not found: " + k
    return page


(ROOT / "artifact.html").write_text(page, encoding="utf-8")
(ROOT / "index.html").write_text(standalone(page), encoding="utf-8")
print("ok", len(page), "bytes")

# one kiosk per event: python3 src/build.py experiences -> experiences/index.html
for ev in sys.argv[1:]:
    out = ROOT / ev
    out.mkdir(exist_ok=True)
    ev_page = with_event(page, ev)
    (out / "index.html").write_text(standalone(ev_page), encoding="utf-8")
    (out / "artifact.html").write_text(ev_page, encoding="utf-8")
    print("ok", ev)
