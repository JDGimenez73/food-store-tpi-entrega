from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={'check_same_thread': False} if settings.DATABASE_URL.startswith('sqlite') else {},
    pool_pre_ping=True,
)

if settings.DATABASE_URL.startswith('sqlite'):
    @event.listens_for(engine, 'connect')
    def sqlite_foreign_keys(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    import app.modules.usuarios.models  # noqa: F401
    import app.modules.categorias.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    SQLModel.metadata.create_all(engine)
