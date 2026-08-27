"""认证接口：验证码、注册、登录。"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import 认证服务

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class CaptchaResponse(BaseModel):
    captcha_id: str
    image: str  # data:image/svg+xml;base64,xxx


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=32)
    password: str = Field(min_length=1, max_length=64)
    role: str = Field(pattern="^(student|parent)$")
    captcha_id: str
    captcha: str = Field(min_length=1, max_length=8)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=32)
    password: str = Field(min_length=1, max_length=64)
    captcha_id: str
    captcha: str = Field(min_length=1, max_length=8)


class UserInfo(BaseModel):
    user_id: str
    username: str
    role: str
    display_name: str


@router.get("/captcha", response_model=CaptchaResponse, summary="获取图形验证码（SVG）")
def get_captcha() -> CaptchaResponse:
    return CaptchaResponse(**auth.issue_captcha())


@router.post("/register", response_model=UserInfo, summary="注册（学生/家长）")
def register(payload: RegisterRequest) -> UserInfo:
    try:
        return UserInfo(**auth.register(
            payload.username, payload.password, payload.role, payload.captcha_id, payload.captcha
        ))
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail={"code": e.code, "message": e.message})


@router.post("/login", response_model=UserInfo, summary="登录（学生/家长）")
def login(payload: LoginRequest) -> UserInfo:
    try:
        return UserInfo(**auth.login(
            payload.username, payload.password, payload.captcha_id, payload.captcha
        ))
    except auth.AuthError as e:
        raise HTTPException(status_code=400, detail={"code": e.code, "message": e.message})