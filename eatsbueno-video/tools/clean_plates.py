"""Builds clean phone-screen plates for launch.html from the 1170x2532 app screenshots.

Usage: python3 tools/clean_plates.py <dir with Employee_*_EN.png> assets/screens/clean
Every plate gets: the beige capture strip at the top removed, the real clock / TestFlight
back-link replaced by a uniform 9:41, and the onboarding debug pill removed. A few plates
also have the content that the film animates in removed (it is cut from the original
screenshot at render time), so nothing is ever hidden behind a flat-colour rectangle.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
FONT = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', 52)
os.makedirs(OUT, exist_ok=True)


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, f'Employee_{name}_EN.png')).convert('RGB')).astype(float)


def smooth(row, w=25):
    """Box-blur a boundary row so sensor/JPEG noise doesn't smear into vertical streaks."""
    pad = np.pad(row, ((w, w), (0, 0)), mode='edge')
    c = np.cumsum(pad, 0)
    return (c[2 * w:] - c[:-2 * w]) / (2 * w)


def vfill(a, x0, x1, y0, y1, flat=False):
    """Replace rows y0..y1 in columns x0..x1 by a per-column blend of the rows just outside
    (flat=True: one median colour per edge, for backgrounds that only vary vertically)."""
    top, bot = smooth(a[y0 - 5:y0, x0:x1].mean(0)), smooth(a[y1 + 1:y1 + 6, x0:x1].mean(0))
    if flat:
        top, bot = np.median(top, 0)[None].repeat(x1 - x0, 0), np.median(bot, 0)[None].repeat(x1 - x0, 0)
    k = ((np.arange(y0, y1 + 1) - (y0 - 1)) / (y1 + 2 - y0))[:, None, None]
    a[y0:y1 + 1, x0:x1] = top[None] * (1 - k) + bot[None] * k


def hfill(a, x0, x1, y0, y1):
    """Replace columns x0..x1 in rows y0..y1 by a per-row blend of the columns just outside."""
    lft, rgt = a[y0:y1, x0 - 1], a[y0:y1, min(x1 + 1, a.shape[1] - 1)]
    k = ((np.arange(x0, x1 + 1) - (x0 - 1)) / (x1 + 2 - x0))[None, :, None]
    a[y0:y1, x0:x1 + 1] = lft[:, None] * (1 - k) + rgt[:, None] * k


def top_strip(a):
    n = 0
    while (np.abs(a[n] - [234, 236, 222]).sum(1) < 6).mean() > 0.9:
        n += 1
    if n:
        a[:n] = a[n + 1]
    return n


def clock(a, onboarding, light=False):
    if onboarding:          # time + "◀ TestFlight" stack
        vfill(a, 25, 380, 22, 140)
    else:
        vfill(a, 110, 280, 48, 108)
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    ImageDraw.Draw(im).text((191, 78), '9:41', font=FONT, anchor='mm', fill=(255, 255, 255) if light else (0, 0, 0))
    return np.asarray(im).astype(float)


def pill(a):
    """The white 'change_account.button' debug pill (and its soft shadow) on the onboarding steps.
    Nothing else lives in that band, so it is blended row-wise across the full width."""
    vfill(a, 0, a.shape[1], 135, 322)


def save(a, name):
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, name + '.jpg'), quality=92)


for name, onb in [('Welcome', 0), ('Onboarding_Step1', 1), ('Onboarding_Step2', 1), ('Onboarding_Step7', 1),
                  ('Coach_Conversation', 0), ('Scanner_Barcode', 0), ('SleepRecovery', 0), ('SleepRecovery_Clean', 0), ('Hydration_FirstUse', 0), ('Hydration_InProgress', 0),
                  ('Statistics_Month', 0)]:
    a = load(name)
    top_strip(a)
    a = clock(a, onb, light=name == 'Welcome')
    if onb:
        pill(a)
    save(a, name)

    if name == 'Onboarding_Step7':      # before typing: no greeting, no name, empty avatar
        b = a.copy()
        vfill(b, 60, 1110, 1395, 1680)      # "Hello," + "Srushti" (the underline below stays)
        vfill(b, 60, 1110, 1780, 1860)      # "Welcome aboard, Srushti"
        yy, xx = np.mgrid[0:b.shape[0], 0:b.shape[1]]
        r = np.hypot(xx - 585, yy - 1152)
        ring = b[(r > 112) & (r < 128)]
        b[r < 118] = np.median(ring, 0)
        save(b, name + '_Empty')
    if name == 'SleepRecovery':          # before logging: no "Sleep logged" toast (it pops in on cue)
        b = a.copy()
        vfill(b, 30, 1140, 2290, 2486)       # the toast and the button it sits on -> plain card
        b[2290:2478, 45:48] = b[2280, 46]          # redraw the card's side and bottom borders the toast covered
        b[2290:2478, 1122:1125] = b[2280, 1123]
        b[2476:2479, 60:1108] = b[2280, 46]
        save(b, name + '_NoToast')
    if name == 'Coach_Conversation':    # empty thread: no user bubble, no answer
        b = a.copy()
        vfill(b, 0, 1170, 312, 2118, flat=True)
        save(b, name + '_Empty')
    if name == 'Scanner_Barcode':       # before the scan: no product card
        b = a.copy()
        vfill(b, 0, 1170, 1738, 2148)
        save(b, name + '_Empty')
