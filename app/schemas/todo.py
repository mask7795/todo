from pydantic import BaseModel


class Todo(BaseModel):
    id: int | None = None
    title: str
    completed: bool = False
