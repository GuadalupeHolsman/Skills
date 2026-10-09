#!/usr/bin/env python3
"""Small EDL-driven vertical video editor (ffmpeg + Pillow) with EatsBueno branding.

Usage: python3 vedit.py spec.json
"""
import json, os, subprocess, sys, math, hashlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

HERE = os.environ.get("VEDIT_ROOT", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONTS = os.path.join(HERE, "fonts")
BRAND = os.path.join(HERE, "brand")
CREAM = (247, 238, 221)
ORANGE = (224, 97, 42)
CHIP = (242, 128, 44)  # label-chip orange: brand orange reads red on video
GREEN = (43, 94, 82)
DARK = (24, 44, 39)
ACCENT = (255, 170, 102)

FONT_MAP = {  # brand typography: Cooper BT family
    "Fraunces900": "CooperLtBT-Bold", "Fraunces800": "CooperLtBT-Bold",
    "FrauncesItalic700": "CooperLtBT-Bold", "FrauncesItalic500": "CooperLtBT-Italic",
}

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, FONT_MAP.get(name, name) + ".ttf"), size)

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(cmd)[:2000]); print(r.stderr[-3000:]); sys.exit(1)
    return r.stdout

def run_cached(cmd, out):
    key = hashlib.md5(" ".join(cmd).encode()).hexdigest()
    kf = out + ".key"
    if os.path.exists(out) and os.path.exists(kf) and open(kf).read() == key:
        return
    run(cmd); open(kf, "w").write(key)

