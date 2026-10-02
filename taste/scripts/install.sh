#!/usr/bin/env bash
# Install the taste skill into local agent skill directories.
#   ./scripts/install.sh            install into every target whose parent dir exists
#   ./scripts/install.sh claude     copy to ~/.claude/skills/taste
#   ./scripts/install.sh agents     copy to ~/.agents/skills/taste  (Codex, Copilot CLI, Gemini CLI)
#   ./scripts/install.sh codex      symlink ~/.codex/skills/taste -> this repo
#   ./scripts/install.sh all        every target, creating directories as needed
set -euo pipefail

MODE="${1:-auto}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_NAME="taste"

copy_skill() {
  local target="$1/$SKILL_NAME"
  mkdir -p "$1"
  rm -rf "$target"
  mkdir -p "$target"
  rsync -a \
    --exclude '.git/' \
    --exclude '.github/' \
    --exclude 'dist/' \
    --exclude 'scripts/' \
    --exclude '.DS_Store' \
    "$REPO_ROOT/" "$target/"
  echo "Installed: $target"
}

link_skill() {
  local target="$1/$SKILL_NAME"
  mkdir -p "$1"
  ln -sfn "$REPO_ROOT" "$target"
  echo "Linked:    $target -> $REPO_ROOT"
}

install_claude() { copy_skill "$HOME/.claude/skills"; }
install_agents() { copy_skill "$HOME/.agents/skills"; }
install_codex()  { link_skill "$HOME/.codex/skills"; }

case "$MODE" in
  claude) install_claude ;;
  agents) install_agents ;;
  codex)  install_codex ;;
  all)    install_claude; install_agents; install_codex ;;
  auto)
    found=0
    [ -d "$HOME/.claude" ] && { install_claude; found=1; }
    [ -d "$HOME/.agents" ] && { install_agents; found=1; }
    [ -d "$HOME/.codex" ] && [ ! -e "$HOME/.agents/skills/$SKILL_NAME" ] && { install_codex; found=1; }
    [ "$found" -eq 1 ] || { echo "No skills directories found; run with claude|agents|codex|all" >&2; exit 1; }
    ;;
  *)
    echo "Usage: $0 [claude|agents|codex|all]" >&2
    exit 1
    ;;
esac
