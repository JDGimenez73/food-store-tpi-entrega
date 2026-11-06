from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaService, CategoriaNoEncontrada, NombreDuplicado, get_categoria_service

router = APIRouter(prefix='/categorias', tags=['categorias'])
Service = Annotated[CategoriaService, Depends(get_categoria_service)]
Admin = Annotated[UserPublic, Depends(require_role(['admin']))]


def invoke(operation, *args):
    try:
        return operation(*args)
    except CategoriaNoEncontrada as error:
        raise HTTPException(404, str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(409, str(error)) from error


@router.get('', response_model=list[CategoriaRead])
def list_categories(service: Service):
    return service.list_all()


@router.get('/{record_id}', response_model=CategoriaRead)
def get_category(record_id: int, service: Service):
    return invoke(service.get, record_id)


@router.post('', status_code=201, response_model=CategoriaRead)
def create(data: CategoriaCreate, service: Service, admin: Admin):
    return invoke(service.create, data)


@router.put('/{record_id}', response_model=CategoriaRead)
def update(record_id: int, data: CategoriaUpdate, service: Service, admin: Admin):
    return invoke(service.update, record_id, data)


@router.delete('/{record_id}', status_code=204)
def delete(record_id: int, service: Service, admin: Admin):
    invoke(service.delete, record_id)
    return Response(status_code=204)
