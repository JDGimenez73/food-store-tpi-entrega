from datetime import datetime
from sqlalchemy import func
from sqlmodel import select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def list_by_usuario(self, usuario_id: int | None, skip: int, limit: int, estado: str | None):
        criteria = []
        if usuario_id is not None:
            criteria.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            criteria.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*criteria)).one()
        items = self.session.exec(select(Pedido).where(*criteria).order_by(Pedido.id.desc()).offset(skip).limit(limit)).all()
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        return dict(self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all())

    def count_between(self, start: datetime, end: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= start, Pedido.created_at < end)).one()

    def delivered_income(self) -> float:
        return self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == 'ENTREGADO')).one()
