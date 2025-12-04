# AI Coding Agent Guide – Python/FastAPI

Status: Greenfield. Target stack is Python + FastAPI. Optimize for minimal, runnable increments with tests.

## Repo Snapshot
- Path: `/Users/maxschlappkohl/workspace/todo`
- Current contents: empty (no code or config yet)
- Platform: macOS, shell: `zsh`

## How To Engage
- Work in small, reviewable steps; reference created paths using backticks.
- Start changes with a short 3–6 bullet plan; keep diffs tight.
- Always produce a runnable increment plus a smoke test and brief README updates.

## Bootstrap Workflow (FastAPI + uv)
- Use `uv` for env + deps; no system-wide installs required.
- Initialize environment and deps:
```zsh
uv venv
uv add fastapi uvicorn pytest httpx
```
- Minimal app and test layout to create on first scaffold:
	- `app/main.py` (defines `app = FastAPI()` and a root route)
	- `tests/test_smoke.py` (pytest + `httpx.AsyncClient` hitting `/`)
	- `README.md` (Try it / Test commands)
- Run the dev server:
```zsh
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Run tests:
```zsh
uv run pytest -q
```

## Project Conventions (establish on first commit)
- Layout:
	- `app/main.py` (FastAPI app factory or module-level `app`)
	- `app/routers/*` (group routes by domain: `todos.py`, etc.)
	- `app/schemas/*` (Pydantic v2 models for request/response)
	- `app/deps.py` (shared dependencies)
	- `tests/` (pytest; async tests use `pytest.mark.asyncio` + `httpx.AsyncClient`)
- Typing: use type hints; prefer explicit Pydantic models over `dict`.
- HTTP status codes: return via `from fastapi import status` constants for clarity.

## Testing Pattern (example)
- Prefer async tests with in-process app client:
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_root():
		async with AsyncClient(app=app, base_url="http://test") as ac:
				r = await ac.get("/")
		assert r.status_code == 200
```

## Change Management
- Explain why each new file exists; keep diffs minimal.
- Update `README.md` with run/test commands whenever they change.
- Update this file as workflows or conventions evolve (routers, schemas, testing style).

## Integration Points
- None yet. When adding a DB or external API, document:
	- Dependency (`uv add ...`), config location (`.env`/settings), and how to run locally.
	- How tests isolate or stub the integration (fixtures, containers, or fakes).

## Quick Start (copy into README once scaffolded)
```zsh
uv venv
uv add fastapi uvicorn pytest httpx
uv run uvicorn app.main:app --reload
uv run pytest -q
```
# AI Coding Agent Guide – Python/FastAPI

Status: Greenfield. Target stack is Python + FastAPI. Optimize for minimal, runnable increments with tests.

## Repo Snapshot
- Path: `/Users/maxschlappkohl/workspace/todo`
- Current contents: empty (no code or config yet)
- Platform: macOS, shell: `zsh`

## How To Engage
- Work in small, reviewable steps; reference created paths using backticks.
- Start changes with a short 3–6 bullet plan; keep diffs tight.
- Always produce a runnable increment plus a smoke test and brief README updates.

## Bootstrap Workflow (FastAPI + uv)
- Use `uv` for env + deps; no system-wide installs required.
- Initialize environment and deps:
```zsh
uv venv
uv add fastapi uvicorn pytest httpx
```
- Minimal app and test layout to create on first scaffold:
	- `app/main.py` (defines `app = FastAPI()` and a root route)
	- `tests/test_smoke.py` (pytest + `httpx.AsyncClient` hitting `/`)
	- `README.md` (Try it / Test commands)
- Run the dev server:
```zsh
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Run tests:
```zsh
uv run pytest -q
```

## Project Conventions (establish on first commit)
- Layout:
	- `app/main.py` (FastAPI app factory or module-level `app`)
	- `app/routers/*` (group routes by domain: `todos.py`, etc.)
	- `app/schemas/*` (Pydantic v2 models for request/response)
	- `app/deps.py` (shared dependencies)
	- `tests/` (pytest; async tests use `pytest.mark.asyncio` + `httpx.AsyncClient`)
- Typing: use type hints; prefer explicit Pydantic models over `dict`.
- HTTP status codes: return via `from fastapi import status` constants for clarity.

## Testing Pattern (example)
- Prefer async tests with in-process app client:
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_root():
		async with AsyncClient(app=app, base_url="http://test") as ac:
				r = await ac.get("/")
		assert r.status_code == 200
```

## Change Management
- Explain why each new file exists; keep diffs minimal.
- Update `README.md` with run/test commands whenever they change.
- Update this file as workflows or conventions evolve (routers, schemas, testing style).

## Integration Points
- None yet. When adding a DB or external API, document:
	- Dependency (`uv add ...`), config location (`.env`/settings), and how to run locally.
	- How tests isolate or stub the integration (fixtures, containers, or fakes).

## Quick Start (copy into README once scaffolded)
```zsh
uv venv
uv add fastapi uvicorn pytest httpx
uv run uvicorn app.main:app --reload
uv run pytest -q
```
