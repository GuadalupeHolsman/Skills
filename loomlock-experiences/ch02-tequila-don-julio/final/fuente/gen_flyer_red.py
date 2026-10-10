"""CH 02 · redacted invitation flyer (story + post): only the invitation survives the redaction."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import gen_statics_p as S
from gen_reels_c import lockup

TXT = ("Dear guest, this is not another post for your feed. You're invited. Thursday, 29 October. Bogotá. "
       "Bring your phone, it stays in your pocket. At the door you tap the key and the apps go quiet until you leave. "
       "Tequila Don Julio, music loud, people in front of you. Invite only. Eighteen and over. "
       "Nothing gets posted tonight. Live now, post later.")
KEEP = ["You're", "invited.", "Thursday,", "29", "October.", "Bogotá.", "Invite", "only.", "Live", "now,", "post", "later."]

def para(fs):
    out = ""
    for w in TXT.split(" "):
        if w in KEEP:
            out += f'<span class="wd" style="color:#0B0B0B"><span class="hb" style="background:var(--yel)"></span>{w}</span> '
        else:
            out += f'<span class="wd"><span class="rb" style="transform:none"></span>{w}</span> '
    return out

def make(name, W, H, top, fs, foot_top):
    S.H = H
    html = (f'<div class="ab" style="inset:0;background:#E7E5E0"></div>'
            f'<div class="ab" style="left:56px;right:56px;top:{top}px;font-size:{fs}px;line-height:1.34;font-weight:700;color:#141414">{para(fs)}</div>'
            f'<div class="ab" style="left:0;right:0;top:{foot_top}px;display:flex;justify-content:center"><div style="background:#0B0B0E;border-radius:999px;padding:18px 34px">{lockup(40, 70)}</div></div>'
            + S.corners("#141414", "#141414", "REDACTED BY<br>LOOMLOCK", "INVITE<br>ONLY") + S.legal("rgba(20,20,20,.75)", "rgba(231,229,224,.92)"))
    S.shot(name, S.page(html, "#E7E5E0", W, H), W, H)

if __name__ == "__main__":
    make("flyer-red-story", 1080, 1920, 230, 62, 1600)
    make("flyer-red-post", 1080, 1350, 160, 44, 1110)
