# Soundtracks for videos 4 and 5 (120 BPM, beat = 0.5 s). usage: python3 music2.py v4|v5
import sys
SR = 44100
# Procedural 120 BPM track synced to v3.js (beat = 0.5 s). Pure stdlib.
import math, random, wave, struct
random.seed(7)
def put(t0, samples, gain=1.0, pan=0.0):
    global L, R, N
    i0 = int(t0 * SR); gl = gain * (1 - max(0, pan)); gr = gain * (1 + min(0, pan))
    for k, v in enumerate(samples):
        i = i0 + k
        if 0 <= i < N: L[i] += v * gl; R[i] += v * gr
def kick(g=1.0):
    n = int(.32 * SR); out = []; ph = 0
    for k in range(n):
        t = k / SR; f = 45 + 110 * math.exp(-t * 28); ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 9) * g + (random.uniform(-1, 1) * math.exp(-t * 300) * .3 * g))
    return out
def noise(dur, decay, lp=.5, g=1.0):
    n = int(dur * SR); out = []; y = 0
    for k in range(n):
        y += lp * (random.uniform(-1, 1) - y); out.append(y * math.exp(-k / SR * decay) * g)
    return out
def hat(): return [v - w for v, w in zip(noise(.06, 70, .95, .5), [0] + noise(.06, 70, .95, .5)[:-1])]
def clap():
    s = noise(.25, 18, .6, .8)
    for o in (0.008, 0.017): s = [a + b for a, b in zip(s, [0] * int(o * SR) + noise(.25 - o, 30, .6, .5))][:len(s)]
    return s
def tone(f, dur, decay, shape='saw', g=.3, attack=.005):
    n = int(dur * SR); out = []
    for k in range(n):
        t = k / SR; p = (t * f) % 1
        v = (2 * p - 1) if shape == 'saw' else (1 if p < .5 else -1) if shape == 'sq' else math.sin(2 * math.pi * p)
        env = min(1, t / attack) * math.exp(-t * decay)
        out.append(v * env * g)
    # gentle lowpass
    y = 0; o2 = []
    for v in out: y += .25 * (v - y); o2.append(y)
    return o2
def boom(g=1.0):
    n = int(1.6 * SR); out = []; ph = 0
    for k in range(n):
        t = k / SR; f = 30 + 90 * math.exp(-t * 6); ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 2.2) * g)
    return [a + b for a, b in zip(out, noise(1.6, 3.5, .35, .55 * g) + [0] * 0)]
def riser(dur, g=.5):
    n = int(dur * SR); out = []; y = 0
    for k in range(n):
        p = k / n; lp = .02 + .6 * p * p; y += lp * (random.uniform(-1, 1) - y); out.append(y * p * p * g)
    return out
def whoosh(dur=.5, g=.6):
    n = int(dur * SR); out = []; y = 0
    for k in range(n):
        p = k / n; lp = .05 + .5 * math.sin(math.pi * p); y += lp * (random.uniform(-1, 1) - y); out.append(y * math.sin(math.pi * p) * g)
    return out
thwack = lambda: [a + b for a, b in zip(noise(.18, 25, .3, .7), tone(90, .18, 20, 'sine', .9))]


ROOTS = [55.0, 43.65, 65.41, 49.0]
CHORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
def bell(f, g=.4):
    n = int(1.2 * SR); return [ (math.sin(2*math.pi*f*k/SR) + .5*math.sin(2*math.pi*f*2.01*k/SR) + .25*math.sin(2*math.pi*f*3.98*k/SR)) * math.exp(-k/SR*4) * g for k in range(n)]
