# Fuentes de las 3 versiones (HyperFrames)

Cada carpeta `v1`, `v2`, `v3` es un proyecto HyperFrames (HTML + GSAP). Los videos finales están en `../versiones/`.

| Versión | Concepto | Duración | Música original desde |
|---|---|---|---|
| v1 | "Your last notification tonight." | 11.8 s | 8.19 s |
| v2 | "3 rules for 29.10." | 12.3 s | 7.23 s |
| v3 | "Same party. Different night." (pantalla dividida) | 12.6 s | 6.94 s |

## Volver a renderizar

1. Copia `assets/` dentro de cada carpeta de versión (`v1/assets`, …).
2. Añade a cada `assets/` el video original como `src.mp4` y su audio como `music_full.wav`:
   `ffmpeg -i tap-in.mp4 -vn -c:a pcm_s16le music_full.wav`
3. `cd v1 && npx hyperframes render -o ../v1.mp4`
4. Normaliza el audio a −14 LUFS / pico ≤ −1 dBFS (limitador sobremuestreado y luego ganancia):
   `ffmpeg -i v1.mp4 -c:v copy -af "aresample=192000,alimiter=limit=0.4:level=false:attack=2:release=60:asc=1,volume=<GANANCIA>dB,aresample=48000" -c:a aac -b:a 192k final.mp4`

Los efectos de sonido de `assets/sfx` están generados con FFmpeg (sin licencias de terceros). La tipografía es Montserrat (SIL Open Font License).
