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
- Create: `POST /todos/` with body `{ "title": "Write tests", "completed": false }`
- Update: `PUT /todos/{id}` with body `{ "title": "Write more tests", "completed": true }`
- Delete: `DELETE /todos/{id}`

Data is persisted to a local SQLite file at `./todo.db`.

## Run Tests

```zsh
uv run pytest -q --cov=app --cov-report=term
```

## Project Layout
- `app/main.py`: FastAPI app and root route
- `app/routers/todos.py`: `/todos` router (demo in-memory list)
- `app/schemas/todo.py`: Pydantic v2 model for todos
- `tests/test_smoke.py`: async smoke test with `httpx.AsyncClient`
 - `tests/test_todos.py`: validates `/todos` returns an empty list
 - `app/routers/health.py`: health endpoints (`/health/live`, `/health/ready`)
 - `tests/test_health.py`: tests for health endpoints

## Notes
- The app uses SQLModel + SQLite for persistence (`./todo.db`).
- Tests reset the DB automatically via `reset_db()`.

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
