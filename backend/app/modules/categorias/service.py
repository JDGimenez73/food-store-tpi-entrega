from sqlalchemy.exc import IntegrityError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def _active(self, uow, record_id: int, *, lock=False):
        category = uow.categorias.get_by_id(record_id, lock=lock)
        if category is None or not category.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada')
        return category

    def list_all(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_active()]

    def get(self, record_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._active(uow, record_id))

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                if uow.categorias.get_by_nombre(data.nombre):
                    raise NombreDuplicado('Ya existe una categoría con ese nombre')
                category = uow.categorias.add(Categoria.model_validate(data))
                return CategoriaRead.model_validate(category)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def update(self, record_id: int, data: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                category = self._active(uow, record_id, lock=True)
                values = data.model_dump(exclude_unset=True)
                if 'nombre' in values:
                    existing = uow.categorias.get_by_nombre(values['nombre'])
                    if existing and existing.id != record_id:
                        raise NombreDuplicado('Ya existe una categoría con ese nombre')
                for key, value in values.items():
                    setattr(category, key, value)
                uow.session.flush()
                return CategoriaRead.model_validate(category)
        except IntegrityError as error:
            raise NombreDuplicado('Ya existe una categoría con ese nombre') from error

    def delete(self, record_id: int) -> None:
        with self.uow as uow:
            self._active(uow, record_id, lock=True).activo = False


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
