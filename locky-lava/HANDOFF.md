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

## Estado al 19 oct 2026
- `GEMINI_API_KEY` no está en el entorno como variable. La credencial que inyecta el proxy para
  `generativelanguage.googleapis.com` la rechaza Google con `401 API_KEY_SERVICE_BLOCKED`
  (la clave tiene bloqueada la Gemini API en sus restricciones). Sin eso no se pueden generar cuadros.
- Poses bajadas por rango del zip y guardadas en `assets/poses/` (phone, cry, sad, sad-x, yay, wave,
  run, happy, winner).
- `anim/`: placas base sobre verde croma (`base_*.png`), listas de poses (`walk/fall/sad/yay.json`)
  y `anim/generate.sh`, que corre la skill character-animation (Mode 2) para las 4 animaciones.
- Falta: correr `anim/generate.sh` con una clave que ande, cargar los cuadros en `film.js`,
  renderizar y verificar.

## Actualización: rig vectorial (19 oct 2026)
- Lupe pasó `BASIC_LOCKY.svg` (Drive, id `1jjJMNyK7LN-N3q-gKID0HMfmpc54BRXE`), guardado en `assets/`.
- `film.js` ahora dibuja a Locky con los paths oficiales de ese SVG, cada parte rotando en su
  articulación: caminar con el celular, caer gritando, triste y festejar. No usa Gemini.
- `locky-lava.mp4` re-renderizado y verificado (sincronía ✓, -13,9 LUFS).
- Las placas de `anim/` siguen listas para la vía con Gemini si algún día anda la clave.

## Actualización: perspectiva y textos en inglés (19 oct 2026)
- Lupe pidió la perspectiva de su video de referencia: cámara alta mirando un pasillo de lava que se aleja
  hacia el fondo. `film.js` ahora proyecta el escenario desde la fila donde actúa Locky (`VP`, `dep`, `px`):
  caminos de piedra a los costados con bordes iluminados por la lava, paredes, puerta EXIT en la pared derecha.
- Locky se dibuja espejado: costado oscuro a la derecha, celular de perfil en la mano del costado.
- Todos los textos en pantalla están en inglés (Try 1/2/3, AAAH!, IDEA!, BOOM!, MADE IT!). Sin cartel EXIT; la tarjeta final dice "LOCKY — Don't let it consume you".
- Destello naranja en el cuadro exacto de cada caída para que la imagen marque el golpe. Sincronía ✓.

## Actualización: estética del video de referencia y mejor movimiento (19 oct 2026)
- Escenario: cuarto gris claro dibujado con línea negra fina, puertas blancas con arco (la de EXIT se abre al
  ganar), cajas de cartón, lava naranja con manchas suaves desenfocadas, burbujas con brillo, sombra bajo Locky.
- Tipografía: Fredoka 700 (assets/fonts, OFL) blanca con borde negro grueso, como el "3..." de la referencia.
- Locky SIN pupilas: los ojos actúan con forma y posición (deslizados hacia el celular, más altos de susto,
  cerrados, felices, tristes, garabatos de mareo). Pestañea cada ~2,6 s.
- Movimiento: inclinación y rebote al caminar, aplastado en cada paso, el arco con retraso; en cada caída camina
  sobre el vacío, se queda en el aire, se da cuenta y cae estirado; aterrizajes con aplastado y rebote suave;
  anticipación antes de la idea; saltos de festejo con impulso, estirado y aplastado.
- Sacudidas de cámara con el golpe más fuerte en el cuadro del impacto. Sincronía ✓ (todas +0f).

## Actualización: animación de Locky potenciada (19 oct 2026)
- Gag del celular: nunca lo suelta; al caer lo sostiene en alto (pose `phoneUp`) dentro de la lava y volando.
- Caída con "take": camina sobre el vacío, mira hacia abajo, los ojos hacen POP (eyeK con rebote) y cae.
- Caminatas con personalidad: se ríe de algo en el celular (boca `laugh`); cruza el puente confiado (armSwing).
- Impactos: líneas de velocidad en el aire, estallido de trazos y polvo al aterrizar, arco que rebota (shY).
- Alivio después del primer aterrizaje; tristeza con sollozos a ráfagas y lágrimas (tears); respiración en
  las pausas; un salto de festejo con giro completo. Sincronía ✓ (todas +0f).

## Actualización: Locky 2.5D y más distraído (19 oct 2026)
- Rig 2.5D en `locky()`: el cuerpo es una caja que gira (`turn`, radianes; 0 = a cámara, + = hacia la derecha,
  PI = de espaldas). Se proyectan las esquinas: frente y costados se ensanchan/angostan con perspectiva, la cara
  se desliza y se escorza, el arco queda de canto de perfil, de espaldas se ve una cerradura. Brazos y piernas
  (paths oficiales) se clavan en las articulaciones proyectadas y van delante o detrás según la profundidad.
  Costado en azul muy oscuro (#1E2366) para que lea como volumen.
- Giros en la actuación: camina en 3/4 hacia el celular, gira de golpe a cámara en el "take", vueltas en el
  aire mostrando la espalda, se arrastra de perfil hacia la izquierda, triste en 3/4, gira con la idea, salto
  de festejo con giro completo.
- Distraído: encorvado sobre el celular (`hunch`), pulgar escribiendo (`typing`), notificaciones (corazones y
  globitos, `notify`), luz de la pantalla en la cara; en los intentos 1 y 2 se frena a mitad de camino a
  escribir y reírse; tras caer vuelve directo al celular. Sincronía ✓ (todas +0f).

## Arreglo: pies (19 oct 2026)
- Los pies del SVG apuntan a la derecha sin espejar; ahora `limb(..., sx)` los da vuelta según hacia dónde mira
  (sin(turn)) y el balanceo de piernas sigue la dirección de la caminata (`dir`), así no camina "al revés"
  ni hace moonwalk al arrastrarse hacia la izquierda. Caderas a ±70, balanceo 0,36.

## Notas
- Siempre responder en español rioplatense.
- La memoria de Notion no tenía nada sobre Locky ni Loomlock. Se puede guardar si Lupe quiere.
