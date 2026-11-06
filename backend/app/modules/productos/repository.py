from sqlalchemy import func
from sqlmodel import select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session):
        super().__init__(session, Producto)

    def search(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None):
        criteria = [Producto.activo == True]
        if search:
            criteria.append(Producto.nombre.ilike('%' + search.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_') + '%', escape='\\'))
        if categoria_id is not None:
            criteria.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            criteria.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*criteria)).one()
        items = self.session.exec(select(Producto).where(*criteria).order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, items
