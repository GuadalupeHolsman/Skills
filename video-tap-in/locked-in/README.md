# LOCKED IN — Loomlock × Don Julio · 29.10

Reel vertical de 14.7 s con estética de club: negro y azul profundo, toques de amarillo, grano de película, tipografía gigante y una cuadrícula de seis pantallas cortada al beat. Sin personajes, porque es una marca de alcohol.

Marca: Montserrat (ExtraBold / SemiBold), azul `#1D29C2`, amarillo `#FCCE21`, logo oficial de Loomlock.

| Tiempo | Qué pasa |
|---|---|
| 0–1.4 s | Gancho, una palabra por medio beat: **LEAVE / YOUR / PHONE / AT THE / DOOR.** |
| 1.4–2.9 s | **29.10**: invite only · thursday |
| 2.9–5.1 s | Tap diseñado: teléfono desbordado de notificaciones → la tarjeta Loomlock Experience Key (logo y patrón del brandbook) toca → anillos → las notificaciones colapsan → pantalla azul con el logo, LOCKED IN / UNTIL 04:00. Textos: **TAP IN.** → **STAY IN.** |
| 5.1–7.2 s | La cuadrícula se arma pantalla a pantalla: NO PHOTOS. NO FEED. JUST TONIGHT. (strobe antes del drop) |
| 7.2–10.1 s | Drop: BE HERE. DANCE. TALK. LOSE TRACK. En cada beat una pantalla se pone a todo color |
| 10.1–11.5 s | **UNPOSTED. UNFORGETTABLE.** |
| 11.5–14.7 s | Loomlock × Don Julio, 29.10, TAP IN AT THE DOOR, Please drink responsibly, +18 |

## Versiones

| Archivo | Música | Color |
|---|---|---|
| `locked-in-A-tarjeta-loomlock.mp4` | track original del reel (desde 5.31 s) | azul `#1D29C2`, con la tarjeta Loomlock (Experience Key) en el tap |
| `locked-in-AB-tarjeta-loomlock-intermedia.mp4` | track original | intermedia: golpe medio, split RGB sutil, sacudida suave, frames invertidos solo en 29.10, el drop y el tagline |
| `locked-in-B-tarjeta-loomlock-impacto.mp4` | track original | igual que A, con textos de impacto: slam, split RGB, sacudida, frames invertidos y zoom-through |
| `locked-in-techno-violeta.mp4` | techno oscuro con línea acid (original) | violeta `#5713C0` |
| `locked-in-afro-house-naranja.mp4` | afro house: congas, shaker, marimba (original) | naranja `#D87700` |
| `locked-in-garage-cian.mp4` | UK garage / 2-step con swing (original) | cian `#0C77B7` |

Las tres músicas nuevas están compuestas por código (`musica/synth.py`, WAV en `musica/`), así que no tienen derechos de terceros. Todas van a 125 BPM con el drop en 7.20 s (cae en "BE HERE."). Audio a −14 LUFS.

## Editar / volver a renderizar
En `proyecto/`: añade el video original como `assets/src.mp4` y su audio como `assets/music_full.wav`. Si cambias `template_lockedin.html`, regenera con
`python3 build_lockedin.py index.html template_lockedin.html <música> <inicio> <color>` (ej. `assets/techno.wav 0 '#5713c0'`; añade al final `0` (calma), `1` (intermedia) o `2` (impacto)) y luego `npx hyperframes render -o out.mp4`.