def click(): return [math.sin(2*math.pi*1800*k/SR) * math.exp(-k/SR*120) * .4 for k in range(int(.05*SR))]
def groove(a, b, clap_on=True, arp_on=False, soft=1.0):
    K, Hh, C = kick(soft), hat(), clap()
    t = a
    while t < b - 1e-6:
        bar = int(t // 2) % 4; pos = round((t % 2) / .25)
        if pos % 2 == 0: put(t, K, .9 * soft)
        else: put(t, Hh, .4, .3 if pos % 4 == 1 else -.3)
        if clap_on and pos in (2, 6): put(t, C, .45)
        if pos % 2 == 1: put(t, tone(ROOTS[bar], .22, 9, 'saw', .45), .8)
        t += .25
    if arp_on:
        t = a; i = 0
        while t < b - 1e-6:
            bar = int(t // 2) % 4; f = CHORDS[bar][[0, 1, 2, 1][i % 4]] * (2 if i % 8 >= 4 else 1)
            put(t, tone(f, .2, 14, 'sq', .09), .8, .5 if i % 2 else -.5); t += .125; i += 1
def pad(a, b, g=.06):
    t = a
    while t < b - 1e-6:
        e = min(b, t + 2); bar = int(t // 2) % 4; n = int((e - t) * SR)
        for f in CHORDS[bar] + [CHORDS[bar][0] / 2]:
            put(t, [math.sin(2*math.pi*f*k/SR) * g * min(1, k/(SR*.3)) * min(1, (n-k)/(SR*.3)) for k in range(n)])
        t = e
def hits(ts, g=.55):
    for t in ts: put(t, thwack(), g)
which = sys.argv[1]
if which == 'v4':
    DUR = 45.0
else:
    DUR = 54.0
N = int(SR * DUR); L = [0.0] * N; R = [0.0] * N
if which == 'v4':
    for t in (.75, 1.25, 1.75): put(t, kick(1.1)); put(t, thwack(), .6)
    put(2.2, riser(.8, .6)); put(3.0, boom(.9))
    pad(4, 8.5, .07); hits([4.4])
    groove(8.5, 14.5); hits([9.5, 11.5, 13.5], .6); put(14.0, whoosh(.5, .7))
    groove(14.5, 26.5, arp_on=True); hits([15.0, 19.0, 23.0]); [put(x, whoosh(.5, .6)) for x in (18.3, 22.3, 26.0)]
    put(26.5, boom(.7)); groove(26.5, 32.5, arp_on=True); hits([26.6, 27.1, 29.5, 30.0])
    put(32.0, whoosh(.5, .7)); put(32.5, boom(.8)); pad(32.5, 36.5, .07); hits([32.7, 33.2, 33.7])
    t = 32.5
    while t < 36.5: put(t, hat(), .3); t += .25
    groove(36.5, 40.5, clap_on=True); hits([36.6]); put(40.0, whoosh(.5, .6))
    put(40.5, boom(.8)); pad(40.5, 45, .07); hits([40.8, 41.3, 41.8, 42.3], .5)
else:
    for t in (.75, 1.25, 1.75): put(t, kick(1.1)); put(t, thwack(), .6)
    put(2.2, riser(.8, .6)); put(3.0, boom(.9)); pad(3.0, 4.0, .06)
    groove(4.0, 33.8, clap_on=True, arp_on=False, soft=.85)
    groove(37.0, 47.2, clap_on=True, arp_on=True, soft=.85)
    for a in (11.0, 18.0, 25.0, 32.0, 41.0): put(a - .4, whoosh(.7, .7))
    hits([4.25, 11.25, 18.25, 25.25, 32.25, 41.25], .55)
    for t in (6.6, 10.2, 17.4, 22.4, 24.3, 33.0): put(t, click(), 1)
    pad(33.8, 37.0, .07); put(34.0, riser(1.25, .6))
    put(35.3, boom(.6)); put(35.3, bell(880, .35)); put(35.55, bell(1318.5, .3))
    put(47.2, boom(.8)); pad(47.2, 54, .07); hits([47.6, 48.1, 48.6, 49.1], .5)
    t = 47.2
    while t < 53: put(t, hat(), .25); t += .5
pk = max(max(abs(x) for x in L), max(abs(x) for x in R))
with wave.open(f'music_{which}.wav', 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    fr = bytearray()
    for i in range(N):
        fade = min(1, (DUR - i / SR) / 1.5)
        l = math.tanh(1.6 * L[i] / pk) * .89 * fade; r = math.tanh(1.6 * R[i] / pk) * .89 * fade
        fr += struct.pack('<hh', int(l * 32767), int(r * 32767))
    w.writeframes(bytes(fr))
print('ok', which)