def probe(src):
    out = json.loads(run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", src]))
    v = next(s for s in out["streams"] if s["codec_type"] == "video")
    w, h = int(v["width"]), int(v["height"])
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd: rot = int(sd["rotation"])
    if abs(rot) in (90, 270): w, h = h, w
    has_audio = any(s["codec_type"] == "audio" for s in out["streams"])
    return w, h, float(out["format"].get("duration", 0) or 0), has_audio

# ---------------------------------------------------------------- text art
def text_layer(W, H, items):
    """items: list of dicts {text, font, size, fill, stroke, stroke_fill, xy:(cx, y) center-x, shadow}"""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for it in items:
        f = font(it["font"], it["size"])
        d = ImageDraw.Draw(im)
        bbox = d.textbbox((0, 0), it["text"], font=f, stroke_width=it.get("stroke", 0))
        tw = bbox[2] - bbox[0]
        x = it["xy"][0] - tw / 2 - bbox[0] if it.get("align", "center") == "center" else it["xy"][0]
        y = it["xy"][1]
        if it.get("shadow"):
            sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(sh).text((x + 4, y + 6), it["text"], font=f, fill=(0, 0, 0, 150), stroke_width=it.get("stroke", 0), stroke_fill=(0, 0, 0, 150))
            im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
        d = ImageDraw.Draw(im)
        d.text((x, y), it["text"], font=f, fill=it.get("fill", CREAM), stroke_width=it.get("stroke", 0), stroke_fill=it.get("stroke_fill", DARK))
    return im

def rich_line(draw_im, y, runs, size, fontname, W, stroke=7, shadow=True):
    """runs: list of (text, color). Draw centered on one line."""
    f = font(fontname, size)
    d = ImageDraw.Draw(draw_im)
    widths = [d.textlength(t, font=f) for t, _ in runs]
    x = (W - sum(widths)) / 2
    if shadow:
        sh = Image.new("RGBA", draw_im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh); xx = x
        for (t, c), w in zip(runs, widths):
            sd.text((xx + 3, y + 6), t, font=f, fill=(0, 0, 0, 140), stroke_width=stroke, stroke_fill=(0, 0, 0, 140)); xx += w
        draw_im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(draw_im)
    for (t, c), w in zip(runs, widths):
        d.text((x, y), t, font=f, fill=c, stroke_width=stroke, stroke_fill=DARK); x += w

def wrap_runs(words, maxw, f, d):
    lines, cur, curw = [], [], 0
    for wd, c in words:
        w = d.textlength(wd + " ", font=f)
        if cur and curw + w > maxw:
            lines.append(cur); cur, curw = [], 0
        cur.append((wd + " ", c)); curw += w
    if cur: lines.append(cur)
    return lines

def caption_png_clean(W, H, text, y, size=60):
    """Style A: Manrope Bold, white, no outline, soft drop shadow."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); f = font("Manrope700", size); d = ImageDraw.Draw(im)
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if cur and d.textlength(t, font=f) > W - 200: lines.append(cur); cur = w
        else: cur = t
    lines.append(cur); lh = int(size * 1.27)
    # two shadow layers: a wide soft halo for light backgrounds + a tight one for crisp edges
    for blur, alpha, off, grow in ((14, 255, 2, 6), (3, 210, 2, 0)):
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
        for i, l in enumerate(lines):
            x = (W - d.textlength(l, font=f)) / 2
            sd.text((x, y + i * lh + off), l, font=f, fill=(0, 0, 0, alpha), stroke_width=grow, stroke_fill=(0, 0, 0, alpha))
        sh = sh.filter(ImageFilter.GaussianBlur(blur))
        if blur > 5: sh.putalpha(sh.getchannel("A").point(lambda v: int(v * 0.62)))
        im.alpha_composite(sh)
    d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        x = (W - d.textlength(l, font=f)) / 2; d.text((x, y + i * lh), l, font=f, fill=(255, 255, 255))
    return im

def headline_box_png(W, H, text, y, size=72, fg=CREAM, bg=GREEN, track=0.02, padx=26, pady=12, radius=18, gap=8):
    """Native-style hook title: one rounded box per line (TikTok/IG text-background look)."""
    f = font("Manrope800", size); lines = text.upper().split("\n"); sp = size * track
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    def width(l): return sum(probe.textlength(c, font=f) for c in l) + sp * (len(l) - 1)
    asc, desc = f.getmetrics(); cap = f.getbbox("H")[3] - f.getbbox("H")[1]; bh = cap + 2 * pady + 14
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im); sd = ImageDraw.Draw(sh); yy = y
    for l in lines:
        w = width(l); x0 = (W - w) / 2 - padx; x1 = (W + w) / 2 + padx
        sd.rounded_rectangle((x0, yy + 6, x1, yy + bh + 6), radius, fill=(0, 0, 0, 90))
        d.rounded_rectangle((x0, yy, x1, yy + bh), radius, fill=bg + (255,))
        x = (W - w) / 2; ty = yy + (bh - cap) / 2 - f.getbbox("H")[1]
        for c in l: d.text((x, ty), c, font=f, fill=fg); x += probe.textlength(c, font=f) + sp
        yy += bh + gap
    sh = sh.filter(ImageFilter.GaussianBlur(10)); sh.alpha_composite(im)
    return sh

def headline_png(W, H, text, y, size=96, track=0.04, color=(255, 255, 255)):
    """Opening headline: Manrope ExtraBold, uppercase, tracked, with the clean-caption shadow."""
    f = font("Manrope800", size); lines = text.upper().split("\n"); lh = int(size * 1.12); sp = size * track
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    def width(l): return sum(probe.textlength(c, font=f) for c in l) + sp * (len(l) - 1)
    def draw(dr, dy, fill, grow=0):
        for i, l in enumerate(lines):
            x = (W - width(l)) / 2
            for c in l:
                dr.text((x, y + i * lh + dy), c, font=f, fill=fill, stroke_width=grow, stroke_fill=fill); x += probe.textlength(c, font=f) + sp
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for blur, alpha, off, grow, k in ((16, 255, 3, 8, 0.6), (3, 200, 3, 0, 1.0)):
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); draw(ImageDraw.Draw(sh), off, (0, 0, 0, alpha), grow)
        sh = sh.filter(ImageFilter.GaussianBlur(blur)); sh.putalpha(sh.getchannel("A").point(lambda v: int(v * k))); im.alpha_composite(sh)
    draw(ImageDraw.Draw(im), 0, color + (255,))
    return im

def caption_png(W, H, text, y, size=66, keywords=()):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    f = font("Manrope800", size); d = ImageDraw.Draw(im)
    words = []
    for wd in text.split():
        bare = wd.strip(".,!?¿¡:;\"'").lower()
        words.append((wd, ACCENT if bare in keywords else CREAM))
    lines = wrap_runs(words, W - 160, f, d)
    lh = int(size * 1.22)
    for i, ln in enumerate(lines):
        ln[-1] = (ln[-1][0].rstrip(), ln[-1][1])
        rich_line(im, y + i * lh, ln, size, "Manrope800", W)
    return im

def rounded(d, box, r, fill):
    d.rounded_rectangle(box, r, fill=fill)

def label_png(W, H, kicker, title, y=300, title_font="FrauncesItalic700", title_size=84, kicker_bg=None):
    kicker_bg = kicker_bg or CHIP
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if kicker:
        kf = font("Manrope800", 40)
        kt = " ".join(kicker.upper())  # tracking
        tw = d.textlength(kt, font=kf)
        bx0 = (W - tw) / 2 - 34; bx1 = (W + tw) / 2 + 34
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((bx0 + 2, y + 6, bx1 + 2, y + 82), 38, fill=(0, 0, 0, 110))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((bx0, y, bx1, y + 76), 38, fill=kicker_bg + (255,))
        d.text(((W - tw) / 2, y + 13), kt, font=kf, fill=CREAM)
        y += 100
    if title:
        f = font(title_font, title_size)
        words = [(w, CREAM) for w in title.split()]
        lines = wrap_runs(words, W - 140, f, d)
        for i, ln in enumerate(lines):
            ln[-1] = (ln[-1][0].rstrip(), ln[-1][1])
            rich_line(im, y + i * int(title_size * 1.15), ln, title_size, title_font, W, stroke=6)
    return im

def watermark_png(W, H, size=86, margin=48, opacity=0.9):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    iso = Image.open(os.path.join(BRAND, "iso_cream.png")).convert("RGBA")
    iso = iso.resize((size, int(size * iso.size[1] / iso.size[0])), Image.LANCZOS)
    a = np.asarray(iso).copy(); a[..., 3] = (a[..., 3] * opacity).astype(np.uint8); iso = Image.fromarray(a)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh.paste((0, 0, 0, 120), (W - margin - size + 2, margin + 4), iso)
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    im.alpha_composite(iso, (W - margin - size, margin))
    return im

def gradient_bg(W, H, seed=3, palette="orange"):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    if palette == "orange":
        base = np.array([224, 97, 42], float); hi = np.array([232, 140, 82], float); pink = np.array([221, 117, 100], float)
    else:
        base = np.array([58, 117, 103], float); hi = np.array([118, 150, 112], float); pink = np.array([70, 128, 112], float)
    def blob(cx, cy, r):
        return np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * r * r)))
    b1 = blob(W * 0.25, H * 0.45, W * 0.55); b2 = blob(W * 0.8, H * 0.7, W * 0.45)
    img = base[None, None] * (1 - b1[..., None]) + hi[None, None] * b1[..., None]
    img = img * (1 - 0.6 * b2[..., None]) + pink[None, None] * 0.6 * b2[..., None]
    img += rng.normal(0, 6, img.shape)  # grain like the brand book
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert("RGBA")

def outro_png(W, H, tagline, sub=None, palette="orange"):
    im = gradient_bg(W, H, palette=palette)
    logo = Image.open(os.path.join(BRAND, "logo_cream.png")).convert("RGBA")
    lw = 560; logo = logo.resize((lw, int(lw * logo.size[1] / logo.size[0])), Image.LANCZOS)
    y0 = int(H * 0.36)
    im.alpha_composite(logo, ((W - lw) // 2, y0))
    d = ImageDraw.Draw(im)
    ty = y0 + logo.size[1] + 110
    if tagline:
        f = font("FrauncesItalic500", 64)
        for i, ln in enumerate(tagline.split("\n")):
            tw = d.textlength(ln, font=f); d.text(((W - tw) / 2, ty + i * 80), ln, font=f, fill=CREAM)
        ty += 80 * len(tagline.split("\n")) + 40
    if sub:
        f = font("Manrope700", 40); tw = d.textlength(sub, font=f); d.text(((W - tw) / 2, ty), sub, font=f, fill=CREAM)
    return im.convert("RGB")

# ---------------------------------------------------------------- render
SFX = os.path.join(HERE, "sfx")

def seg_filter(sw, sh, W, H, dur, zoom, fps, grade, pan=None, shake=None):
    z0, z1 = zoom
    cover = max(W / sw, H / sh)
    zexpr = f"({z0}+({z1}-{z0})*min(t/{dur:.3f},1))"
    sw_e = f"ceil({sw}*{cover:.6f}*{zexpr}/2)*2"
    sh_e = f"ceil({sh}*{cover:.6f}*{zexpr}/2)*2"
    px, py = pan or (0.5, 0.5)
    cx, cy = f"(iw-{W})*{px}", f"(ih-{H})*{py}"
    if shake:  # [start, end, amplitude_px] camera shake for impacts
        a, b, amp = shake
        k = f"between(t,{a},{b})*{amp}*(1-(t-{a})/({b}-{a}+0.001))"
        cx = f"max(0,min(iw-{W},{cx}+{k}*sin(t*71)))"; cy = f"max(0,min(ih-{H},{cy}+{k}*cos(t*53)))"
    if shake and z0 < 1.04:  # need margin for shake
        sw_e = sw_e.replace(zexpr, f"({zexpr}*1.04)"); sh_e = sh_e.replace(zexpr, f"({zexpr}*1.04)")
    f = [f"fps={fps}", f"scale=w='{sw_e}':h='{sh_e}':eval=frame:flags=bicubic",
         f"crop={W}:{H}:'{cx}':'{cy}'", "setsar=1"]
    if grade: f.append(grade)
    f.append("format=yuv420p")
    return ",".join(f)

GRADES = {
    "warm": "eq=contrast=1.06:saturation=1.14:gamma=0.98,colorbalance=rs=0.03:gs=0.0:bs=-0.03:rm=0.02:bm=-0.02",
    "natural": "eq=contrast=1.04:saturation=1.08",
    "desert": "eq=contrast=1.08:saturation=1.15:gamma=0.97,colorbalance=rs=0.05:bs=-0.05:rm=0.03:bm=-0.03",
    "cool": "eq=contrast=1.08:saturation=1.05,colorbalance=rs=-0.02:bs=0.04:rh=-0.02:bh=0.03",
    "none": "",
}

TRANS_SFX = {"whip": "swipe", "slideleft": "swipe", "slideright": "swipe", "slideup": "swipe", "smoothleft": "whoosh",
             "smoothright": "whoosh", "smoothup": "whoosh", "zoomin": "whoosh_deep", "fadewhite": "whoosh", "circleopen": "whoosh",
             "hblur": "swipe", "dissolve": None, "fade": None, "pixelize": "glitch", "hlslice": "swipe", "fadeblack": None,
             "squeezeh": "swipe", "radial": "whoosh"}

def crop_png(im, pad=8):
    bb = im.getbbox()
    if not bb: return im, (0, 0)
    bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.size[0], bb[2] + pad), min(im.size[1], bb[3] + pad))
    return im.crop(bb), (bb[0], bb[1])

def anim_chain(k, s, e, anim, w, h, x0, y0):
    """returns (filter for overlay stream, overlay x expr, y expr). x0,y0 = top-left at rest."""
    T = f"max(0,t-{s:.3f})"
    cx, cy = x0 + w / 2, y0 + h / 2
    src = f"[{k}:v]format=rgba,trim=start={max(0, s - 0.05):.3f}:end={e:.3f}"
    fades = f",fade=t=in:st={s:.3f}:d=0.16:alpha=1,fade=t=out:st={max(s, e - 0.14):.3f}:d=0.14:alpha=1"
    if anim == "pop":
        S = f"if(lt({T},0.10),0.55+0.6*{T}/0.10,if(lt({T},0.2),1.15-0.15*({T}-0.10)/0.10,1))"
        chain = src + f",scale=w='max(2,trunc(iw*{S}/2)*2)':h='max(2,trunc(ih*{S}/2)*2)':eval=frame" + fades
        return chain, f"{cx:.1f}-overlay_w/2", f"{cy:.1f}-overlay_h/2"
    if anim == "rise":
        return src + fades, f"{x0}", f"{y0}+50*pow(max(0,1-{T}/0.3),2)"
    if anim == "slide":
        return src + fades, f"{x0}-420*pow(max(0,1-{T}/0.32),3)", f"{y0}"
    if anim == "drop":
        return src + fades, f"{x0}", f"{y0}-120*pow(max(0,1-{T}/0.35),3)"
    if anim == "zoom":
        S = f"min(1,0.3+0.7*pow(min(1,{T}/0.45),0.5))"
        chain = src + f",scale=w='max(2,trunc(iw*{S}/2)*2)':h='max(2,trunc(ih*{S}/2)*2)':eval=frame" + fades
        return chain, f"{cx:.1f}-overlay_w/2", f"{cy:.1f}-overlay_h/2"
    if anim == "spin":  # logo isotype spin-in
        S = f"min(1,0.2+0.8*min(1,{T}/0.5))"
        R = f"(1-min(1,{T}/0.7))*-3.1416"
        chain = src + f",rotate='{R}':c=none:ow='hypot(iw,ih)':oh=ow,scale=w='max(2,trunc(iw*{S}/2)*2)':h='max(2,trunc(ih*{S}/2)*2)':eval=frame" + fades
        return chain, f"{cx:.1f}-overlay_w/2", f"{cy:.1f}-overlay_h/2"
    return src + (fades if anim == "fade" else ""), f"{x0}", f"{y0}"

def main(spec_path):
    spec = json.load(open(spec_path))
    W, H, FPS = spec.get("w", 1080), spec.get("h", 1920), spec.get("fps", 30)
    work = os.path.join(HERE, "work", os.path.splitext(os.path.basename(spec_path))[0]); os.makedirs(work, exist_ok=True)
    grade = GRADES[spec.get("grade", "warm")]
    clips = spec["clips"]
    auto_sfx = spec.get("auto_sfx", True)
    sfx = list(spec.get("sfx", []))
    segs = []; t = 0.0; audio_parts = []; starts = []
    ovs = []  # (png, start, end, anim, x, y)
    for i, c in enumerate(clips):
        out = os.path.join(work, f"seg{i:03d}.mp4")
        dur = c["dur"]
        nxt = clips[i + 1] if i + 1 < len(clips) else None
        tail = nxt.get("trans", {}).get("d", 0.3) if nxt and nxt.get("trans") else 0.0
        rdur = dur + tail
        starts.append(t)
        if c.get("outro") or c.get("card"):
            p = os.path.join(work, f"bg{i}.png"); gradient_bg(W, H, palette=c.get("palette", "orange")).convert("RGB").save(p)
            vf = seg_filter(W, H, W, H, rdur, c.get("zoom", [1.0, 1.04]), FPS, "", None)
            run_cached(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS), "-t", f"{rdur:.3f}", "-i", p,
                 "-vf", vf, "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-r", str(FPS), out], out)
            if c.get("outro"):
                logo = Image.open(os.path.join(BRAND, "logo_cream.png")).convert("RGBA")
                lw = 560; logo = logo.resize((lw, int(lw * logo.size[1] / logo.size[0])), Image.LANCZOS)
                iso_h = int(logo.size[1] * 0.70); iso = logo.crop((0, 0, lw, iso_h)); word = logo.crop((0, iso_h, lw, logo.size[1]))
                y0 = int(H * 0.30)
                pi_ = os.path.join(work, f"oiso{i}.png"); iso.crop(iso.getbbox()).save(pi_); bb = iso.getbbox()
                ovs.append((pi_, t + 0.15, t + dur, "spin", (W - lw) // 2 + bb[0], y0 + bb[1]))
                pw = os.path.join(work, f"oword{i}.png"); wb = word.getbbox(); word.crop(wb).save(pw)
                ovs.append((pw, t + 0.55, t + dur, "rise", (W - lw) // 2 + wb[0], y0 + iso_h + wb[1]))
                ty = y0 + logo.size[1] + 110
                if c.get("tagline"):
                    tl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(tl); f = font("FrauncesItalic500", 66)
                    for li, ln in enumerate(c["tagline"].split("\n")):
                        tw = d.textlength(ln, font=f); d.text(((W - tw) / 2, ty + li * 84), ln, font=f, fill=CREAM)
                    im, (x, y) = crop_png(tl); pt = os.path.join(work, f"otag{i}.png"); im.save(pt)
                    ovs.append((pt, t + 0.95, t + dur, "rise", x, y))
                if auto_sfx:
                    sfx += [{"name": "whoosh", "start": t + 0.05, "vol": 0.5}, {"name": "sparkle", "start": t + 0.6, "vol": 0.55}]
            else:  # title card
                im = label_png(W, H, c.get("kicker"), c.get("title"), c.get("y", 760), title_size=c.get("size", 96))
                im, (x, y) = crop_png(im); pc = os.path.join(work, f"card{i}.png"); im.save(pc)
                ovs.append((pc, t + 0.1, t + dur, "zoom", x, y))
                if auto_sfx: sfx.append({"name": "pop", "start": t + 0.1, "vol": 0.6})
        elif c.get("image"):
            im_ = Image.open(c["image"]); sw, sh = im_.size
            vf = seg_filter(sw, sh, W, H, rdur, c.get("zoom", [1.0, 1.06]), FPS, grade, c.get("pan"))
            run_cached(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS), "-t", f"{rdur:.3f}", "-i", c["image"],
                 "-vf", vf, "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-r", str(FPS), out], out)
        else:
            sw, sh, sdur, has_a = probe(c["src"])
            spd = c.get("speed", 1.0)
            need = rdur * spd
            cin = min(c["in"], max(0, sdur - need - 0.05)) if c["in"] + need > sdur else c["in"]
            vf = seg_filter(sw, sh, W, H, rdur, c.get("zoom", [1.0, 1.0]), FPS, grade, c.get("pan"), c.get("shake"))
            if spd != 1.0: vf = f"setpts=PTS/{spd}," + vf
            run_cached(["ffmpeg", "-y", "-v", "error", "-ss", f"{cin:.3f}", "-t", f"{need:.3f}", "-i", c["src"],
                 "-vf", vf + ",tpad=stop_mode=clone:stop_duration=2", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                 "-r", str(FPS), "-t", f"{rdur:.3f}", out], out)
            if c.get("audio") and has_a:
                audio_parts.append({"src": c["src"], "in": cin, "start": t, "dur": dur, "vol": c.get("vol", 1.0), "speed": spd})
        if c.get("trans") and auto_sfx and i > 0:
            nm = TRANS_SFX.get(c["trans"]["type"], "whoosh")
            if nm: sfx.append({"name": nm, "start": max(0, t - 0.12), "vol": c["trans"].get("sfx_vol", 0.45)})
        segs.append((out, c.get("trans")))
        t += dur
    total = t

    # ---- join with xfade transitions (timeline-preserving: segment i carries the transition tail)
    vcat = os.path.join(work, "vcat.mp4")
    if any(tr for _, tr in segs[1:]):
        inputs = []; fc = []; last = "0:v"
        for i, (p, _) in enumerate(segs): inputs += ["-i", p]
        for i in range(1, len(segs)):
            tr = segs[i][1]
            if tr:
                typ = {"whip": "hblur"}.get(tr["type"], tr["type"])
                fc.append(f"[{last}]settb=AVTB,setpts=PTS-STARTPTS[l{i}];[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[r{i}];"
                          f"[l{i}][r{i}]xfade=transition={typ}:duration={tr.get('d', 0.3)}:offset={starts[i]:.3f}[x{i}]")
            else:  # hard cut: trim then concat
                fc.append(f"[{last}]trim=duration={starts[i]:.3f},setpts=PTS-STARTPTS[t{i}];[{i}:v]setpts=PTS-STARTPTS[s{i}];[t{i}][s{i}]concat=n=2:v=1:a=0[x{i}]")
            last = f"x{i}"
        run_cached(["ffmpeg", "-y", "-v", "error"] + inputs + ["-filter_complex", ";".join(fc), "-map", f"[{last}]",
             "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-r", str(FPS), "-t", f"{total:.3f}", vcat], vcat)
    else:
        lst = os.path.join(work, "list.txt"); open(lst, "w").write("".join(f"file '{s}'\n" for s, _ in segs))
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", vcat])

    # ---- overlays
    outro_start = next((starts[i] for i, c in enumerate(clips) if c.get("outro")), total)
    if spec.get("watermark", True):
        im, (x, y) = crop_png(watermark_png(W, H), 0); p = os.path.join(work, "wm.png"); im.save(p)
        ovs.append((p, 0, outro_start, "none", x, y))
    kw = set(k.lower().strip(".,!?") for k in spec.get("keywords", []))
    for j, o in enumerate(spec.get("overlays", [])):
        if o["type"] == "caption":
            if spec.get("caption_style") == "clean":
                im = caption_png_clean(W, H, o["text"], o.get("y", 1300), o.get("size", 60))
            else:
                im = caption_png(W, H, o["text"], o.get("y", 1290), o.get("size", 66), kw | set(k.lower() for k in o.get("keywords", [])))
            anim = o.get("anim", spec.get("caption_anim", "pop"))
        elif o["type"] == "label":
            im = label_png(W, H, o.get("kicker"), o.get("title"), o.get("y", 300), title_size=o.get("size", 84), kicker_bg=tuple(spec.get("chip_color", CHIP)))
            anim = o.get("anim", "drop")
            if auto_sfx and o.get("sfx", True): sfx.append({"name": o.get("sfx_name", "pop"), "start": o["start"], "vol": 0.5})
        elif o["type"] == "title":
            im = label_png(W, H, o.get("kicker"), o.get("title"), o.get("y", 300), title_size=o.get("size", 96), kicker_bg=tuple(spec.get("chip_color", CHIP)))
            anim = o.get("anim", "zoom")
            if auto_sfx and o.get("sfx", True): sfx.append({"name": o.get("sfx_name", "pop"), "start": o["start"], "vol": 0.55})
        elif o["type"] == "headline":
            if o.get("box"):
                im = headline_box_png(W, H, o["text"], o.get("y", 300), o.get("size", 72), fg=tuple(o.get("fg", CREAM)), bg=tuple(o.get("bg", GREEN)))
            else:
                im = headline_png(W, H, o["text"], o.get("y", 300), o.get("size", 96))
            anim = o.get("anim", "rise")
        elif o["type"] == "png":
            im = Image.open(o["path"]).convert("RGBA"); anim = o.get("anim", "pop")
        im, (x, y) = crop_png(im); p = os.path.join(work, f"ov{j:03d}.png"); im.save(p)
        ovs.append((p, o["start"], o["end"], anim, x, y))
    audio_parts += spec.get("audio", [])

    inputs = ["-i", vcat]; fc = []; last = "0:v"
    for k, (p, s, e, anim, x, y) in enumerate(ovs):
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{total:.3f}", "-i", p]
        w, h = Image.open(p).size
        chain, xe, ye = anim_chain(k + 1, s, e, anim, w, h, x, y)
        fc.append(chain + f"[o{k}]")
        fc.append(f"[{last}][o{k}]overlay=x='{xe}':y='{ye}':eof_action=pass:enable='between(t,{max(0, s - 0.05):.3f},{e:.3f})'[v{k}]"); last = f"v{k}"
    n_in = 1 + len(ovs)
    # ---- audio: dialogue/VO parts, music/ambience, sfx
    amix = []; m = 0
    for a in audio_parts:
        inputs += ["-i", a["src"]]; idx = n_in + m
        spd = a.get("speed", 1.0)
        chain = f"[{idx}:a:0]atrim=start={a['in']:.3f}:duration={a['dur'] * spd:.3f},asetpts=PTS-STARTPTS"
        if spd != 1.0: chain += f",atempo={spd}"
        if a.get("eq") == "voice": chain += ",highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=3"
        fi, fo = a.get("fade_in", 0.04), a.get("fade_out", 0.06)
        chain += f",afade=t=in:d={fi},afade=t=out:st={max(0, a['dur'] - fo):.3f}:d={fo},volume={a.get('vol', 1.0)}"
        chain += f",aformat=channel_layouts=stereo:sample_rates=48000,adelay={int(a['start'] * 1000)}:all=1[a{m}]"
        fc.append(chain); amix.append(f"[a{m}]"); m += 1
    for s_ in sfx:
        inputs += ["-i", os.path.join(SFX, s_["name"] + ".wav")]; idx = n_in + m
        chain = f"[{idx}:a]volume={s_.get('vol', 0.5)}"
        if s_.get("dur"): chain += f",atrim=duration={s_['dur']},afade=t=out:st={max(0, s_['dur'] - 0.8)}:d=0.8"
        chain += f",aformat=channel_layouts=stereo:sample_rates=48000,adelay={int(max(0, s_['start']) * 1000)}:all=1[a{m}]"
        fc.append(chain); amix.append(f"[a{m}]"); m += 1
    if amix:
        fc.append(f"{''.join(amix)}amix=inputs={len(amix)}:normalize=0:dropout_transition=0,"
                  f"loudnorm=I={spec.get('lufs', -14)}:TP=-1.5:LRA=11,alimiter=limit=0.89,apad,atrim=duration={total:.3f}[aout]")
    else:
        fc.append(f"anullsrc=r=48000:cl=stereo,atrim=duration={total:.3f}[aout]")
    fc.append(f"[{last}]null[vout]")
    out = spec["out"]
    fcp = os.path.join(work, "fc.txt"); open(fcp, "w").write(";\n".join(fc))
    run(["ffmpeg", "-y", "-v", "error"] + inputs + ["-filter_complex_script", fcp, "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.3f}", out])
    print("wrote", out, f"{total:.2f}s", f"{len(ovs)} overlays", f"{len(sfx)} sfx")

if __name__ == "__main__":
    main(sys.argv[1])
