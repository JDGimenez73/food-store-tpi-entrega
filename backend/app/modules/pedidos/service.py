from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from app.modules.pedidos.models import DetallePedido, Pedido, utcnow
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaPedido(Exception):
    pass


class StockInsuficiente(ReglaPedido):
    pass


class ProductoNoDisponible(ReglaPedido):
    pass


class ProductoRepetido(ReglaPedido):
    pass


class TransicionInvalida(ReglaPedido):
    pass


class PedidoService:
    TRANSICIONES = {
        'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
        'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
        'ENTREGADO': set(),
        'CANCELADO': set(),
    }

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _get(self, uow, record_id: int, *, lock=False):
        order = uow.pedidos.get_by_id(record_id, lock=lock)
        if order is None:
            raise PedidoNoEncontrado('Pedido no encontrado')
        return order

    def create(self, data: PedidoCreate, user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido('No se puede repetir un producto en el pedido')
            order = Pedido(usuario_id=user.id, forma_pago=data.forma_pago,
                           direccion_entrega=data.direccion_entrega, notas=data.notas)
            uow.pedidos.add(order)
            # Orden global de locks: evita deadlocks entre carritos con distinto orden.
            # PostgreSQL serializa aquí compras/cambios de stock del mismo producto.
            for item in sorted(data.items, key=lambda line: line.producto_id):
                product = uow.productos.get_by_id(item.producto_id, lock=True)
                if product is None or not product.activo:
                    raise ProductoNoEncontrado(f'Producto {item.producto_id} no encontrado')
                if not product.disponible:
                    raise ProductoNoDisponible(f'{product.nombre} no está disponible')
                if product.stock < item.cantidad:
                    raise StockInsuficiente(f'Stock insuficiente para {product.nombre}')
                product.stock -= item.cantidad
                subtotal = product.precio_base * item.cantidad
                line = DetallePedido(producto_id=product.id, cantidad=item.cantidad,
                                     nombre_producto=product.nombre, precio_unitario=product.precio_base,
                                     subtotal=subtotal)
                order.items.append(line)
                order.total += subtotal
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def list_all(self, user: UserPublic, skip=0, limit=20, estado=None) -> PedidosPaginados:
        with self.uow as uow:
            total, orders = uow.pedidos.list_by_usuario(None if user.role == 'admin' else user.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(order) for order in orders])

    def get(self, record_id: int, user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            order = self._get(uow, record_id)
            if user.role != 'admin' and order.usuario_id != user.id:
                raise PedidoAjeno('El pedido pertenece a otro usuario')
            return PedidoRead.model_validate(order)

    def _transition(self, uow, order: Pedido, state: str) -> None:
        if state not in self.TRANSICIONES[order.estado]:
            raise TransicionInvalida('Transición de estado inválida')
        if state == 'CANCELADO':
            for line in sorted(order.items, key=lambda item: item.producto_id):
                # Incluye productos inactivos: la referencia histórica se conserva.
                product = uow.productos.get_by_id(line.producto_id, lock=True)
                product.stock += line.cantidad
        order.estado = state
        order.updated_at = utcnow()

    def change_state(self, record_id: int, state: str) -> PedidoRead:
        with self.uow as uow:
            # Lock del pedido evita doble restitución en cancelaciones simultáneas.
            order = self._get(uow, record_id, lock=True)
            self._transition(uow, order, state)
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def cancel(self, record_id: int, user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            order = self._get(uow, record_id, lock=True)
            if order.usuario_id != user.id:
                raise PedidoAjeno('El pedido pertenece a otro usuario')
            if order.estado != 'PENDIENTE':
                raise TransicionInvalida('Solo podés cancelar pedidos pendientes')
            self._transition(uow, order, 'CANCELADO')
            uow.session.flush()
            return PedidoRead.model_validate(order)

    def summary(self) -> ResumenPedidos:
        with self.uow as uow:
            counts = uow.pedidos.count_by_estado()
            zone = ZoneInfo('America/Argentina/Buenos_Aires')
            today = datetime.now(zone).date()
            start = datetime.combine(today, time.min, zone).astimezone(timezone.utc)
            end = datetime.combine(today + timedelta(days=1), time.min, zone).astimezone(timezone.utc)
            return ResumenPedidos(pendientes=counts.get('PENDIENTE', 0), en_preparacion=counts.get('EN_PREPARACION', 0),
                                  entregados=counts.get('ENTREGADO', 0), cancelados=counts.get('CANCELADO', 0),
                                  pedidos_hoy=uow.pedidos.count_between(start, end),
                                  ingresos_entregados=uow.pedidos.delivered_income())


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
