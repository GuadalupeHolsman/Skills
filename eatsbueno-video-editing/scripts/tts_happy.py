"""Re-voice an avatar track phrase by phrase with eleven_v3 (cheerful), each phrase time-fitted to the original slot (keeps lip sync)."""
import json, sys, subprocess, urllib.request, os
key = os.environ["ELEVENLABS_API_KEY"]; V = "UCR4UtHH5XiWvCN33ixc"
TX = json.load(open("avatar/transcript.json"))
FIX = {"Mampoke": "Manpo-kei", "10,000 step meter.": "10,000-step meter.", "Recent studies": "Recent studies"}
def tts(text, prev, nxt, out):
    body = {"text": text, "model_id": "eleven_v3", "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V}?output_format=mp3_44100_128", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": key, "Content-Type": "application/json"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=120).read())
def speech_bounds(p):
    o = subprocess.run(["ffmpeg", "-i", p, "-af", "silencedetect=n=-40dB:d=0.08", "-f", "null", "-"], capture_output=True, text=True).stderr
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    st = [float(l.split("silence_start: ")[1]) for l in o.splitlines() if "silence_start" in l]
    en = [float(l.split("silence_end: ")[1].split()[0]) for l in o.splitlines() if "silence_end" in l]
    a = en[0] if st and st[0] < 0.05 and en else 0.0
    # trailing silence = a silence_start with no matching silence_end after it (or ending at EOF)
    b = d
    if st and (len(en) < len(st) or en[-1] >= d - 0.2) and st[-1] > a + 0.2: b = st[-1]
    return a, b
src = sys.argv[1]; name = sys.argv[2]
segs = TX[src]["segs"]
# merge whisper segments that are split mid-sentence (e.g. "... step" / "meter.")
merged = []
for s in segs:
    t = s["t"].strip()
    if merged and not merged[-1]["t"].rstrip().endswith((".", "?", "!", ",")) and s["s"] - merged[-1]["e"] < 0.4:
        merged[-1] = {"s": merged[-1]["s"], "e": s["e"], "t": merged[-1]["t"].strip() + " " + t}
    else: merged.append({"s": s["s"], "e": s["e"], "t": t})
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
parts = []
for i, s in enumerate(merged):
    text = s["t"]
    for a, b in FIX.items(): text = text.replace(a, b)
    raw = f"vo_happy/{name}_{i:02d}.mp3"
    if not os.path.exists(raw):
        tts("[cheerful] " + text, None, None, raw)
    a, b = speech_bounds(raw); L = b - a
    slot = max(0.3, s["e"] - s["s"])
    room = (merged[i + 1]["s"] if i + 1 < len(merged) else dur) - s["s"] - 0.08   # may spill into the pause after
    f = L / slot
    if f > 1.0: f = max(1.0, L / room) if L / room <= 1.0 else L / room
    f = max(0.82, min(1.45, f if f >= 1.0 else max(f, 0.82)))
    if L / f > room + 0.01: f = min(1.6, L / room)
    fit = f"vo_happy/{name}_{i:02d}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{L:.3f}", "-i", raw, "-af", f"rubberband=tempo={f:.4f},aresample=48000", "-ac", "1", fit])
    parts.append((s["s"], fit)); print(f"{i:2d} slot {slot:.2f} tts {L:.2f} tempo {f:.2f}  {text}")
# assemble on original timeline
inp = []; fc = []
for k, (st, p) in enumerate(parts):
    inp += ["-i", p]; fc.append(f"[{k}:a]adelay={int(st*1000)}:all=1[a{k}]")
fc.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad,atrim=duration={dur:.3f}[o]")
subprocess.run(["ffmpeg", "-v", "error", "-y"] + inp + ["-filter_complex", ";".join(fc), "-map", "[o]", "-ar", "48000", f"vo_happy/{name}.wav"])
print("wrote", f"vo_happy/{name}.wav")
