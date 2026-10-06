# EatsBueno — motion graphics product film

A 47-second, 1920×1080 / 30 fps product video for the EatsBueno app. It is built with the
brandbook's palette, isotype, wordmark and verbal universe, plus the real app screens from
`EatsBueno_App_Assests.zip`.

**Output:** `eatsbueno_product_video.mp4` (H.264 + AAC)

## Storyboard

| Time | Scene | Content |
|---|---|---|
| 0–4.7s | Logo reveal | The eight "seeds" spin in and bloom into the isotype, then the wordmark wipes in (orange brand gradient) |
| 4.7–10s | Brand idea | *EatsBurger · EatsSalad · EatsAnything* → *just* **EatsBueno** |
| 10–15.7s | Manifesto | "Forget strict diets." → "No 'bad' foods. No guilt." → "Just smarter choices." |
| 15.7–22.6s | Personalization | "Built around you": the onboarding flow (welcome → goal → height → weight → activity → "Hello, Srushti") |
| 22.6–29s | Core features | "Every bite, made simple.": meal logging, AI home and barcode scanner |
| 29–35s | AI coach | "A coach that speaks human.": coach conversation with animated chat bubbles |
| 35–41s | Habits | "Celebrate small victories.": hydration, sleep and monthly stats with counters, plus a milestone toast |
| 41–47s | End card | Logo lockup, "A healthier life, your way.", "No diets · No guilt · Just good" |

Brand colors used: `#E26023` orange, `#3B7668` green, `#FAF0DF` cream, `#AFCFC4` mint,
`#F9F4F2` paper and `#1E1E1E` ink. The isotype is the exact vector from the brandbook. The
wordmark is traced from the brandbook at high resolution. Type is Fraunces (a soft serif,
standing in for Cooper BT) with Manrope.

## Files

- `index.html`: the animated composition (GSAP timeline). Open it in a browser to preview it live (it loops).
- `render.mjs`: renders the composition frame by frame with Playwright and pipes the frames to ffmpeg.
- `music.py`: synthesizes the original soundtrack (pad, plucks, soft beat and whooshes timed to the cuts).
- `assets/`: screens, fonts, logo assets and `music.wav`.

## Re-render

```bash
npm i playwright            # or link a global install
python3 music.py assets/music.wav
node render.mjs silent.mp4 30
ffmpeg -i silent.mp4 -i assets/music.wav -c:v copy -c:a aac -b:a 192k -shortest eatsbueno_product_video.mp4
# stills for review:
node render.mjs --stills 3.5,12,26 ./stills
```

Copy and timings live in `index.html`. Change the text or the times in the timeline section, then re-render.
