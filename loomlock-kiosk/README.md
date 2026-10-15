# Loomlock · Kiosco táctil

Experiencia interactiva de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
0. Inicio (Locky animado, "Tocá para empezar")
1. ¿Qué es Loomlock? — celular de demo: elegís apps y las "bloqueás"; llamadas, música y mapas quedan siempre disponibles
2. Tu tarjeta — se da vuelta al tocarla; chip NFC, sin batería, edición limitada
3. Cómo activarla — 4 pasos; se arrastra la tarjeta hasta el celular (o se toca) y se bloquea
4. Tu experiencia hoy — llegada / durante / salida
5. Preguntas rápidas + cierre ("Andá al tótem de Locky") + teaser Loomlock 30

Botón ES/EN arriba a la derecha. Si nadie toca la pantalla por 60 s, vuelve sola al inicio.

## Cómo usarla en el evento
- Abrir `index.html` en Chrome en la pantalla táctil, en modo kiosco:
  `chrome --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 file:///ruta/a/index.html`
- Funciona en horizontal (1920×1080) y vertical (1080×1920).
- Las tipografías vienen de Google Fonts; sin internet usa tipografías de respaldo y todo sigue funcionando.

## Ajustes rápidos
En `src/kiosk.template.html`, dentro de `CONFIG`:
- `evento`: nombre del evento que aparece en la portada (ej. `"Locktober × Don Julio"`)
- `idleSegundos`: segundos sin uso antes de volver al inicio
- `idioma`: idioma inicial (`"es"` o `"en"`)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
