import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_write_requires_api_key_when_configured(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("TODO_API_KEY", "secret")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Missing header -> 401
        r = await ac.post("/todos/", json={"title": "Nope"})
        assert r.status_code == 401

        # Wrong header -> 401
        r = await ac.post("/todos/", headers={"X-API-Key": "wrong"}, json={"title": "Nope"})
        assert r.status_code == 401

        # Correct header -> 201
        r = await ac.post("/todos/", headers={"X-API-Key": "secret"}, json={"title": "Ok"})
        assert r.status_code == 201

        # Update protected
        tid = r.json()["id"]
        r = await ac.put(f"/todos/{tid}", json={"completed": True})
        assert r.status_code == 401
        r = await ac.put(
            f"/todos/{tid}",
            headers={"X-API-Key": "secret"},
            json={"completed": True},
        )
        assert r.status_code == 200

        # Delete protected
        r = await ac.delete(f"/todos/{tid}")
        assert r.status_code == 401
        r = await ac.delete(f"/todos/{tid}", headers={"X-API-Key": "secret"})
        assert r.status_code == 204


@pytest.mark.asyncio
async def test_read_endpoints_remain_open(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("TODO_API_KEY", "secret")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/")
        assert r.status_code == 200
        r = await ac.get("/")
        assert r.status_code == 200
