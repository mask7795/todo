# FastAPI Todo – Scaffold

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
- Update: `PATCH /todos/{id} {"completed": true}`
- List: `GET /todos/?limit=10&offset=0&completed=true|false`
 - List: `GET /todos/?limit=10&offset=0&completed=true|false&priority=low|medium|high&overdue=true|false&sort_due=true|false`
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

## Layout

- `app/main.py` – FastAPI app with a root route
- `tests/test_smoke.py` – Async smoke test hitting `/`
# Todo API (FastAPI)

[![CI](https://github.com/maxschlappkohl/todo/actions/workflows/ci.yml/badge.svg)](https://github.com/maxschlappkohl/todo/actions/workflows/ci.yml)

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

## Run Tests

```zsh
uv run pytest -q --cov=app --cov-report=term
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

 
