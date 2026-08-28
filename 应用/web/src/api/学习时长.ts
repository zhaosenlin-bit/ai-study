/** /study：学习时长记录与查询。 */
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

export interface StudyTimeSummary {
  total: number;
  math: number;
  chinese: number;
  english: number;
}

export async function realRecordStudyTime(
  studentId: string,
  subject: "math" | "chinese" | "english",
  seconds: number,
): Promise<void> {
  await apiFetch(`/api/v1/study/time`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, subject, seconds }),
  });
}

export async function realGetStudyTime(studentId: string, days = 7): Promise<StudyTimeSummary> {
  return apiFetch<StudyTimeSummary>(
    `/api/v1/study/time?student_id=${encodeURIComponent(studentId)}&days=${days}`,
  );
}
