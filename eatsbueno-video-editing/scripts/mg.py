"""Brand motion graphics rendered as RGBA .mov (png codec) for overlay: counters, charts, timers, loops, bars, checklists."""
import math, os, subprocess, tempfile, shutil, importlib.util
from PIL import Image, ImageDraw, ImageFilter
_sp = importlib.util.spec_from_file_location("v", os.path.join(os.path.dirname(os.path.abspath(__file__)), "vedit.py"))
v = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(v)
FPS = 30
CREAM, GREEN, ORANGE, DARK = (247, 238, 221), (43, 94, 82), (226, 96, 35), (24, 44, 39)
F = lambda w, s: v.font({8: "Manrope800", 7: "Manrope700", 5: "Manrope500"}[w], s)
def ease(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3
def ease_io(t): t = max(0.0, min(1.0, t)); return 3 * t * t - 2 * t * t * t

def panel(w, h):
    im = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((30, 40, 30 + w, 40 + h), 40, fill=(0, 0, 0, 110))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    ImageDraw.Draw(im).rounded_rectangle((30, 30, 30 + w, 30 + h), 40, fill=CREAM + (244,))
    return im

def write(frames_fn, dur, out):
    n = max(2, int(round(dur * FPS))); tmp = tempfile.mkdtemp()
    for i in range(n):
        t = i / FPS; im = frames_fn(t)
        a = ease(t / 0.28) * (1 - ease((t - (dur - 0.22)) / 0.22))     # pop in / fade out
        s = 0.86 + 0.14 * ease(t / 0.32)
        if s < 0.999:
            W0, H0 = im.size; sm = im.resize((max(1, int(W0 * s)), max(1, int(H0 * s))), Image.BICUBIC)
            im = Image.new("RGBA", (W0, H0), (0, 0, 0, 0)); im.alpha_composite(sm, ((W0 - sm.width) // 2, (H0 - sm.height) // 2))
        if a < 0.999: im.putalpha(im.getchannel("A").point(lambda p: int(p * a)))
        im.save(f"{tmp}/{i:04d}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/%04d.png", "-c:v", "png", "-pix_fmt", "rgba", out], check=True)
    shutil.rmtree(tmp); return out

def counter(out, dur, a, b, label, sub=None, ring_to=1.0, prefix=""):
    W, H = 640, 300
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im); p = ease_io((t - 0.15) / max(0.3, dur - 0.7))
        cx, cy, r = 30 + 150, 30 + H // 2, 95
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(220, 210, 190, 255), width=22)
        d.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * ring_to * p, fill=ORANGE, width=22)
        # little walking feet icon in ring
        for k, (dx, dy) in enumerate(((-18, 10), (16, -12))):
            d.ellipse((cx + dx - 13, cy + dy - 20, cx + dx + 13, cy + dy + 20), fill=GREEN)
        val = a + (b - a) * p; txt = prefix + f"{int(round(val)):,}"
        d.text((30 + 290, 30 + 62), txt, font=F(8, 96), fill=DARK)
        d.text((30 + 294, 30 + 178), label, font=F(7, 40), fill=GREEN)
        if sub and p > 0.98: d.text((30 + 294, 30 + 228), sub, font=F(7, 30), fill=ORANGE)
        return im
    return write(fr, dur, out)

def stopwatch(out, dur, secs_to, label):
    W, H = 620, 300
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im); p = ease_io((t - 0.15) / max(0.3, dur - 0.7))
        cx, cy, r = 30 + 150, 30 + H // 2 + 8, 95
        d.rectangle((cx - 16, cy - r - 34, cx + 16, cy - r - 12), fill=GREEN); d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(220, 210, 190, 255), width=20)
        d.arc((cx - r, cy - r, cx + r, cy + r), -90, -90 + 360 * p, fill=ORANGE, width=20)
        ang = math.radians(-90 + 360 * p * 4); d.line((cx, cy, cx + 0.7 * r * math.cos(ang), cy + 0.7 * r * math.sin(ang)), fill=DARK, width=8)
        s = int(secs_to * p); d.text((30 + 290, 30 + 62), f"{s // 60}:{s % 60:02d}", font=F(8, 104), fill=DARK)
        d.text((30 + 294, 30 + 190), label, font=F(7, 38), fill=GREEN)
        return im
    return write(fr, dur, out)

