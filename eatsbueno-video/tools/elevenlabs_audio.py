"""Soundtrack for launch.html made with ElevenLabs (music + sound effects), synced to the picture.

Usage: ELEVENLABS_API_KEY=... python3 tools/elevenlabs_audio.py [assets/meta_launch.json] [out.wav]

1. Generates one 48 s music track (Music API) whose prompt follows the film's sections, using the
   tension / silence / groove / finale times from meta_launch.json.
2. Generates a small kit of sound effects (Sound Effects API): whoosh, impact, notification ping,
   key click, UI tap, scanner beep, counter tick, logo shimmer.
3. Places every effect at the exact times the picture exports (slams, notifs, keys, taps, whooshes,
   hits, beeps, ticks, logo) and mixes it over the music, keeping the "Exhausting, right?" silence.

Generated audio is cached in assets/eleven/ so re-mixing never re-bills the API.
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'assets/meta_launch.json')))
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'assets/music_launch_eleven.wav')
CACHE = os.path.join(HERE, 'assets/eleven')
KEY = os.environ.get('ELEVENLABS_API_KEY')
SR = 44100
DUR = float(META['duration'])
SIL0, SIL1 = META['silence']
G0, G1 = META['groove']
os.makedirs(CACHE, exist_ok=True)


def post(path, body, dest):
    if os.path.exists(dest):
        return dest
    headers = {'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}
    if KEY:                       # otherwise a cloud "network secret" injects xi-api-key at the proxy
        headers['xi-api-key'] = KEY
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit('ElevenLabs %s -> HTTP %s: %s' % (path, e.code, e.read()[:400].decode(errors='replace')))
    with open(dest, 'wb') as f:
        f.write(data)
    return dest


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


# ---------------- music ----------------
music_prompt = (
    f"Premium product launch film score for a warm, optimistic nutrition app, {DUR:.0f} seconds, 120 BPM. "
    f"0 to {SIL0:.1f}s: tense, anxious build — ticking hi-hats, low pulsing drone, rising tension, getting faster. "
    f"{SIL0:.1f}s to {SIL1:.1f}s: complete silence. "
    f"{SIL1:.1f}s to {G0:.1f}s: a warm bloom — soft felt piano and airy pads, hopeful, like sunlight. "
    f"{G0:.1f}s to {G1:.1f}s: confident modern groove — clean kick and claps, plucked synth arpeggios, warm bass, "
    f"playful and polished, tech product launch energy. "
    f"{G1:.1f}s to the end: a big uplifting final hit, then a gentle resolved outro. Instrumental, no vocals."
)
# a composition plan pins every section to the film's own cue points, so the music turns exactly with the picture
ms = lambda a, b: int(round((b - a) * 1000))
PLAN = {
    'positive_global_styles': ['premium product launch film score', 'warm, optimistic, modern', '120 BPM', 'instrumental', 'polished mix'],
    'negative_global_styles': ['vocals', 'lyrics', 'lo-fi', 'distortion'],
    'sections': [
        {'section_name': 'Diet noise', 'duration_ms': ms(0, SIL0), 'lines': [],
         'positive_local_styles': ['tense anxious build', 'fast ticking hi-hats', 'low pulsing drone', 'rising, getting faster'], 'negative_local_styles': ['melody', 'warmth']},
        {'section_name': 'Breath and bloom', 'duration_ms': ms(SIL0, G0), 'lines': [],
         'positive_local_styles': ['starts in near silence for about 1.6 seconds', 'then a warm bloom', 'soft felt piano', 'airy pads', 'hopeful sunlight'], 'negative_local_styles': ['drums']},
        {'section_name': 'Groove', 'duration_ms': ms(G0, G1), 'lines': [],
         'positive_local_styles': ['confident modern groove', 'clean kick and claps', 'plucked synth arpeggios', 'warm bass', 'playful and polished, tech product launch energy'], 'negative_local_styles': ['breakdown', 'silence']},
        {'section_name': 'Finale', 'duration_ms': ms(G1, DUR), 'lines': [],
         'positive_local_styles': ['big uplifting final hit', 'full warm chords', 'gentle resolved ending'], 'negative_local_styles': ['abrupt stop']},
    ],
}
music = load(post('/v1/music', {'composition_plan': PLAN, 'model_id': 'music_v1'}, os.path.join(CACHE, 'music_plan.mp3')))

# ---------------- sound effects kit ----------------
SFX = {
    'whoosh': ('fast clean cinematic whoosh, airy swish, modern UI transition', 0.8),
    'impact': ('deep cinematic impact hit with short sub boom, punchy, clean tail', 1.2),
    'slam': ('punchy typographic slam, tight low thud with a snap', 0.5),
    'notif': ('soft modern smartphone notification ping, two-tone, short', 0.5),
    'key': ('single soft iPhone keyboard key tap, close mic, very short', 0.5),
    'tap': ('soft UI button tap, glassy click, short', 0.5),
    'beep': ('barcode scanner beep, clean, short', 0.5),
    'tick': ('quick digital counter ticking up, rapid soft clicks', 0.8),
    'logo': ('magical warm shimmer chime, bright sparkle, brand logo reveal', 2.5),
    'scan': ('futuristic laser scanner sweep, quick clean electronic scan', 0.6),
    'success': ('bright satisfying success chime, two rising notes, modern app confirmation', 1.0),
    'pop': ('soft bubbly UI pop, light and round, short', 0.5),
    'riser': ('short cinematic tension riser building into a transition, airy and modern', 1.5),
    'water': ('water pouring into a glass, close, clean, short', 1.2),
    'night': ('soft magical night chime with gentle crickets, calm', 1.6),
    'title': ('elegant cinematic title hit, soft deep boom with a warm bright shimmer tail, premium brand film', 1.8),
    'word': ('huge cinematic bass hit with a short reverse swell into it, punchy, wide, modern trailer', 1.0),
}
kit = {k: load(post('/v1/sound-generation', {'text': t, 'duration_seconds': d, 'prompt_influence': 0.5},
                    os.path.join(CACHE, f'sfx_{k}.mp3'))) for k, (t, d) in SFX.items()}

# ---------------- mix: music bus + effects bus, music ducks under every hit ----------------
N = int(DUR * SR)
mus = np.zeros((N, 2), dtype=np.float32)
# Re-cut the generated track onto the picture, on its own beat grid (120 BPM, groove downbeat at 16.0 s in the
# generated file): (picture start, picture end, source start). Bloom is pulled forward so the groove lands on
# G0; one 4-bar phrase repeats at the scan -> victories seam so the resolve lands on the logo.
GROOVE_SRC = 16.0
SEGS = [(0.0, SIL0, 0.0),
        (SIL1 - 0.95, G0, GROOVE_SRC - (G0 - (SIL1 - 0.95))),
        (G0, 34.4, GROOVE_SRC),
        (34.4, 42.4, GROOVE_SRC + (34.4 - G0) - 8.0),
        (42.4, DUR, GROOVE_SRC + (42.4 - G0) - 8.0)]
XF = int(0.02 * SR)
for p0, p1, src in SEGS:
    a, b, s0 = int(p0 * SR), int(p1 * SR), int(src * SR)
    seg = music[s0:s0 + (b - a)].copy()
    if len(seg) < b - a:
        seg = np.pad(seg, ((0, b - a - len(seg)), (0, 0)))
    fi = int((0.3 if p0 == SIL1 - 0.95 else 0.02) * SR)
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]
    seg[-XF:] *= np.linspace(1, 0, XF)[:, None]
    mus[a:b] += seg[:b - a]
sfx = np.zeros((N, 2), dtype=np.float32)
duck = np.ones(N, dtype=np.float32)


def place(sig, t, gain, pan=0.0, ducks=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    s = sig[: N - i] * gain
    s = s * np.array([np.sqrt(1 - pan) if pan > 0 else 1, np.sqrt(1 + pan) if pan < 0 else 1], dtype=np.float32)
    sfx[i:i + len(s)] += s
    if ducks:                                   # dip the music ~0.4 s around the hit, smooth attack/release
        n, a = int(0.4 * SR), int(0.03 * SR)
        env = np.ones(n, dtype=np.float32) * (1 - ducks)
        env[:a] = np.linspace(1, 1 - ducks, a)
        env[-int(0.25 * SR):] = np.linspace(1 - ducks, 1, int(0.25 * SR))
        j = max(0, i - a)
        seg = duck[j:j + n]
        duck[j:j + n] = np.minimum(seg, env[:len(seg)])


M = lambda k: META.get(k, [])
TITLES, WORDS = M('titles'), M('words')
near = lambda t, pts, w: any(abs(t - p) < w for p in pts)
for t in TITLES:                                  # titles get their own signature hit instead of a swoosh
    place(kit['title'], t - 0.05, 0.55, ducks=0.4)
for t in WORDS:
    place(kit['word'], t - 0.12, 0.6, ducks=0.5)
for t in M('slams'):
    if not near(t, WORDS, 0.1):
        place(kit['slam'] if t < SIL0 else kit['impact'], t, 0.55, ducks=0.35)
for t in M('hits'):
    if not near(t, TITLES + WORDS, 0.2):
        place(kit['impact'], t, 0.5, ducks=0.45)
for t in M('notifs'):
    place(kit['notif'], t, 0.32, pan=0.25)
for k, t in enumerate(M('whooshes')):
    if not near(t, TITLES + WORDS, 0.9):          # no swoosh on top of a title moment
        place(kit['whoosh'], t - 0.4, 0.33, pan=0.35 if k % 2 else -0.35)
for t in M('risers'):
    place(kit['riser'], t - 1.45, 0.3)
for t in M('taps'):
    place(kit['tap'], t, 0.45)
for t in M('beeps'):
    place(kit['beep'], t, 0.42, ducks=0.2)
for t in M('scans'):
    place(kit['scan'], t, 0.35)
for t in M('success'):
    place(kit['success'], t, 0.4, ducks=0.3)
for k, t in enumerate(M('pops')):
    place(kit['pop'], t, 0.3, pan=(k % 3 - 1) * 0.3)
for t in M('ticks'):
    place(kit['tick'], t, 0.26)
for t in M('water'):
    place(kit['water'], t, 0.4)
for t in M('night'):
    place(kit['night'], t, 0.35)
for t in M('logo'):
    place(kit['logo'], t, 0.45, ducks=0.25)
mix = mus * 0.8 * duck[:, None] + sfx
a, b = int(SIL0 * SR), int((SIL1 - 0.95) * SR)
mix[a:b] = 0                                   # the silence beat ...
for t in M('keys'):
    i = int(t * SR); k = kit['key'][: N - i] * (0.3 if SIL0 <= t < SIL1 else 0.18)
    mix[i:i + len(k)] += k                     # ... where only the typing is heard

fade = np.ones(N, dtype=np.float32)
fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mix *= fade[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)       # gentle soft-clip instead of hard peaks
mix /= max(1e-6, np.abs(mix).max() / 0.95)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-',
                '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-ar', str(SR), OUT],
               input=mix.astype(np.float32).tobytes(), check=True)
print('wrote', OUT)
