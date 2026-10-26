# Loomlock · Kiosco táctil

Experiencia interactiva vertical (9:16) de ~1 minuto para la pantalla táctil de los eventos Loomlock.
Explica qué es Loomlock, la tarjeta NFC, cómo activarla y cómo se vive la noche (bloqueo en el tótem de Locky → momento presente → desbloqueo).

## Pantallas
Todo pasa en el **CH 02 · Tequila Don Julio**. Locky no aparece dibujado (nivel 0 con marcas de alcohol); solo se nombra el tótem de Locky. Cada pantalla explica una sola idea.

El orden sigue lo que vive el invitado: qué es → preparar la app antes de llegar → recibir la key → tap en la puerta → la noche.

0. **Portada:** tele de tubo en el CH 02 (al tocarla cambia la frase), "Esta noche, con Tequila Don Julio" y aviso +18
1. **01 · Quién te invitó:** PR, Equipo Loomlock, Equipo Don Julio, Equipo Bikini o "Quería conocer a Locky". Se envía al Sheet a los 3 s de elegir
2. **02 · Tu nombre:** "¿Cómo te llamas?" con teclado en pantalla (QWERTY con Ñ). Es opcional; el nombre viaja con la invitación al Sheet (columna E) y aparece en el cierre ("¿Todo listo, Lupe?"). La invitación se envía al salir de esta pantalla
2b. **Qué es:** "Escanea tu key. Apps en pausa." Solo la animación grande: la key toca el celular y aparece el candado
3. **Prepara tu app (pasos 1-5):** a la izquierda una barra de pasos numerada (hechos con ✓, el actual en amarillo); a la derecha las pantallas reales. pantallas reales de la guía *How Experience Mode Works* (iPhone): 1 “Join an experience”, 2 cómo funciona, 3 llamadas y SMS siguen, 4 elige el modo, 5 elige qué queda abierto. Pasan solas o con un toque; después del paso 4 se abre el selector y se toca Guardar
4. **Las keys ("Dos keys, dos usos"):** una sola key grande sobre el azul, sin tarjetas: de un lado es la key de la experiencia (Locky, negra) y al darla vuelta es la key de recuerdo (Don Julio). Arrastrar la inclina en 3D, tocar la da vuelta, y arriba hay dos botones para elegir el lado. Debajo cambia el texto (para qué sirve cada una). Si nadie la toca, se da vuelta sola cada 5 s.
   Antes (versión con dos tarjetas): las keys se mueven: arrastrarlas las inclina en 3D y tocarlas las da vuelta (dorso de la experiencia: "Escanéala en la entrada"; dorso del regalo: el de Don Julio).
   Antes: la key de la experiencia (la del lugar); al tocarla se da vuelta
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

### Dos tipos de keys
La pantalla 04 ("Dos keys, dos usos") compara la **key de la experiencia** (Big Locky, está en el lugar, se escanea al entrar y al salir, no te la llevas) con la **key de recuerdo** (la de Don Julio, `src/keys/gift-key-don-julio.svg`: te la llevas, es coleccionable, no empieza ni termina la experiencia).

El kiosco habla siempre de **una key** / **la key de la experiencia** ("Scan a key", "Venue experience key"), nunca de "tu key": la key que empieza y termina la experiencia está en el lugar, y no se confunde con las keys de recompensa que la gente se lleva.

### Sin la palabra "tap"
Ningún texto visible usa "tap" (ni en español ni en inglés): la acción con la key se dice *escanear* / *scan* (igual que el botón "Scan key and enter now" de la app), y en la pantalla *tocar* / *touch*.

### Alineado con "How Experience Mode Works"
- El selector funciona como la app real (lista de permitidas): se eligen las apps que **quedan abiertas** y todo lo demás se pausa al escanear la key.
- Siempre funcionan llamadas, mensajes y mapas (la guía también menciona el SOS de emergencia).
- El quiz son las "tres cosas que los invitados deben escuchar": nada que comprar (sin cuenta ni producto), nunca incomunicado (llamadas, mensajes y SOS), privado por diseño (solo ve qué app está abierta).

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
