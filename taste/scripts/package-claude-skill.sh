#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$REPO_ROOT/dist"
ARCHIVE_PATH="$DIST_DIR/taste.skill"
STAGE_DIR="$DIST_DIR/taste"

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR" "$DIST_DIR"

rsync -a \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude 'dist/' \
  --exclude 'scripts/' \
  --exclude '.DS_Store' \
  "$REPO_ROOT/" "$STAGE_DIR/"

rm -f "$ARCHIVE_PATH"
(
  cd "$DIST_DIR"
  zip -qr "taste.skill" taste
)

echo "Wrote $ARCHIVE_PATH"
