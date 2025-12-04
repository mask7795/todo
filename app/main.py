from contextlib import asynccontextmanager

from fastapi import FastAPI, status

from app.db import init_db
from app.routers.todos import router as todos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Todo API", version="0.1.0", lifespan=lifespan)

app.include_router(todos_router)


@app.get("/", status_code=status.HTTP_200_OK)
async def read_root() -> dict:
    return {"message": "OK", "service": "todo", "version": "0.1.0"}


# Using lifespan above instead of deprecated on_event startup
