# Loomlock Experiences × Smirnoff Spicy Tamarind: videos (EN)

Motion graphics, 9:16 (1080×1920, 30 fps). The campaign line is **Live now. Post later.** The loom weave is the visual thread, made with the Loomlock blue (#3F49CC) and the Spicy Tamarind palette (chili, amber, gold, tamarind).

| File | Concept | Length |
|---|---|---|
| `videos/01_invitation_your-key_20s.mp4` | **Your key.** A 3D Loomlock key card turns to show the Spicy Tamarind weave and ends on a ticket with the event details, the steps and the RSVP. | 20 s |
| `videos/02_social_noise-cut-silence_15s.mp4` | **Noise → Cut → Silence.** Notifications pile up, then the key taps, then "Live now, post later." No event details. | 15 s |
| `videos/03_social_sweet-tart-spicy_10s.mp4` | **Sweet. Tart. Spicy. / Tap. Lock. Live.** Cut on the beat, with its own motif for each word. No event details. | 10 s |

## Editing
- Event details (invitation only) and the legal line go in the `EVENT` object in `experiences.html`.
- Variants: `experiences.html#invite`, `#noise`, `#spicy`.
- Typefaces: Unbounded, Space Mono and Instrument Serif (all OFL).
- `sound.py <variant> <out.wav>` generates each soundtrack (synthesized, royalty-free).

## Re-rendering
```bash
mkdir -p frames && node render.js "$PWD/experiences.html#invite" "$PWD/frames" 30 20
python3 sound.py invite invite.wav
ffmpeg -y -framerate 30 -i frames/f%05d.jpg -i invite.wav -c:v libx264 -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart videos/01_invitation_your-key_20s.mp4
```
Durations: invite 20, noise 15, spicy 10.
