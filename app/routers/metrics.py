from fastapi import APIRouter, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    Counter,
    Histogram,
    generate_latest,
)

router = APIRouter(prefix="", tags=["metrics"])  # root-level path

_registry: CollectorRegistry | None = None
_requests_total: Counter | None = None
_request_duration: Histogram | None = None


def get_registry() -> CollectorRegistry:
    global _registry, _requests_total, _request_duration
    if _registry is None:
        _registry = CollectorRegistry()
        _requests_total = Counter(
            "http_requests_total",
            "Total HTTP requests",
            ["method", "path", "status"],
            registry=_registry,
        )
        _request_duration = Histogram(
            "http_request_duration_seconds",
            "HTTP request duration in seconds",
            ["method", "path", "status"],
            registry=_registry,
        )
    return _registry


def record_request(method: str, path: str, status: int, duration_seconds: float) -> None:
    # Ensure metrics are initialized
    get_registry()
    assert _requests_total is not None and _request_duration is not None
    _requests_total.labels(method=method, path=path, status=str(status)).inc()
    _request_duration.labels(method=method, path=path, status=str(status)).observe(duration_seconds)


@router.get("/metrics")
def metrics() -> Response:
    registry = get_registry()
    data = generate_latest(registry)
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)
