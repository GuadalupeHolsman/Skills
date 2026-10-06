"""Synthesizes the film's original soundtrack (warm pad + plucks + soft beat + transition whooshes).

Usage: python3 music.py out.wav
Timing matches the scene cuts in index.html.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 47.0
BPM = 100
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    mix[i:i + len(sig), 0] += sig * (1 - pan) ** 0.5
    mix[i:i + len(sig), 1] += sig * (1 + pan) ** 0.5


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(midis, length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in midis:
        f = note(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * tt) + 0.25 * np.sin(4 * np.pi * ff * tt) + 0.08 * np.sin(6 * np.pi * ff * tt)
    return s / (len(midis) * 3) * env(n, 0.9, 1.2)


def pluck(m, length=1.2):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = note(m)
    s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 8)) * np.exp(-tt * 4.5)
    s[:200] *= np.linspace(0, 1, 200)
    return s


def kick():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 50 + 90 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def shaker():
    n = int(0.08 * SR)
    s = rng.standard_normal(n)
    s = np.diff(np.concatenate([[0], s]))  # crude high-pass
    return s * np.exp(-np.arange(n) / SR * 60)


def whoosh(length=0.9):
    n = int(length * SR)
    s = rng.standard_normal(n)
    # sweep a one-pole low-pass upward
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.02 + 0.5 * (i / n) ** 2
        y += a * (s[i] - y)
        out[i] = y
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2


# chord progression (one chord per bar of 4 beats): Fmaj7 · Am7 · Dm9 · Bbmaj7
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 64, 65], [46, 53, 57, 62]]
ARPS = [[65, 69, 72, 76], [69, 72, 76, 79], [62, 69, 72, 77], [58, 65, 69, 74]]
BAR = 4 * BEAT
bars = int(DUR / BAR) + 1
for b in range(bars):
    c = b % 4
    add(pad(CHORDS[c], BAR + 1.3), b * BAR, gain=0.22)
    add(np.sin(2 * np.pi * note(CHORDS[c][0] - 12) * np.arange(int(BAR * SR)) / SR) * env(int(BAR * SR), 0.05, 0.6), b * BAR, gain=0.10)
    if b >= 1:  # plucks enter after the logo reveal
        for i in range(8):
            m = ARPS[c][[0, 1, 2, 3, 2, 1, 3, 2][i]]
            add(pluck(m), b * BAR + i * BEAT / 2, pan=0.35 if i % 2 else -0.35, gain=0.09)
    if 2 <= b < bars - 2:  # soft beat in the middle of the film
        for i in range(4):
            add(kick(), b * BAR + i * BEAT, gain=0.32)
            add(shaker(), b * BAR + i * BEAT + BEAT / 2, pan=0.4, gain=0.05)

# transition whooshes, landing on each cut
for cut in [4.0, 9.6, 14.95, 22.0, 28.4, 34.6, 40.3]:
    add(whoosh(), cut - 0.15, gain=0.12)
# bell-like chime on the logo reveals
for tt0 in [1.3, 41.15]:
    for m, g in [(77, 0.12), (84, 0.06), (89, 0.03)]:
        add(pluck(m, 2.5), tt0, gain=g)

# master: gentle fade in/out, normalize
fade = np.ones(N)
fade[: int(0.6 * SR)] = np.linspace(0, 1, int(0.6 * SR))
fade[-int(2.5 * SR):] = np.linspace(1, 0, int(2.5 * SR))
mix *= fade[:, None]
mix = np.tanh(mix * 1.4)
mix /= np.abs(mix).max() / 0.85

with wave.open(sys.argv[1] if len(sys.argv) > 1 else "music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
