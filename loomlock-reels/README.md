# Loomlock: reels "la key transforma tu teléfono"

Tres reels verticales 9:16 (1080×1920, 30 fps, H.264 + AAC) que explican el concepto: **según qué key (tarjeta NFC) le toques al teléfono, el teléfono se convierte en otra cosa y hace un solo trabajo.**

Todo está dibujado y sintetizado con código, sin footage ni música de stock, así que no hay temas de derechos. Locky y el logo salen de los archivos originales del Drive ("Locky" → `BASIC_LOCKY.svg`, "Loomlock Logo" → `LoomlockFull.svg`).

## Contexto usado (Drive)
- Guion **"Ruido, corte, silencio"** de Estudio Astora. Tesis: *"El tap no te quita el teléfono. Le da un solo trabajo."*
- Evento Cine Colombia: **Cinema Mode**, que bloquea todas las apps hasta que termina la función.
- Mascota Locky y paleta: azul `#3F49CC`, celeste `#9FD8FF` y lila `#878EE5`.

## Nicho / ángulo
Los competidores (Brick, Unpluq, Foqos) venden **un** tag que bloquea apps. El diferencial que estos reels empujan es otro: **cada key es un modo distinto** (Cine, Gym, Foco, Dormir). Por eso las tres versiones muestran varias keys y el teléfono cambiando de identidad con cada una.

---

## V1: "Una key, un trabajo" (explainer musical, ~22 s)
`loomlock-v1-una-key-un-trabajo.mp4`

Teléfono saturado de notificaciones (cada notificación es una nota musical y se acelera) → 1/8 de silencio → cuatro taps en cuatro compases: **Cine → Gym → Foco → Dormir**. En cada tap el fondo y la pantalla se transforman desde el punto de contacto y entra un instrumento nuevo. Cierra con el abanico de las 4 keys y luego Locky con el logo.

- **Hook (0–1 s):** "Tu teléfono hace TODO."
- **Caption:** Tu teléfono no tiene que hacerlo todo. Tap a la key de Cine y solo hay peli. Tap a la de Gym, solo tu rutina. Una key, un trabajo. Y ya. 🔒
- **Hashtags:** #loomlock #detoxdigital #productividad #menospantalla #nfc

## V2: "Ruido, corte, silencio" (de marca, 15 s)
`loomlock-v2-ruido-corte-silencio.mp4`

Sigue al pie de la letra el guion de Astora:
- **Acto 1, ruido (0–6 s):** cortes que se aceleran de 0.75 s a 0.18 s (teléfono, Locky iluminado de azul, pared de notificaciones, mesa con celulares, scroll infinito).
- **Acto 2, corte:** un momento en negro y silencio total. Entra la key y suena **un solo tap seco** que no se repite. La pantalla hace su trabajo (Modo Dormir) y el teléfono va al bolsillo.
- **Acto 3, silencio:** el mismo encuadre de Locky, ahora con luz de ventana. Respira y baja los hombros. Solo ambiente, sin música. Un único texto, **"un trabajo, y ya"**, y después la marca.
- **Caption:** El tap no te quita el teléfono. Le da un solo trabajo.

## V3: "Locky tiene una key para todo" (comedia, ~18 s)
`loomlock-v3-locky-una-key-para-todo.mp4`

Escalada en 3 rondas, cada una más grande. Locky saca una key, toma impulso y la estampa contra el teléfono:
1. **Cine:** llueven crispetas.
2. **Gym:** sentadillas a cada beat, con mancuerna.
3. **Dormir:** *record scratch*, la banda se calla, el tap suena en silencio, se apagan las luces, canción de cuna y Locky se queda dormido (zzz).

Remate: vuelve la banda con el logo y las 4 keys orbitando a Locky. "Una key para cada momento."
- **Caption:** ¿Peli? Key Cine. ¿Gym? Key Gym. ¿Dormir? Ya sabes 😴 Una key para cada momento.

---

## Para revisar antes de publicar
- Los nombres y colores de los modos (Cine, Gym, Foco, Dormir) y los textos de pantalla ("6:30 alarma", "Todo en pausa hasta que acabe la función") son ilustrativos. Confirmen que coinciden con los modos reales de la app.
- El CTA final es "Tap. Modo. Listo." (no lleva URL ni @). Si quieren poner el handle o el link, se cambia en una línea.
- La safe zone de Reels/TikTok está respetada: los textos quedan fuera del 11% superior, del 22% inferior y del borde derecho.

## Cómo regenerar o editar
Cada versión es un proyecto en la raíz del repo (`loomlock-reel-keys/`, `loomlock-reel-silencio/`, `loomlock-reel-locky/`):
- `score.js`: la línea de tiempo (tempo, taps, textos).
- `song.js`: la música.
- `film.js`: la imagen.
- `loom.js`: el kit compartido de marca (keys, pantallas de modo, Locky, logo). La copia maestra está en `loomlock-shared/`.

```bash
cd loomlock-reel-keys
node song.js && node engine/render.js video && node engine/render.js mux   # → out/loomlock-reel-keys.mp4
```
Si Chromium corre como root, apunten `CHROME_PATH` a un wrapper que agregue `--no-sandbox`.
