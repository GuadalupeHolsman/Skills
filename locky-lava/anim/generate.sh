#!/bin/sh
# Genera las 4 animaciones de Locky con la skill character-animation (Mode 2).
# Necesita GEMINI_API_KEY con acceso a la Gemini API. Correr desde locky-lava/.
set -e
S=../.claude/skills/character-animation/scripts
for a in walk fall sad yay; do
  python3 $S/generate_posed_frames.py anim/base_$a.png anim/$a.json --out-dir anim/frames_$a --size 1K --workers 4
  python3 $S/frames_to_sheet.py anim/frames_$a --cols 4 --rows 1 --bg-color "#00B140" \
    --emit-frames anim/norm_$a --out anim/sheet_$a.png
done
