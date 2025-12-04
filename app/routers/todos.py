from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models.todo import Todo

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/", response_model=list[Todo], status_code=status.HTTP_200_OK)
def list_todos(session: Annotated[Session, Depends(get_session)]) -> list[Todo]:
    return session.exec(select(Todo)).all()


@router.post("/", response_model=Todo, status_code=status.HTTP_201_CREATED)
def create_todo(todo: Todo, session: Annotated[Session, Depends(get_session)]) -> Todo:
    if todo.id is not None:
        todo.id = None
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


@router.get("/{todo_id}", response_model=Todo, status_code=status.HTTP_200_OK)
def get_todo(todo_id: int, session: Annotated[Session, Depends(get_session)]) -> Todo:
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo


@router.put("/{todo_id}", response_model=Todo, status_code=status.HTTP_200_OK)
def update_todo(
    todo_id: int,
    updated: Todo,
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
