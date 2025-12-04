from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel

DB_PATH = Path(".data")
DB_PATH.mkdir(exist_ok=True)
DATABASE_URL = f"sqlite:///{DB_PATH / 'todo.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    SQLModel.metadata.create_all(bind=engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


def reset_db() -> None:
    """Drop and recreate all tables (used in tests)."""
    SQLModel.metadata.drop_all(bind=engine)
    SQLModel.metadata.create_all(bind=engine)
