# EatsBueno — motion graphics product film

A 60-second, 1920×1080 / 30 fps product video for the EatsBueno app. It is built with the
brandbook's palette, isotype, wordmark and verbal universe, plus the real app screens from
`EatsBueno_App_Assests.zip`. Most of the runtime is a live app walkthrough: one continuous phone
with taps (finger and ripple), typing, scrolling, screen transitions and camera zoom-ins on the UI.
Each tap and keystroke has a sound.

**Output:** `eatsbueno_product_video.mp4` (H.264 + AAC)

## Storyboard

| Time | Scene | Interaction |
|---|---|---|
| 0–4.4s | Logo reveal | The eight "seeds" spin in and bloom into the isotype, then the wordmark wipes in |
| 4.4–9s | Brand idea | *EatsBurger · EatsSalad · EatsAnything* → *just* **EatsBueno** |
| 9–19.6s | 1 · Get started: "Built around you." | Tap *Create an Account* → pick a goal → *Continue* through height, weight and activity → zoom on "Hello, Srushti" |
| 19.6–30.6s | 2 · AI coach: "A coach that speaks human." | Zoom in and tap energy *High* → type "Suggest some good lunch options" → send → the coach's answer streams in while the camera follows |
| 30.6–43.4s | 3 · Log in seconds: "Scan it. Log it. Done." | Tap **+** → *Product* → barcode scan (scan line and flash) → product card → *Log meal* → journal → open the meal detail and scroll |
| 43.4–54s | 4 · Build habits: "Celebrate small victories." | *Add record* fills the water glass → *Add Sleep Log* → zoom on 8.0 hours → monthly stats, plus a "Keep it up!" milestone |
| 54–60s | End card | Logo lockup, "A healthier life, your way.", "No diets · No guilt · Just good" |

## Brand

- **Colors:** `#E26023` orange, `#3B7668` green, `#FAF0DF` cream, `#AFCFC4` mint, `#F9F4F2` paper and `#1E1E1E` ink.
- **Logo:** the isotype is the exact vector from the brandbook, and the wordmark is traced from it at high resolution.
- **Type:** Cooper BT, the brand font (Light, Light Italic, Bold, Bold Italic, Medium and Black), with Manrope for body text.
  Cooper BT is a commercial font and this repository is public, so its files are **not** committed.
  To render with it, put the `.ttf` files in `assets/fonts/cooperbt/` (this folder is gitignored).
  Without them, the composition falls back to [Cooper*](https://github.com/indestructible-type/Cooper),
  an OFL-licensed revival of the same family (`assets/fonts/Cooper-OFL.txt`).

## Files

- `index.html`: the animated composition (GSAP timeline). Open it in a browser to preview it live (it loops).
- `render.mjs`: renders the composition frame by frame with Playwright and pipes the frames to ffmpeg. It also exports the timing metadata.
- `music.py`: synthesizes the original soundtrack. Whooshes, UI taps and keyboard ticks are synced from `assets/meta.json`.
- `assets/`: screens, fonts, logo assets, `meta.json` and `music.wav`.

## Re-render

```bash
npm i playwright            # or link a global install
node render.mjs --meta assets/meta.json
python3 music.py assets/music.wav assets/meta.json
node render.mjs silent.mp4 30
ffmpeg -i silent.mp4 -i assets/music.wav -c:v copy -c:a aac -b:a 192k -shortest eatsbueno_product_video.mp4
# stills for review:
node render.mjs --stills 3.5,12,26 ./stills
```

Tap positions, zoom targets and timings live in the timeline section of `index.html`. The
`tap(x, y, t)` and `zoom(x, y, scale, t)` helpers take screen-relative coordinates from 0 to 1.
