#!/usr/bin/env bash
set -euo pipefail

# Move to frontend directory (bash-compatible)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../frontend"

echo "[setup-frontend] Working directory: $PWD"

# Options
INSTALL_NVM="${SETUP_NVM_INSTALL:-0}"
if [ "${1:-}" = "--install-nvm" ]; then
  INSTALL_NVM="1"
fi

# Try to load nvm if available, otherwise continue
if command -v nvm >/dev/null 2>&1; then
  echo "[setup-frontend] Using nvm from PATH"
  if [ -f ".nvmrc" ]; then
    if [ "$INSTALL_NVM" = "1" ]; then
      echo "[setup-frontend] Running nvm install (from .nvmrc)"
      nvm install || true
    fi
    nvm use || true
  else
    nvm use || true
  fi
else
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "[setup-frontend] Sourcing nvm from ~/.nvm/nvm.sh"
    set +e
    . "$HOME/.nvm/nvm.sh"
    set -e
    if [ -f ".nvmrc" ]; then
      if [ "$INSTALL_NVM" = "1" ]; then
        echo "[setup-frontend] Running nvm install (from .nvmrc)"
        nvm install || true
      fi
      nvm use || true
    else
      nvm use || true
    fi
  else
    echo "[setup-frontend] nvm not found; ensure Node version matches .nvmrc"
  fi
fi

# Install dependencies reproducibly
echo "[setup-frontend] Installing frontend dependencies via npm ci"
npm ci

echo "[setup-frontend] Done. You can now run: npm run start:frontend"