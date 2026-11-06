from fastapi import HTTPException
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def list_all(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(user) for user in uow.usuarios.get_all()]

    def set_disabled(self, user_id: int, disabled: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id, lock=True)
            if user is None:
                raise HTTPException(404, 'Usuario no encontrado')
            if disabled and user_id == actor_id:
                raise HTTPException(400, 'No podés desactivarte a vos mismo')
            user.disabled = disabled
            return UserPublic.model_validate(user)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
