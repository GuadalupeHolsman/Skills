# Loomlock Experience × Smirnoff Spicy Tamarindo, video promo

- `loomlock_smirnoff_spicy_tamarindo.mp4`: video final, 1080×1920 (9:16), 15 s, 30 fps, con audio.
- `promo.html`: la animación. Los datos del evento (fecha, lugar, CTA) están en el objeto `EVENT` dentro del `<script>`.
- `beat.py`: genera la pista `beat.wav` (120 bpm, sintetizada y libre de derechos).

Para volver a renderizarlo después de editar `promo.html`:

```bash
mkdir -p frames
node render.js "$PWD/promo.html" "$PWD/frames" 30 15
ffmpeg -y -framerate 30 -i frames/f%05d.jpg -i beat.wav -c:v libx264 -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart loomlock_smirnoff_spicy_tamarindo.mp4
```
