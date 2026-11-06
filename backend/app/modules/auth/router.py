from typing import Annotated
from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import Message, UserCreate, UserPublic
from app.modules.auth.service import AuthService, get_auth_service

router = APIRouter(prefix='/auth', tags=['auth'])
Service = Annotated[AuthService, Depends(get_auth_service)]


@router.post('/register', status_code=201, response_model=UserPublic)
def register(data: UserCreate, service: Service):
    return service.register(data)


@router.post('/token', response_model=Message)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, service: Service):
    token = service.login(form.username, form.password)
    response.set_cookie('access_token', token, httponly=True, secure=settings.COOKIE_SECURE,
                        samesite='lax', max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, path='/')
    return Message(message='Login exitoso')


@router.post('/logout', response_model=Message)
def logout(response: Response):
    response.delete_cookie('access_token', path='/', httponly=True, secure=settings.COOKIE_SECURE, samesite='lax')
    return Message(message='Sesión cerrada')


@router.get('/me', response_model=UserPublic)
def me(user: Annotated[UserPublic, Depends(get_current_active_user)]):
    return user
