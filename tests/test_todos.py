import pytest
from httpx import ASGITransport, AsyncClient

from app.db import reset_db
from app.main import app


@pytest.fixture(autouse=True)
def _reset_db() -> None:
    reset_db()


@pytest.mark.asyncio
async def test_list_todos_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/todos/")
    assert r.status_code == 200
    body = r.json()
    assert body["items"] == []
    assert body["total"] == 0


@pytest.mark.asyncio
async def test_create_read_update_delete_todo():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create
        r = await ac.post("/todos/", json={"title": "Write tests"})
        assert r.status_code == 201
        created = r.json()
        assert created["title"] == "Write tests"
        assert created["completed"] is False
        todo_id = created["id"]

        # Read by id
        r = await ac.get(f"/todos/{todo_id}")
        assert r.status_code == 200
        assert r.json()["id"] == todo_id

        # Update
        r = await ac.put(
            f"/todos/{todo_id}",
            json={
                "title": "Write more tests",
                "completed": True,
            },
        )


@pytest.mark.asyncio
async def test_pagination():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        for i in range(5):
            await ac.post("/todos/", json={"title": f"T{i}"})
        r = await ac.get("/todos/?limit=2&offset=1")
        assert r.status_code == 200
        data = r.json()
        assert data["limit"] == 2
        assert data["offset"] == 1
        assert data["total"] == 5
        assert len(data["items"]) == 2
        assert data["items"][0]["title"] == "T1"


@pytest.mark.asyncio
async def test_filter_completed():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/todos/", json={"title": "A", "completed": False})
        await ac.post("/todos/", json={"title": "B", "completed": True})
        await ac.post("/todos/", json={"title": "C", "completed": True})
        r = await ac.get("/todos/?completed=true")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 2
        assert all(item["completed"] is True for item in data["items"])
