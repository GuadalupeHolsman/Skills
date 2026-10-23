"""Soundtrack for dashboard_launch.html (EatsBueno Institutional) made with ElevenLabs, synced to the picture.

Usage: python3 tools/elevenlabs_dash_audio.py assets/meta_dash.json assets/music_dash_eleven.wav

The music is generated with a composition plan whose sections end exactly on the film's cue points
(hook, brand reveal, product walkthrough, outro). Sound effects reuse the cached kit in assets/eleven/
(generated once for the consumer film) plus two calm UI sounds for the dashboard. The API key comes from the
environment's network secret (the proxy adds xi-api-key), or ELEVENLABS_API_KEY if set.
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
CACHE = os.path.join(HERE, 'assets/eleven')
KEY = os.environ.get('ELEVENLABS_API_KEY')
SR = 44100
DUR = float(META['duration'])
CUES = [6.4, 9.8, DUR - 4.8]     # hook | brand | product | outro (the outro is always the last 4.8 s)


def post(path, body, dest):
    if os.path.exists(dest):
        return dest
    headers = {'Content-Type': 'application/json', 'Accept': 'audio/mpeg'}
    if KEY:
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


ms = lambda a, b: int(round((b - a) * 1000))
HK, AP, BN = META['hook'], META['app'], META['benefits']
CUES = [HK[1], AP[0], AP[1], BN[0], BN[1]]
PLAN = {
    'positive_global_styles': ['premium brand film score', 'warm modern Latin-tinged pop groove', 'marimba and plucked nylon guitar', 'tight claps and shakers',
                               'warm round bass', 'uplifting and confident', '118 BPM', 'instrumental', 'polished wide mix'],
    'negative_global_styles': ['vocals', 'lyrics', 'corporate stock music cliches', 'cheesy ukulele', 'aggressive EDM drops', 'distortion', 'lo-fi'],
    'sections': [
        {'section_name': 'Hook', 'duration_ms': ms(0, CUES[0]), 'lines': [],
         'positive_local_styles': ['three punchy percussive stabs with claps', 'tension building', 'then a sudden hush with a single held synth note and a soft heartbeat kick'],
         'negative_local_styles': ['full groove']},
        {'section_name': 'Bloom', 'duration_ms': ms(CUES[0], CUES[1]), 'lines': [],
         'positive_local_styles': ['big warm bloom', 'bright marimba motif enters', 'airy pads open up', 'hopeful major key'], 'negative_local_styles': ['silence']},
        {'section_name': 'Your people', 'duration_ms': ms(CUES[1], CUES[2]), 'lines': [],
         'positive_local_styles': ['light playful groove starts', 'shakers and plucked guitar', 'warm bass enters'], 'negative_local_styles': ['heavy drums']},
        {'section_name': 'Walkthrough', 'duration_ms': ms(CUES[2], CUES[3]), 'lines': [],
         'positive_local_styles': ['steady confident groove', 'claps on two and four', 'marimba arpeggios', 'subtle builds every eight bars', 'focused, modern, premium'],
         'negative_local_styles': ['breakdown', 'silence', 'big drops']},
        {'section_name': 'Benefits', 'duration_ms': ms(CUES[3], CUES[4]), 'lines': [],
         'positive_local_styles': ['lift: fuller, brighter arrangement', 'added strings and handclaps', 'rising energy toward the end'], 'negative_local_styles': ['silence']},
        {'section_name': 'Finale', 'duration_ms': ms(CUES[4], DUR), 'lines': [],
         'positive_local_styles': ['one big warm final hit', 'marimba motif resolves', 'gentle ending'], 'negative_local_styles': ['abrupt stop']},
    ],
}
music = load(post('/v1/music', {'composition_plan': PLAN, 'model_id': 'music_v1'}, os.path.join(CACHE, f'music_dash_v2_{int(round(DUR * 10))}.mp3')))

KIT = {k: load(os.path.join(CACHE, f'sfx_{k}.mp3')) for k in ['whoosh', 'tap', 'key', 'pop', 'tick', 'success', 'title', 'logo', 'scan', 'impact']}
for k, (text, d) in {'click': ('soft trackpad click, quiet and precise, modern laptop', 0.5),
                     'swish': ('very soft UI page transition swish, subtle and airy', 0.6),
                     'slam2': ('punchy cinematic hit, tight deep thump with a crisp clap on top, short', 0.6),
                     'swoosh2': ('smooth airy camera whoosh, soft and wide, premium', 0.8),
                     'pop2': ('soft wooden marimba pop, single note, warm and round', 0.5),
                     'tick2': ('soft wooden tick, tiny and precise', 0.5),
                     'stamp': ('rubber stamp pressed firmly on paper, satisfying thud', 0.6),
                     'lock': ('small padlock clicking shut, clean metallic click', 0.5),
                     'bloom': ('magical warm bloom swell with shimmering chimes, rising into a soft impact', 1.6)}.items():
    KIT[k] = load(post('/v1/sound-generation', {'text': text, 'duration_seconds': d, 'prompt_influence': 0.55}, os.path.join(CACHE, f'sfx_{k}.mp3')))

N = int(DUR * SR)
mus = np.zeros((N, 2), dtype=np.float32)
mus[:min(N, len(music))] = music[:N]
sfx = np.zeros((N, 2), dtype=np.float32)
duck = np.ones(N, dtype=np.float32)


def place(sig, t, gain, pan=0.0, ducks=0.0):
    i = int(t * SR)
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    s = sig[: N - i] * gain
    s = s * np.array([np.sqrt(1 - pan) if pan > 0 else 1, np.sqrt(1 + pan) if pan < 0 else 1], dtype=np.float32)
    sfx[i:i + len(s)] += s
    if ducks:
        n, a = int(0.45 * SR), int(0.03 * SR)
        env = np.ones(n, dtype=np.float32) * (1 - ducks)
        env[:a] = np.linspace(1, 1 - ducks, a)
        env[-int(0.25 * SR):] = np.linspace(1 - ducks, 1, int(0.25 * SR))
        j = max(0, i - a)
        seg = duck[j:j + n]
        duck[j:j + n] = np.minimum(seg, env[:len(seg)])


M = lambda k: META.get(k, [])
near = lambda t, pts, w: any(abs(t - p) < w for p in pts)
for t in M('slams'):
    place(KIT['slam2'], t - 0.01, 0.62, ducks=0.45)
for t in M('titles'):
    if not near(t, M('slams'), 0.5):
        place(KIT['title'], t - 0.05, 0.32, ducks=0.25)
for k, t in enumerate(M('whooshes')):
    if not near(t, M('titles') + M('slams'), 0.45):
        place(KIT['swoosh2'], t - 0.25, 0.4, pan=0.3 if k % 2 else -0.3)
for t in M('taps'):
    place(KIT['click'], t, 0.7)
for t in M('keys'):
    place(KIT['key'], t, 0.16)
for k, t in enumerate(M('pops')):
    place(KIT['pop2'], t, 0.3, pan=(k % 3 - 1) * 0.3)
for t in M('ticks'):
    place(KIT['tick2'], t, 0.32)
for t in M('scans'):
    place(KIT['scan'], t, 0.2)
for t in M('success'):
    place(KIT['success'], t, 0.3, ducks=0.25)
for t in M('stamps'):
    place(KIT['stamp'], t, 0.6, ducks=0.35)
for t in M('locks'):
    place(KIT['lock'], t, 0.5)
for t in M('hits'):
    place(KIT['impact'], t - 0.02, 0.42, ducks=0.4)
for t in M('logo'):
    place(KIT['bloom'], t - 0.6, 0.42, ducks=0.3)
mix = mus * 0.85 * duck[:, None] + sfx
fade = np.ones(N, dtype=np.float32)
fade[-int(1.6 * SR):] = np.linspace(1, 0, int(1.6 * SR))
mix *= fade[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= max(1e-6, np.abs(mix).max() / 0.95)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', str(SR), OUT],
               input=mix.astype(np.float32).tobytes(), check=True)
print('wrote', OUT)
