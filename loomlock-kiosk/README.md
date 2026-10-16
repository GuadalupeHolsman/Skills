# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio** (Locktober). Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky.

0. **Portada:** tele de tubo en el CH 02; al tocarla cambia la frase del canal con estática. Etiqueta del evento y aviso +18
1. **01 · Qué es:** le llegan notificaciones al celular de demo; eliges apps y las pausas (sello FUERA DEL AIRE, las notificaciones se tachan)
2. **02 · Tu llave:** llave holográfica que se inclina, se da vuelta y cambia de edición (la de esta noche es CH 02)
3. **03 · Cómo activarla:** "¿Tienes tu llave?" → con llave: la arrastras al celular · sin llave: arrastras el celular al tótem de Locky. Un tap para pausar y otro para volver al aire
4. **04 · Tu noche:** deslizas la hora (21:00 → +2 días) y se encienden los momentos: ritual, fuera del aire, salida, galería
5. **05 · Mito o verdad:** 5 preguntas rápidas con puntaje, teaser de Loomlock 30 y cierre

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
- `evento`: etiqueta del evento en la portada (hoy `"Locktober · Jue 29 oct"`)
- `canal`: canal de la temporada (`"CH 02"`)
- `anfitrion`: marca anfitriona del canal (`"Tequila Don Julio"`)
- `aviso18`: muestra el aviso de mayores de 18 en la portada
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"es"` o `"en"`)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
