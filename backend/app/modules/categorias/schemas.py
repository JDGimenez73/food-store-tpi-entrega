from sqlmodel import Field, SQLModel
from pydantic import model_validator


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ''


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @model_validator(mode='after')
    def reject_explicit_null(self):
        if any(getattr(self, name) is None for name in self.model_fields_set):
            raise ValueError('Los campos enviados no pueden ser null')
        return self


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
