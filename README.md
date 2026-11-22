# Food Store - Trabajo Práctico Integrador

Proyecto de Programación 4 de la Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web para consultar un catálogo de comidas, gestionar un carrito y realizar pedidos. Incluye un panel administrativo para categorías, productos, stock, usuarios y estados de pedidos.

El proyecto se organiza en `backend/` (API) y `frontend/` (interfaz). La consigna y el diagrama UML están en `docs/`.

## Documentación

- [Consigna completa](docs/TPI_Food_Store.pdf), 23 páginas.
- [Diagrama UML del modelo de datos](docs/modelo-datos.png).

## Tecnologías

Backend: Python 3.11 a 3.13, FastAPI, SQLModel, PostgreSQL y JWT en cookie HttpOnly.

Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, TanStack Query/Form/Table, Zustand y React Router; gestor pnpm.

Las versiones exactas están fijadas en los archivos de dependencias y sus lockfiles, respetando la consigna.

## Requisitos locales

Python 3.11 a 3.13, Node.js 20.19 o superior, pnpm 9 o superior y PostgreSQL 15 o superior. Python 3.14 no es compatible con la versión SQLModel fijada. Para PostgreSQL se puede usar una instalación propia o Docker Desktop; SQLite está permitido como alternativa de desarrollo.

## Base de datos

Con Docker Desktop ejecutándose, desde la raíz:

```powershell
docker compose up -d
```

El servicio usa PostgreSQL 16 y publica el puerto local **55433**. Credenciales de desarrollo: usuario `foodstore`, contraseña `foodstore_local`, base `foodstore_db`. El volumen `foodstore_data` conserva los datos. `docker compose down` detiene el servicio sin borrar ese volumen.

El puerto se puede cambiar mediante la variable FOODSTORE_DB_PORT al ejecutar Docker Compose. Si lo cambiás, actualizá también el puerto de DATABASE_URL en backend/.env.

Si ya tenés PostgreSQL, creá una base para este proyecto y ajustá DATABASE_URL.

## Backend

En PowerShell, desde la raíz:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Revisá `.env` antes de continuar: configurá la conexión elegida y reemplazá SECRET_KEY por una clave propia de al menos 32 caracteres. Para desarrollar sin PostgreSQL, usá `DATABASE_URL=sqlite:///./foodstore.db`.

```powershell
.\.venv\Scripts\python.exe -m app.db.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

API: http://localhost:8000/api/v1. Swagger: http://localhost:8000/docs. ReDoc: http://localhost:8000/redoc.

En Linux/macOS los comandos equivalentes usan `.venv/bin/python`.

## Frontend

En otra terminal, desde la raíz:

```powershell
cd frontend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pnpm.cmd install --frozen-lockfile
pnpm.cmd build
pnpm.cmd dev
```

Abrí http://localhost:5173. Usá `localhost` tanto en frontend como en API para mantener coherentes cookies y CORS. En Linux/macOS reemplazá `pnpm.cmd` por `pnpm`. La compilación verifica TypeScript antes de generar `dist/`.

## Variables de entorno

| Proyecto | Variable | Uso |
| --- | --- | --- |
| Backend | DATABASE_URL | Conexión PostgreSQL; admite SQLite para desarrollo. |
| Backend | SECRET_KEY | Firma JWT, mínimo 32 caracteres; reemplazar el ejemplo. |
| Backend | ALGORITHM | HS256. |
| Backend | ACCESS_TOKEN_EXPIRE_MINUTES | Duración de JWT y cookie; 30 por defecto. |
| Backend | FRONTEND_ORIGIN | Origen CORS; http://localhost:5173. |
| Backend | COOKIE_SECURE | false para HTTP local; true al usar HTTPS. |
| Frontend | VITE_API_URL | http://localhost:8000/api/v1. |

Nunca subir `.env` al repositorio. Los archivos `.env.example` documentan los valores locales.

Si Windows rechaza la apertura del puerto de PostgreSQL o el puerto ya está ocupado, elegí otro libre y actualizá DATABASE_URL. Si usás Docker, también ajustá el puerto publicado en compose.yaml.

## Datos de demostración

El seed crea `admin / Admin1234!`, 3 categorías y 8 productos con stock. El seed puede repetirse sin duplicar los datos iniciales. Estas credenciales corresponden al entorno académico de demostración.

## Uso

El catálogo permite buscar y filtrar productos. Para confirmar una compra, el cliente debe registrarse e ingresar una dirección y una forma de pago: efectivo o transferencia manual. El total se calcula en el servidor.

Los pedidos avanzan de PENDIENTE a EN_PREPARACION y ENTREGADO. El cliente puede cancelar pedidos pendientes; el administrador puede cancelar pedidos pendientes o en preparación. La cancelación restituye el stock. Los pedidos entregados y cancelados conservan su historial.

El administrador accede desde el menú al panel de categorías, productos, pedidos, usuarios y resumen de indicadores.

## Enlaces

- [Repositorio del proyecto](https://github.com/JDGimenez73/food-store-tpi-entrega).
- [Video de demostración](https://drive.google.com/file/d/1zkB8kYn6P0M4_O070__nsFWvvJB5MZ-J/view?usp=sharing).

## Referencias

La autenticación adapta el proyecto académico `seguridad_jwt_pg` de la materia. La arquitectura, el catálogo y los pedidos se desarrollan según la consigna del TPI.

Documentación técnica: [relaciones con SQLModel](https://sqlmodel.tiangolo.com/tutorial/fastapi/relationships/) y [sesiones con SQLAlchemy](https://docs.sqlalchemy.org/en/20/orm/session_basics.html).
