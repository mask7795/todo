from pydantic import BaseModel, ConfigDict


class Todo(BaseModel):
    id: int | None = None
    title: str
    completed: bool = False

    model_config = ConfigDict(
        json_schema_extra={"example": {"id": 1, "title": "Buy milk", "completed": False}}
    )


class TodoCreate(BaseModel):
    title: str
    completed: bool = False


class TodoUpdate(BaseModel):
    title: str
    completed: bool = False


class TodoList(BaseModel):
    items: list[dict]
    total: int
    limit: int
    offset: int

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [
                    {"id": 1, "title": "Buy milk", "completed": False},
                    {"id": 2, "title": "Walk dog", "completed": True},
                ],
                "total": 2,
                "limit": 50,
                "offset": 0,
            }
        }
    )
