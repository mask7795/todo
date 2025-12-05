from fastapi import APIRouter, status

from app.db import engine

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", status_code=status.HTTP_200_OK)
def live() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready", status_code=status.HTTP_200_OK)
def ready() -> dict[str, str]:
    # DB readiness check; return not-ready on error instead of 500
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
        return {"status": "ready"}
    except Exception:
        return {"status": "not-ready"}
