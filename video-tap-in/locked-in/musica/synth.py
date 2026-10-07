"""Original 125 BPM tracks timed to the LOCKED IN edit.

Sections (seconds): hook 0-1.44 | groove 1.44-2.88 | break/tap 2.88-5.04 |
build 5.04-7.20 | DROP 7.20-10.08 | tagline 10.08-11.52 | end card 11.52-14.69
Usage: python3 synth.py <techno|afro|garage> out.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BEAT = 0.48
S16 = BEAT / 4
LEN = 15.2
HOOK_HITS = [0.0, 0.24, 0.48, 0.96, 1.2]
TAP = 3.25
rng = np.random.default_rng(29)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def n2f(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def filt(x, kind, f, order=2):
    if isinstance(f, (list, tuple)):
        f = [min(v, SR / 2 - 100) for v in f]
    else:
        f = min(f, SR / 2 - 100)
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)


def add(buf, sig, t, g=1.0):
    i = int(round(t * SR))
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n] * g


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


# ---------------- instruments ----------------
def kick(p0=165, p1=46, decay=0.32, drive=2.2, click=0.5, d=0.6):
    t = t_axis(d)
    f = p1 + (p0 - p1) * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / decay)
    c = filt(rng.standard_normal(len(t)), "highpass", 2500) * np.exp(-t / 0.003) * click
    return np.tanh((body + c) * drive) / np.tanh(drive)


def hat(d=0.06, open_=False):
    dd = 0.35 if open_ else d
    t = t_axis(dd + 0.02)
    fr = np.array([205.3, 304.4, 369.6, 522.7, 540.0, 800.0]) * 1.7
    x = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in fr)
    x = filt(x, "bandpass", [7000, 15000], 2) + 0.4 * filt(rng.standard_normal(len(t)), "highpass", 9000)
    return x * np.exp(-t / (dd / 3)) * 0.35


def clap(d=0.25):
    t = t_axis(d)
    n = filt(rng.standard_normal(len(t)), "bandpass", [900, 3200])
    env = np.zeros_like(t)
    for k, o in enumerate([0, 0.011, 0.022]):
        env += (t >= o) * np.exp(-np.clip(t - o, 0, None) / 0.006) * (0.8 if k < 2 else 1)
    env += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) / 0.07) * 0.6
    return n * env * 0.8


def snare(d=0.2):
    t = t_axis(d)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    n = filt(rng.standard_normal(len(t)), "bandpass", [1500, 8000]) * np.exp(-t / 0.06)
    return (0.6 * tone + 0.8 * n) * 0.7


def rim():
    t = t_axis(0.05)
    return (np.sin(2 * np.pi * 1700 * t) + 0.5 * np.sin(2 * np.pi * 820 * t)) * np.exp(-t / 0.008) * 0.6


def conga(f=260, d=0.25):
    t = t_axis(d)
    fr = f * (1 + 0.5 * np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.09)
    x += filt(rng.standard_normal(len(t)), "bandpass", [f * 2, f * 6]) * np.exp(-t / 0.01) * 0.3
    return x * 0.7


def shaker(d=0.07):
    t = t_axis(d)
    env = np.minimum(t / 0.012, 1) * np.exp(-t / 0.025)
    return filt(rng.standard_normal(len(t)), "bandpass", [5000, 11000]) * env * 0.35


def chord_stab(notes, d=0.35, cutoff=2600, kind="saw"):
    t = t_axis(d)
    x = np.zeros_like(t)
    for m in notes:
        for det in (-0.12, 0.0, 0.11):
            f = n2f(m + det)
            x += saw(f, t) if kind == "saw" else np.sign(np.sin(2 * np.pi * f * t))
    x = filt(x / (len(notes) * 3), "lowpass", cutoff)
    return x * np.exp(-t / (d / 3)) * np.minimum(t / 0.004, 1)


def pad(notes, d, cutoff=1100, att=0.6):
    t = t_axis(d)
    x = np.zeros_like(t)
    for m in notes:
        for det in (-0.08, 0.07):
            x += saw(n2f(m + det), t)
    x = filt(x / (len(notes) * 2), "lowpass", cutoff)
    env = np.minimum(t / att, 1) * np.minimum((d - t) / 0.4, 1).clip(0, 1)
    return x * env


def pluck(m, d=0.45):
    t = t_axis(d)
    f = n2f(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.18) + 0.5 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.02)
    return x * 0.5


def sub(m, d, glide_from=None):
    t = t_axis(d)
    f0 = n2f(m)
    f = np.full_like(t, f0)
    if glide_from is not None:
        f = f0 + (n2f(glide_from) - f0) * np.exp(-t / 0.04)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(t / 0.005, 1) * np.minimum((d - t) / 0.02, 1).clip(0, 1)
    return np.tanh(1.4 * x) * env * 0.8


def acid(m, d, cut, res=0.85):
    """saw through a resonant state-variable lowpass with a per-note envelope"""
    t = t_axis(d)
    x = saw(n2f(m), t)
    fc = cut * (0.35 + 0.65 * np.exp(-t / 0.07))
    y = np.zeros_like(x)
    low = band = 0.0
    q = 1 - res
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], 8000) / SR)
        low += f * band
        high = x[i] - low - q * band
        band += f * high
        y[i] = low
    env = np.minimum(t / 0.003, 1) * np.exp(-t / 0.12)
    return np.tanh(2.0 * y) * env * 0.45


def riser(d):
    t = t_axis(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    blocks = 40
    for b in range(blocks):
        a, z = int(b / blocks * len(t)), int((b + 1) / blocks * len(t))
        fc = 300 * (40 ** (b / blocks))
        out[a:z] = filt(n[max(0, a - 2000):z], "bandpass", [fc * 0.7, fc * 1.4])[-(z - a):]
    tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (3 * t / d)) / SR) * 0.15
    return (out + tone) * (t / d) ** 2 * 0.6


def impact():
    t = t_axis(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-t * 18)) / SR) * np.exp(-t / 0.5)
    crash = filt(rng.standard_normal(len(t)), "highpass", 3000) * np.exp(-t / 0.4) * 0.25
    return np.tanh(1.5 * (boom + crash))


def reverb(x, rt=1.6, mix=0.25, lp=6000):
    t = t_axis(rt)
    ir = rng.standard_normal(len(t)) * np.exp(-t / (rt / 6.9))
    ir = filt(ir, "lowpass", lp)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x + mix * wet


def sidechain(n, kicks, depth=0.7, rel=0.14):
    t = np.arange(n) / SR
    g = np.ones(n)
    for k in kicks:
        i = int(k * SR)
        seg = t[i:] - k
        g[i:] = np.minimum(g[i:], 1 - depth * np.exp(-seg / rel))
    return g


def beats(a, b, step=BEAT, off=0.0):
    return list(np.arange(a + off, b - 1e-6, step))


# ---------------- arrangements ----------------
def build_common(drums, music, bass, kicks_in, roll_hits):
    # build: snare roll accelerating + riser, gap before the drop, impact on the drop
    for t in roll_hits:
        add(drums, snare(), t, 0.25 + 0.55 * (t - 5.04) / 2.04)
    add(music, riser(2.04), 5.04, 0.9)
    add(music, impact(), 7.20, 0.9)


def roll():
    h = beats(5.04, 6.0, BEAT / 2) + beats(6.0, 6.72, BEAT / 4) + beats(6.72, 7.08, BEAT / 8)
    return h


def track(genre):
    n = int(LEN * SR)
    drums, music, bass, fx = (np.zeros(n) for _ in range(4))
    kicks = []

    def K(t, g=1.0, **kw):
        add(drums, kick(**kw), t, g)
        kicks.append(t)

    groove = beats(1.44, 2.88) + beats(5.04, 7.08) + beats(7.20, 10.08) + beats(11.52, 14.4)

    if genre == "techno":
        AM = [57, 60, 64, 69]
        for t in HOOK_HITS:
            K(t, 1.0, p0=180, decay=0.28)
            add(music, chord_stab([45] + AM, 0.4, 3000), t, 0.8)
        for t in groove:
            K(t, 1.0)
        for t in beats(1.44, 2.88, off=0.24) + beats(7.20, 10.08, off=0.24) + beats(11.52, 14.4, off=0.24):
            add(drums, hat(0.07), t, 0.8)
        for t in beats(7.20, 10.08, S16):
            add(drums, hat(0.035), t, 0.35 if (round(t / S16) % 2) else 0.2)
        for t in beats(7.20 + BEAT, 10.08, 2 * BEAT) + beats(11.52 + BEAT, 14.4, 2 * BEAT) + beats(1.44 + BEAT, 2.88, 2 * BEAT):
            add(drums, clap(), t, 0.7)
        # acid line on the drop
        pat = [33, 33, 45, 33, 36, 33, 45, 40, 33, 33, 43, 33, 36, 45, 33, 38]
        for k, t in enumerate(beats(7.20, 10.08, S16)):
            cut = 600 + 2600 * ((t - 7.2) / 2.88)
            add(bass, acid(pat[k % 16], S16 * 0.95, cut), t, 1.0)
        for k, t in enumerate(beats(11.52, 14.4, S16)):
            add(bass, acid(pat[k % 16], S16 * 0.95, 900), t, 0.7)
        for t in beats(1.44, 2.88, BEAT / 2):
            add(bass, sub(33, 0.2), t + 0.24 if False else t, 0.6)
        # break: dark pad + stab echoes around the tap
        add(music, pad([45, 57, 60, 64], 2.2, 900), 2.88, 0.5)
        add(music, chord_stab([45] + AM, 0.5, 1800), TAP, 0.7)
        add(music, pad([41, 53, 57, 60], 2.2, 1400, att=1.2), 5.04, 0.35)
        # tagline: two big hits, no kick
        for t in (10.08, 10.56):
            add(music, chord_stab([33, 45] + AM, 0.9, 2400), t, 1.0)
            add(bass, sub(33, 0.8), t, 0.9)
        build_common(drums, music, bass, kicks, roll())
        reverb_mix = 0.35
    elif genre == "afro":
        for t in HOOK_HITS:
            K(t, 0.9, p0=140, p1=50, decay=0.3, drive=1.6)
            add(drums, conga(330), t + 0.12, 0.6)
            add(music, pluck(69), t, 0.6)
            add(music, pluck(76), t, 0.4)
        for t in groove:
            K(t, 0.9, p0=135, p1=48, decay=0.34, drive=1.6, click=0.25)
        bars = [(1.44, 2.88), (7.20, 10.08), (11.52, 14.4)]
        hi_steps, lo_steps, rim_steps = [3, 6, 11, 14], [7, 10, 15], [2, 5, 9, 13]
        motif = [(0, 69), (3, 72), (6, 76), (8, 74), (10, 72), (13, 67), (14, 69)]
        bassline = [(3, 33), (6, 36), (10, 28), (14, 31)]
        for a, b in bars:
            for bar0 in beats(a, b, 16 * S16):
                for s in hi_steps:
                    add(drums, conga(330), bar0 + s * S16, 0.55)
                for s in lo_steps:
                    add(drums, conga(220), bar0 + s * S16, 0.6)
                for s in rim_steps:
                    add(drums, rim(), bar0 + s * S16, 0.35)
                for s in range(16):
                    add(drums, shaker(), bar0 + s * S16 + (0.012 if s % 2 else 0), 0.5 if s % 2 else 0.3)
                for s, m in bassline:
                    add(bass, sub(m, S16 * 2.6), bar0 + s * S16, 0.9)
                if a >= 7.2:
                    for s, m in motif:
                        add(music, pluck(m), bar0 + s * S16, 0.45)
                    for s in (4, 12):
                        add(drums, clap(), bar0 + s * S16, 0.5)
        add(music, pad([57, 60, 64, 67], 2.2, 1500), 2.88, 0.45)
        add(music, pluck(81, 0.9), TAP, 0.6)
        add(music, pad([53, 57, 60, 64], 2.2, 1800, att=1.0), 5.04, 0.35)
        for t in beats(5.04, 7.08, S16):
            add(drums, conga(330 if round(t / S16) % 2 else 220), t, 0.2 + 0.4 * (t - 5.04) / 2.04)
        for t in (10.08, 10.56):
            add(music, pluck(69, 1.0), t, 0.8)
            add(music, pluck(76, 1.0), t, 0.6)
            add(bass, sub(33, 0.9), t, 0.9)
        add(music, riser(2.04), 5.04, 0.6)
        add(music, impact(), 7.20, 0.8)
        reverb_mix = 0.3
    else:  # garage / 2-step, shuffled
        sw = 0.035
        AM9 = [57, 60, 64, 67, 71]
        for t in HOOK_HITS:
            K(t, 1.0, p0=150, p1=44, decay=0.3)
            add(music, chord_stab(AM9, 0.3, 3200, kind="sq"), t, 0.7)
        bars = [(1.44, 2.88), (7.20, 10.08), (11.52, 14.4)]
        subline = [(0, 33, None), (3, 33, None), (6, 36, 33), (8, 40, None), (11, 38, 40), (14, 36, None)]
        for a, b in bars:
            for bar0 in beats(a, b, 16 * S16):
                for s in (0, 10):
                    if bar0 + s * S16 < b:
                        K(bar0 + s * S16, 1.0, p0=150, p1=44, decay=0.3)
                for s in (4, 12):
                    if bar0 + s * S16 < b:
                        add(drums, clap(), bar0 + s * S16, 0.6)
                        add(drums, snare(), bar0 + s * S16, 0.3)
                for s in range(16):
                    tt = bar0 + s * S16 + (sw if s % 2 else 0)
                    if tt < b:
                        add(drums, hat(0.03, open_=(s == 14)), tt, (0.45 if s % 2 else 0.25) * (0.6 if s == 14 else 1))
                for k, (s, m, g) in enumerate(subline):
                    tt = bar0 + s * S16
                    if tt < b:
                        nxt = subline[k + 1][0] if k + 1 < len(subline) else 16
                        add(bass, sub(m, (nxt - s) * S16 * 0.9, g), tt, 1.0)
                if a >= 7.2:
                    for s in (2, 6, 11):
                        add(music, chord_stab(AM9, 0.22, 2800, kind="sq"), bar0 + s * S16 + (sw if s % 2 else 0), 0.5)
        add(music, pad([57, 60, 64, 67, 71], 2.2, 1300), 2.88, 0.45)
        add(music, chord_stab(AM9, 0.6, 2000, kind="sq"), TAP, 0.7)
        add(music, pad([53, 57, 60, 64, 67], 2.2, 1600, att=1.0), 5.04, 0.35)
        for t in (10.08, 10.56):
            add(music, chord_stab([45] + AM9, 0.9, 2600, kind="sq"), t, 0.9)
            add(bass, sub(33, 0.8), t, 0.9)
        build_common(drums, music, bass, kicks, roll())
        reverb_mix = 0.3

    # mix: sidechain the bass + music under the kick, reverb on music
    sc = sidechain(n, kicks, 0.65)
    music = reverb(music, 1.8, reverb_mix)
    mix = drums * 0.9 + bass * sc * 0.85 + music * sc * 0.7
    mix = filt(mix, "highpass", 28)
    # end fade
    t = np.arange(n) / SR
    mix *= np.clip((14.69 - t) / 0.45, 0, 1)
    mix = np.tanh(1.3 * mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.9
    return mix


if __name__ == "__main__":
    genre, out = sys.argv[1], sys.argv[2]
    x = track(genre)
    st = np.stack([x, np.roll(x, 12) * 0.98], 1)  # tiny width
    pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("wrote", out, round(len(x) / SR, 2), "s")
