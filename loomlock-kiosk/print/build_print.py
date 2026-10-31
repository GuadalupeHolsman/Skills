"""Builds the 'gracias por venir' print pieces (square panel + horizontal banner).
Run: python3 print/build_print.py && node print/render_print.js"""
import base64, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "print"
tpl = (P / "print.template.html").read_text(encoding="utf-8")
idx = (ROOT / "index.html").read_text(encoding="utf-8")
locky = re.search(r'<symbol id="locky".*?</symbol>', idx, re.S).group(0)
logo = (ROOT / "logo.svg").read_text(encoding="utf-8")
logo = re.sub(r'viewBox="[^"]*"', 'viewBox="45 175 680 262"', logo, count=1)
page = (tpl.replace("{{LOCKY_SYMBOL}}", locky)
           .replace("{{LOGO}}", "data:image/svg+xml;base64," + base64.b64encode(logo.encode()).decode())
           .replace("{{DONJULIO}}", "data:image/svg+xml;base64," + base64.b64encode((P / "don-julio-logo.svg").read_bytes()).decode())
           .replace("{{QRLIB}}", (ROOT / "src/vendor/qrcode-generator.js").read_text(encoding="utf-8")))
(P / "gracias.html").write_text(page, encoding="utf-8")
print("ok", len(page))

# alternative directions for review
opt = (P / "options.template.html").read_text(encoding="utf-8")
for k, v in {"{{LOCKY_SYMBOL}}": locky, "{{LOGO}}": "data:image/svg+xml;base64," + base64.b64encode(logo.encode()).decode(),
             "{{DONJULIO}}": "data:image/svg+xml;base64," + base64.b64encode((P / "don-julio-logo.svg").read_bytes()).decode(),
             "{{QRLIB}}": (ROOT / "src/vendor/qrcode-generator.js").read_text(encoding="utf-8")}.items():
    opt = opt.replace(k, v)
(P / "opciones.html").write_text(opt, encoding="utf-8")

# Instagram story (9:16)
st = (P / "story.template.html").read_text(encoding="utf-8")
for k, v in {"{{LOCKY_SYMBOL}}": locky, "{{LOGO}}": "data:image/svg+xml;base64," + base64.b64encode(logo.encode()).decode(),
             "{{DONJULIO}}": "data:image/svg+xml;base64," + base64.b64encode((P / "don-julio-logo.svg").read_bytes()).decode(),
             "{{QRLIB}}": (ROOT / "src/vendor/qrcode-generator.js").read_text(encoding="utf-8")}.items():
    st = st.replace(k, v)
(P / "historia.html").write_text(st, encoding="utf-8")
