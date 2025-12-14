#!/usr/bin/env zsh
set -euo pipefail

# Move to frontend directory
SCRIPT_DIR=${0:a:h}
cd "$SCRIPT_DIR/../frontend"

print -- "[setup-frontend] Working directory: $PWD"

# Try to load nvm if available, otherwise continue
if command -v nvm >/dev/null 2>&1; then
  print -- "[setup-frontend] Using nvm from PATH"
  nvm use || true
else
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    print -- "[setup-frontend] Sourcing nvm from ~/.nvm/nvm.sh"
    . "$HOME/.nvm/nvm.sh"
    nvm use || true
  else
    print -- "[setup-frontend] nvm not found; ensure Node version matches .nvmrc"
  fi
fi

# Install dependencies reproducibly
print -- "[setup-frontend] Installing frontend dependencies via npm ci"
npm ci

print -- "[setup-frontend] Done. You can now run: npm run start:frontend"