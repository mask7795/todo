from pydantic import BaseModel, ConfigDict


class TodoBase(BaseModel):
    title: str
    completed: bool = False


class TodoCreate(TodoBase):
    model_config = ConfigDict(json_schema_extra={"example": {"title": "Buy milk"}})


class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class Todo(TodoBase):
    id: int


class TodoList(BaseModel):
    items: list[Todo]
    total: int
    limit: int | None = None
    offset: int | None = None
