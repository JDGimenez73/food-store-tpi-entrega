# Food Store - Trabajo Práctico Integrador

Proyecto de Programación 4 de la Tecnicatura Universitaria en Programación a Distancia (UTN).

## Tecnologías exigidas

Backend: Python 3.11 a 3.13, FastAPI, SQLModel, PostgreSQL y JWT en cookie HttpOnly.

Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, TanStack Query/Form/Table, Zustand y React Router; gestor pnpm.

Las versiones exactas se elegirán y fijarán al preparar cada proyecto, respetando la consigna.

## Requisitos locales

Python 3.11 a 3.13, Node.js 20.19 o superior, pnpm 9 o superior y PostgreSQL 15 o superior. Python 3.14 no es compatible con la versión SQLModel fijada. Para PostgreSQL se puede usar una instalación propia o Docker Desktop; SQLite está permitido como alternativa de desarrollo.

## Base de datos

Con Docker Desktop ejecutándose, desde la raíz:

```powershell
docker compose up -d
```

El servicio usa PostgreSQL 16 y publica el puerto local **5433**, para evitar conflictos con instalaciones en 5432. Credenciales de desarrollo: usuario `foodstore`, contraseña `foodstore_local`, base `foodstore_db`. El volumen `foodstore_data` conserva los datos. `docker compose down` detiene el servicio sin borrar ese volumen.

Si ya tenés PostgreSQL, creá una base para este proyecto y ajustá DATABASE_URL. No es necesario cambiar las bases de los trabajos anteriores.

## Backend

En PowerShell, desde la raíz:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
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
Copy-Item .env.example .env
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

## Datos de demostración

El seed crea `admin / Admin1234!`, 3 categorías y 8 productos con stock. Se verificó su repetición sin duplicar datos. Estas credenciales corresponden al entorno académico de demostración.

