import time
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI, Request, status

from app.db import init_db
from app.routers.health import router as health_router
from app.routers.metrics import record_request
from app.routers.metrics import router as metrics_router
from app.routers.todos import router as todos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


openapi_tags = [
    {
        "name": "health",
        "description": "Service health endpoints for liveness and readiness checks.",
    },
    {
        "name": "todos",
        "description": "CRUD endpoints for managing todo items.",
    },
]

app = FastAPI(title="Todo API", version="0.1.0", lifespan=lifespan, openapi_tags=openapi_tags)

app.include_router(todos_router)
app.include_router(health_router)
app.include_router(metrics_router)


@app.get("/", status_code=status.HTTP_200_OK)
async def read_root() -> dict:
    return {"message": "OK", "service": "todo", "version": "0.1.0"}


# Using lifespan above instead of deprecated on_event startup


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    # Normalize path to route template to reduce label cardinality
    route = request.scope.get("route")
    path = getattr(route, "path", request.url.path)
    method = request.method
    status_code = response.status_code
    with suppress(Exception):
        record_request(method, path, status_code, duration)
    return response
