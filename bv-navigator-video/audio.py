import json, numpy as np, wave
SR = 48000
d = json.load(open('sfx.json')); DUR = d['dur']; EV = d['sfx']
N = int(SR * (DUR + 0.5))
rng = np.random.default_rng(7)
mus = np.zeros((N, 2)); fx = np.zeros((N, 2))

def mf(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR
def add(buf, t0, sig, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[:N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * g * l * 1.414
    buf[i:i + len(sig), 1] += sig * g * r * 1.414
def env(n, a, r, curve=1.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    if nr < n: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def bandnoise(n, lo, hi):
    x = rng.standard_normal(n); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def additive(freq, dur, nh=10, roll=1.3, detune=(0,), decay_h=0.0):
    n = int(dur * SR); t = tt(n); s = np.zeros(n)
    for dc in detune:
        f0 = freq * 2 ** (dc / 1200); ph = rng.random() * 6.28
        for h in range(1, nh + 1):
            if f0 * h > 16000: break
            a = 1 / h ** roll
            if decay_h: a = a * np.exp(-t * decay_h * h)
            s += a * np.sin(2 * np.pi * f0 * h * t + ph * h)
    return s / len(detune)

# ---------------- instruments ----------------
def kick(g=1.0, dec=.38):
    n = int(.6 * SR); t = tt(n); f = 45 + 110 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec * 2.2)
    s[:200] += bandnoise(200, 2000, 8000) * .3
    return np.tanh(s * 1.6) * g
def clap():
    n = int(.35 * SR); t = tt(n); nz = bandnoise(n, 900, 5000); e = np.zeros(n)
    for o in (0, .011, .022): i = int(o * SR); e[i:] += np.exp(-(t[:n - i]) * 40) * .6
    e += np.exp(-t * 13) * .5; return nz * e * .5
def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); t = tt(n)
    return bandnoise(n, 7000, 16000) * np.exp(-t * (18 if open_ else 80)) * .16
def bass(m, dur, g=1.0):
    s = additive(mf(m), dur, nh=9, roll=1.15, detune=(-4, 4))
    return np.tanh(s * 1.4) * env(len(s), .005, .05) * np.exp(-tt(len(s)) * 2.0) * g
def pluck(m, dur=.35, g=1.0):
    s = additive(mf(m), dur, nh=8, roll=1.0, decay_h=4.5)
    return s * env(len(s), .002, .1) * np.exp(-tt(len(s)) * 7) * g
def pad(ms, dur, a=.8, r=1.2, g=1.0, nh=8):
    n = int(dur * SR); s = np.zeros(n)
    for m in ms: s += additive(mf(m), dur, nh=nh, roll=1.6, detune=(-9, 0, 9))
    lfo = 1 + .12 * np.sin(2 * np.pi * .25 * tt(n))
    return s * env(n, a, r) * lfo * g / len(ms)
def boom(g=1.0, f0=55, dec=2.2):
    n = int(dec * 1.3 * SR); t = tt(n); f = f0 * (1 + 1.5 * np.exp(-t * 6))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec * 3)
    nz = bandnoise(n, 200, 9000) * np.exp(-t * 3.2) * .35
    return np.tanh((s + nz) * 1.5) * g
def whoosh(dur=.7, up=True, g=1.0):
    n = int(dur * SR); t = tt(n); x = rng.standard_normal(n)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X *= np.exp(-((f - 1800) / 2500) ** 2) + .15 * (f < 6000); y = np.fft.irfft(X, n)
    y /= np.abs(y).max(); e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** (1.5 if up else 1)
    return y * e * .55 * g
def riser(dur, g=1.0):
    n = int(dur * SR); t = tt(n); p = t / dur
    sw = np.sin(2 * np.pi * np.cumsum(200 + 1600 * p ** 2) / SR) * .25
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1 / SR); X *= (f > 1500); nz = np.fft.irfft(X, n); nz /= np.abs(nz).max()
    return (sw + nz * .5) * p ** 2.2 * g
