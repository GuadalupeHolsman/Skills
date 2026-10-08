# Skills instaladas

Están en `.claude/skills/` (Claude Code las carga solas al abrir este repo). `skills-lock.json` guarda el origen y el hash de cada una; para actualizarlas: `npx skills update -p`.

> Las skills se ejecutan con todos los permisos del agente. Algunas necesitan herramientas o claves externas (FFmpeg, Node, Whisper, GPU, `FAL_KEY`, Gemini/Veo, ElevenLabs, cuenta HeyGen).

| Origen | Skills | Para qué |
|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | `hyperframes`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-registry`, `hyperframes-studio`, `media-use`, `embedded-captions`, `faceless-explainer`, `figma`, `general-video`, `motion-graphics`, `music-to-video`, `pr-to-video`, `product-launch-video`, `remotion-to-hyperframes`, `slideshow`, `talking-head-recut` | Motion graphics en HTML/GSAP, dirección creativa, mezcla de audio, montaje con música |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | `remotion-best-practices`, `remotion-captions`, `remotion-create`, `remotion-docs`, `remotion-interactivity`, `remotion-maps`, `remotion-markup`, `remotion-multimedia`, `remotion-render`, `remotion-saas`, `remotion-studio`, `remotion-upgrade` | Video como código en React (oficial) |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | `remotion-motion-graphics` | Motion graphics con Remotion que no parezcan genéricos |
| [agricidaniel/claude-video](https://github.com/agricidaniel/claude-video) | `claude-video`, `claude-video-analyze`, `claude-video-audio`, `claude-video-caption`, `claude-video-create`, `claude-video-download`, `claude-video-edit`, `claude-video-enhance`, `claude-video-enhance-audio`, `claude-video-export`, `claude-video-generate`, `claude-video-image`, `claude-video-promo`, `claude-video-screenshot`, `claude-video-shorts`, `claude-video-transcode` | Suite FFmpeg: editar, audio (LUFS), subtítulos, exportar por red, generar con IA |
| [agamm/video-agent](https://github.com/agamm/video-agent) | `audio-edit`, `captions`, `color-grade`, `cutting-rhythm`, `edl-edit`, `filler-removal`, `grok-video-edit`, `reframe-social`, `remotion-graphics`, `video-overlay`, `video-transitions` | Ritmo de corte, color, transiciones, reencuadre |
| [josiahsiegel/claude-plugin-marketplace](https://github.com/josiahsiegel/claude-plugin-marketplace) | `ffmpeg-*` (16), `viral-video-*` (6), `fal-*` (4), `python-video-pipeline` | Recetas FFmpeg (audio, subtítulos karaoke, transiciones, glitch, color), viralidad, generación con fal.ai |
| [notivn/AIEV](https://github.com/notivn/AIEV) | `auto-cut`, `background-music`, `color-grading`, `gsap`, `remotion-assemble` | Partes reutilizables de AIEV (el resto depende de su panel o duplica HyperFrames) |
| [vyralcontent/content-skills](https://github.com/vyralcontent/content-skills) | `viral-hooks`, `viral-short-form`, `viral-short-form-ideas`, `viral-instagram-reels`, `viral-tiktok-content`, `viral-youtube-shorts`, `viral-captions-and-ctas` | Ganchos, guiones y estrategia por plataforma |
| [aicontentskills/ai-video-storyboard-skill](https://github.com/aicontentskills/ai-video-storyboard-skill) | `ai-video-storyboard` | Storyboard plano a plano |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `ad-creative`, `video`, `social`, `copywriting`, `marketing-psychology`, `events`, `co-marketing`, `influencer-marketing`, `launch`, `marketing-ideas`, `product-marketing` | Concepto, copy, lanzamiento de eventos y co-branding |
| [mbfinotti/advertising-skills](https://github.com/mbfinotti/advertising-skills) | `ad-creative-brief`, `ad-hook-analyzer`, `ad-copy-variants`, `ad-creative-test-plan`, `ad-format-fit`, `ugc-ad-scripts`, `ad-swipe-file` | Brief creativo, análisis del gancho, plan de test A/B |
| [realjaymes/marketingagentskills](https://github.com/realjaymes/marketingagentskills) | `storytelling-framework`, `copy-anatomy` | Estructura narrativa y análisis de copy |
| [aaron-he-zhu/aaron-marketing-skills](https://github.com/aaron-he-zhu/aaron-marketing-skills) | `trend-spotter` | Tendencias relevantes para la marca, puntuadas por afinidad, con decisión go/skip y calendario cultural |
| [gtmagents/gtm-agents](https://github.com/gtmagents/gtm-agents) | `trend-research` | *Culture listening*: momentos culturales, audios, memes y creadores para refrescar la dirección creativa |
| [drshailesh88/integrated_content_os](https://github.com/drshailesh88/integrated_content_os) | `social-media-trends-research` | Datos reales sin API keys: Google Trends (pytrends) y Reddit |
| [aahl/skills](https://github.com/aahl/skills) | `trendspyg` | Google Trends: búsquedas en alza, interés en el tiempo y por región |

## Enfoque: storytelling y narrativa
El trabajo de la campaña es **contar una historia**, no solo hacer piezas lindas. Por eso las skills de tendencias se usan para encontrar **la tensión cultural** que cuenta la narrativa (ej. la fatiga de pantallas, el "estar presente") y no para copiar formatos virales. Skills narrativas del repo: `storytelling-framework` (estructura), `copy-anatomy` (copy), `hyperframes-creative` (beats y narración en video), `ai-video-storyboard` (plano a plano), `viral-hooks` (el primer segundo).

No instaladas: `normalize-loudness` (gooseworks-ai; el repo no es accesible, lo cubren `claude-video-audio` y `audio-edit`) y las skills de AIEV que dependen de su panel o son específicas de TikTok en vietnamita.

Propuesta creativa para el video "Tap in": [`video-tap-in/CONCEPTO.md`](video-tap-in/CONCEPTO.md).
