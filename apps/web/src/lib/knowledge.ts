/**
 * 知识库前端加载工具（角色 E）
 *
 * 数据源：apps/web/public/knowledge/{subject}/g{grade}.json
 * 由 tools/sync_knowledge.py 从 data/question_bank + data/knowledge_graph
 * 聚合生成，覆盖 1-6 年级：
 *   - g3-g6：知识图谱 + 题库 JSON（data/ 原始数据）
 *   - g1-g2：语文从统编版教材 PDF 目录提取；数学为北师大版章节框架；
 *           英语为三年级起点，1-2 年级无内容（前端已隐藏英语入口）
 */
import type { KnowledgePoint, Question, Subject } from "@contracts";

/** 知识库知识点（在契约基础上附带来源标记，供前端展示教材出处） */
export interface GradeKnowledgePoint extends KnowledgePoint {
  source?: "knowledge_graph" | "textbook_toc" | "textbook_framework";
}

export interface GradeKnowledge {
  grade: number;
  subject: Subject;
  knowledge_points: GradeKnowledgePoint[];
  questions: Question[];
}

/** 按学科+年级加载知识库内容；加载失败返回 null（调用方自行降级） */
export async function loadGradeKnowledge(
  subject: Subject,
  grade: number,
): Promise<GradeKnowledge | null> {
  try {
    const res = await fetch(`/knowledge/${subject}/g${grade}.json`);
    if (!res.ok) return null;
    return (await res.json()) as GradeKnowledge;
  } catch {
    return null;
  }
}

/** 加载某年级全部学科的课程内容（并行），返回 subject → 知识库 的映射 */
export async function loadGradeAll(
  subjects: Subject[],
  grade: number,
): Promise<Partial<Record<Subject, GradeKnowledge>>> {
  const entries = await Promise.all(
    subjects.map(async (s) => [s, await loadGradeKnowledge(s, grade)] as const),
  );
  return Object.fromEntries(entries.filter(([, v]) => v !== null));
}
