"""Soundtrack for launch.html: tension -> silence -> bloom -> groove -> finale, on a 120 BPM grid.

Usage: python3 music_launch.py out.wav [meta.json]
meta.json comes from `node render.mjs --page launch.html --meta meta.json`; every slam, tap, key,
whoosh, hit, beep and counter tick in the picture gets its sound at the exact same time.
"""
import json
import sys
import wave

import numpy as np

META = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "assets/meta_launch.json"))
SR = 44100
DUR = float(META["duration"])
BEAT = 60 / META.get("bpm", 120)
BAR = 4 * BEAT
N = int(SR * DUR)
rng = np.random.default_rng(11)
mix = np.zeros((N, 2))
SIL0, SIL1 = META["silence"]
G0, G1 = META["groove"]


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(n):
    return np.arange(n) / SR


def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i] * gain
    mix[i:i + len(sig), 0] += sig * np.sqrt(1 - pan) / np.sqrt(1)
    mix[i:i + len(sig), 1] += sig * np.sqrt(1 + pan) / np.sqrt(1)


def env(n, a, r):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def pad(midis, length, bright=0.25):
    n = int(length * SR)
    t = tt(n)
    s = np.zeros(n)
    for m in midis:
        for det in (-0.1, 0.0, 0.1):
            f = note(m) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * t) + bright * np.sin(4 * np.pi * f * t) + 0.06 * np.sin(6 * np.pi * f * t)
    return s / (len(midis) * 3) * env(n, 0.6, 0.9)


def pluck(m, length=0.9, decay=5.0):
    n = int(length * SR)
    t = tt(n)
    f = note(m)
    s = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) * np.exp(-t * 9)) * np.exp(-t * decay)
    s[:150] *= np.linspace(0, 1, 150)
    return s


def kick(punch=1.0):
    n = int(0.4 * SR)
    t = tt(n)
    f = 48 + 110 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * punch


def snare():
    n = int(0.25 * SR)
    t = tt(n)
    noise = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    return (noise * 0.5 * np.exp(-t * 22) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.6)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    s = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    return s * np.exp(-tt(n) * (14 if open_ else 70))


def impact():
    n = int(1.2 * SR)
    t = tt(n)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t * 10)) / SR) * np.exp(-t * 3.2)
    crack = np.diff(np.concatenate([[0], rng.standard_normal(n)])) * np.exp(-t * 18) * 0.5
    return boom + crack


def whoosh(length=0.8):
    n = int(length * SR)
    s = rng.standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.015 + 0.45 * (i / n) ** 2
        y += a * (s[i] - y)
        out[i] = y
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2


def riser(length):
    n = int(length * SR)
    t = tt(n)
    s = rng.standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.005 + 0.35 * (i / n) ** 3
        y += a * (s[i] - y)
        out[i] = y
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / length) ** 2) / SR) * 0.15
    return (out + tone) * (t / length) ** 1.6


def click(f=1500, length=0.07):
    n = int(length * SR)
    t = tt(n)
    return (np.sin(2 * np.pi * f * t) * 0.6 + rng.standard_normal(n) * 0.25) * np.exp(-t * 90)


def ping():
    n = int(0.35 * SR)
    t = tt(n)
    return (np.sin(2 * np.pi * 1318 * t) * (t < 0.09) + np.sin(2 * np.pi * 1760 * t) * (t >= 0.09)) * np.exp(-t * 9) * 0.6


def beep():
    n = int(0.22 * SR)
    t = tt(n)
    return (np.sin(2 * np.pi * 1980 * t) + 0.3 * np.sin(2 * np.pi * 3960 * t)) * env(n, 0.003, 0.05)


# ---------------- 1. tension (0 -> silence) ----------------
n = int(SIL0 * SR)
t = tt(n)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sign(np.sin(2 * np.pi * 55.3 * t)) * 0.3) * (0.55 + 0.45 * (np.sin(2 * np.pi * (2 / BEAT) * t) > 0))
add(drone * np.linspace(0.4, 1, n), 0, gain=0.16)
step = BEAT / 2
k = 0
while k * step < SIL0 - 0.02:
    tk = k * step
    add(hat(), tk, pan=0.3, gain=0.05 + 0.05 * tk / SIL0)
    if tk > 2.4:
        add(hat(), tk + step / 2, pan=-0.3, gain=0.06)
    k += 1
