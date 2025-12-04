import time
from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.db import ensure_schema, get_session
from app.deps import require_api_key
from app.models.todo import Todo
from app.routers.metrics import inc_db_error, record_db_timing
from app.schemas.todo import Todo as TodoSchema
from app.schemas.todo import TodoCreate, TodoList, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/", response_model=TodoList, status_code=status.HTTP_200_OK)
def list_todos(
    session: Annotated[Session, Depends(get_session)],
    limit: int = Query(50, ge=1, le=200, description="Max items per page (1-200)"),
    offset: int = Query(0, ge=0, description="Items to skip (>=0)"),
    completed: bool | None = Query(None, description="Filter by completion status (true/false)"),
    priority: str | None = Query(None, description="Filter by priority: low|medium|high"),
    overdue: bool | None = Query(None, description="Filter overdue items (due_at < now)"),
    sort_due: bool = Query(False, description="Sort by due_at ascending when true"),
    include_deleted: bool = Query(False, description="Include soft-deleted items when true"),
) -> TodoList:
    # Ensure latest schema (handles tests and dev hot-reload)
    ensure_schema()
    if limit < 1:
        limit = 1
    if limit > 200:
        limit = 200
    if offset < 0:
        offset = 0
    base_stmt = select(Todo)
    if not include_deleted:
        # SQLAlchemy column API; mypy sees field type, so ignore
        base_stmt = base_stmt.where(Todo.deleted_at.is_(None))  # type: ignore[union-attr]
    if completed is not None:
        base_stmt = base_stmt.where(Todo.completed == completed)
    if priority is not None:
        base_stmt = base_stmt.where(Todo.priority == priority)
    if overdue:
        from datetime import UTC, datetime

        # Guard non-null then compare; silence mypy on column methods
        base_stmt = base_stmt.where(Todo.due_at.is_not(None))  # type: ignore[union-attr]
        base_stmt = base_stmt.where(Todo.due_at < datetime.now(UTC))  # type: ignore[operator]
    t0 = time.perf_counter()
    try:
        total = session.exec(base_stmt).unique().all()
    except Exception:
        inc_db_error("select_count", "todo")
        raise
    finally:
        record_db_timing("select_count", "todo", time.perf_counter() - t0)
    total_count = len(total)
    if sort_due:
        # Cast for mypy: SQL column expression expected
        stmt = base_stmt.order_by(cast(Any, Todo.due_at)).limit(limit).offset(offset)
    else:
        stmt = base_stmt.limit(limit).offset(offset)
    t1 = time.perf_counter()
    try:
        items = [TodoSchema(**item.model_dump()) for item in session.exec(stmt)]
    except Exception:
        inc_db_error("select_page", "todo")
        raise
    finally:
        record_db_timing("select_page", "todo", time.perf_counter() - t1)
    return TodoList(items=items, total=total_count, limit=limit, offset=offset)


@router.post("/", response_model=TodoSchema, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo: TodoCreate,
    session: Annotated[Session, Depends(get_session)],
    _: None = Depends(require_api_key),
) -> Todo:
    ensure_schema()
    obj = Todo(
        title=todo.title,
        completed=todo.completed,
        due_at=todo.due_at,
        priority=todo.priority,
    )
    t0 = time.perf_counter()
    try:
        session.add(obj)
        session.commit()
        session.refresh(obj)
    except Exception:
        inc_db_error("insert", "todo")
        raise
    finally:
        record_db_timing("insert", "todo", time.perf_counter() - t0)
    return obj


@router.get("/{todo_id}", response_model=TodoSchema, status_code=status.HTTP_200_OK)
def get_todo(todo_id: int, session: Annotated[Session, Depends(get_session)]) -> Todo:
    ensure_schema()
    t0 = time.perf_counter()
    try:
        todo = session.get(Todo, todo_id)
    except Exception:
        inc_db_error("select_by_id", "todo")
        raise
    finally:
        record_db_timing("select_by_id", "todo", time.perf_counter() - t0)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo


@router.put("/{todo_id}", response_model=TodoSchema, status_code=status.HTTP_200_OK)
def update_todo(
    todo_id: int,
    updated: TodoUpdate,
    session: Annotated[Session, Depends(get_session)],
    _: None = Depends(require_api_key),
) -> Todo:
    ensure_schema()
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if updated.title is not None:
        todo.title = updated.title
    if updated.completed is not None:
        todo.completed = updated.completed
    if updated.due_at is not None:
        todo.due_at = updated.due_at
    if updated.priority is not None:
        todo.priority = updated.priority
    t1 = time.perf_counter()
    try:
        session.add(todo)
        session.commit()
        session.refresh(todo)
    except Exception:
        inc_db_error("update", "todo")
        raise
    finally:
        record_db_timing("update", "todo", time.perf_counter() - t1)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    session: Annotated[Session, Depends(get_session)],
    _: None = Depends(require_api_key),
) -> None:
    ensure_schema()
    t0 = time.perf_counter()
    try:
        todo = session.get(Todo, todo_id)
    except Exception:
        inc_db_error("select_by_id", "todo")
        raise
    finally:
        record_db_timing("select_by_id", "todo", time.perf_counter() - t0)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    t1 = time.perf_counter()
    try:
        from datetime import UTC, datetime

        todo.deleted_at = datetime.now(UTC)
        session.add(todo)
        session.commit()
    except Exception:
        inc_db_error("delete", "todo")
        raise
    finally:
        record_db_timing("delete", "todo", time.perf_counter() - t1)
    return None


@router.post("/{todo_id}/restore", response_model=TodoSchema, status_code=status.HTTP_200_OK)
def restore_todo(
    todo_id: int,
    session: Annotated[Session, Depends(get_session)],
    _: None = Depends(require_api_key),
) -> Todo:
    ensure_schema()
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    t0 = time.perf_counter()
    try:
        todo.deleted_at = None
        session.add(todo)
        session.commit()
        session.refresh(todo)
    except Exception:
        inc_db_error("restore", "todo")
        raise
    finally:
        record_db_timing("restore", "todo", time.perf_counter() - t0)
    return todo
