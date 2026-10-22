# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio**. Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky. Cada pantalla explica una sola idea.

El orden sigue lo que vive el invitado: qué es → preparar la app antes de llegar → recibir la key → tap en la puerta → la noche.

0. **Portada:** tele de tubo en el CH 02 (al tocarla cambia la frase), "Esta noche, con Tequila Don Julio" y aviso +18
1. **01 · Quién te invitó:** PR, Equipo Loomlock, Equipo Don Julio, Equipo Bikini o "Quería conocer a Locky". Se envía al Sheet a los 3 s de elegir
2. **02 · Qué es:** "Escanea tu key. Apps en pausa." Solo la animación grande: la key toca el celular y aparece el candado
3. **03 · Prepara tu app (pasos 1-4):** pantallas reales de la app, numeradas: 1 abre la app, 2 permite Screen Time, 3 llamadas y SMS siguen, 4 elige tus apps. Pasan solas o con un toque; después del paso 4 se abre el selector y se toca Guardar
4. **04 · Tu key:** la key de Locky; al tocarla se da vuelta
5. **05 · La entrada (paso 5):** el celular arranca con la pantalla real *You're Event Ready!*; al acercarlo al tótem de Locky (o con tu key) la pantalla se desliza y se bloquean las apps elegidas en el paso 03. Otro tap y vuelven
6. **06 · Tu noche:** 4 momentos (puerta, adentro, salida, galería); las fotos quedan en la web de Loomlock Experiences
7. **07 · Mito o verdad:** 3 preguntas rápidas y cierre "Ve al tótem"

### Íconos y tótem
- Las apps de la demo usan los íconos reales de Instagram, TikTok, YouTube, X y Facebook (glifos del paquete *simple-icons*, licencia CC0, con los colores de cada marca). Los nombres e íconos son marcas de sus dueños y se muestran solo para explicar qué apps se pausan. Juegos, llamadas, cámara y mapas usan íconos genéricos.
- El tótem es Locky mismo (el personaje del archivo `locky.svg`), con ondas NFC sobre la cabeza y una base con el canal. Aparece en la pantalla 05 y en los botones que nombran al tótem.

### Conteo de invitaciones
Para hosting propio (GitHub Pages) el conteo va a un Google Sheet con Apps Script: ver `apps-script/README.md` y poner la URL en `CONFIG.sheetUrl`. Lo de abajo describe la base compartida del preview de claude.ai.

Cada elección se guarda de tres formas: en esa pantalla, en una cola que sobrevive a recargas, y en la **base compartida** del link publicado (colección `invites`, un documento por elección con `id` y `ts`). Si no hay internet o el dispositivo no puede escribir, la cola espera y se sube sola apenas se pueda (cada 30 s). Para verlo: mantén presionado 1,5 s "loomlock experiences" arriba a la izquierda; muestra "All screens" si lee la base compartida, o "This screen only" si no, más cuántas están pendientes de subir. Para que se sincronice, la pantalla debe abrir el link publicado con la sesión de la cuenta dueña (o de alguien con permiso de Contributor).

### Pantallas reales de la app
No es un paso aparte: la app real aparece dentro de los pasos que ya existían. En "Elige qué se pausa" el celular arranca mostrando la pantalla real *App Group Setup*; al tocarlo se abre el selector de apps. En "Un tap y entras" arranca con la pantalla real *You're Event Ready!* y, al acercar el celular al tótem (o la key), esa pantalla se va y aparece el bloqueo. Las imágenes están en `src/app-screens/` (`app4.webp` y `app5.webp`, 640 px de ancho, reducidas del zip de diseño); para cambiarlas reemplaza los archivos y corre `python3 src/build.py`.

### La key
La key que se ve en todo el kiosco es el diseño *Big Locky* (Locky con ondas NFC sobre negro), de `src/keys/locky-key.svg`, convertido del PDF `Big_locky_200_B.pdf`. Se usa en "Qué es", en "Tu key" (mismo arte de los dos lados) y como la key que se arrastra en "Tengo mi key". Para cambiarla, reemplaza ese SVG y corre `python3 src/build.py`.

### Sin la palabra "tap"
Ningún texto visible usa "tap" (ni en español ni en inglés): la acción con la key se dice *escanear* / *scan* (igual que el botón "Scan key and enter now" de la app), y en la pantalla *tocar* / *touch*.

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
