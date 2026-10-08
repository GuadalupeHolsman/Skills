#!/usr/bin/env bash
# Re-downloads the stock clips used by the people version of the launch film into assets/footage/.
# Source: Mixkit (https://mixkit.co/license/#videoFree) — free for commercial use, but the clips may not be
# redistributed as standalone files, so they are gitignored and fetched on demand.
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
25595 1.0 3.0 counting
12834 1.5 2.0 choice
11511 1.0 3.0 tired
46507 3.0 3.0 friends
49349 2.0 2.5 supermarket
21396 1.0 3.0 water
42981 1.0 3.0 sleep
49466 1.0 3.5 highfive
26085 2.0 1.5 salad
45468 2.0 1.5 laugh
LIST
rm -rf "$tmp"
