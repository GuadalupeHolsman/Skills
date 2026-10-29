---
name: loomlock-experiences
description: Contexto completo del proyecto loomlock experiences (kiosco táctil del evento CH 02 · Tequila Don Julio en Bikini, guía de staff, llaves, tótem, planilla de invitados). Usar cuando se trabaje en cualquier material de loomlock: el kiosco, la guía de staff, textos de marca, las llaves, el tótem, Locky o la planilla de Google Sheets.
---

# loomlock experiences

Proyecto de una cuenta compartida por tres personas: Lupe, Cami y Cami Roja. Responder en español.

## Qué es loomlock

Una llave (NFC) que pausa las apps que te roban la atención. En una *loomlock experience* el invitado no compra nada y no crea cuenta: solo baja la app gratis, elige qué apps quedan abiertas y escanea la **llave de la experiencia** al entrar. Al salir la escanea otra vez y las apps vuelven. Llamadas, mensajes, mapas y SOS siempre funcionan. El celular se queda con la persona.

Lema: **Live now, post later.** Otras ideas de marca: *Build a better day*, *Pro human*.

## Reglas que no se rompen

Lee `references/marca-y-lenguaje.md` antes de escribir cualquier texto. Lo esencial:

- **loomlock siempre en minúscula** (también "loomlock experiences"). Nunca "Loomlock" ni "LoomLock".
- En el kiosco: decir **"key"**, nunca "card". En la guía de staff (español): **"llave"**.
- **Nunca usar "tap"** en textos visibles. Para la llave: "scan" / "escanear". Para la pantalla: "touch" / "tocar".
- Decir **"Scan a key"**, no "your key", para no confundir la llave del lugar con la de regalo. El botón dice **"Venue experience key"**.
- **Dos llaves distintas:**
  - *Llave de la experiencia* (del lugar): la negra con Locky (`assets/keys/locky-key.svg`). Se escanea al entrar y al salir. Nadie se la lleva.
  - *Llave de recuerdo* (de regalo): la de Don Julio (`assets/keys/gift-key-don-julio*.svg`). Es coleccionable. No empieza ni termina la experiencia.
- **Locky** es la mascota: candado azul con ojos blancos **sin pupilas**.
- **El tótem** ahora es el **isotipo de loomlock** (las dos "l" en neón sobre base negra con una pantallita NFC). Ver `assets/referencias/totem-loomlock-render.jpg`. Ya no es "el tótem de Locky". En la guía de staff se dice "el tótem de la marca o el tótem de Locky".
- Menos texto, una idea por pantalla.

## Links y datos del proyecto

| Qué | Dónde |
|---|---|
| Kiosco en vivo (GitHub Pages) | https://guadalupeholsman.github.io/Skills/ |
| Vista previa en claude.ai | https://claude.ai/artifact/BXd4Z7WcQ87TA3o6YnXYcE (no escribe en la planilla) |
| Repo | `guadalupeholsman/Skills` |
| Rama de trabajo | `claude/brave-heisenberg-izyt6b`, carpeta `loomlock-kiosk/` |
| Rama publicada (Pages) | `loomlock-kiosk` (el kiosco está en la raíz) |
| Planilla de invitados | https://docs.google.com/spreadsheets/d/1wNYN-rdJ9_JD7vly3rNqFsciNYK1NBezSXJCIq6huFQ/edit |
| Apps Script (web app que usa el kiosco) | https://script.google.com/macros/s/AKfycbzWGRs-eSWw0QpNt0zEHXjzPvNFgdgbpKCBf_-5-RtOO_FuOs9PtuaD0-zPUBDXyJCE/exec |
| Fotos de la noche (lo que abre el QR) | https://loomlock.estudioastora.com |
| Guía de staff (PDF, 25 págs.) | `loomlock-kiosk/docs/loomlock_experiences_guia_de_staff.pdf` en la rama de trabajo |

Detalle técnico del kiosco, la planilla y cómo publicar: `references/kiosco.md`.

## El evento

**CH 02 · Tequila Don Julio**, en el venue **Bikini**. Marca de alcohol: aviso de mayores de 18 en la portada. Estética del kiosco: "Prime Time / loomlock experiences", como un canal de TV (azul de canal, amarillo señal, negro de pantalla, tipografías Montserrat y Space Mono).

## Materiales incluidos

- `assets/logo.svg`: logo completo (isotipo + "loomlock"). El isotipo son los dos últimos paths.
- `assets/locky.svg`: Locky.
- `assets/keys/`: llave de la experiencia (`locky-key.svg`) y llave de regalo Don Julio (frente y dorso).
- `assets/app-screens/app1..6.webp`: pantallas reales de la app (del PDF "How Experience Mode Works", página 6): Join an experience, How it works, Calls & SMS, Pick a mode, Allow apps, You're Experience Ready.
- `assets/apps-script/`: código de la planilla (`Code.gs`) y su README.
- `assets/referencias/`: render del tótem nuevo, logo, feedback de Loom por WhatsApp y el PDF de la llave Big Locky.

## Pendientes

1. Loom va a mandar una pantalla nueva de **App Group Setup** (modo social, sin Instagram en apps permitidas): reemplazar `app5.webp` cuando llegue.
2. **Antes del evento:** borrar las filas de prueba de la planilla con el menú *Loomlock > Reiniciar datos…*.
3. El aviso rojo del selector de apps ("Only the apps you pick stay open. Everything else gets blocked.") fue una suposición: el mensaje de Loom estaba cortado. Confirmar el texto.
4. En la guía de staff, `[coordinador/a]` y `[WhatsApp]` siguen como marcadores (págs. 23 y 25).
