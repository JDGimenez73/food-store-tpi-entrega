from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, ResumenPedidos, EstadoPedido
from app.modules.pedidos.service import PedidoService, PedidoNoEncontrado, PedidoAjeno, ReglaPedido, get_pedido_service

router = APIRouter(prefix='/pedidos', tags=['pedidos'])
Service = Annotated[PedidoService, Depends(get_pedido_service)]
User = Annotated[UserPublic, Depends(get_current_active_user)]
Admin = Annotated[UserPublic, Depends(require_role(['admin']))]


def invoke(operation, *args):
    try:
        return operation(*args)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as error:
        raise HTTPException(404, str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(403, str(error)) from error
    except ReglaPedido as error:
        raise HTTPException(400, str(error)) from error


@router.post('', status_code=201, response_model=PedidoRead)
def create(data: PedidoCreate, user: User, service: Service):
    return invoke(service.create, data, user)


@router.get('', response_model=PedidosPaginados)
def list_orders(user: User, service: Service, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), estado: EstadoPedido | None = None):
    return service.list_all(user, skip, limit, estado)


@router.get('/resumen', response_model=ResumenPedidos)
def summary(admin: Admin, service: Service):
    return service.summary()


@router.get('/{record_id}', response_model=PedidoRead)
def get_order(record_id: int, user: User, service: Service):
    return invoke(service.get, record_id, user)


@router.patch('/{record_id}/estado', response_model=PedidoRead)
def change_state(record_id: int, data: CambioEstado, admin: Admin, service: Service):
    return invoke(service.change_state, record_id, data.estado)


@router.patch('/{record_id}/cancelar', response_model=PedidoRead)
def cancel(record_id: int, user: User, service: Service):
    return invoke(service.cancel, record_id, user)
