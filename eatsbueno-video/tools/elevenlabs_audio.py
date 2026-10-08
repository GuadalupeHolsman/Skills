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
    f"playful and polished, Apple-keynote energy. "
    f"{G1:.1f}s to the end: a big uplifting final hit, then a gentle resolved outro. Instrumental, no vocals."
)
music = load(post('/v1/music', {'prompt': music_prompt, 'music_length_ms': int(DUR * 1000)}, os.path.join(CACHE, 'music.mp3')))

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
}
kit = {k: load(post('/v1/sound-generation', {'text': t, 'duration_seconds': d, 'prompt_influence': 0.5},
                    os.path.join(CACHE, f'sfx_{k}.mp3'))) for k, (t, d) in SFX.items()}

# ---------------- mix: music bus + effects bus, music ducks under every hit ----------------
N = int(DUR * SR)
mus = np.zeros((N, 2), dtype=np.float32)
m = music[:N]
mus[:len(m)] += m
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
for t in M('slams'):
    place(kit['slam'] if t < SIL0 else kit['impact'], t, 0.55, ducks=0.35)
for t in M('hits'):
    place(kit['impact'], t, 0.5, ducks=0.45)
for t in M('notifs'):
    place(kit['notif'], t, 0.32, pan=0.25)
for k, t in enumerate(M('whooshes')):
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
