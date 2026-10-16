# Loomlock: reels v3 (estética de marca)

Tercera ronda, hecha con el **Brandbook de Loomlock** como base. Se mantienen la idea y el concepto de la v2. Cambia la ejecución, que ahora se ve y suena a Loomlock.

| Archivo | Qué es | Duración |
|---|---|---|
| `loomlock-v3-la-key-lo-cambia-todo.mp4` | Reel principal: FOOH de Bogotá, transformación 3D y el candado Loomlock | 20 s |
| `loomlock-v3-locky.mp4` | Locky oficial en 3D con actuación de personaje | 19 s |

## Qué se tomó del Brandbook
- **Tipografía (§3):** Montserrat ExtraBold en titulares, con dos tonos (blanco + lavanda `#C0C8FF`, como en "What is / loomlock"). Las píldoras navy con texto en itálica vienen del recurso "Core Idea". Baloo Bhaina 2 se usa en el detalle juguetón de las "z".
- **Color (§2):** fondos en el azul de marca (`#3F49CC` → `#1D29C2` / `#121B95` / navy `#121C66`). Cada key tiene **un solo** acento ("los acentos agregan emoción, nunca le ganan a la estructura"):
  - Cine: `#E83852`
  - Gym: `#68EE8F`
  - Foco: `#FCCE21`
  - Dormir: `#C0C8FF`
- **Recursos gráficos:** los contornos gigantes del isotipo que se salen del cuadro (páginas "Core Idea" y "Design & Aesthetic") y las estrellas de 4 puntas de las ilustraciones.
- **Formas (§4.2):** "orgánicas, sin ángulos duros". Los cubos ahora son cubitos redondeados.
- **Producto (§Ecosystem):** el cierre del reel principal es **el candado Loomlock real** (cuerpo azul brillante, argolla cromada, isotipo blanco), igual al render del brand book.
- **App (§6):** las pantallas del teléfono ahora son la app Loomlock: interfaz lavanda calma, "Sesión activa", botón azul de marca.
- **Tono (§6):** "hablamos como una persona real, no como una marca motivacional". Se fueron "TODO. EL. TIEMPO." y los flashes agresivos. El copy nuevo:
  - "Tomate una pausa."
  - "¿Y si hiciera una sola cosa?"
  - "Locky no lo apaga. Le da un solo trabajo."
  - "No obliga. Invita."
  - "Una key para cada momento."
- **Logo (§1.1):** "calmo, no ruidoso", con espacio libre alrededor. Por eso no hay flash fuerte en el logo y el wordmark tiene aire.

## Locky (§4, página "Illustration & Character")
- **Modelo fiel a la ficha:**
  - Frente `#3B5CFF` y laterales navy `#141C62`.
  - Argolla `#9FD8FF` gruesa y redondeada, con las bisagras encastradas como pide la nota del manual.
  - Ojos blancos y boca rosa `#FF97D5`.
  - Brazos blancos con mano de bolita, medias navy y botas lila `#878EE5`.
- **Contorno toon (inverted hull):** es el Locky ilustrado de los stickers, pero en 3D.
- **Rig y actuación:**
  - Ciclo de caminata, squash & stretch con volumen preservado y anticipación antes de cada salto.
  - Parpadeos y expresiones: ojos abiertos, sorprendidos, felices (^^) y cerrados; boca sonrisa y boca "o".
  - Saluda, se asusta, suspira, festeja, come una crispeta, hace fuerza, bosteza y se duerme.
- **El gesto de marca:** cuando lo superan las notificaciones, la argolla de Locky **se abre de golpe**. Cuando decide, **hace click y se cierra**. Es "No simboliza restricción, sino decisión" (Brandbook, Our Ecosystem).
- Locky "acompaña, no ordena" (OC Locky): no castiga al teléfono, le da un solo trabajo.

## Sonido
Música original de ElevenLabs (la misma base de la v2, con los eventos fijados a sus beats) y foley nuevo de ElevenLabs para la actuación de Locky: pasitos, saludo, golpe del teléfono al caer, argolla que se abre, click de cierre, suspiro, crispeta, bostezo y ronquido.

## Regenerar
`loomlock-v3-hero/` y `loomlock-v3-locky/` (en Locky, `python3 build.py` arma `film.js` desde `film.tpl.js`). El kit de marca compartido es `loomlock-shared/brand.js` y las fuentes oficiales (OFL) están en `loomlock-shared/fonts/`.
