# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
0. Inicio: Locky gigante que sigue el dedo con la mirada, cintas con texto en movimiento; se toca en cualquier lado para empezar
1. ¿Qué es Loomlock? — celular de demo: elegís apps y las "bloqueás" (sello ¡PAUSA! + lluvia de candados); llamadas, música y mapas quedan siempre disponibles
2. Tu tarjeta — tarjeta holográfica que se inclina con el dedo y se da vuelta al tocarla; chip NFC, sin batería, edición limitada
3. Cómo activarla — 4 pasos; se arrastra la tarjeta hasta el celular (o se toca) y se bloquea
4. Tu experiencia hoy — llegada / durante / salida
5. Preguntas rápidas + cierre ("Andá al tótem de Locky") + teaser Loomlock 30

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
- `locky`: `false` para eventos de marcas de alcohol (Don Julio, Smirnoff): saca a Locky de todas las pantallas, según la regla de nivel 0
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"es"` o `"en"`)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
