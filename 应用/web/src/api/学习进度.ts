/** /learning：按学科+年级返回有序学习列表。 */
import type { LearningResponse } from "@contracts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

export async function realGetLearning(
  subject: "math" | "chinese" | "english",
  studentId: string,
  grade: number,
): Promise<LearningResponse> {
  return apiFetch<LearningResponse>(
    `/api/v1/learning/${subject}?student_id=${encodeURIComponent(studentId)}&grade=${grade}`,
  );
}