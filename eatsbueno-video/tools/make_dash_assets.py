"""Builds assets/dash_<lang>/ (the dashboard UI the films show) from the dev team's v1.2.0 screenshots.

Usage: python3 tools/make_dash_assets.py <.../HR_Dashboard/EN> en      -> assets/dash_en (dashboard_launch.html)
       python3 tools/make_dash_assets.py <.../HR_Dashboard/ES> es      -> assets/dash_es (dashboard_launch_es.html)

v1.2.0 keeps the layout the film was built on (same card grid, same HR import steps). The Spanish copy runs longer:
its energy / absenteeism row is 14 px taller (everything below moves down 14 px) and its empty upload card is 9 px
taller. Coordinates are css px of the 1440 px wide page; images are @2x.
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image

SRC, LANG = sys.argv[1], sys.argv[2]
ES = LANG == 'es'
EMPTY_H = 105 if ES else 96          # height of the empty upload card
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, f'assets/dash_{LANG}')
os.makedirs(OUT, exist_ok=True)


def shot(name):
    return Image.open(os.path.join(SRC, f'{name}@2x.png')).convert('RGB')


def crop(im, x, y, w, h):
    return im.crop((int(x * 2), int(y * 2), int((x + w) * 2), int((y + h) * 2)))


# ---- layout: the film's original layout (Spanish: taller trends row)
L = json.loads(open(os.path.join(HERE, 'assets/dash/layout.js')).read().split('=', 1)[1].strip().rstrip(';'))
for k in ('energy', 'absent') if ES else ():
    L['overview'][k]['h'] += 14
    L['overview'][k]['card'][3] += 14
open(os.path.join(OUT, 'layout.js'), 'w').write('window.DASH = ' + json.dumps(L, indent=1) + ';\n')

# ---- overview: the full page, its cards as separate pieces, and a plate with the card areas cleared
full = shot('02_Overview_Desktop_FullPage')
full.save(os.path.join(OUT, 'overview_full.png'))
plate = np.asarray(full).copy()
for k in ('score', 'users', 'part', 'energy', 'absent'):
    o = L['overview'][k]
    crop(full, o['x'], o['y'], o['w'], o['h']).save(os.path.join(OUT, f'{k}.png'))
    x, y, w, h = o['card']
    gutter = plate[int(y * 2):int((y + h) * 2), int(x * 2) - 32:int(x * 2) - 26].reshape(-1, 3)   # page colour beside the card
    plate[int(y * 2) - 20:int((y + h) * 2) + 30, int(x * 2) - 20:int((x + w) * 2) + 20] = np.median(gutter, 0)
Image.fromarray(plate).save(os.path.join(OUT, 'overview_clean.png'))

# ---- sign in, subgroups
shot('08_SignIn').save(os.path.join(OUT, 'login.png'))
shot('05_Subgroups').save(os.path.join(OUT, 'subgroups.png'))

# ---- HR import: the empty page is the plate; every later state is cut from its own screenshot (2 px margin)
H = L['hr']
empty, chosen, ready = shot('06_HR_Import_Upload'), shot('29_HR_Import_FileChosen'), shot('26_HR_Import_ReadyToAccept')
hr = np.asarray(empty).copy()            # the plate has no upload card: the film lays each state on top of it
x, y, w, _ = H['upload']
gutter = hr[int(y * 2):int((y + EMPTY_H) * 2), int(x * 2) - 32:int(x * 2) - 26].reshape(-1, 3)
hr[int(y * 2) - 20:int((y + EMPTY_H) * 2) + 24, int(x * 2) - 20:int((x + w) * 2) + 20] = np.median(gutter, 0)
Image.fromarray(hr).save(os.path.join(OUT, 'hr_clean.png'))
x, y, w, _ = H['upload']
crop(empty, x - 2, y - 2, w + 4, EMPTY_H + 4).save(os.path.join(OUT, 'hr_empty.png'))
crop(chosen, x - 2, y - 2, w + 4, 96 + 4).save(os.path.join(OUT, 'hr_file.png'))
x, y, w, h = H['accepted_result']
crop(ready, x - 2, y - 2, w + 4, h + 4).save(os.path.join(OUT, 'hr_result.png'))
for i, (x, y, w, h) in enumerate(H['strip']):
    crop(empty, x - 2, y - 2, w + 4, h + 4).save(os.path.join(OUT, f'hr_s{i}_up.png'))
    crop(chosen if i < 2 else ready, x - 2, y - 2, w + 4, h + 4).save(os.path.join(OUT, f'hr_s{i}_acc.png'))

# ---- brand files the film reuses unchanged
for f in ('logo.js', 'logo_h.svg', 'logo_h_rev.svg', 'mark_rev.svg'):
    shutil.copy(os.path.join(HERE, 'assets/dash', f), OUT)
print('wrote', OUT)
