# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio**. Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky. Cada pantalla explica una sola idea.

0. **Portada:** tele de tubo en el CH 02 (al tocarla cambia la frase), "Tonight, with Tequila Don Julio" y aviso +18
1. **01 · Who invited you:** cinco opciones (PR, Loomlock team, Don Julio team, Bikini team, I wanted to meet Locky). Al elegir, responde con una línea de bienvenida y cuenta una invitación. Se puede cambiar de opinión; la elección se cuenta una vez, cuando termina la sesión
2. **02 · What it is:** "Tap your key. Apps pause." Animación en loop: la key toca el celular y recién ahí se pausan las redes; llamadas, cámara y mapas siguen igual
3. **03 · Your key:** la key del CH 02, que se inclina y se da vuelta (chip NFC)
4. **04 · In the app:** en la app de Loomlock eliges qué apps se pausan y tocas Save. Aviso: "la pausa empieza con un tap: tótem o key"
5. **05 · The tap:** arranca con el tótem de Locky (arrastras el celular al tótem); la otra opción es tu key. Se pausan justo las apps elegidas en el paso 03. Tap para pausar y tap para volver
6. **06 · Your night:** deslizas la hora y se encienden los 4 momentos
7. **07 · Myth or fact:** 5 preguntas rápidas con puntaje y cierre "Head to the totem"

### Íconos y tótem
- Las apps de la demo usan los íconos reales de Instagram, TikTok, YouTube, X y Facebook (glifos del paquete *simple-icons*, licencia CC0, con los colores de cada marca). Los nombres e íconos son marcas de sus dueños y se muestran solo para explicar qué apps se pausan. Juegos, llamadas, cámara y mapas usan íconos genéricos.
- El tótem es Locky mismo (el personaje del archivo `locky.svg`), con ondas NFC sobre la cabeza y una base con el canal. Aparece en la pantalla 05 y en los botones que nombran al tótem.

### Conteo de invitaciones
Para hosting propio (GitHub Pages) el conteo va a un Google Sheet con Apps Script: ver `apps-script/README.md` y poner la URL en `CONFIG.sheetUrl`. Lo de abajo describe la base compartida del preview de claude.ai.

Cada elección se guarda de tres formas: en esa pantalla, en una cola que sobrevive a recargas, y en la **base compartida** del link publicado (colección `invites`, un documento por elección con `id` y `ts`). Si no hay internet o el dispositivo no puede escribir, la cola espera y se sube sola apenas se pueda (cada 30 s). Para verlo: mantén presionado 1,5 s "loomlock experiences" arriba a la izquierda; muestra "All screens" si lee la base compartida, o "This screen only" si no, más cuántas están pendientes de subir. Para que se sincronice, la pantalla debe abrir el link publicado con la sesión de la cuenta dueña (o de alguien con permiso de Contributor).

### Pantallas reales de la app
La pantalla 04 ("Antes de llegar") muestra 5 pantallas reales de la app (`src/app-screens/app1..5.webp`, reducidas desde el zip de diseño): abrir, permitir Screen Time, llamadas y SMS, elegir apps y entrar con la key. Pasan solas y se avanzan con un toque o deslizando. Para cambiarlas, reemplaza los .webp (640 px de ancho) y corre `python3 src/build.py`.

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
- `idioma`: idioma inicial (`"es"` por defecto; el botón ES/EN cambia a inglés)

Después de editar textos o ajustes: `python3 src/build.py` (regenera `index.html` y `artifact.html`).
