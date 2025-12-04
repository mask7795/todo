import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_liveness():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/health/live")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/health/ready")
    assert r.status_code == 200
    assert r.json()["status"] in {"ready", "not-ready"}


@pytest.mark.asyncio
async def test_metrics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/metrics")
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("text/plain")
    assert r.text.startswith("# HELP")
    # Basic metrics present
    assert "http_requests_total" in r.text
    assert "http_request_duration_seconds" in r.text
    assert "http_requests_class_total" in r.text
    assert "http_errors_total" in r.text
    assert "http_request_size_bytes" in r.text
    assert "http_response_size_bytes" in r.text
