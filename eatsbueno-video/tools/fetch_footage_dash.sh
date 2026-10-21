#!/usr/bin/env bash
# Stock clips for the institutional dashboard film (dashboard_launch.html) -> assets/footage/ (gitignored).
# Source: Mixkit (https://mixkit.co/license/#videoFree): free for commercial use, not redistributable standalone.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/footage
tmp=$(mktemp -d)
while read -r id ss dur name; do
  curl -sSL -A "Mozilla/5.0" -o "$tmp/$id.mp4" "https://assets.mixkit.co/videos/$id/$id-720.mp4"
  ffmpeg -nostdin -v error -y -ss "$ss" -i "$tmp/$id.mp4" -t "$dur" -an \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30" \
    -c:v libvpx-vp9 -crf 36 -b:v 0 -g 15 -row-mt 1 -deadline good -cpu-used 4 "assets/footage/$name.webm"
  echo "ok $name"
done <<'LIST'
46680 1.0 6.0 d_meeting
4872 1.0 5.0 d_coworkers
918 0.5 5.0 d_office
42664 1.0 6.0 d_hrlead
46755 0.5 4.0 d_handshake
LIST
rm -rf "$tmp"
