/** /me：当前用户 + 绑定的学生资料。 */
import type { MeResponse } from "@contracts";

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

export async function getMe(userId: string): Promise<MeResponse> {
  return apiFetch<MeResponse>(`/api/v1/me?user_id=${encodeURIComponent(userId)}`);
}

export async function setMyGrade(userId: string, grade: number): Promise<MeResponse> {
  return apiFetch<MeResponse>(`/api/v1/me/grade?user_id=${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify({ grade }),
  });
}
