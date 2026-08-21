"""认证服务：注册、登录、SVG 验证码（大小写不敏感）。"""

import hashlib
import hmac
import os
import secrets
import string
import threading
import time
from uuid import uuid4

from app import db

CAPTCHA_TTL_SECONDS = 5 * 60
CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"  # 去 0/1/O/I 避免混淆
CAPTCHA_LENGTH = 4

_captcha_store: dict[str, dict] = {}
_captcha_lock = threading.Lock()


# ---------- 密码哈希（PBKDF2-HMAC-SHA256）----------

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, expected = stored.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return hmac.compare_digest(digest, expected)


# ---------- 验证码 ----------

def _new_captcha_text() -> str:
    return "".join(secrets.choice(CAPTCHA_CHARS) for _ in range(CAPTCHA_LENGTH))


def _build_captcha_svg(text: str) -> str:
    """4 字符彩色验证码 + 干扰线，输出 SVG 字符串。"""
    import random

    palette = ["#2563eb", "#db2777", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"]
    parts: list[str] = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">',
        '<rect width="120" height="40" fill="#f5f5f5"/>',
    ]
    # 干扰线
    for _ in range(4):
        x1, y1, x2, y2 = (random.randint(0, 120), random.randint(0, 40), random.randint(0, 120), random.randint(0, 40))
        color = secrets.choice(palette)
        parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1" opacity="0.6"/>'
        )
    # 字符
    for i, ch in enumerate(text):
        x = 16 + i * 24
        y = 26
        color = secrets.choice(palette)
        rotate = secrets.choice([-18, -10, -6, 6, 10, 18])
        parts.append(
            f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="22" font-weight="bold"'
            f' fill="{color}" transform="rotate({rotate} {x} {y})">{ch}</text>'
        )
    parts.append("</svg>")
    return "".join(parts)


def issue_captcha() -> dict:
    """生成验证码：返回 {captcha_id, image（SVG data URI）}。"""
    text = _new_captcha_text()
    captcha_id = uuid4().hex
    with _captcha_lock:
        # 清理过期
        now = time.time()
        for k in list(_captcha_store):
            if _captcha_store[k]["expires"] < now:
                _captcha_store.pop(k, None)
        _captcha_store[captcha_id] = {
            "text": text.lower(),
            "expires": now + CAPTCHA_TTL_SECONDS,
        }
    import base64

    svg = _build_captcha_svg(text)
    image = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()
    return {"captcha_id": captcha_id, "image": image}


def _consume_captcha(captcha_id: str, captcha_text: str) -> bool:
    """校验并消费验证码（大小写不敏感，单次有效）。"""
    if not captcha_id or not captcha_text:
        return False
    with _captcha_lock:
        entry = _captcha_store.pop(captcha_id, None)
    if not entry or entry["expires"] < time.time():
        return False
    return hmac.compare_digest(entry["text"], captcha_text.strip().lower())


# ---------- 注册 / 登录 ----------

class AuthError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def register(username: str, password: str, role: str, captcha_id: str, captcha: str) -> dict:
    if not _consume_captcha(captcha_id, captcha):
        raise AuthError("captcha_invalid", "验证码错误或已过期")
    if role not in ("student", "parent"):
        raise AuthError("role_invalid", "角色仅支持 student / parent")
    if not username or len(username) < 3:
        raise AuthError("username_invalid", "账号至少 3 个字符")
    if not password or len(password) < 6:
        raise AuthError("password_invalid", "密码至少 6 个字符")
    if db.get_user_by_username(username):
        raise AuthError("username_taken", "该账号已注册")
    user = {
        "user_id": f"user_{uuid4().hex[:8]}",
        "username": username,
        "password_hash": hash_password(password),
        "role": role,
        "display_name": username,
        "linked_student_id": None,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    db.create_user(user)
    return {
        "user_id": user["user_id"],
        "username": username,
        "role": role,
        "display_name": user["display_name"],
    }


def login(username: str, password: str, captcha_id: str, captcha: str) -> dict:
    if not _consume_captcha(captcha_id, captcha):
        raise AuthError("captcha_invalid", "验证码错误或已过期")
    user = db.get_user_by_username(username)
    if not user or not verify_password(password, user["password_hash"]):
        raise AuthError("invalid_credentials", "账号或密码错误")
    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "role": user["role"],
        "display_name": user.get("display_name") or user["username"],
    }
