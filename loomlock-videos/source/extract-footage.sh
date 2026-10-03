#!/usr/bin/env bash
# Rebuilds assets/seq_* image sequences from the original footage files.
# usage: ./extract-footage.sh <lockbox.mp4> <YB1.mp4> <P1.mp4>
set -e; cd "$(dirname "$0")/assets"
ext(){ mkdir -p seq_$1; ffmpeg -v error -ss $3 -t $4 -i "$2" -vf "fps=30,scale=1600:-2" -q:v 4 seq_$1/%03d.jpg -y; }
ext boxlock "$1" 2.6 3.2; ext casetimer "$1" 21.6 3.2; ext yb "$2" 2.2 3.2; ext p1 "$3" 4.6 3.2
