from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class Todo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=200)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), index=True)
    due_at: datetime | None = Field(default=None, index=True)
    priority: str | None = Field(default=None, index=True, description="low|medium|high")
    deleted_at: datetime | None = Field(default=None, index=True)
