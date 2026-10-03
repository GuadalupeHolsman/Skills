# Procedural 120 BPM track synced to v3.js (beat = 0.5 s). Pure stdlib.
import math, random, wave, struct
SR = 44100; DUR = 32.0; N = int(SR * DUR)
L = [0.0] * N; R = [0.0] * N
random.seed(7)
def put(t0, samples, gain=1.0, pan=0.0):
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

ROOTS = [55.0, 43.65, 65.41, 49.0]          # A F C G
CHORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
groove = [(4, 9.5), (10, 19), (22, 29)]
arp = [(10, 19), (22, 29)]
K, Hh, C = kick(), hat(), clap()
for a, b in groove:
    t = a
    while t < b - 1e-6:
        bar = int(t // 2) % 4; pos = round((t % 2) / .25)
        if pos % 2 == 0: put(t, K, .95)
        else: put(t, Hh, .45, .3 if pos % 4 == 1 else -.3)
        if pos in (2, 6) and a >= 10: put(t, C, .55)
        if pos % 2 == 1: put(t, tone(ROOTS[bar], .22, 9, 'saw', .45), .9)
        t += .25
for a, b in arp:
    t = a; i = 0
    while t < b - 1e-6:
        bar = int(t // 2) % 4; f = CHORDS[bar][[0, 1, 2, 1][i % 4]] * (2 if i % 8 >= 4 else 1)
        put(t, tone(f, .2, 14, 'sq', .10), .8, .5 if i % 2 else -.5); t += .125; i += 1
# intro & breakdown
for t in (1.0, 1.5, 2.0, 2.5): put(t, kick(1.1), 1); put(t, thwack(), .6)
put(2.8, riser(1.2, .7))
for t, d in ((9.3, .7), (13.4, .6), (18.4, .6), (24.6, .4), (28.4, .6)): put(t, whoosh(d, .7))
put(19.4, riser(1.6, .8))
t = 20.0
while t < 21.0: put(t, C, .35 + (t - 20) * .4); t += .125 if t < 20.5 else .0625
for t in (10.0, 14.0, 29.0): put(t, boom(.8))
put(21.0, boom(1.3)); put(21.0, noise(1.2, 3, .9, .6))
for t in (10.5, 11.0, 11.5, 14.5, 15.0, 22.0, 23.0, 23.5, 25.5, 26.5, 27.5, 29.5, 30.0, 30.5, 31.0): put(t, thwack(), .55)
# pad under breakdown & ending
for (a, b, ch) in ((19.0, 21.0, CHORDS[0]), (29.0, 32.0, CHORDS[1])):
    for f in ch:
        n = int((b - a) * SR)
        put(a, [math.sin(2 * math.pi * f * k / SR) * .06 * min(1, k / (SR * .4)) * min(1, (n - k) / (SR * .5)) for k in range(n)])
for t in (29.0, 29.5, 30.0, 30.5, 31.0, 31.5): put(t, Hh, .3)
# master: soft clip + fade
pk = max(max(abs(x) for x in L), max(abs(x) for x in R))
with wave.open('music_v3.wav', 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    fr = bytearray()
    for i in range(N):
        fade = min(1, (DUR - i / SR) / 1.2)
        l = math.tanh(1.6 * L[i] / pk) * .89 * fade; r = math.tanh(1.6 * R[i] / pk) * .89 * fade
        fr += struct.pack('<hh', int(l * 32767), int(r * 32767))
    w.writeframes(bytes(fr))
print('ok')
