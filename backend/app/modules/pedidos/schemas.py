from datetime import datetime, timezone
from typing import Literal
from sqlmodel import Field, SQLModel
from pydantic import field_validator

EstadoPedido = Literal['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']
FormaPago = Literal['EFECTIVO', 'TRANSFERENCIA']


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]

    @field_validator('created_at', 'updated_at')
    @classmethod
    def utc_timestamp(cls, value: datetime) -> datetime:
        # Respuestas ISO inequívocas también cuando SQLite devuelve UTC naive.
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
