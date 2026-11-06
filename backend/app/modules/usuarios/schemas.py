from datetime import datetime, timezone
from typing import Literal

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=1, max_length=100)
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('password')
    @classmethod
    def bcrypt_length(cls, value: str) -> str:
        if len(value.encode('utf-8')) > 72:
            raise ValueError('La contraseña admite hasta 72 bytes UTF-8')
        return value


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: Literal['user', 'admin']
    disabled: bool
    created_at: datetime

    @field_validator('created_at')
    @classmethod
    def utc_timestamp(cls, value: datetime) -> datetime:
        # SQLite omite el offset al releer fechas que se guardaron en UTC.
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
