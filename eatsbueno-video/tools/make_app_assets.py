"""Builds assets/screens/v12_<lang>/ (the phone screens the people films show) from the dev team's v1.2.0
iPhone 6.3" screenshots. EN and ES share one layout, so the same cut-outs serve both languages.

Usage: python3 tools/make_app_assets.py <.../App_dev/EN/iPhone_6.3> en   -> launch_people.html
       python3 tools/make_app_assets.py <.../App_dev/ES/iPhone_6.3> es   -> launch_people_es.html

Each screen is saved under the name the film already uses for its English counterpart, resized to the film's
1170 x 2532 phone grid. Three "before" plates are cut out of the finished screens so the film can build them up:
the name step before typing, the coach thread before the question, the scanner before the product card.
"""
import os
import sys

import numpy as np
from PIL import Image

SRC, LANG = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, f'assets/screens/v12_{LANG}')
os.makedirs(OUT, exist_ok=True)
W, H = 1170, 2532

MAP = {
    'Welcome': 'ACC_03_AuthLanding',
    'Onboarding_Step1': 'FAM_09_Step4_Goal',
    'Onboarding_Step2': 'FAM_10_Step5_Height',
    'Onboarding_Step7': 'FAM_06_Step1_Name',
    'Coach_Conversation': 'COA_02_Conversation',
    'Coach_Conversation_Empty': 'COA_04_NewChat',
    'Scanner_Barcode': 'BAR_31_Green_US_Summary',
    'Hydration_InProgress': 'HYD_03_AfterAdd',
    'Hydration_FirstUse': 'HYD_02_Default',
    'SleepRecovery_NoToast': 'SLP_02_Summary',
    'Statistics_Month': 'STA_01_Top',
    'Scanner_MealSheet': 'BAR_06_MealChooser',
}


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name + '.png')).convert('RGB').resize((W, H), Image.LANCZOS)).astype(float)


def save(a, key):
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, key + '.jpg'), quality=92)


def vfill(a, x0, x1, y0, y1):
    """Rows y0..y1 (fractions of the screen) become a per-column blend of the rows just outside."""
    x0, x1, y0, y1 = int(x0 * W), int(x1 * W), int(y0 * H), int(y1 * H)
    top, bot = a[y0 - 6:y0, x0:x1].mean(0), a[y1 + 1:y1 + 7, x0:x1].mean(0)
    k = ((np.arange(y0, y1 + 1) - (y0 - 1)) / (y1 + 2 - y0))[:, None, None]
    a[y0:y1 + 1, x0:x1] = top[None] * (1 - k) + bot[None] * k


for key, name in MAP.items():
    save(load(name), key)

# name step before typing: no letter in the avatar, no greeting / name / "nice to meet you" line (the underline stays)
a = load(MAP['Onboarding_Step7'])
yy, xx = np.mgrid[0:H, 0:W]
r = np.hypot(xx - 0.5 * W, yy - 0.464 * H)
a[r < 120] = np.median(a[(r > 125) & (r < 140)], 0)
vfill(a, 0.05, 0.95, 0.553, 0.594)
vfill(a, 0.05, 0.95, 0.598, 0.664)
vfill(a, 0.05, 0.95, 0.700, 0.738)
save(a, 'Onboarding_Step7_Empty')

# scanner before the scan: the product card is not there yet
a = load(MAP['Scanner_Barcode'])
vfill(a, 0.0, 1.0, 0.232, 0.442)
save(a, 'Scanner_Barcode_Empty')
# the month before it fills in: the orange (goal met) days of the calendar turn back into plain days
a = load(MAP['Statistics_Month'])
y0, y1 = int(0.52 * H), int(0.77 * H)
cal = a[y0:y1]
orange = (cal[..., 0] > 170) & (cal[..., 1] > 70) & (cal[..., 1] < 190) & (cal[..., 2] < 140) & (cal[..., 0] - cal[..., 2] > 70)
cal[orange] = (cal[orange] * 0 + np.array([246, 243, 238]))
light = (cal.min(-1) > 225) & np.repeat(orange[..., None], 3, -1).any(-1)
save(a, 'Statistics_Month_Empty')
print('wrote', OUT)
