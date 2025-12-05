from contextlib import asynccontextmanager

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
async def root():
    return {"message": "OK"}


# Using lifespan above instead of deprecated on_event startup


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    # Minimal metrics middleware using metrics.record_request
    return await record_request(request, call_next)
