# Locky y la lava: resumen para continuar

**Proyecto de:** Lupe
**Rama:** `claude/pensive-cerf-7l7a0y` (repo `guadalupeholsman/skills`)

## La idea
Locky camina distraído mirando el celular y se cae a la lava. Le pasa tres veces, cada vez peor,
hasta que usa el celular como puente y logra cruzar. Inspirado en un video de referencia
(una caja de cartón en un pasillo con lava); el escenario y la puesta en escena son originales.

## Quién es Locky
La mascota de **Loomlock**, la app de Lupe. Es un candado azul (#3A5CFC) con un costado más oscuro
(#2338B4), arco celeste (#8ED6FF) con borde negro, ojos ovalados blancos, sonrisa chiquita con
lengüita rosa, manos blancas redondas y piernas lilas (#9C98EE).

Assets oficiales: Drive de Lupe, zip "Copy of ai stuff (slim, 5 Oct 2026).zip"
(id `1OxHp77AbbnyB_6mKXheplA9E6sXYdMG0`, 3,5 GB). Las poses están en
`ai stuff/loomlock-website/mac/assets/locky/` (29 PNG con transparencia: locky-phone, locky-cry,
locky-sad, locky-yay, locky-run, locky-happy, locky-wave, locky-winner, etc.).
El zip permite descargas por rango (HTTP Range), así que se puede bajar solo esa carpeta sin
traer los 3,5 GB.

## Lo que ya está hecho
- `locky-lava/`: proyecto de la skill **animation-studio** (9:16, 24,6 s, 132 BPM).
  - `score.js`: línea de tiempo y eventos (caídas, idea, puente, festejo).
  - `song.js`: música chiptune y efectos, todo sintetizado.
  - `film.js`: Locky dibujado por código según su diseño, cueva volcánica y lava.
  - `assets/locky-yay.png`: la pose oficial, usada en el cierre.
  - `locky-lava.mp4`: el video final, 1080×1920, H.264 + AAC, -13,8 LUFS. Sincronía verificada.
- Skills instaladas en `.claude/skills/`: **character-animation** (sin sus ejemplos) y las 12 de
  **animation-principles / 01-by-domain**.

## Cómo renderizar (en el contenedor)
Chrome necesita `--no-sandbox` porque corre como root. Usar un script envoltorio:
```
printf '#!/bin/sh\nexec /opt/pw-browsers/chromium-1194/chrome-linux/chrome --no-sandbox --disable-dev-shm-usage "$@"\n' > /tmp/chrome.sh && chmod +x /tmp/chrome.sh
cd locky-lava && export CHROME_PATH=/tmp/chrome.sh
node song.js && node engine/render.js video && node engine/render.js mux && node engine/render.js verify
```
`video` tarda unos 2,5 minutos: correrlo en segundo plano.

## Próximo paso
1. Comprobar que `GEMINI_API_KEY` esté cargada en el entorno (sin mostrarla).
2. Bajar las poses de Locky del Drive.
3. Con **character-animation**, generar animaciones de Locky a partir de las poses oficiales:
   caminar con el celular, caer o gritar, llorar o estar triste, festejar.
4. Reemplazar en `film.js` al Locky dibujado por esos cuadros (sprites con `Studio.loadImage`),
   volver a renderizar, verificar y mandar el video.

## Notas
- Siempre responder en español rioplatense.
- La memoria de Notion no tenía nada sobre Locky ni Loomlock. Se puede guardar si Lupe quiere.