def blip(f0, f1, dur, g=1.0):
    n = int(dur * SR); t = tt(n); f = f0 + (f1 - f0) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dur * 4) * env(n, .003, .02) * g
def bell(f0, dur=.9, g=1.0):
    n = int(dur * SR); t = tt(n)
    s = np.sin(2 * np.pi * f0 * t) + .5 * np.sin(2 * np.pi * f0 * 2.76 * t) * np.exp(-t * 6) + .25 * np.sin(2 * np.pi * f0 * 5.4 * t) * np.exp(-t * 10)
    return s * np.exp(-t * 5) * env(n, .002, .05) * g
def stab(ms, dur=.7, g=1.0):
    n = int(dur * SR); s = sum(additive(mf(m), dur, nh=14, roll=.9, detune=(-12, 12)) for m in ms)
    return np.tanh(s * 1.2) * np.exp(-tt(n) * 3) * env(n, .005, .2) * g / len(ms)

# ---------------- MUSIC (v2: uplifting, major key) ----------------
B = .5
PROG = [(38, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (43, [62, 67, 71])]  # D A Bm G
def chord_at(t): return PROG[int(t // 2) % 4]
pump = np.zeros((N, 2)); KICKS = []
def ep(m, dur=1.2, g=1.0):  # electric piano / tine
    n = int(dur * SR); t = tt(n); f = mf(m)
    s = np.sin(2*np.pi*f*t + .8*np.sin(2*np.pi*f*t)*np.exp(-t*3)) + .35*np.sin(2*np.pi*f*4*t)*np.exp(-t*14)
    return s * np.exp(-t*2.2) * env(n, .003, .15) * g
def saws(ms, dur, g=1.0):
    n = int(dur * SR); s = sum(additive(mf(m), dur, nh=12, roll=1.1, detune=(-18, -7, 0, 7, 18)) for m in ms)
    return s * env(n, .01, .12) * g / len(ms)
def snare(g=1.0):
    n = int(.4 * SR); t = tt(n)
    body = np.sin(2*np.pi*190*t) * np.exp(-t*25)
    return (bandnoise(n, 1200, 9000)*np.exp(-t*14)*.7 + body*.5) * g
def shaker(g=1.0):
    n = int(.07 * SR); t = tt(n); return bandnoise(n, 5000, 14000) * np.sin(np.pi*t/.07)**2 * .18 * g
def K(t, g=1.0): add(mus, t, kick(g)); KICKS.append(t)

# intro 0-7.2: tine arpeggio + warm pad + heartbeat
add(mus, 0, pad([38, 50, 57, 62], 7.6, a=2.5, r=1.5, g=.5, nh=10))
for k, t in enumerate(np.arange(.4, 7.0, .75)):
    add(mus, t, ep([74, 69, 66, 78, 74, 69, 81, 78, 74][k % 9], 1.6, .22), pan=np.sin(k)*.4)
for t in np.arange(2.0, 7.0, 1.0): add(mus, t, kick(.3, .5))
# tension 7-15.2: Bm pulse, clock ticks, swelling saws
for i, t in enumerate(np.arange(7.0, 15.0, B/2)):
    p = (t-7)/8
    add(mus, t, bass(35, .2, .3 + .45*p))
    add(mus, t, shaker(.8 + p), pan=.3 if i % 2 else -.3)
for t in np.arange(11.0, 15.0, B): K(t, .5 + .1*(t-11))
add(mus, 7.0, pad([47, 54, 59, 62, 66], 8.3, a=5, r=.4, g=.3))
add(fx, 13.2, riser(2.0, .35))
# reveal 15.2-22: big D add9 + bell motif
add(mus, 15.2, saws([50, 57, 62, 66, 69, 76], 3.6, .32))
add(mus, 15.2, pad([38, 50, 57, 62, 64, 69], 6.6, a=.05, r=2.0, g=.55, nh=10))
add(mus, 18.8, pad([43, 55, 62, 67, 71], 3.4, a=.6, r=1.0, g=.45, nh=10))
for t, m in [(16.6, 78), (17.0, 76), (17.4, 74), (17.8, 69), (18.8, 71), (19.2, 74), (19.6, 76), (20.4, 74)]:
    add(mus, t, bell(mf(m), 1.4, .16)); add(mus, t, ep(m-12, 1.4, .12))
add(mus, 21.0, riser(1.0, .3))
# main groove 22-78.6 (syncopated, sidechained saws)
G0, G1 = 22.0, 78.0
KP = [0, 3, 6, 10]          # kick 16th positions in a bar of 16 (with variation)
for bar in np.arange(G0, G1, 2.0):
    root, ch = chord_at(bar - G0); full = bar >= 27.5
    for s16 in range(16):
        t = bar + s16*B/2/2*2/2 if False else bar + s16*.125
        if s16 in (0, 4, 8, 12) or (full and s16 in (7, 14)): K(t, .95 if s16 % 4 == 0 else .6)
        if full and s16 in (4, 12): add(mus, t, snare(), g=.75); add(mus, t, clap(), g=.35)
        if s16 % 2 == 1 or full: add(mus, t, shaker(.7 if s16 % 4 == 2 else .4), pan=.25*np.sin(s16))
        if s16 % 4 == 2: add(mus, t, hat(open_=(s16 == 14)), pan=-.2, g=.6)
        if s16 in (0, 3, 6, 8, 11, 14): add(mus, t, bass(root-12+(12 if s16 in (6, 14) else 0), .2, .8))
        if full and s16 % 2 == 0:
            tones = ch + [ch[0]+12, ch[1]+12]
            add(mus, t, ep(tones[[0, 2, 1, 3, 2, 4, 3, 1][(s16//2) % 8]], .5, .11), pan=.4*np.sin(s16*.9+bar))
    # offbeat saw stabs into pump bus
    for off in (.25, .75, 1.25, 1.75):
        add(pump, bar+off, saws(ch, .22, .22 if full else .12))
    add(pump, bar, pad(ch+[ch[0]-12], 2.1, a=.08, r=.3, g=.3))
# melodic hook every 8 bars after 30s
HOOK = [(0, 78), (.5, 76), (.75, 74), (1.0, 76), (1.5, 81), (2.5, 78), (3.0, 76), (3.5, 74), (4.0, 73), (4.5, 74), (5.0, 76), (6.0, 69)]
for st in (30.0, 46.0, 62.0):
    for o, m in HOOK: add(mus, st+o, bell(mf(m), .9, .12), pan=.2); add(mus, st+o, ep(m, .9, .1))
for t in (27.4, 41.0, 48.6, 60.4, 71.2): add(mus, t, hat(True), g=1.3)
# breakdown 78-84.2 (map): filtered pads, rising arps, snare build
add(mus, 78.0, pad([38, 50, 57, 62, 66, 69], 3.2, a=.3, r=.6, g=.5))
add(mus, 81.1, pad([43, 55, 59, 62, 67, 71], 3.2, a=.2, r=.3, g=.5))
for k, t in enumerate(np.arange(78.0, 84.2, B/2)):
    add(mus, t, ep([74, 78, 81, 86][k % 4], .4, .1 + .1*(t-78)/6.2), pan=np.sin(k)*.4)
for t in np.arange(78.0, 82.2, B): K(t, .45)
for t in np.arange(82.2, 84.15, B/4): add(mus, t, snare(), g=.12 + .55*(t-82.2)/2)
# finale 84.2+
add(mus, 84.2, saws([50, 57, 62, 66, 69, 74, 78], 2.0, .3))
add(mus, 84.2, pad([38, 50, 57, 62, 66, 69, 76], 5.6, a=.02, r=3.5, g=.85, nh=12))
add(mus, 84.2, bass(26, 3.0, .9)); K(84.2, 1.0)
for t, m in [(84.7, 78), (85.1, 76), (85.5, 74), (85.9, 81), (86.7, 78), (87.4, 74)]:
    add(mus, t, bell(mf(m), 1.6, .15)); add(mus, t, ep(m-12, 1.6, .1))
# sidechain pump
duck = np.ones(N)
for kt in KICKS:
    i0 = int(kt*SR); n = min(int(.32*SR), N-i0)
    if n > 0: duck[i0:i0+n] = np.minimum(duck[i0:i0+n], 1 - .7*np.exp(-np.arange(n)/SR/.09))
mus += pump * duck[:, None]

# ---------------- SFX ----------------
for e in EV:
    t, v, ty = e['t'], e['v'], e['type']
    if ty == 'type':
        n = int(.012 * SR); s = bandnoise(n, 2500, 9000) * np.exp(-tt(n) * 500)
        add(fx, t, s, pan=rng.uniform(-.2, .2), g=.12 * v * rng.uniform(.6, 1.1))
    elif ty == 'click':
        add(fx, t, blip(2400, 1800, .025, .25 * v)); add(fx, t + .035, blip(1800, 1500, .02, .15 * v))
    elif ty == 'tick': add(fx, t, blip(2200, 2000, .02, .12 * v))
    elif ty == 'stream': add(fx, t, blip(3000, 2800, .012, .05 * v))
    elif ty == 'pop': add(fx, t, blip(520, 980, .09, .3 * v))
    elif ty == 'check': add(fx, t, blip(700, 1400, .08, .3 * v)); add(fx, t + .06, bell(1760, .3, .06))
    elif ty == 'ding': add(fx, t, bell(1568 if rng.random() < .5 else 1760, .8, .12 * v), pan=rng.uniform(-.4, .4))
    elif ty == 'whoosh': add(fx, t - .25, whoosh(.7, g=.9 * v))
    elif ty == 'send': add(fx, t, whoosh(.35, g=.5)); add(fx, t, blip(600, 1400, .12, .2))
    elif ty == 'paper': add(fx, t, bandnoise(int(.3 * SR), 1200, 6000) * np.sin(np.pi * np.linspace(0, 1, int(.3 * SR))) * .22 * v)
    elif ty == 'riser': pass
    elif ty == 'suck':
        w = whoosh(1.0, g=.9 * v)[::-1]; add(fx, t, w); add(fx, t, riser(1.0, .4 * v))
    elif ty == 'impact': add(fx, t, boom(.95 * v, 50, 2.4))
    elif ty == 'slam':
        add(fx, t, boom(.8 * v, 60, .9)); add(fx, t, kick(.9)); add(fx, t, stab([45, 46, 57], .5, .25))
    elif ty == 'hit': add(fx, t, boom(.45 * v, 80, .6))
    elif ty == 'alarm': add(fx, t, stab([45, 51, 57], .9, .4 * v)); add(fx, t, boom(.4, 55, .7))
    elif ty == 'alarm2': add(fx, t, stab([57, 63], .5, .25 * v))
    elif ty == 'shimmer':
        n = int(2.2 * SR); tq = tt(n)
        s = sum(np.sin(2 * np.pi * f * tq * (1 + .02 * tq)) for f in (1320, 1980, 2640, 3520)) * env(n, 1.4, .8) * .03
        add(fx, t, s)
add(fx, 5.8, riser(1.3, .5)); add(fx, 81.8, riser(2.4, .55))

# ---------------- mix ----------------
def reverb(x, sec=2.2, wet=.22):
    n = int(sec * SR); t = tt(n); out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / sec); ir[:int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))
        L = 1 << int(np.ceil(np.log2(len(x) + n)))
        y = np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir, L), L)[:len(x)]
        out[:, c] = y / (np.abs(y).max() + 1e-9) * np.abs(x[:, c]).max()
    return x + out * wet
mus = reverb(mus, 2.4, .28); fx = reverb(fx, 1.6, .18)
mus /= np.abs(mus).max(); fx /= np.abs(fx).max()
mix = mus * .72 + fx * .62
fade = np.ones(N); fs = int((DUR-1.0) * SR); fe = int(DUR * SR)
fade[fs:fe] = np.linspace(1, 0, fe - fs); fade[fe:] = 0
mix *= fade[:, None]
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
mix = mix / np.abs(mix).max() * .89
mix = mix[:int(DUR * SR)]
pcm = (mix * 32767).astype(np.int16)
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR)
