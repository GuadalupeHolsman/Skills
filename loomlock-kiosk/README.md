# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas (canales)
0. **Portada:** tele de tubo; al tocarla cambia de canal con estática (Locky aparece solo en el canal de inicio)
1. **CH 01 · Qué es:** le llegan notificaciones al celular de demo; eliges apps y las pausas (sello FUERA DEL AIRE, las notificaciones se tachan)
2. **CH 02 · Tu llave:** llave holográfica que se inclina, se da vuelta y cambia de edición (CH 01, 02, 03)
3. **CH 03 · El tap:** arrastras la llave al celular para pausar y otra vez para volver al aire
4. **CH 04 · Tu noche:** deslizas la hora (21:00 → +2 días) y se encienden los momentos: ritual, fuera del aire, salida, galería
5. **CH 05 · Mito o verdad:** 4 preguntas rápidas con puntaje, teaser de Loomlock 30 y cierre

Botón ES/EN arriba a la derecha. Si nadie toca la pantalla por 60 s, vuelve sola al inicio.

## Cómo usarla en el evento
- Abrir `index.html` en Chrome en la pantalla táctil, en modo kiosco:
  `chrome --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 file:///ruta/a/index.html`
- Diseñada en vertical 9:16 (1080×1920). En cualquier otra pantalla se escala sola y deja bandas a los costados.
- Las tipografías vienen de Google Fonts; sin internet usa tipografías de respaldo y todo sigue funcionando.

## Estética
Usa la dirección de arte de **Prime Time · loomlock experiences**: cada pantalla es un canal de TV (CH 01 a CH 05), azul canal `#2F3AD0`, amarillo señal `#FCCE21`, negro pantalla y papel; Montserrat fina en mayúsculas con énfasis en itálica gruesa, rótulos en Space Mono; grano, líneas de TV, estática al cambiar de canal y respuestas "tachadas" que se destapan. Firma: *live now, post later.*

## Ajustes rápidos
En `src/kiosk.template.html`, dentro de `CONFIG`:
- `evento`: nombre del evento que aparece en la portada (ej. `"Locktober × Tequila Don Julio"`)
- `canal`: canal de la temporada que se ve en la TV y en la llave (ej. `"CH 02"`)
- `locky`: Locky solo aparece en la tele de la portada. `false` lo saca del todo (usar con marcas de alcohol, como Don Julio o Smirnoff, por la regla de nivel 0)
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"es"` o `"en"`)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
