# Loomlock Experience × Smirnoff Spicy Tamarindo, video promo

- `loomlock_smirnoff_spicy_tamarindo.mp4`: video final, 1080×1920 (9:16), 15 s, 30 fps, con audio.
- `promo.html`: la animación. Los datos del evento (fecha, lugar, CTA) están en el objeto `EVENT` dentro del `<script>`.
- Concepto: Ruido → Corte (tap) → Silencio, del guion de marca de Loomlock, en motion graphics: patrones spicy y notificaciones apiladas, la key de Loomlock con el tap, el barrido al azul de marca (#3F49CC), "Live now. Post later." y un tejido de telar con los colores de Smirnoff Spicy Tamarindo.
- `mark.svg` / `lockup.svg`: logo oficial de Loomlock (de `LoomlockFull.svg`).
- `sound.py`: genera `sound.wav` (sintetizada y libre de derechos).

Para volver a renderizarlo después de editar `promo.html`:

```bash
mkdir -p frames
node render.js "$PWD/promo.html" "$PWD/frames" 30 15
ffmpeg -y -framerate 30 -i frames/f%05d.jpg -i sound.wav -c:v libx264 -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart loomlock_smirnoff_spicy_tamarindo.mp4
```
