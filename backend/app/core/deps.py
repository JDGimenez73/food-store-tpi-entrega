from typing import Annotated

from fastapi import Cookie, Depends, HTTPException

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> UserPublic:
    payload = decode_access_token(access_token) if access_token else None
    if not payload:
        raise HTTPException(401, 'Sesión inválida o expirada')
    with UsuarioUnitOfWork() as uow:
        user = uow.usuarios.get_by_username(payload['sub'])
        if user is None:
            raise HTTPException(401, 'Sesión inválida o expirada')
        return UserPublic.model_validate(user)


def get_current_active_user(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    if user.disabled:
        raise HTTPException(400, 'Cuenta de usuario desactivada')
    return user


def require_role(roles: list[str]):
    def dependency(user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(403, 'No tenés permiso para esta operación')
        return user
    return dependency
