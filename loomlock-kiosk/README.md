# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio**. Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky. Cada pantalla explica una sola idea.

0. **Portada:** tele de tubo en el CH 02 (al tocarla cambia la frase), "Esta noche, con Tequila Don Julio" y aviso +18
1. **01 · Qué es:** esquema "En pausa" (redes) vs "Siempre funcionan" (llamadas, cámara, mapas)
2. **02 · Pruébalo:** demo guiada en 3 pasos: Elige → Pausa → Listo
3. **03 · Tu llave:** llave holográfica que se inclina, se da vuelta y cambia de edición
4. **04 · Antes de llegar:** dos pasos para tocar (descarga la app, elige tus apps)
5. **05 · El tap:** "¿Tienes tu llave?" → llave al celular, o celular al tótem de Locky. Tap para pausar y tap para volver
6. **06 · Tu noche:** deslizas la hora y se encienden los 4 momentos
7. **07 · Mito o verdad:** 5 preguntas rápidas con puntaje y cierre "Ve al tótem"

## Estética
Usa la dirección de arte de **Prime Time · loomlock experiences**: cada pantalla es un canal de TV (CH 01 a CH 05), azul canal `#2F3AD0`, amarillo señal `#FCCE21`, negro pantalla y papel; Montserrat fina en mayúsculas con énfasis en itálica gruesa, rótulos en Space Mono; grano, líneas de TV, estática al cambiar de canal y respuestas "tachadas" que se destapan. Firma: *live now, post later.*

## Ajustes rápidos
En `src/kiosk.template.html`, dentro de `CONFIG`:
- `evento`: etiqueta opcional en la portada (hoy vacía)
- `canal`: canal de la temporada (`"CH 02"`)
- `anfitrion`: marca anfitriona del canal (`"Tequila Don Julio"`)
- `aviso18`: muestra el aviso de mayores de 18 en la portada
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"es"` o `"en"`)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
