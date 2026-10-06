# Loomlock Experience × Smirnoff Spicy Tamarind: videos (EN)

Motion graphics in 9:16 (1080×1920, 30 fps) with the Loomlock identity (mark, brand blue #3F49CC, "Live now. Post later.") and the Smirnoff Spicy Tamarind palette.

| File | Use | Length |
|---|---|---|
| `videos/01_invitation_20s.mp4` | Invitation: "You're invited", details, guest list, RSVP | 20 s |
| `videos/02_promo_noise-cut-silence_15s.mp4` | Social promo: Noise → Cut (tap) → Silence | 15 s |
| `videos/03_promo_sweet-tart-spicy_10s.mp4` | Social promo: fast, cut on the beat | 10 s |

## Editing
- Event details (date, venue, RSVP, legal line) live in the `EVENT` object at the top of the `<script>` in `loomlock.html`.
- Each video is a variant: `loomlock.html#invite`, `#noise`, `#spicy`.
- `sound.py <variant> <out.wav>` generates each soundtrack (synthesized, royalty-free).

## Re-rendering
```bash
mkdir -p frames && node render.js "$PWD/loomlock.html#invite" "$PWD/frames" 30 20
python3 sound.py invite invite.wav
ffmpeg -y -framerate 30 -i frames/f%05d.jpg -i invite.wav -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart videos/01_invitation_20s.mp4
```
(Durations: invite 20, noise 15, spicy 10.)
