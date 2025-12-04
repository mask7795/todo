from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel

DB_PATH = Path(".data")
DB_PATH.mkdir(exist_ok=True)
DATABASE_URL = f"sqlite:///{DB_PATH / 'todo.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    SQLModel.metadata.create_all(bind=engine)
    ensure_schema()


def ensure_schema() -> None:
    """Ensure SQLite schema has latest optional columns.

    Adds new nullable columns via ALTER TABLE if they are missing.
    Safe to run multiple times.
    """
    with engine.connect() as conn:
        # Ensure base tables exist before attempting ALTERs
        tbl = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='todo'")
        ).fetchone()
        if tbl is None:
            # Create tables if missing
            SQLModel.metadata.create_all(bind=engine)
        # Inspect existing columns
        cols = conn.execute(text("PRAGMA table_info('todo')")).fetchall()
        existing = {row[1] for row in cols}  # row[1] = name

        if "due_at" not in existing:
            conn.execute(text("ALTER TABLE todo ADD COLUMN due_at DATETIME NULL"))
        if "priority" not in existing:
            conn.execute(text("ALTER TABLE todo ADD COLUMN priority VARCHAR NULL"))
        if "deleted_at" not in existing:
            conn.execute(text("ALTER TABLE todo ADD COLUMN deleted_at DATETIME NULL"))
        conn.commit()


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


def reset_db() -> None:
    """Drop and recreate all tables (used in tests)."""
    SQLModel.metadata.drop_all(bind=engine)
    SQLModel.metadata.create_all(bind=engine)
