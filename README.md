# FastAPI Todo – Scaffold

[![CI](https://github.com/mask7795/todo/actions/workflows/ci.yml/badge.svg)](https://github.com/mask7795/todo/actions/workflows/ci.yml)
[![e2e](https://github.com/mask7795/todo/actions/workflows/e2e.yml/badge.svg)](https://github.com/mask7795/todo/actions/workflows/e2e.yml)

Minimal FastAPI app scaffold with uv-based environment and a smoke test.

## Quick Start

```zsh
uv venv
uv add fastapi uvicorn pytest httpx
```

## Run the Dev Server

```zsh
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Visit http://127.0.0.1:8000/

Quick checks:
- Root: http://127.0.0.1:8000/
- Metrics: http://127.0.0.1:8000/metrics
 - Health: http://127.0.0.1:8000/health/live

### Todos CRUD

- Create: `POST /todos/ {"title": "Buy milk"}`
- Get: `GET /todos/{id}`
- Update: `PUT /todos/{id} {"completed": true}`
- List (offset): `GET /todos/?limit=10&offset=0&completed=true|false`
- Filters: add `priority=low|medium|high&overdue=true|false&sort_due=true|false`
- Cursor list (id-based): `GET /todos/?limit=10&cursor=<id>` (incompatible with `sort_due`)
- Delete: `DELETE /todos/{id}`
- Restore: `POST /todos/{id}/restore`
- Include deleted: `GET /todos/?include_deleted=true`

## Health & Metrics

- Liveness: `GET /health/live` → `{ "status": "ok" }`
- Readiness: `GET /health/ready` → `{ "status": "ready" | "not-ready" }`
- Metrics: `GET /metrics` (Prometheus text exposition)

Examples:
```zsh
curl -s http://127.0.0.1:8000/health/live
curl -s http://127.0.0.1:8000/health/ready
curl -s http://127.0.0.1:8000/metrics | head -n 20
```

## Run Tests

```zsh
uv run pytest -q
```

## End-to-End (Playwright + Angular)

- Dev proxy: `frontend/proxy.conf.json` maps `/api/*` → backend `/*`.
- Start both backend and frontend automatically via `concurrently`.

```zsh
cd frontend
npm ci
export TODO_API_KEY=secret
# Runs both servers via concurrently
npx playwright test --trace on --grep "smoke: create and list todo via UI"
```

- Smoke test behavior:
	- Waits for Angular bootstrap and toolbar (`data-testid="toolbar"`).
	- Asserts the Todos list (`[data-testid="todos-list"]`) is attached.
	- If items render, asserts the seeded title; otherwise still passes.
- View trace on failure:

```zsh
npx playwright show-trace "frontend/test-results/smoke-smoke-create-and-list-todo-via-UI-chromium/trace.zip"
```
## Layout

- `app/main.py` – FastAPI app with a root route
- `tests/test_smoke.py` – Async smoke test hitting `/`
# Todo API (FastAPI)

[![CI](https://github.com/maxschlappkohl/todo/actions/workflows/ci.yml/badge.svg)](https://github.com/maxschlappkohl/todo/actions/workflows/ci.yml)
[![e2e](https://github.com/maxschlappkohl/todo/actions/workflows/e2e.yml/badge.svg)](https://github.com/maxschlappkohl/todo/actions/workflows/e2e.yml)

Minimal FastAPI scaffold with a root endpoint and an async smoke test.

## Quick Start

```zsh
uv venv
uv sync --all-groups
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Visit `http://127.0.0.1:8000/` to see the root response.

Health checks:
- Liveness: `GET /health/live` → `{ "status": "ok" }`
- Readiness: `GET /health/ready` → `{ "status": "ready" | "not-ready" }`

Todos:
- List: `GET /todos/?limit=10&offset=0`
- Filter: `GET /todos/?completed=true`
 - Cursor list (id-based): `GET /todos/?limit=10&cursor=<id>`
- Create: `POST /todos/` with body `{ "title": "Write tests", "completed": false }`
- Update: `PUT /todos/{id}` with body `{ "title": "Write more tests", "completed": true }`
- Delete: `DELETE /todos/{id}`
 - Restore: `POST /todos/{id}/restore`
 - Include deleted: `GET /todos/?include_deleted=true`

Data is persisted to a local SQLite file at `./todo.db`.

## Frontend (Angular)

An early Angular UI lives under `frontend/`.

- Toolchain: Node 20.x and npm >=10 (pinned in `frontend/package.json`).

- Dev server: run the FastAPI backend, then start Angular.

```zsh
# Backend
export TODO_API_KEY=secret
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (Angular dev server mirroring CI)
cd frontend
npm ci
npx ng serve --host 127.0.0.1 --port 4200 --proxy-config proxy.conf.json --verbose --hmr=false
# Or with helper script that writes logs and PID:
# from repo root
bash scripts/start-frontend.sh
# Or via npm alias from frontend folder
npm run start:frontend:sh
# Setup helper (uses .nvmrc + npm ci)
# from repo root
bash scripts/setup-frontend.sh
# Or via npm alias from frontend folder
npm run setup:frontend:sh
```

Notes:
- The Angular `AuthInterceptor` sends `X-API-Key` if `environment.apiKey` is set.
- The `TodosService` points to `environment.apiBaseUrl` (default `http://127.0.0.1:8000`).
- Dev proxy: `frontend/proxy.conf.json` maps `/api/*` → backend `/*`, allowing the UI to call `/api/...` during dev.
- Quick checks:
	- `curl -v http://127.0.0.1:4200/`
	- `curl -v http://127.0.0.1:4200/api/health/live`
	- `tail -n +1 frontend/frontend.log`

 Default route:
 - Visiting `/` in the frontend redirects to `/dashboard` and renders the dashboard on first load.
 - Todos page is available at `/todos`.

### Troubleshooting (Frontend)

- Angular workspace: If you see "This command is not available when running the Angular CLI outside a workspace.", run the dev server from the `frontend` folder.

```zsh
cd frontend
npx ng serve --host 127.0.0.1 --port 4200 --proxy-config proxy.conf.json
```

- Port conflict: If `4200` is busy, choose another port (e.g., `4300`).

```zsh
cd frontend
npx ng serve --host 127.0.0.1 --port 4300 --proxy-config proxy.conf.json
```

- Backend unavailable: If the UI logs `connect ECONNREFUSED 127.0.0.1:8000`, start the FastAPI server.

```zsh
export TODO_API_KEY=secret # optional for write routes
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Proxy smoke check: The dev proxy maps `/api/*` → backend. Verify health via the dev server:

```zsh
curl -v http://127.0.0.1:4200/api/health/live
```

- Dashboard first-load: Router uses blocking initial navigation so `/` renders `/dashboard` on first load.

### CI Tips (Frontend)

- Pin Node and npm versions in `frontend/package.json` `engines` and use `npm ci` in CI for reproducible installs.
- Disable HMR (`--hmr=false`) to avoid flakiness in headless runs.
- Use `--verbose` on `ng serve` to surface routing and proxy logs.
- Ensure the backend is started before the UI and reachable at `http://127.0.0.1:8000`.
- Prefer deterministic ports (`--host 127.0.0.1 --port 4200`) and fall back to `4300` if conflicted.

Node version:
- The frontend includes an `.nvmrc` with Node 20. Use `nvm` to align your local environment before installing deps.

```zsh
cd frontend
nvm use
npm ci
```

Auth tip:
- To enable authenticated write calls from the UI, set `environment.apiKey` (or export `TODO_API_KEY=secret` for the backend and configure the frontend env accordingly). The interceptor will add `X-API-Key` automatically for requests.

Configure in Angular:

```ts
// frontend/src/environments/environment.ts
export const environment = {
	production: false,
	apiBaseUrl: 'http://127.0.0.1:8000',
	apiKey: 'secret', // interceptor sends as X-API-Key
};
```

For production builds, set `apiKey` in `environment.prod.ts` or via your configuration/secrets management.

Production guidance:
- Do not commit real API keys. Prefer environment-specific config, CI/CD secrets, or runtime-config files.
- Example with Angular file replacements: set `apiKey` in `environment.prod.ts` and ensure `angular.json` uses the prod file for `configurations: production`.
- Alternatively, read from a runtime config (e.g., fetch `/assets/config.json` on bootstrap) and populate the interceptor key without embedding secrets in the built bundle.

## Run Tests

```zsh
uv run pytest -q --cov=app --cov-report=term
```

### Testing Auth

- CI does not set `TODO_API_KEY`; tests run with auth disabled by default.
- Auth-specific tests enable auth via `monkeypatch.setenv("TODO_API_KEY", "secret")` and assert 401/OK paths.
- A test-wide autouse fixture (`tests/conftest.py`) clears `TODO_API_KEY` so external env/secrets cannot unintentionally enable auth during the suite.
- Local runs: keep `TODO_API_KEY` unset to run the full suite without auth.
- Run only auth tests:

```zsh
uv run pytest -q -k auth
```

- Manual auth check locally:

```zsh
export TODO_API_KEY=secret
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
curl -s -X POST http://127.0.0.1:8000/todos/ \
	-H "Content-Type: application/json" \
	-H "X-API-Key: secret" \
	-d '{"title":"Buy milk"}'
```

## Project Layout
- `app/main.py`: FastAPI app and root route
 - `app/routers/todos.py`: `/todos` router (SQLModel + SQLite)
 - `app/schemas/todo.py`: Pydantic v2 models for todos
 - `tests/test_smoke.py`: async smoke test with `httpx.AsyncClient`
 - `tests/test_todos.py`: CRUD, pagination, filtering
 - `app/routers/health.py`: health endpoints (`/health/live`, `/health/ready`)
 - `tests/test_health.py`: tests for health and metrics endpoints

## Notes
- The app uses SQLModel + SQLite for persistence (`./todo.db`).
- Tests reset the DB automatically via `reset_db()`.
 - API key (optional): set `TODO_API_KEY` env var to require `X-API-Key` on write routes
	 - Protected routes: `POST /todos/`, `PUT /todos/{id}`, `DELETE /todos/{id}`, `POST /todos/{id}/restore`
	 - Example: `TODO_API_KEY=secret uv run uvicorn app.main:app --reload ...` and send header `X-API-Key: secret`

### Authenticated Requests (API Key)

When `TODO_API_KEY` is set, write operations require the `X-API-Key` header.

Examples:

```zsh
# Start backend with an API key
export TODO_API_KEY=secret
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Create a todo (protected: requires X-API-Key)
curl -s -X POST \
	http://127.0.0.1:8000/todos/ \
	-H "Content-Type: application/json" \
	-H "X-API-Key: secret" \
	-d '{"title": "Buy milk"}' | jq

# Update a todo (protected)
curl -s -X PUT \
	http://127.0.0.1:8000/todos/1 \
	-H "Content-Type: application/json" \
	-H "X-API-Key: secret" \
	-d '{"completed": true}' | jq

# Delete a todo (protected)
curl -s -X DELETE \
	http://127.0.0.1:8000/todos/1 \
	-H "X-API-Key: secret" | jq

# Restore a todo (protected)
curl -s -X POST \
	http://127.0.0.1:8000/todos/1/restore \
	-H "X-API-Key: secret" | jq
```

Notes:
- Read operations (e.g., `GET /todos/`, `GET /todos/{id}`) do not require the API key.
- Replace `secret` with your own key value if you set a different `TODO_API_KEY`.

## Lint, Format, Type-check

```zsh
uv run ruff check .
uv run black .
uv run mypy app
uv run ruff format .
```

## Pre-commit Hooks

Install and enable hooks to auto-check/format on commit:

```zsh
uv sync --all-groups
uv run pre-commit install
uv run pre-commit run --all-files
```

## Coverage
- CI uploads `coverage.xml` as an artifact; locally you can generate coverage with:

```zsh
uv run pytest -q --cov=app --cov-report=xml --cov-report=term
open coverage.xml
```

## Telemetry

- Metrics: `GET /metrics` returns Prometheus exposition format.
- Example scrape with curl:

```zsh
curl -s http://127.0.0.1:8000/metrics | head -20
```

 
