#!/usr/bin/env python3
"""Synthesize a small, license-free SFX kit (48 kHz stereo WAV) into ./sfx/."""
import os, wave
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sfx")
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR

def env(n, a=0.005, r=None, curve=3.0):
    e = np.ones(n); na = max(1, int(SR * a)); e[:na] = np.linspace(0, 1, na)
    if r is None: r = n / SR - a
    nr = max(1, int(SR * r)); e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e

def bandnoise(n, lo, hi):
    """noise with time-varying band (lo/hi arrays or scalars) via FFT-per-block."""
    if n < 6000:
        return bandnoise(12000, np.broadcast_to(lo, (n,))[0], np.broadcast_to(hi, (n,))[0])[3000:3000 + n]
    x = rng.standard_normal(n); out = np.zeros(n); B = 2048; H = B // 2; win = np.hanning(B)
    lo = np.broadcast_to(lo, (n,)); hi = np.broadcast_to(hi, (n,))
    f = np.fft.rfftfreq(B, 1 / SR)
    for s in range(0, n - B, H):
        c = s + H; X = np.fft.rfft(x[s:s + B] * win)
        m = np.exp(-0.5 * ((f - (lo[c] + hi[c]) / 2) / max(1, (hi[c] - lo[c]) / 2)) ** 2)
        out[s:s + B] += np.fft.irfft(X * m, B)
    return out / (np.abs(out).max() + 1e-9)

def lp(x, a):  # one-pole lowpass
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

def save(name, x, pan=0.0, gain=0.9):
    x = np.asarray(x, float); x = x / (np.abs(x).max() + 1e-9) * gain
    st = np.stack([x * (1 - max(0, pan)), x * (1 + min(0, pan))], 1)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())

def whoosh(d=0.45, f0=300, f1=4000, name="whoosh"):
    n = int(SR * d); tt = np.linspace(0, 1, n)
    c = f0 * (f1 / f0) ** tt
    x = bandnoise(n, c * 0.5, c * 1.6)
    e = np.sin(np.pi * tt) ** 1.6
    save(name, x * e, gain=0.8)

def pop(name="pop", f0=900, f1=320, d=0.12):
    tt = t_(d); f = f1 + (f0 - f1) * np.exp(-tt * 40)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env(len(tt), 0.002, d - 0.002, 4)
    x += 0.15 * bandnoise(len(tt), 2000, 6000) * env(len(tt), 0.001, 0.02, 6)
    save(name, x, gain=0.85)

def ding(name="ding", f=1318.5, d=1.4):
    tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * k) for a, m, k in [(1, 1, 3), (.5, 2.0, 5), (.25, 3.01, 8), (.15, 4.2, 11)])
    save(name, x * env(len(tt), 0.002, d - 0.01, 1.2), gain=0.7)

def sparkle(name="sparkle", d=1.2):
    tt = t_(d); x = np.zeros_like(tt)
    notes = [1568, 1976, 2349, 2637, 3136, 3951]
    for i, f in enumerate(notes):
        s = int(SR * i * 0.07); seg = t_(d - i * 0.07)
        x[s:s + len(seg)] += np.sin(2 * np.pi * f * seg) * np.exp(-seg * 6) * (0.9 - i * 0.08)
    save(name, x, gain=0.6)

def impact(name="impact", d=1.6):
    tt = t_(d); f = 40 + 110 * np.exp(-tt * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    x += 0.5 * lp(rng.standard_normal(len(tt)), 0.08) * np.exp(-tt * 14)
    save(name, np.tanh(2.2 * x), gain=0.95)

def riser(name="riser", d=2.0):
    n = int(SR * d); tt = np.linspace(0, 1, n)
    c = 200 * (6000 / 200) ** tt
    x = bandnoise(n, c * 0.6, c * 1.4) * tt ** 2
    x += 0.35 * np.sin(2 * np.pi * np.cumsum(220 * 4 ** tt) / SR) * tt ** 2
    save(name, x * env(n, 0.05, 0.03, 1), gain=0.75)

def shutter(name="shutter"):
    tt = t_(0.16); x = np.zeros_like(tt)
    for s, a in [(0, 1.0), (0.055, 0.7)]:
        i = int(SR * s); seg = t_(0.04)
        x[i:i + len(seg)] += a * bandnoise(len(seg), 1500, 7000) * np.exp(-seg * 120)
    save(name, x, gain=0.8)

def wind(name="wind", d=12.0):
    n = int(SR * d); tt = np.arange(n) / SR
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * tt) * np.sin(2 * np.pi * 0.047 * tt + 1)
    c = 500 + 350 * np.sin(2 * np.pi * 0.07 * tt)
    x = bandnoise(n, c * 0.4, c * 1.8) * mod
    fade = np.minimum(1, np.minimum(tt / 1.0, (d - tt) / 1.0))
    save(name, x * fade, gain=0.6)

def alien(name="alien", d=1.6):
    tt = t_(d); f = 520 + 180 * np.sin(2 * np.pi * 5.5 * tt) + 300 * tt
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    save(name, x * env(len(tt), 0.08, 0.5, 1.5), gain=0.6)

def radar(name="radar", d=1.0):
    tt = t_(d); x = np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt * 7)
    x += 0.4 * np.sin(2 * np.pi * 2640 * tt) * np.exp(-tt * 10)
    save(name, x * env(len(tt), 0.002, 0.2, 1), gain=0.55)

def glitch(name="glitch", d=0.35):
    n = int(SR * d); x = np.zeros(n); i = 0
    while i < n:
        L = int(SR * rng.uniform(0.008, 0.04)); kind = rng.integers(3); seg = np.arange(min(L, n - i)) / SR
        if kind == 0: x[i:i + len(seg)] = np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * seg)) * 0.6
        elif kind == 1: x[i:i + len(seg)] = rng.standard_normal(len(seg)) * 0.5
        i += L + int(SR * rng.uniform(0, 0.015))
    save(name, x, gain=0.55)

def swipe(name="swipe"):
    whoosh(0.25, 800, 7000, name)

def tick(name="tick"):
    tt = t_(0.03); x = bandnoise(len(tt), 3000, 9000) * np.exp(-tt * 250)
    save(name, x, gain=0.6)

if __name__ == "__main__":
    whoosh(); whoosh(0.7, 150, 2500, "whoosh_deep"); swipe(); pop(); pop("pop_hi", 1500, 600, 0.09)
    ding(); sparkle(); impact(); riser(); shutter(); wind(); alien(); radar(); glitch(); tick()
    print(sorted(os.listdir(OUT)))
