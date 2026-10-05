"""Synthesizes music.wav: a soft chord pad + pluck arpeggio, with SFX synced to video.html."""
import wave
import numpy as np

SR, DUR = 44100, 60.0
t = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t)
midi = lambda n: 440 * 2 ** ((n - 69) / 12)

# Cmaj7 - Am7 - Fmaj7 - G6, 2.5 s per chord (96 BPM, 4 beats)
CHORDS = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]
BEAT = 60 / 96
BAR = BEAT * 4

def tone(f, start, length, amp, decay=None, harmonics=(1, .35, .12)):
    i0, i1 = int(start * SR), min(len(t), int((start + length) * SR))
    if i0 >= len(t): return
    tt = t[i0:i1] - start
    w = sum(a * np.sin(2 * np.pi * f * (k + 1) * tt) for k, a in enumerate(harmonics))
    env = np.exp(-tt / decay) if decay else np.minimum(1, tt / .6) * np.minimum(1, (length - tt) / .6)
    env *= np.minimum(1, tt / .005)
    out[i0:i1] += amp * w * env

bar = 0
while bar * BAR < DUR:
    ch = CHORDS[bar % 4]; s = bar * BAR
    for n in ch:  # pad
        tone(midi(n), s, BAR + .4, .045, harmonics=(1, .2, .05))
    tone(midi(ch[0] - 12), s, BAR + .2, .06, harmonics=(1, .1))  # bass
    if 3 <= s < 53:  # pluck arpeggio in eighth notes
        pattern = [ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 24, ch[3] + 12, ch[2] + 12]
        for k, n in enumerate(pattern):
            tone(midi(n), s + k * BEAT / 2, .9, .035, decay=.22)
    bar += 1

def noise_hit(start, length, amp, lp=.5, decay=.05):
    i0 = int(start * SR); n = int(length * SR)
    rng = np.random.default_rng(int(start * 100))
    x = rng.standard_normal(n)
    for _ in range(3): x = lp * x + (1 - lp) * np.concatenate([[0], x[:-1]])  # crude lowpass
    out[i0:i0 + n] += amp * x * np.exp(-np.arange(n) / SR / decay)

# SFX
noise_hit(9.62, .4, .5, lp=.2, decay=.06); tone(70, 9.62, .4, .5, decay=.1)          # stamp thud
noise_hit(19.25, .15, .45, lp=.6, decay=.015); tone(1800, 19.25, .1, .12, decay=.02) # lid click
tone(1568, 22.2, .25, .12, decay=.08); tone(2093, 22.32, .35, .12, decay=.12)         # locked beep
tone(880, 29.4, .5, .18, decay=.12); tone(1320, 29.45, .6, .1, decay=.18)              # key tap
for st in (35.8, 36.1, 36.4): noise_hit(st, .2, .25, lp=.7, decay=.03)                # books land
tone(784, 38.4, .3, .15, decay=.08); tone(988, 40.4, .3, .15, decay=.08)              # bubble pops
for k in range(5): tone(1200, 47.2 + k * .6, .1, .08, decay=.03)                      # countdown ticks
for k, n in enumerate([72, 76, 79, 84]): tone(midi(n), 50.2 + k * .08, 1.5, .12, decay=.5)  # unlock chime
noise_hit(50.8, .6, .2, lp=.8, decay=.2)                                                # confetti burst

fade = np.minimum(1, t / 1.0) * np.minimum(1, (DUR - t) / 2.5)
out *= fade
out = np.tanh(out * 1.4) * .8
pcm = (np.stack([out, out], 1) * 32767).astype('<i2')
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('peak', float(np.abs(out).max()))
