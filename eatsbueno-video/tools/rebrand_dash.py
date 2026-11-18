#!/usr/bin/env python3
"""Replace the demo company name in the dashboard screenshots.

The v1.2.0 screenshots show the demo employer "Grupo Horizonte" in two places
(page header and sidebar card) and a "HORIZONTE" logo chip in the sidebar.
This rewrites the name as NEW_NAME in Manrope (the dashboard's own typeface,
matched in weight and size) and blurs the logo chip.

Run after tools/make_dash_assets.py:
    python3 tools/rebrand_dash.py            # patches assets/dash_en and assets/dash_es
"""
import io, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

NEW_NAME = 'Black Vitriol'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['overview_clean', 'overview_full', 'subgroups', 'hr_clean']

# search boxes (screenshot px, 2x) and type settings matched against the original text
SLOTS = [
    # name, search box, weight, px size, dark background?
    ('header', (575, 60, 1000, 118), 750, 29.5, False),
    ('side', (55, 255, 470, 300), 650, 28.0, True),
]
CHIP = (62, 178, 276, 242)  # "HORIZONTE" logo chip in the sidebar card


def manrope():
    f = TTFont(os.path.join(ROOT, 'assets/fonts/manrope.woff2'))
    f.flavor = None
    buf = io.BytesIO(); f.save(buf); return buf.getvalue()


FONT = manrope()


def font(weight, px, ss):
    f = ImageFont.truetype(io.BytesIO(FONT), int(round(px * ss)))
    f.set_variation_by_axes([weight])
    return f


def patch_text(im, box, weight, px, dark):
    a = np.asarray(im.crop(box).convert('RGB')).astype(int)
    lum = a.mean(2)
    bg = np.median(a.reshape(-1, 3), axis=0).astype(int)  # flat background colour
    blum = bg.mean()
    ink = np.abs(lum - blum) > 40
    ys, xs = np.where(ink)
    if not len(xs):
        raise SystemExit(f'no text found in {box}')
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
    # text colour = most extreme pixel
    idx = np.unravel_index(np.argmax(np.abs(lum - blum)), lum.shape)
    fg = tuple(int(v) for v in a[idx])
    # erase the old name
    d = ImageDraw.Draw(im)
    d.rectangle((box[0] + x0 - 4, box[1] + y0 - 4, box[0] + x1 + 4, box[1] + y1 + 4), fill=tuple(bg))
    # draw the new one with the same left edge and cap top, supersampled
    ss = 4
    f = font(weight, px, ss)
    tb = ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), NEW_NAME, font=f)
    W, H = tb[2] - tb[0] + 8 * ss, tb[3] - tb[1] + 8 * ss
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).text((4 * ss - tb[0], 4 * ss - tb[1]), NEW_NAME, font=f, fill=255)
    m = m.resize((W // ss, H // ss), Image.LANCZOS)
    im.paste(Image.new('RGB', m.size, fg), (box[0] + x0 - 4, box[1] + y0 - 4), m)


def blur_chip(im):
    x0, y0, x1, y1 = CHIP
    inner = (x0 + 6, y0 + 6, x1 - 6, y1 - 6)
    region = im.crop(inner)
    region = region.filter(ImageFilter.GaussianBlur(14)).filter(ImageFilter.GaussianBlur(14))
    mask = Image.new('L', region.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, region.size[0] - 1, region.size[1] - 1), radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    im.paste(region, inner[:2], mask)


def main():
    for lang in ('en', 'es'):
        for page in PAGES:
            p = os.path.join(ROOT, f'assets/dash_{lang}/{page}.png')
            im = Image.open(p)
            mode = im.mode
            im = im.convert('RGBA') if mode == 'RGBA' else im.convert('RGB')
            rgb = im.convert('RGB')
            for name, box, w, px, dark in SLOTS:
                patch_text(rgb, box, w, px, dark)
            blur_chip(rgb)
            if mode == 'RGBA':
                rgb.putalpha(im.getchannel('A'))
            rgb.save(p)
            print('patched', p)


if __name__ == '__main__':
    main()
