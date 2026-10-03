# loomlock explainer videos

| Video | 16:9 | 9:16 |
|---|---|---|
| What are we? (42s) | `videos/loomlock_what-are-we_16x9_EN.mp4` / `_ES` | `videos/loomlock_what-are-we_9x16_EN.mp4` / `_ES` |
| How to use loomlock Experiences (54s) | `videos/loomlock_how-to-experiences_16x9_EN.mp4` / `_ES` | `videos/loomlock_how-to-experiences_9x16_EN.mp4` / `_ES` |

Videos are silent, so add a music track in your editor or social app.

## Editing and re-rendering
The videos are HTML/CSS 3D animations (`source/`). All on-screen copy is in `v1.js` (`T1`), `v2.js` (`T2`) and `screens.js` (`STR`), in English and Spanish.

```bash
cd source
./extract-footage.sh <lockbox.mp4> <YB1.mp4> <P1.mp4>   # rebuild footage frames (needs ffmpeg)
node render.js 1 h en stills preview.jpg 2,10,20      # quick preview sheet
node render.js 2 v es video out.mp4 4                 # video 2, vertical, Spanish, 4 workers
```
Arguments: `<video 1|2> <h|v> <en|es>`. Requires Node and Playwright with Chromium.
