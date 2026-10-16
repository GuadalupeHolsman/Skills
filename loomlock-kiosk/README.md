# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio**. Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky. Cada pantalla explica una sola idea.

0. **Portada:** tele de tubo en el CH 02 (al tocarla cambia la frase), "Tonight, with Tequila Don Julio" y aviso +18
1. **01 · What it is:** "Tap your key. Apps pause." Animación en loop: la key toca el celular y recién ahí se pausan las redes; llamadas, cámara y mapas siguen igual
2. **02 · Your key:** la key del CH 02, que se inclina y se da vuelta (chip NFC)
3. **03 · In the app:** en la app de Loomlock eliges qué apps se pausan y tocas Save. Aviso: "la pausa empieza con un tap: tótem o key"
4. **04 · The tap:** arranca con el tótem de Locky (arrastras el celular al tótem); la otra opción es tu key. Se pausan justo las apps elegidas en el paso 03. Tap para pausar y tap para volver
5. **05 · Your night:** deslizas la hora y se encienden los 4 momentos
6. **06 · Myth or fact:** 5 preguntas rápidas con puntaje y cierre "Head to the totem"

## Estética
Usa la dirección de arte de **Prime Time · loomlock experiences**: cada pantalla es un canal de TV (CH 01 a CH 05), azul canal `#2F3AD0`, amarillo señal `#FCCE21`, negro pantalla y papel; Montserrat fina en mayúsculas con énfasis en itálica gruesa, rótulos en Space Mono; grano, líneas de TV, estática al cambiar de canal y respuestas "tachadas" que se destapan. Firma: *live now, post later.*

## Motion
- Cambio de canal tipo TV de tubo: la pantalla se apaga a una línea, pasa estática y la siguiente se enciende
- Los bloques entran escalonados desde el lado hacia donde vas (adelante o atrás); los títulos caen palabra por palabra y el rótulo se escribe solo
- Cada toque deja una onda amarilla; en pantallas Android también vibra
- Ambiente: barrido de luz, barra que rueda dentro de la tele y glitch del título PRIME TIME
- Cuando terminas lo que propone cada pantalla, el botón Next empieza a latir (o a los 9 s)
- Micro-animaciones: apps que se apagan una por una, aviso OFF AIR / ON AIR, key que entra volando, checks que saltan, momentos en cascada, preguntas que giran
- Con "reducir movimiento" activado en el sistema, todo se apaga

## Ajustes rápidos
En `src/kiosk.template.html`, dentro de `CONFIG`:
- `evento`: etiqueta opcional en la portada (hoy vacía)
- `canal`: canal de la temporada (`"CH 02"`)
- `anfitrion`: marca anfitriona del canal (`"Tequila Don Julio"`)
- `aviso18`: muestra el aviso de mayores de 18 en la portada
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"en"` por defecto; el botón ES/EN cambia a español)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
