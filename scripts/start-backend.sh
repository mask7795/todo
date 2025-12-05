#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root relative to this script (portable Bash)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/.."

if [ -f .venv/bin/activate ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

export TODO_API_KEY=${TODO_API_KEY:-secret}

# Ensure uv is available; helpful logging
command -v uv >/dev/null 2>&1 || { echo "uv not found in PATH" >&2; exit 127; }

uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
