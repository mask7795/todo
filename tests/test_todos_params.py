import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_list_limit_too_large_returns_400():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/", params={"limit": 1000})
    assert r.status_code == 400
    assert r.json().get("detail") == "limit must be <= 200"


@pytest.mark.asyncio
async def test_list_limit_too_small_returns_400():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/", params={"limit": 0})
    assert r.status_code == 400
    assert r.json().get("detail") == "limit must be >= 1"


@pytest.mark.asyncio
async def test_list_offset_negative_returns_400():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/", params={"offset": -1})
    assert r.status_code == 400
    assert r.json().get("detail") == "offset must be >= 0"


@pytest.mark.asyncio
async def test_cursor_incompatible_with_sort_due_returns_400():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/", params={"cursor": "10", "sort_due": True})
    assert r.status_code == 400
    assert r.json().get("detail") == "cursor is incompatible with sort_due"


@pytest.mark.asyncio
async def test_valid_params_returns_200_and_shape():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/", params={"limit": 10, "offset": 0, "include_deleted": True})
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and isinstance(body["items"], list)
    assert body.get("limit") == 10
    assert body.get("offset") == 0
