from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoRead, ProductoStockUpdate, ProductosPaginados
from app.modules.productos.service import ProductoService, ProductoNoEncontrado, get_producto_service

router = APIRouter(prefix='/productos', tags=['productos'])
Service = Annotated[ProductoService, Depends(get_producto_service)]
Admin = Annotated[UserPublic, Depends(require_role(['admin']))]


def invoke(operation, *args):
    try:
        return operation(*args)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(404, str(error)) from error


@router.get('', response_model=ProductosPaginados)
def list_products(service: Service, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), search: str | None = None, categoria_id: int | None = Query(None, gt=0), disponible: bool | None = None):
    return service.list_all(skip, limit, search, categoria_id, disponible)


@router.get('/{record_id}', response_model=ProductoRead)
def get_product(record_id: int, service: Service):
    return invoke(service.get, record_id)


@router.post('', status_code=201, response_model=ProductoRead)
def create(data: ProductoCreate, service: Service, admin: Admin):
    return invoke(service.create, data)


@router.put('/{record_id}', response_model=ProductoRead)
def update(record_id: int, data: ProductoUpdate, service: Service, admin: Admin):
    return invoke(service.update, record_id, data)


@router.patch('/{record_id}/stock', response_model=ProductoRead)
def stock(record_id: int, data: ProductoStockUpdate, service: Service, admin: Admin):
    return invoke(service.stock, record_id, data)


@router.delete('/{record_id}', status_code=204)
def delete(record_id: int, service: Service, admin: Admin):
    invoke(service.delete, record_id)
    return Response(status_code=204)
