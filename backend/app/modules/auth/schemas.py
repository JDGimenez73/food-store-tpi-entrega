from sqlmodel import SQLModel
from app.modules.usuarios.schemas import UserCreate, UserPublic


class Message(SQLModel):
    message: str


__all__ = ['UserCreate', 'UserPublic', 'Message']
