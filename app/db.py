from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./todo.db"
engine = create_engine(DATABASE_URL, echo=False)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


# Testing helper to reset database between test runs
def reset_db() -> None:
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
