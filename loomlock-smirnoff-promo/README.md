# Loomlock Experiences × Smirnoff Spicy Tamarind: videos (EN)

All three videos use one visual language: cuts on the beat (120 bpm), huge type and a different full-bleed pattern in the Spicy Tamarind and Loomlock colors on every beat. Each ends on stacked pattern blocks with the logos. Format is 9:16, 1080×1920, 30 fps.

| File | Content | Length |
|---|---|---|
| `videos/01_invitation_20s.mp4` | You're invited → Sweet/Tart/Spicy → Tap. Lock. Live. → brands → DATE / DOORS / VENUE → "Tap your key at the door" → closing card with details and RSVP | 20 s |
| `videos/02_social_put-your-phone-down_15s.mp4` | Put your phone down → Tap. Lock. Live. → Sweet/Tart/Spicy (stacked bands) → Live now. Post later. → brands. No event details. | 15 s |
| `videos/03_social_sweet-tart-spicy_10s.mp4` | Sweet. Tart. Spicy. Tamarind. Tap. Lock. Live. → brands. No event details. | 10 s |

Event details (invitation only) and the legal line go in `EVENT` at the top of `beats.html`. Variants: `beats.html#invite`, `#noise`, `#spicy`. Audio: `python3 sound.py <variant> out.wav`.
