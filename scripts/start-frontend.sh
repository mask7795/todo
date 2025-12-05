#!/usr/bin/env bash
set -euo pipefail

# Start Angular dev server mirroring CI settings
# - Binds to 127.0.0.1:4200
# - Uses proxy.conf.json
# - Disables HMR
# - Enables verbose logging
# Logs to frontend.log and writes PID to frontend.pid

cd "$(dirname "$0")/.."/frontend

LOG_FILE="frontend.log"
PID_FILE="frontend.pid"

echo "Starting Angular dev server..."
echo "Logs: ${LOG_FILE} | PID: ${PID_FILE}"

# Ensure dependencies are installed
if [ ! -d node_modules ]; then
  echo "node_modules missing; installing (prefer npm ci, fallback to npm install)"
  npm ci || npm install
fi

# On Linux runners, ensure Rollup platform binary is present (optional dep may be skipped)
if [[ "$(uname -s)" == "Linux" ]]; then
  echo "Ensuring Rollup Linux binary is installed (Linux host detected)"
  npm ls @rollup/rollup-linux-x64-gnu >/dev/null 2>&1 || npm install @rollup/rollup-linux-x64-gnu --no-save || true
fi

# Start the server
npx ng serve \
  --host 127.0.0.1 \
  --port 4200 \
  --proxy-config proxy.conf.json \
  --verbose \
  --hmr=false \
  > "${LOG_FILE}" 2>&1 & echo $! > "${PID_FILE}"

sleep 2
if ! kill -0 $(cat "${PID_FILE}") 2>/dev/null; then
  echo "Frontend exited early; showing logs and retrying once..."
  echo '--- frontend.log (early exit) ---'
  tail -n +1 "${LOG_FILE}" || true
  npx ng serve \
    --host 127.0.0.1 \
    --port 4200 \
    --proxy-config proxy.conf.json \
    --verbose \
    --hmr=false \
    > "${LOG_FILE}" 2>&1 & echo $! > "${PID_FILE}"
fi

echo "Angular dev server started (PID $(cat "${PID_FILE}"))"
echo "Try: curl -v http://127.0.0.1:4200/"
