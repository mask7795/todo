from fastapi import APIRouter, status

from app.db import engine

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", status_code=status.HTTP_200_OK)
async def liveness() -> dict:
    return {"status": "ok"}


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness() -> dict:
    try:
        with engine.connect() as conn:
            # Use SQLAlchemy 2.x API to execute a simple driver SQL for readiness.
            conn.exec_driver_sql("SELECT 1")
        return {"status": "ready"}
    except Exception:
        return {"status": "not-ready"}