def chart(out, dur, title, series, xlab, foot, marker=None, band=None, ymax=1.1):
    """series: [(fn(x in 0..1) -> y, color, label)]"""
    W, H = 900, 640; L, T, R, B = 30 + 90, 30 + 120, 30 + W - 60, 30 + H - 110
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im)
        d.text((30 + 50, 30 + 36), title, font=F(8, 46), fill=DARK)
        d.line((L, B, R, B), fill=DARK, width=5); d.line((L, T, L, B), fill=DARK, width=5)
        d.text((L, B + 18), xlab, font=F(7, 30), fill=DARK)
        if band:
            x0, x1, txt = band
            if t > 0.5: 
                al = int(90 * ease((t - 0.5) / 0.4)); X0, X1 = L + (R - L) * x0, L + (R - L) * x1
                ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).rectangle((X0, T, X1, B), fill=GREEN + (al,)); im.alpha_composite(ov); d = ImageDraw.Draw(im)
                d.text((X0 + 8, T + 6), txt, font=F(7, 28), fill=GREEN + (min(255, al * 3),))
        if marker:
            mx, mtxt = marker; X = L + (R - L) * mx
            for yy in range(T, B, 22): d.line((X, yy, X, yy + 11), fill=ORANGE, width=4)
            d.text((X - d.textlength(mtxt, font=F(8, 30)) - 10, T - 6), mtxt, font=F(8, 30), fill=ORANGE)
        p = ease_io((t - 0.2) / max(0.4, dur * 0.65))
        for k, (fn, col, lab) in enumerate(series):
            pts = []; N = 120
            for i in range(int(N * p) + 1):
                x = i / N; pts.append((L + (R - L) * x, B - (B - T) * fn(x) / ymax))
            if len(pts) > 1: d.line(pts, fill=col, width=10, joint="curve")
            if pts: d.ellipse((pts[-1][0] - 11, pts[-1][1] - 11, pts[-1][0] + 11, pts[-1][1] + 11), fill=col)
            if p > 0.9 and lab:
                xs = [i / 200 for i in range(201)]; xp = max(xs, key=fn); y = B - (B - T) * fn(xp) / ymax
                lx = L + (R - L) * xp + 30; ly = y - 22 + (34 if k else -6)
                d.text((lx, ly), lab, font=F(8, 32), fill=col)
        d.text((30 + 50, 30 + H - 52), foot, font=F(5, 24), fill=(90, 90, 80))
        return im
    return write(fr, dur, out)

def loop_route(out, dur, label, sub):
    W, H = 620, 420
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im); p = ease_io((t - 0.15) / max(0.3, dur - 0.6))
        x0, y0, x1, y1 = 30 + 70, 30 + 70, 30 + 300, 30 + 330
        d.rounded_rectangle((x0 + 30, y0 + 30, x1 - 30, y1 - 30), 18, fill=(220, 210, 190))   # the block
        per = 2 * ((x1 - x0) + (y1 - y0)); dist = per * p; pts = [(x0, y0)]
        segs = [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]
        rem = dist
        for (a, b) in segs:
            L = math.dist(a, b)
            if rem >= L: pts.append(b); rem -= L
            else:
                f = rem / L; pts.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)); break
        d.line(pts, fill=ORANGE, width=12, joint="curve"); e = pts[-1]
        d.ellipse((e[0] - 18, e[1] - 18, e[0] + 18, e[1] + 18), fill=GREEN)
        d.text((30 + 340, 30 + 120), label, font=F(8, 54), fill=DARK)
        d.text((30 + 342, 30 + 196), sub, font=F(7, 32), fill=GREEN)
        return im
    return write(fr, dur, out)

def bars(out, dur, title, items, foot):
    """items: [(label, rel_height 0..1, color)]"""
    W, H = 760, 600; B = 30 + H - 120
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im)
        d.text((30 + 50, 30 + 36), title, font=F(8, 44), fill=DARK)
        for k, (lab, hgt, col) in enumerate(items):
            p = ease((t - 0.25 - 0.35 * k) / 0.9); x = 30 + 140 + k * 300; top = B - (B - (30 + 140)) * hgt * p
            d.rounded_rectangle((x, top, x + 180, B), 22, fill=col)
            d.text((x + 90 - d.textlength(lab, font=F(8, 32)) / 2, B + 14), lab, font=F(8, 32), fill=DARK)
        if t > 0.25 + 0.35 * (len(items) - 1) + 0.9 and len(items) > 1:
            d.text((30 + 140 + 300 + 196, 30 + 160), "more", font=F(8, 34), fill=ORANGE)
        d.text((30 + 50, 30 + H - 50), foot, font=F(5, 24), fill=(90, 90, 80))
        return im
    return write(fr, dur, out)

def checklist(out, dur, items, step=0.45):
    W, H = 620, 120 + 110 * len(items)
    def fr(t):
        im = panel(W, H); d = ImageDraw.Draw(im)
        for k, it in enumerate(items):
            y = 30 + 60 + k * 110; p = ease((t - 0.2 - step * k) / 0.35)
            d.rounded_rectangle((30 + 50, y, 30 + 130, y + 80), 20, fill=(GREEN if p > 0 else (220, 210, 190)))
            if p > 0:
                a = (30 + 68, y + 42); b = (30 + 86, y + 60); c = (30 + 114, y + 22)
                pts = [a, b] if p < 0.5 else [a, b, (b[0] + (c[0] - b[0]) * (p - 0.5) * 2, b[1] + (c[1] - b[1]) * (p - 0.5) * 2)]
                if p < 0.5: pts = [a, (a[0] + (b[0] - a[0]) * p * 2, a[1] + (b[1] - a[1]) * p * 2)]
                d.line(pts, fill=CREAM, width=12, joint="curve")
            d.text((30 + 160, y + 10), it, font=F(8, 52), fill=DARK if p > 0 else (150, 140, 120))
        return im
    return write(fr, dur, out)
