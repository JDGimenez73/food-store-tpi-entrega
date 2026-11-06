from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar('T', bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, record_id: int, *, lock: bool = False) -> T | None:
        statement = select(self.model).where(self.model.id == record_id)
        if lock:
            statement = statement.with_for_update()
        return self.session.exec(statement).first()

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model).order_by(self.model.id)).all())

    def add(self, record: T) -> T:
        self.session.add(record)
        self.session.flush()
        return record

    def delete(self, record: T) -> None:
        self.session.delete(record)
