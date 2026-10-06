---
name: eatsbueno-video-editing
description: Edit raw phone footage (clips, photos, voiceovers) into branded 9:16 EatsBueno reels with captions, chapter chips, transitions, animated text, sound effects, a synthesized music bed and a logo outro. Use when asked to edit / cut / assemble EatsBueno or Angie Bueno videos from a folder of scenes.
---

# EatsBueno video editing

A small, scriptable editor built on ffmpeg + Pillow. Each video is described by a
JSON "edit spec" (an EDL); `scripts/vedit.py` renders it to a 1080x1920, 30 fps MP4
at about -14 LUFS (social-ready).

## Workflow

1. **Gather footage**: download every clip in the folder; probe it with `ffprobe`.
2. **Review**: `python3 scripts/sheets2.py <folder>` builds contact sheets
   (`ov_XX.jpg`, 4 frames per clip). Look at every sheet before planning.
3. **Transcribe** speech or voiceovers: `python3 scripts/transcribe.py <files>`
   (faster-whisper, word timestamps). Use `medium.en` for voiceovers.
4. **Plan the cut**:
   - With a voiceover, cut on the word timings and caption every phrase.
   - Without one, generate a music bed (`scripts/music.py <style> <secs> out.wav`;
     styles: `space`, `lofi`, `sunny`, `dreamy`) and cut on the beat
     (multiples of 60/bpm).
5. **Write the spec** (see `specs/*.json`) and render: `python3 scripts/vedit.py spec.json`.
6. **QA**: pull a frame strip at key times and check the loudness with `ebur128`.

## Spec reference

```jsonc
{
  "out": "out/name.mp4", "grade": "warm|natural|desert|cool|none",
  "keywords": ["words", "highlighted", "in captions"],
  "clips": [
    {"src": "clip.mov", "in": 1.2, "dur": 2.4, "zoom": [1.0, 1.08], "pan": [0.5, 0.5],
     "trans": {"type": "whip|zoomin|slideleft|smoothup|fadewhite|dissolve|pixelize|circleopen|…", "d": 0.25},
     "shake": [0.0, 0.6, 22], "audio": false},
    {"image": "photo.jpg", "dur": 2.0},
    {"card": true, "palette": "green|orange", "kicker": "…", "title": "…", "dur": 2.0},
    {"outro": true, "dur": 3.0, "tagline": "Line one\nLine two"}
  ],
  "audio":   [{"src": "vo.m4a", "in": 0.9, "start": 0, "dur": 19.5, "eq": "voice", "vol": 1.0}],
  "sfx":     [{"name": "impact|whoosh|swipe|pop|pop_hi|ding|sparkle|riser|shutter|wind|alien|radar|glitch|tick", "start": 3.2, "vol": 0.5}],
  "overlays": [
    {"type": "caption", "text": "…", "start": 0, "end": 1.2, "anim": "pop|rise|fade", "y": 1290},
    {"type": "label",   "kicker": "Breakfast", "start": 0, "end": 2, "y": 200},
    {"type": "title",   "kicker": "…", "title": "…", "start": 0, "end": 2, "y": 720, "size": 100}
  ]
}
```

The editor adds these automatically: a whoosh or swipe on each transition, a pop on
each chip, the isotype watermark, and an outro animation (the isotype spins in, then
the wordmark and tagline rise in with a sparkle).

## Brand rules (from the brand book)

- Colors: orange `#E0612A`, cream `#F7EEDD`, green `#2B5E52`, with a grainy gradient
  for backgrounds.
- Type: Fraunces (stands in for Cooper BT) for titles and taglines; Manrope for
  captions and chips.
- Voice: no guilt, no "bad foods", only smarter choices. Real, not perfect.
- Logo assets in `brand/` were extracted from the brand book. Don't distort them.

## Setup

`pip install faster-whisper pillow numpy pillow-heif`, then run `python3 scripts/sfx.py`
once to synthesize the SFX kit into `sfx/`. Fonts are SIL OFL (Google Fonts).

## Fonts

Titles use **Cooper BT** (Cooper Lt BT Bold / Italic). It is a commercial font, so it is not in this repo: drop the licensed `CooperLtBT-*.ttf` / `CooperMdBT-*.ttf` files into `fonts/`. Captions, chips and step labels use **Manrope** (OFL, included).

## Voiceovers (ElevenLabs)

`scripts/tts_elevenlabs.py` generates voiceovers with the cloned **Angie** voice (`eleven_v4`, stability 0.5, similarity 0.75, speed 1.0). It reads the key from the `ELEVENLABS_API_KEY` environment variable. Never commit the key (this repo is public).
