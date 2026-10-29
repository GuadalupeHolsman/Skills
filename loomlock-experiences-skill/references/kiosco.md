# Kiosco loomlock: detalle técnico

Pantalla táctil vertical 9:16 (lienzo 1080×1920) para la entrada del evento. Un solo HTML.

## Archivos (rama `claude/brave-heisenberg-izyt6b`, carpeta `loomlock-kiosk/`)

- `src/kiosk.template.html`: toda la experiencia (HTML + CSS + JS + textos ES/EN).
- `src/build.py`: arma `index.html` y `artifact.html` reemplazando marcadores (`{{LOCKY}}`, `{{LOGO}}`, `{{APP1..6}}`, `{{KEY_FRONT}}`, `{{KEY_GIFT}}`, `{{KEY_GIFT_BACK}}`, `{{QRLIB}}`). Correr `python3 src/build.py` después de cada cambio.
- `src/app-screens/`, `src/keys/`, `src/vendor/qrcode-generator.js` (MIT, el QR se genera sin internet).
- `apps-script/Code.gs`: web app de Google Apps Script que recibe los datos.
- `docs/loomlock_experiences_guia_de_staff.pdf`: guía de staff.

## CONFIG (en la plantilla)

```js
canal: "CH 02", anfitrion: "Tequila Don Julio", aviso18: true,
idleSegundos: 60,          // sin toques vuelve al inicio
sheetUrl: "",              // en la rama de trabajo va vacío; en la rama publicada va la URL del Apps Script
fotosUrl: "https://loomlock.estudioastora.com",  // web de las fotos (QR de la portada)
idioma: "es"               // español por defecto, botón ES/EN; traductor automático de Google bloqueado
```

Textos: diccionario `T = {es:{...}, en:{...}}`, atributos `data-t`, función `applyLang()`.

## Pantallas, en orden

1. **Portada**: tele "Prime Time", QR chico arriba a la derecha ("Your photos from tonight"), botón de inicio.
2. **Who invited you?**: PR / loomlock team / Don Julio team / Bikini team / I wanted to meet Locky.
3. **What's your name?**: teclado propio (QWERTY + Ñ), se puede saltar.
4. **Qué es**: "Scan a key. Apps pause." La llave se toca y anima (también sola a los 4 s).
5. **Set up your app**: riel de 6 pasos + celular con las pantallas reales de la app (9 s por pantalla, transición tipo iOS, recuadro amarillo + mano que muestra qué tocar, botones anterior/siguiente). Paso 1 = insignias App Store / Google Play. Al final, selector de apps "Apps that stay open" con aviso rojo y botón Save.
6. **Two keys, two jobs**: una llave grande que se gira (experiencia ↔ recuerdo), se mueve con el dedo.
7. **The entrance**: elegir tótem loomlock o "Venue experience key"; se arrastra el celular al tótem o se escanea; la pantalla "You're Experience Ready" se va y se bloquean las apps.
8. **Your night**: 4 momentos (escaneo, fuera del aire, otro escaneo, la galería en la web de loomlock experiences).
9. **Myth or fact**: 3 preguntas y cierre "Head to the totem".

## Planilla de Google Sheets

- ID `1wNYN-rdJ9_JD7vly3rNqFsciNYK1NBezSXJCIq6huFQ`.
- Hoja **Respuestas**: fecha_hora, invitacion, id, clave, nombre.
- Hoja **Resumen**: conteo por origen + gráficos "Quién invitó" y "Llegada por hora".
- Hoja **Por origen**: desplegable en B1 para filtrar (Todos / PR / Equipo Loomlock / Equipo Don Julio / Equipo Bikini / Quería conocer a Locky).
- Menú **Loomlock > Reiniciar datos…** borra todo (ofrece copia de respaldo).
- El kiosco manda `{k, id, ts, name, label}` por POST (no-cors, text/plain). Si no hay internet guarda en cola y reintenta. La etiqueta de loomlock se manda como "Equipo Loomlock" (con mayúscula) a propósito, para no romper el filtro.

## Publicar en GitHub Pages

1. Hacer los cambios en la rama de trabajo, `python3 src/build.py`, commit y push.
2. En la rama `loomlock-kiosk` (kiosco en la raíz): copiar `src/kiosk.template.html` (y lo que cambió), poner `sheetUrl` con la URL del Apps Script (`AKfycbzWGRs…`), correr `python3 src/build.py`, commit y push.
3. Pages a veces no se actualiza con un push: un segundo commit real lo destraba. Verificar con `curl -s https://guadalupeholsman.github.io/Skills/ | grep AKfycbzWGRs`.

## Probar

Playwright con ventana 540×960 (mitad del lienzo). Revisar siempre en los dos idiomas.
