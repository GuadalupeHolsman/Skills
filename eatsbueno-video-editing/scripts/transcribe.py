import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
out = {}
for f in sys.argv[1:]:
    segs, info = m.transcribe(f, word_timestamps=True, vad_filter=False)
    segs = list(segs)
    out[f] = {"lang": info.language, "segs": [{"s": s.start, "e": s.end, "t": s.text, "w": [(w.start, w.end, w.word) for w in s.words]} for s in segs]}
    print(f, info.language, round(info.language_probability,2))
    for s in segs: print(f"  [{s.start:6.2f}-{s.end:6.2f}] {s.text}")
json.dump(out, open("transcript_"+sys.argv[1].split('/')[0]+".json","w"))
