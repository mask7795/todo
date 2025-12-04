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
    assert r.json() == []


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
                "id": todo_id,
                "title": "Write more tests",
                "completed": True,
            },
        )
        assert r.status_code == 200
        updated = r.json()
        assert updated["title"] == "Write more tests"
        assert updated["completed"] is True

        # Delete
        r = await ac.delete(f"/todos/{todo_id}")
        assert r.status_code == 204

        # Ensure gone
        r = await ac.get(f"/todos/{todo_id}")
        assert r.status_code == 404
