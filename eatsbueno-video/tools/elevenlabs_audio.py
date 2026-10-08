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
    if not KEY:
        sys.exit('ELEVENLABS_API_KEY is not set (and %s is not cached yet)' % os.path.basename(dest))
    req = urllib.request.Request('https://api.elevenlabs.io' + path, data=json.dumps(body).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, 'wb') as f:
        f.write(r.read())
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
}
kit = {k: load(post('/v1/sound-generation', {'text': t, 'duration_seconds': d, 'prompt_influence': 0.5},
                    os.path.join(CACHE, f'sfx_{k}.mp3'))) for k, (t, d) in SFX.items()}

# ---------------- mix ----------------
N = int(DUR * SR)
mix = np.zeros((N, 2), dtype=np.float32)
m = music[:N]
mix[:len(m)] += m * 0.8


def place(sig, t, gain):
    i = int(t * SR)
    if i >= N:
        return
    s = sig[: N - i] * gain
    mix[i:i + len(s)] += s


for t in META['slams']:
    place(kit['slam'] if t < SIL0 else kit['impact'], t, 0.55)
for t in META['hits']:
    place(kit['impact'], t, 0.5)
for t in META['notifs']:
    place(kit['notif'], t, 0.35)
for t in META['whooshes']:
    place(kit['whoosh'], t - 0.4, 0.35)
for t in META['taps']:
    place(kit['tap'], t, 0.45)
for t in META['beeps']:
    place(kit['beep'], t, 0.4)
for t in META['ticks']:
    place(kit['tick'], t, 0.3)
for t in META['logo']:
    place(kit['logo'], t, 0.45)
a, b = int(SIL0 * SR), int((SIL1 - 0.95) * SR)
mix[a:b] = 0                                   # the silence beat ...
for t in META['keys']:
    place(kit['key'], t, 0.3 if SIL0 <= t < SIL1 else 0.18)   # ... where only the typing is heard

fade = np.ones(N, dtype=np.float32)
fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mix *= fade[:, None]
mix /= max(1e-6, np.abs(mix).max() / 0.9)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', OUT],
               input=mix.astype(np.float32).tobytes(), check=True)
print('wrote', OUT)
