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

# ---------------- MUSIC ----------------
B = .5  # beat (120bpm)
PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
def chord_at(t): return PROG[int(t // 2) % 4]

# intro drone 0-7.2
add(mus, 0, pad([33, 40, 45], 7.6, a=3.0, r=1.5, g=.55, nh=12))
add(mus, .3, pad([76, 81, 83], 5.5, a=2.5, r=2.5, g=.06), g=1)
for t in np.arange(2.0, 7.0, 1.0): add(mus, t, kick(.35, .5)); add(mus, t + .25, kick(.18, .4))
# tension 7-15.2 : 8th bass pulse + 16th hats, crescendo
for i, t in enumerate(np.arange(7.0, 15.0, B / 2)):
    p = (t - 7) / 8
    add(mus, t, bass(33 if int(t) % 4 < 2 else 34, .22, .35 + .45 * p))
    add(mus, t, hat(), pan=.3 if i % 2 else -.3, g=.4 + .8 * p)
for t in np.arange(11.0, 15.0, B): add(mus, t, kick(.55 + .1 * (t - 11)))
add(mus, 7.0, pad([45, 52, 57, 58], 8.4, a=4, r=.5, g=.25))  # dissonant b9 tension
# reveal 15.2-22
add(mus, 15.2, pad([41, 53, 57, 60, 67], 3.7, a=.05, r=1.5, g=.7, nh=10))
add(mus, 18.6, pad([36, 48, 55, 60, 64, 74], 4.0, a=.4, r=1.0, g=.6, nh=10))
for k, t in enumerate(np.arange(16.5, 22.0, B / 2)):
    _, ch = PROG[1] if t < 18.6 else PROG[2]
    tones = ch + [ch[0] + 12, ch[1] + 12]
    add(mus, t, pluck(tones[k % 5] + 12, .4, .18 + .1 * (t - 16.5) / 5.5), pan=np.sin(k) * .5)
add(mus, 21.0, riser(1.0, .35))
# main groove 22-78
G0, G1 = 22.0, 78.0
for k, t in enumerate(np.arange(G0, G1, B / 4)):
    beat = k / 4; root, ch = chord_at(t - G0)
    full = t >= 27.5
    if k % 4 == 0: add(mus, t, kick(.95))
    if full and k % 8 == 4: add(mus, t, clap(), g=.75)
    if k % 4 == 2: add(mus, t, hat(open_=(k % 16 == 14)), pan=.25, g=.8)
    elif full and k % 2 == 1: add(mus, t, hat(), pan=-.2, g=.35)
    if k % 2 == 0: add(mus, t, bass(root - 12 + (12 if k % 8 == 6 else 0), .24, .75))
    if full:
        tones = ch + [ch[0] + 12]; pat = [0, 1, 2, 3, 2, 1, 2, 3]
        add(mus, t, pluck(tones[pat[k % 8]] + 12, .3, .16), pan=.45 * np.sin(k * .7))
for bar in np.arange(G0, G1, 2.0):
    root, ch = chord_at(bar - G0)
    add(mus, bar, pad(ch + [ch[0] - 12], 2.15, a=.15, r=.4, g=.32))
for t in (27.4, 41.0, 48.5, 60.3, 71.1): add(mus, t, hat(True), g=1.3)
# breakdown 78-83.6
add(mus, 78.0, pad([45, 57, 60, 64, 71], 3.0, a=.3, r=.6, g=.45))
add(mus, 80.9, pad([43, 55, 59, 62, 69], 2.8, a=.2, r=.3, g=.45))
for k, t in enumerate(np.arange(78.0, 83.6, B / 2)):
    add(mus, t, pluck([69, 72, 76, 79][k % 4], .3, .12 + .1 * (t - 78) / 5.6), pan=np.sin(k) * .4)
for k, t in enumerate(np.arange(81.6, 83.55, B / 4 if True else B)):
    add(mus, t, clap(), g=.15 + .5 * (t - 81.6) / 2)
for t in np.arange(78.0, 81.6, B): add(mus, t, kick(.5))
# finale 83.6+
add(mus, 83.6, pad([36, 48, 55, 60, 64, 67, 74], 5.6, a=.02, r=3.5, g=.85, nh=12))
add(mus, 83.6, bass(24, 3.0, .9))
for k, t in enumerate(np.arange(84.0, 88.4, B / 2)):
    add(mus, t, pluck([72, 76, 79, 84, 79, 76][k % 6], .5, .14 * (1 - (t - 84) / 5)), pan=np.sin(k) * .5)

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
add(fx, 5.8, riser(1.3, .5)); add(fx, 81.2, riser(2.4, .55))

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
fade = np.ones(N); fs = int(88.2 * SR); fe = int(89.2 * SR)
fade[fs:fe] = np.linspace(1, 0, fe - fs); fade[fe:] = 0
mix *= fade[:, None]
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
mix = mix / np.abs(mix).max() * .89
mix = mix[:int(DUR * SR)]
pcm = (mix * 32767).astype(np.int16)
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR)
