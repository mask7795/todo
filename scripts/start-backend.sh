#!/usr/bin/env zsh
set -euo pipefail
cd "${0:h}/.."
if [[ -f .venv/bin/activate ]]; then
  source .venv/bin/activate
fi
export TODO_API_KEY=${TODO_API_KEY:-secret}
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
