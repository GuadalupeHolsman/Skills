#!/usr/bin/env python3
"""Synthesize simple license-free music beds. usage: music.py style seconds out.wav"""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(11)

def note(m): return 440.0 * 2 ** ((m - 69) / 12)

def adsr(n, a=0.01, d=0.1, s=0.6, r=0.2):
    e = np.full(n, s, float); na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd)
    nr = min(nr, n); e[-nr:] *= np.linspace(1, 0, nr)
    return e

def lp(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y

def lp_fast(x, cutoff, passes=2):  # vectorized-ish via FFT brickwall-ish smooth
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** (2 * passes)); return np.fft.irfft(X, len(x))

def add(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += x[:j - i]

def kick(): t = np.arange(int(0.35 * SR)) / SR; f = 45 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def snare():
    t = np.arange(int(0.25 * SR)) / SR
    return 0.6 * lp_fast(rng.standard_normal(len(t)), 5000) * np.exp(-t * 18) + 0.3 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
def hat(open_=False):
    t = np.arange(int((0.18 if open_ else 0.05) * SR)) / SR; x = rng.standard_normal(len(t))
    x = x - lp_fast(x, 7000); return 0.35 * x * np.exp(-t * (14 if open_ else 70))
def saw(f, n): t = np.arange(n) / SR; return 2 * ((t * f) % 1) - 1
def pad(fs, n):
    x = sum(saw(f * d, n) for f in fs for d in (0.997, 1.003)); return lp_fast(x, 1400) / (2 * len(fs))
def pluck(f, d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 9)

STYLES = {
    # bpm, chords (midi roots + triad), bass octave, arp?, swing
    "space": dict(bpm=100, prog=[(57, "m"), (53, "M"), (48, "M"), (55, "M")], arp=True, hats=True, swing=0.0, bright=1.0),
    "lofi": dict(bpm=86, prog=[(53, "M7"), (52, "m7"), (50, "m7"), (55, "7")], arp=False, hats=True, swing=0.18, bright=0.55),
    "sunny": dict(bpm=112, prog=[(48, "M"), (55, "M"), (57, "m"), (53, "M")], arp=True, hats=True, swing=0.0, bright=1.1),
    "dreamy": dict(bpm=78, prog=[(50, "m7"), (55, "7"), (48, "M7"), (57, "m7")], arp=True, hats=False, swing=0.0, bright=0.7),
}
CH = {"M": [0, 4, 7], "m": [0, 3, 7], "M7": [0, 4, 7, 11], "m7": [0, 3, 7, 10], "7": [0, 4, 7, 10]}

def make(style, secs):
    S = STYLES[style]; beat = 60 / S["bpm"]; bar = 4 * beat
    n = int(secs * SR) + SR; mix = np.zeros(n); drums = np.zeros(n); bass = np.zeros(n); keys = np.zeros(n)
    K, Sn, Hc, Ho = kick(), snare(), hat(), hat(True)
    nbars = int(np.ceil(secs / bar)) + 1
    for b in range(nbars):
        root, q = S["prog"][b % len(S["prog"])]; t0 = b * bar
        fs = [note(root + 12 + iv) for iv in CH[q]]
        keys_seg = pad(fs, int(bar * SR)) * adsr(int(bar * SR), 0.3, 0.2, 0.9, 0.3)
        add(keys, keys_seg * 0.55, t0)
        for k in range(8):  # bass on 8ths with pattern
            if k in (0, 3, 4, 6):
                bf = note(root - 12 + (7 if k == 6 else 0)); nn = int(beat * 0.5 * SR)
                x = lp_fast(saw(bf, nn), 400) * adsr(nn, 0.005, 0.08, 0.7, 0.05)
                add(bass, x * 0.9, t0 + k * beat / 2)
        intro = b == 0
        for k in range(4):
            tb = t0 + k * beat
            if not intro or k >= 2:
                if k in (0, 2) or (k == 3 and b % 2): add(drums, K, tb + (0.0 if k != 3 else beat / 2))
                if k in (1, 3) and not intro: add(drums, Sn * 0.8, tb)
            if S["hats"]:
                for h in range(2):
                    sw = S["swing"] * beat if h == 1 else 0
                    add(drums, (Ho if (h == 1 and k == 3) else Hc) * 0.8, tb + h * beat / 2 + sw)
        if S["arp"]:
            seq = [0, 1, 2, 1, 0, 2, 1, 2] if len(fs) == 3 else [0, 1, 2, 3, 2, 1, 0, 3]
            for k in range(8):
                f = fs[seq[k] % len(fs)] * 2
                add(keys, pluck(f) * 0.28 * S["bright"], t0 + k * beat / 2)
    mix = 0.9 * drums + 0.55 * bass + 0.6 * keys
    mix = mix[:int(secs * SR)]
    fade = np.ones(len(mix)); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo); fade[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
    mix *= fade; mix = np.tanh(1.3 * mix / (np.abs(mix).max() + 1e-9)); mix /= np.abs(mix).max() + 1e-9
    # light stereo: delay right channel slightly for keys width
    L = mix; R = np.roll(mix, int(0.012 * SR)) * 0.9 + mix * 0.1
    return np.stack([L, R], 1) * 0.85, beat

if __name__ == "__main__":
    style, secs, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    st, beat = make(style, secs)
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
    print(out, "beat", beat)
