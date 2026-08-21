/** 登录注册：图形验证码 + 注册 + 登录（真实 API）。 */
import type { CaptchaResponse, RegisterRequest, UserInfo } from "@contracts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.detail?.message || data.message)) || `API ${res.status}: ${path}`;
    throw new Error(message);
  }
  return data as T;
}

export async function realGetCaptcha(): Promise<CaptchaResponse> {
  return apiFetch<CaptchaResponse>("/api/v1/auth/captcha");
}

export async function realRegister(payload: RegisterRequest): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function realLogin(payload: {
  username: string;
  password: string;
  captcha_id: string;
  captcha: string;
}): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
