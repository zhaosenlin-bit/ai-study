/** /courses：课程序列（口算/应用题交替）、课程题目、判题、完成。 */
import type {
  CourseAnswerResponse,
  CourseListResponse,
  CourseQuestion,
} from "@contracts";

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

export async function realGetCourses(
  subject: "math" | "chinese" | "english",
  studentId: string,
  grade: number,
): Promise<CourseListResponse> {
  return apiFetch<CourseListResponse>(
    `/api/v1/courses/${subject}?student_id=${encodeURIComponent(studentId)}&grade=${grade}`,
  );
}

export async function realGetCourseQuestions(
  subject: string,
  courseId: string,
): Promise<CourseQuestion[]> {
  return apiFetch<CourseQuestion[]>(`/api/v1/courses/${subject}/${courseId}/questions`);
}

export async function realAnswerCourseQuestion(
  subject: string,
  courseId: string,
  studentId: string,
  questionId: string,
  answer: string,
): Promise<CourseAnswerResponse> {
  return apiFetch<CourseAnswerResponse>(`/api/v1/courses/${subject}/${courseId}/answer`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, question_id: questionId, answer }),
  });
}

export async function realCompleteCourse(
  subject: string,
  courseId: string,
  studentId: string,
): Promise<{ course_id: string; completed: boolean }> {
  return apiFetch(`/api/v1/courses/${subject}/${courseId}/complete`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId }),
  });
}
