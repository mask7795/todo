#!/usr/bin/env zsh
# Local E2E runner: starts backend + frontend, waits ready, runs Playwright, shows trace on failure.
set -euo pipefail


# Kill any running backend/frontend on default ports (8000, 4200, 4300)
echo "[run-e2e-local] Checking for existing backend/frontend processes..."


for port in 8000 4200 4300; do
  lsof -ti tcp:$port | while read PID; do
    if [ -n "$PID" ]; then
      echo "[run-e2e-local] Killing process on port $port (PID $PID)"
      kill $PID 2>/dev/null || true
    fi
  done
done

ROOT_DIR=${0:a:h}/..
pushd "$ROOT_DIR" >/dev/null

# Config
: ${FE_PORT:=4200}
FE_HOST=127.0.0.1
BE_HOST=127.0.0.1
BE_PORT=8000
LOG_DIR="$ROOT_DIR/frontend"
mkdir -p "$LOG_DIR"

print -- "[run-e2e-local] Root: $PWD"

# Start backend
print -- "[run-e2e-local] Starting backend on $BE_HOST:$BE_PORT"
export TODO_API_KEY=${TODO_API_KEY:-secret}
uv run uvicorn app.main:app --reload --host $BE_HOST --port $BE_PORT > "$LOG_DIR/backend.log" 2>&1 &
BE_PID=$!
sleep 1
if kill -0 $BE_PID 2>/dev/null; then
  echo $BE_PID > "$LOG_DIR/backend.pid"
else
  print -- "[run-e2e-local] Backend failed to start; showing log tail"
  tail -n 120 "$LOG_DIR/backend.log" || true
fi

# Frontend setup
print -- "[run-e2e-local] Frontend setup (nvm use + npm ci if needed)"
if command -v nvm >/dev/null 2>&1; then
  nvm use || true
fi
pushd frontend >/dev/null
if [[ ! -d node_modules ]]; then
  npm ci
fi

# Start frontend
print -- "[run-e2e-local] Starting frontend on $FE_HOST:$FE_PORT"
npx ng serve --host $FE_HOST --port $FE_PORT --proxy-config proxy.conf.json --verbose --hmr=false > "$LOG_DIR/frontend.log" 2>&1 &
FE_PID=$!
sleep 2
if ! kill -0 $FE_PID 2>/dev/null; then
  print -- "[run-e2e-local] Frontend exited early; retrying on port 4300"
  FE_PORT=4300
  npx ng serve --host $FE_HOST --port $FE_PORT --proxy-config proxy.conf.json --verbose --hmr=false > "$LOG_DIR/frontend.log" 2>&1 &
  FE_PID=$!
  sleep 2
  if ! kill -0 $FE_PID 2>/dev/null; then
    print -- "[run-e2e-local] Frontend failed to start; showing log tail and exiting"
    tail -n 200 "$LOG_DIR/frontend.log" || true
    exit 1
  fi
fi
echo $FE_PID > "$LOG_DIR/frontend.pid"

# Wait ready
print -- "[run-e2e-local] Waiting for servers to be ready..."
READY=0
for i in {1..90}; do
  BE_OK=0; FE_OK=0; PX_OK=0
  curl -fsS http://$BE_HOST:$BE_PORT/health/live >/dev/null && BE_OK=1 || true
  curl -fsS http://$FE_HOST:$FE_PORT/ >/dev/null && FE_OK=1 || true
  curl -fsS http://$FE_HOST:$FE_PORT/api/health/live >/dev/null && PX_OK=1 || true
  if [[ "$BE_OK" == "1" && "$FE_OK" == "1" && "$PX_OK" == "1" ]]; then
    READY=1; break
  fi
  [[ $((i % 10)) -eq 0 ]] && print -- "[run-e2e-local] Backend:$BE_OK Frontend:$FE_OK Proxy:$PX_OK"
  sleep 2
done
if [[ "$READY" != "1" ]]; then
  print -- "[run-e2e-local] Servers did not become ready in time"
  tail -n 100 "$LOG_DIR/backend.log" || true
  tail -n 100 "$LOG_DIR/frontend.log" || true
  exit 1
fi

# Install browsers if missing
print -- "[run-e2e-local] Ensuring Playwright browsers"
npx playwright install --with-deps >/dev/null 2>&1 || true

# Run tests
print -- "[run-e2e-local] Running Playwright tests"
set +e
npx playwright test --reporter=dot
EXIT=$?
set -e

# Show logs if failing
if [[ ${EXIT:-0} -ne 0 ]]; then
  print -- "[run-e2e-local] Tests failed; showing log tails"
  print -- "--- backend.log (tail) ---"; tail -n 200 "$LOG_DIR/backend.log" || true
  print -- "--- frontend.log (tail) ---"; tail -n 200 "$LOG_DIR/frontend.log" || true
  print -- "[run-e2e-local] Traces:"
  # Safely list trace files without causing a zsh "no matches found" error when glob is empty.
  files=(test-results/**/*/trace.zip)
  if (( ${#files[@]} > 0 )); then
    ls -1 "${files[@]}" 2>/dev/null || true
  else
    print -- "[run-e2e-local] No trace.zip files found"
  fi
fi

# Cleanup
print -- "[run-e2e-local] Stopping servers"
[[ -f "$LOG_DIR/backend.pid" ]] && kill $(cat "$LOG_DIR/backend.pid") 2>/dev/null || true
[[ -f "$LOG_DIR/frontend.pid" ]] && kill $(cat "$LOG_DIR/frontend.pid") 2>/dev/null || true

popd >/dev/null
print -- "[run-e2e-local] Done (exit ${EXIT:-0})"
exit ${EXIT:-0}
