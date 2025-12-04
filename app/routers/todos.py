from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db import get_session
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoList, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/", response_model=TodoList, status_code=status.HTTP_200_OK)
def list_todos(
    session: Annotated[Session, Depends(get_session)],
    limit: int = Query(50, ge=1, le=200, description="Max items per page (1-200)"),
    offset: int = Query(0, ge=0, description="Items to skip (>=0)"),
    completed: bool | None = Query(None, description="Filter by completion status (true/false)"),
) -> TodoList:
    if limit < 1:
        limit = 1
    if limit > 200:
        limit = 200
    if offset < 0:
        offset = 0
    base_stmt = select(Todo)
    if completed is not None:
        base_stmt = base_stmt.where(Todo.completed == completed)
    total = session.exec(base_stmt).unique().all()
    total_count = len(total)
    stmt = base_stmt.limit(limit).offset(offset)
    items = [item.model_dump() for item in session.exec(stmt)]
    return TodoList(items=items, total=total_count, limit=limit, offset=offset)


@router.post("/", response_model=Todo, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate, session: Annotated[Session, Depends(get_session)]) -> Todo:
    obj = Todo(title=todo.title, completed=todo.completed)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


@router.get("/{todo_id}", response_model=Todo, status_code=status.HTTP_200_OK)
def get_todo(todo_id: int, session: Annotated[Session, Depends(get_session)]) -> Todo:
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo


@router.put("/{todo_id}", response_model=Todo, status_code=status.HTTP_200_OK)
def update_todo(
    todo_id: int,
    updated: TodoUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Todo:
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    todo.title = updated.title
    todo.completed = updated.completed
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, session: Annotated[Session, Depends(get_session)]) -> None:
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    session.delete(todo)
    session.commit()
    return None
