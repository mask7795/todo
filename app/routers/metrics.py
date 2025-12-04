import time
from collections.abc import Awaitable, Callable

from fastapi import APIRouter, Request, Response
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
_requests_class_total: Counter | None = None
_db_query_duration: Histogram | None = None
_http_errors_total: Counter | None = None
_db_errors_total: Counter | None = None
_http_request_size: Histogram | None = None
_http_response_size: Histogram | None = None


def get_registry() -> CollectorRegistry:
    global _registry
    global _requests_total, _request_duration, _requests_class_total
    global _db_query_duration, _http_errors_total, _db_errors_total
    global _http_request_size, _http_response_size
    if _registry is None:
        _registry = CollectorRegistry()
    # Initialize any missing collectors (handles hot-reload/order issues)
    if _requests_total is None:
        _requests_total = Counter(
            "http_requests_total",
            "Total HTTP requests",
            ["method", "path", "status"],
            registry=_registry,
        )
    if _request_duration is None:
        _request_duration = Histogram(
            "http_request_duration_seconds",
            "HTTP request duration in seconds",
            ["method", "path", "status"],
            registry=_registry,
        )
    if _requests_class_total is None:
        _requests_class_total = Counter(
            "http_requests_class_total",
            "Total HTTP requests by status class",
            ["method", "status_class"],
            registry=_registry,
        )
    if _db_query_duration is None:
        _db_query_duration = Histogram(
            "db_query_duration_seconds",
            "Database query duration in seconds",
            ["operation", "table"],
            registry=_registry,
        )
    if _http_errors_total is None:
        _http_errors_total = Counter(
            "http_errors_total",
            "Total HTTP errors (non-2xx/3xx)",
            ["method", "status_class"],
            registry=_registry,
        )
    if _db_errors_total is None:
        _db_errors_total = Counter(
            "db_errors_total",
            "Total DB errors",
            ["operation", "table"],
            registry=_registry,
        )
    if _http_request_size is None:
        _http_request_size = Histogram(
            "http_request_size_bytes",
            "HTTP request size in bytes",
            ["method"],
            registry=_registry,
        )
    if _http_response_size is None:
        _http_response_size = Histogram(
            "http_response_size_bytes",
            "HTTP response size in bytes",
            ["status"],
            registry=_registry,
        )
    return _registry


def record_metrics(method: str, path: str, status: int, duration_seconds: float) -> None:
    # Ensure metrics are initialized
    get_registry()
    assert (
        _requests_total is not None
        and _request_duration is not None
        and _requests_class_total is not None
    )
    _requests_total.labels(method=method, path=path, status=str(status)).inc()
    _request_duration.labels(method=method, path=path, status=str(status)).observe(duration_seconds)
    status_class = f"{status // 100}xx"
    _requests_class_total.labels(method=method, status_class=status_class).inc()


def record_db_timing(operation: str, table: str, duration_seconds: float) -> None:
    # Ensure metrics are initialized
    get_registry()
    assert _db_query_duration is not None
    _db_query_duration.labels(operation=operation, table=table).observe(duration_seconds)


def inc_db_error(operation: str, table: str) -> None:
    get_registry()
    assert _db_errors_total is not None
    _db_errors_total.labels(operation=operation, table=table).inc()


def inc_http_error(method: str, status: int) -> None:
    get_registry()
    assert _http_errors_total is not None
    status_class = f"{status // 100}xx"
    _http_errors_total.labels(method=method, status_class=status_class).inc()


def observe_request_size(method: str, size_bytes: int | None) -> None:
    get_registry()
    if size_bytes is None:
        return
    assert _http_request_size is not None
    _http_request_size.labels(method=method).observe(float(size_bytes))


def observe_response_size(status: int, size_bytes: int | None) -> None:
    get_registry()
    if size_bytes is None:
        return
    assert _http_response_size is not None
    _http_response_size.labels(status=str(status)).observe(float(size_bytes))


@router.get("/metrics")
def metrics() -> Response:
    registry = get_registry()
    data = generate_latest(registry)
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)


async def record_request(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    start = time.perf_counter()
    response: Response = await call_next(request)
    duration = time.perf_counter() - start
    route = request.scope.get("route")
    path = getattr(route, "path", request.url.path)
    record_metrics(request.method, path, response.status_code, duration)
    return response