add(riser(2.1), SIL0 - 2.1, gain=0.18)
for s in META["slams"]:
    if s < SIL0:
        add(impact()[: int(0.5 * SR)] * env(int(0.5 * SR), 0.001, 0.2), s, gain=0.32)
for s in META["notifs"]:
    add(ping(), s, pan=0.2, gain=0.22)

# ---------------- 2. silence, then the swell into the bloom ----------------
add(riser(0.9) * 0.6, SIL1 - 0.95, gain=0.14)

# ---------------- 3. bloom (SIL1 -> groove) ----------------
for i, ch in enumerate([[53, 57, 60, 64, 67], [57, 60, 64, 67]]):
    add(pad(ch, 2.3), SIL1 + i * 2.0, gain=0.2)
for b in range(int((G0 - SIL1) / BEAT)):
    m = [72, 76, 79, 76, 74, 77, 81, 77][b % 8]
    add(pluck(m, 0.7), SIL1 + 0.2 + b * BEAT, pan=0.3 if b % 2 else -0.3, gain=0.07)

# ---------------- 4. groove (G0 -> G1) ----------------
CHORDS = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [46, 53, 58, 62]]   # F, Am, Dm, Bb
ARP = [[65, 69, 72, 76], [69, 72, 76, 79], [62, 69, 72, 77], [58, 65, 70, 74]]
bars = int((G1 - G0) / BAR) + 1
for b in range(bars):
    t0 = G0 + b * BAR
    c = b % 4
    add(pad(CHORDS[c], BAR + 0.6, 0.3), t0, gain=0.13)
    bassn = int(BAR * SR)
    add(np.sin(2 * np.pi * note(CHORDS[c][0] - 12) * tt(bassn)) * env(bassn, 0.02, 0.3), t0, gain=0.14)
    for i in range(4):
        tb = t0 + i * BEAT
        if tb >= G1:
            break
        add(kick(), tb, gain=0.42 if i % 2 == 0 else 0.3)
        if i % 2 == 1:
            add(snare(), tb, gain=0.22)
        add(hat(), tb + BEAT / 2, pan=0.35, gain=0.06)
    for i in range(8):
        tp = t0 + i * BEAT / 2
        if tp < G1:
            add(pluck(ARP[c][[0, 1, 2, 3, 2, 3, 1, 2][i]], 0.5, 7), tp, pan=-0.35 if i % 2 else 0.35, gain=0.055)
add(riser(1.6), G1 - 1.3, gain=0.16)

# ---------------- 5. finale ----------------
FIN = G1 + 0.35
add(impact(), FIN, gain=0.4)
add(pad([53, 57, 60, 64, 67, 72], DUR - FIN, 0.35), FIN, gain=0.22)
for i, m in enumerate([72, 76, 79, 84]):
    add(pluck(m, 2.5, 2.2), FIN + 2.2 + i * BEAT / 2, gain=0.06)

# ---------------- SFX synced to picture ----------------
for s in META["hits"]:
    if s >= SIL0:
        add(impact()[: int(0.7 * SR)] * env(int(0.7 * SR), 0.001, 0.3), s, gain=0.22)
for s in META["slams"]:
    if s >= SIL0:
        add(kick(1.2), s, gain=0.25)
for w in META["whooshes"]:
    add(whoosh(), w - 0.45, gain=0.14)
for tp in META["taps"]:
    add(click(1400, 0.08), tp, gain=0.3)
for kp in META["keys"]:
    add(click(3200 + rng.integers(-300, 300), 0.03), kp, pan=float(rng.uniform(-0.2, 0.2)), gain=0.11)
for bp in META["beeps"]:
    add(beep(), bp, gain=0.2)
for tk in META["ticks"]:
    for j in range(8):
        add(click(2600, 0.02), tk + j * 0.07 * (1 + j * 0.15), gain=0.05)
for lg in META["logo"]:
    for m, g in [(77, 0.12), (84, 0.06), (89, 0.03)]:
        add(pluck(m, 2.5, 2.0), lg, gain=g)

# hard silence window (the "Exhausting, right?" beat)
a, b = int(SIL0 * SR), int((SIL1 - 0.95) * SR)
mix[a:b] *= 0.0

# master
fade = np.ones(N)
fade[: int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
fade[-int(1.8 * SR):] = np.linspace(1, 0, int(1.8 * SR))
mix *= fade[:, None]
mix = np.tanh(mix * 1.5)
mix /= np.abs(mix).max() / 0.9

with wave.open(sys.argv[1] if len(sys.argv) > 1 else "music_launch.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
