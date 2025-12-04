from pydantic import BaseModel


class Todo(BaseModel):
    id: int | None = None
    title: str
    completed: bool = False


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
