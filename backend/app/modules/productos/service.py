from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoRead, ProductoStockUpdate, ProductosPaginados
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _active(self, uow, record_id: int, *, lock=False):
        product = uow.productos.get_by_id(record_id, lock=lock)
        if product is None or not product.activo:
            raise ProductoNoEncontrado('Producto no encontrado')
        return product

    def _category(self, uow, record_id: int):
        category = uow.categorias.get_by_id(record_id)
        if category is None or not category.activo:
            raise CategoriaNoEncontrada('Categoría no encontrada')
        return category

    def list_all(self, skip=0, limit=20, search=None, categoria_id=None, disponible=None) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def get(self, record_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._active(uow, record_id))

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            category = self._category(uow, data.categoria_id)
            product = Producto.model_validate(data)
            product.categoria = category
            uow.productos.add(product)
            return ProductoRead.model_validate(product)

    def update(self, record_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            product = self._active(uow, record_id, lock=True)
            values = data.model_dump(exclude_unset=True)
            if 'categoria_id' in values:
                product.categoria = self._category(uow, values['categoria_id'])
            for key, value in values.items():
                setattr(product, key, value)
            uow.session.flush()
            return ProductoRead.model_validate(product)

    def stock(self, record_id: int, data: ProductoStockUpdate) -> ProductoRead:
        return self.update(record_id, ProductoUpdate(**data.model_dump()))

    def delete(self, record_id: int) -> None:
        with self.uow as uow:
            self._active(uow, record_id, lock=True).activo = False


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
