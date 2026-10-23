#!/usr/bin/env bash
# Stock clips for the institutional dashboard film (dashboard_launch.html) -> assets/footage/ (gitignored).
# Clips are motion-interpolated to 60 fps so they move as smoothly as the 60 fps film around them.
# Source: Mixkit (https://mixkit.co/license/#videoFree): free for commercial use, not redistributable standalone.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/footage
tmp=$(mktemp -d)
# slow = slow-motion factor (the benefit panels hold for ~9 s, so their clips are slowed and re-interpolated to 60 fps)
while read -r id ss dur name slow; do
  [ -f "$tmp/$id.mp4" ] || curl -sSL -A "Mozilla/5.0" -o "$tmp/$id.mp4" "https://assets.mixkit.co/videos/$id/$id-720.mp4"
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$tmp/$id.mp4" -an \
    -vf "setpts=${slow:-1}*PTS,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
    -c:v libvpx-vp9 -crf 36 -b:v 0 -g 15 -row-mt 1 -deadline good -cpu-used 4 "assets/footage/$name.webm"
  echo "ok $name"
done <<'LIST'
46680 1.0 6.0 d_meeting
4872 1.0 5.0 d_coworkers
918 0.5 5.0 d_office
42664 1.0 6.0 d_hrlead
46755 0.5 4.0 d_handshake
26085 2.0 4.0 d_salad
49466 1.0 3.5 d_highfive
49466 0.6 3.9 b_highfive 2.5
46755 0.4 3.9 b_handshake 2.5
42664 0.6 3.9 b_hrlead 2.5
26085 0.4 3.9 b_salad 2.5
LIST
rm -rf "$tmp"
