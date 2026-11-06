from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService, get_usuario_service

router = APIRouter(prefix='/admin/usuarios', tags=['usuarios'])
Admin = Annotated[UserPublic, Depends(require_role(['admin']))]
Service = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get('', response_model=list[UserPublic])
def list_users(service: Service, admin: Admin):
    return service.list_all()


@router.post('/{user_id}/activar', response_model=UserPublic)
def activate(user_id: int, service: Service, admin: Admin):
    return service.set_disabled(user_id, False, admin.id)


@router.post('/{user_id}/desactivar', response_model=UserPublic)
def deactivate(user_id: int, service: Service, admin: Admin):
    return service.set_disabled(user_id, True, admin.id)
