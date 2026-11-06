"""Datos académicos iniciales. Ejecutar desde backend: python -m app.db.seed."""
from sqlmodel import select
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto


def seed() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session
        if session.exec(select(Usuario).where(Usuario.username == 'admin')).first() is None:
            session.add(Usuario(username='admin', full_name='Administrador Food Store', email='admin@foodstore.example',
                                hashed_password=hash_password('Admin1234!'), role='admin'))
        categories = {}
        for name, description in [('Hamburguesas', 'Clásicos entre panes'), ('Pizzas', 'Recién salidas del horno'), ('Bebidas', 'Para acompañar tu pedido')]:
            category = session.exec(select(Categoria).where(Categoria.nombre == name)).first()
            if category is None:
                category = Categoria(nombre=name, descripcion=description)
                session.add(category)
                session.flush()
            categories[name] = category
        products = [
            ('Hamburguesa clásica', 'Carne, queso y vegetales frescos', 6500, 'Hamburguesas', 'photo-1568901346375-23c9450c58cd'),
            ('Doble cheddar', 'Doble carne y doble queso cheddar', 8900, 'Hamburguesas', 'photo-1571091718767-18b5b1457add'),
            ('Hamburguesa vegetariana', 'Medallón de legumbres y vegetales', 7200, 'Hamburguesas', 'photo-1520072959219-c595dc870360'),
            ('Pizza muzzarella', 'Salsa de tomate, muzzarella y aceitunas', 10500, 'Pizzas', 'photo-1513104890138-7c749659a591'),
            ('Pizza napolitana', 'Tomate fresco, ajo y muzzarella', 11500, 'Pizzas', 'photo-1579751626657-72bc17010498'),
            ('Pizza especial', 'Jamón, morrón y muzzarella', 12500, 'Pizzas', 'photo-1571407970349-bc81e7e96d47'),
            ('Limonada', 'Limonada fresca de la casa, 500 ml', 2800, 'Bebidas', 'photo-1513558161293-cdaf765edfd7'),
            ('Agua mineral', 'Agua mineral sin gas, 500 ml', 1800, 'Bebidas', 'photo-1548839140-29a749e1cf4d'),
        ]
        for name, description, price, category_name, photo in products:
            category = categories[category_name]
            existing = session.exec(select(Producto).where(Producto.nombre == name, Producto.categoria_id == category.id)).first()
            if existing is None:
                session.add(Producto(nombre=name, descripcion=description, precio_base=price, categoria_id=category.id,
                                     stock=30, imagen_url=f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=800&q=80'))
    print('Seed completado: admin y catálogo inicial disponibles (sin duplicar datos).')


if __name__ == '__main__':
    seed()
