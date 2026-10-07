# Locky hosts the night — Loomlock × Don Julio · 29.10

Reel vertical de 14.7 s hecho con el brandbook de Loomlock: Montserrat + Baloo 2, paleta core/accent, logo oficial y Locky como anfitrión.

Mismo cuerpo, tres ganchos distintos para test A/B:

| Archivo | Gancho (0–3 s) |
|---|---|
| `locky-A-your-phone-wants-your-night.mp4` | El teléfono se llena de notificaciones: "Your phone wants *your night.*" |
| `locky-B-psst-want-your-night-back.mp4` | Locky se asoma: "psst…" → "Want your *night back?*" |
| `locky-C-what-if-tonight.mp4` | Solo tipografía: "What if tonight was just *tonight?*" |

Cuerpo: Locky llega con la llave → "I'll hold it for you." → un toque y las apps se convierten en candados → "Go. Be there." → la noche en arcos con momentos reales (talk / dance / be there) → "Tonight, you chose to." → cierre Loomlock × Don Julio, 29.10, "Tap in at the door.", "Send this to your +1.", +18 y "Please drink responsibly".

Audio: música original desde 5.31 s (el drop cae en el arco amarillo), −14 LUFS, pico ≤ −4.5 dBFS.

## Editar / volver a renderizar

`proyecto/` es un proyecto HyperFrames. Añade a `proyecto/assets/` el video original como `src.mp4` y su audio como `music_full.wav` y luego:

```
cd proyecto
npx hyperframes render --variables '{"hook":"a"}' -o A.mp4   # "a" | "b" | "c"
```
