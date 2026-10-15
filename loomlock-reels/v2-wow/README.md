# Loomlock: reels v2 ("más wow")

Segunda ronda. Se mantienen las ideas (la key transforma el teléfono, un modo por key, Locky) y cambia por completo la ejecución: CGI 3D real, un hook fotorrealista, música y foley reales, todo sincronizado al beat.

| Archivo | Qué es | Duración |
|---|---|---|
| `loomlock-la-key-lo-cambia-todo.mp4` | Reel principal: FOOH de Bogotá + transformación 3D | 20 s |
| `loomlock-locky-tiene-una-key.mp4` | Locky como muñeco de vinilo 3D | 19 s |
| `fooh-bogota.png` | Fotograma fotorrealista (Nano Banana Pro), sirve también como portada o post | — |

Formato: 1080×1920, 30 fps, H.264 a ~8 Mbps + AAC. Audio masterizado a −12 LUFS.

## 1. "La key lo cambia todo"
1. **Hook fotorrealista (0–2.8 s):** una calle de Chapinero con un edificio que es un teléfono gigante escupiendo notificaciones, estilo FOOH (Jacquemus, Maybelline). Texto: "TU TELÉFONO / HACE TODO." Zoom violento hacia la pantalla.
2. **Match-cut al 3D:** la cámara sale de la pantalla de un teléfono 3D del que brotan cientos de notificaciones físicas. "TODO. EL. TIEMPO."
3. **Freeze:** el tiempo se congela, la música se corta en seco y la key CINE flota en el silencio. "¿Y SI HICIERA UNA SOLA COSA?"
4. **El drop de la canción ES el tap.** El teléfono estalla en 4.200 cubos que se rearman en un balde de crispetas y vuelven a ser teléfono en Modo Cine. Cada cubo lleva el color real del píxel de la pantalla de la que salió.
5. Un compás por key: Gym (mancuerna), Foco (diana con flecha) y Dormir (luna).
6. **Final:** el teléfono se desarma y los cubos forman el **logo real de Loomlock** en 3D. "UNA KEY. UN TRABAJO. Y YA."

## 2. "Locky tiene una key"
Locky modelado en 3D a partir del SVG oficial, con material de vinilo brillante.
1. Abre con un retrato de Locky: "ESTE ES LOCKY."
2. Al lado, un teléfono gigante le tira notificaciones que le rebotan en la cabeza. "SU TELÉFONO NO LO DEJA EN PAZ."
3. Le aparece una key en la mano: "PERO LOCKY TIENE KEYS."
4. Salta en cámara lenta y la estampa sobre el teléfono justo en el drop. El teléfono se convierte en crispetas y Locky festeja.
5. Con la key Gym aparece una mancuerna y Locky hace fuerza.
6. Con la key Dormir aparece la luna: Locky se sube, se duerme, la música se corta y se queda roncando con el logo.

## Herramientas usadas
- **Three.js** (WebGL): render 3D con PBR, bloom, partículas y 4.200 cubos instanciados.
- **Nano Banana Pro** (vía Figma Weave): el fotograma de Bogotá.
- **ElevenLabs Music**: dos temas originales con plan de composición, analizados para fijar cada evento a su beat real.
- **ElevenLabs SFX**: foley de cada golpe, estallido, crispetas, mancuerna, ronquido, etc.
- **Animation Studio**: el pipeline de render, la mezcla y el `verify`. Los dos reels pasan **✓ in sync**: cada tap queda alineado en sonido (±5 ms) y en imagen (±1 frame).

## Lo que quedó bloqueado (y cómo destrabarlo)
Hacía falta video fotorrealista (Veo 3.1) para hacer todo el FOOH filmado y a "Locky de vinilo" en escenas reales:
- **Figma Weave:** la cuenta usó sus 2 corridas gratis. Para seguir hay que pasar a un plan pago en https://app.weavy.ai
- **Abracadabrax:** pide volver a iniciar sesión en el conector (Configuración de claude.ai → Conectores).

Con cualquiera de los dos activo se pueden generar los clips de Veo: el edificio de Bogotá transformándose en cine de verdad, y Locky de vinilo en una sala de cine, en el gym y en la cama.

## Para revisar antes de publicar
- Los textos de pantalla y los nombres de los modos son ilustrativos. Confirmen que coinciden con la app.
- El hook es una imagen generada con IA, no una foto real. Si se pauta, marquen el contenido como "creado con IA".

## Regenerar
Proyectos en la raíz del repo: `loomlock-reel-3d/` y `loomlock-reel-locky3d/`. En cada uno:
```bash
npm install            # three@0.169
node song.js && node engine/render.js video && node engine/render.js mux && node engine/render.js verify
```
El render es software (SwiftShader). Si Chromium corre como root, apunten `CHROME_PATH` a un wrapper que agregue `--no-sandbox --enable-unsafe-swiftshader --use-angle=swiftshader`. En `loomlock-reel-locky3d/`, `film.js` se arma con `python3 build.py` a partir de `film.tpl.js` y del código de cubos compartido.
