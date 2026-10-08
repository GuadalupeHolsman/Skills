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
49349 0.5 7.0 supermarket
21396 1.0 3.0 water
42981 1.0 3.0 sleep
49466 1.0 3.5 highfive
26085 2.0 1.5 salad
45468 2.0 1.5 laugh
LIST
rm -rf "$tmp"
# soft background beds (960x540, heavily blurred in the film)
for spec in "46507 3.0 12.0 bed_friends" "24891 1.0 10.0 bed_family" "26085 0.5 10.0 bed_salad"; do
  set -- $spec; tmp=$(mktemp -d)
  curl -sSL -A "Mozilla/5.0" -o "$tmp/$1.mp4" "https://assets.mixkit.co/videos/$1/$1-720.mp4"
  ffmpeg -nostdin -v error -y -ss "$2" -i "$tmp/$1.mp4" -t "$3" -an -vf "scale=960:540:force_original_aspect_ratio=increase,crop=960:540,fps=30" \
    -c:v libvpx-vp9 -crf 40 -b:v 0 -g 15 -row-mt 1 -deadline good -cpu-used 4 "assets/footage/$4.webm"; rm -rf "$tmp"; echo "ok $4"
done
