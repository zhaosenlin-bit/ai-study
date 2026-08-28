/**
 * 教材清单配置：列出已克隆渲染到 public/textbooks/ 的教材
 * 
 * 结构：TEXTBOOKS[学科][年级] = [{id, label, baseUrl}]
 * 
 * 使用方式：
 *   import { textbooksFor, TEXTBOOKS } from "@/lib/教科书"
 *   const books = textbooksFor("math", 4)
 */

export interface TextbookItem {
  id: string;
  label: string;
  /** 页图片目录，约定 /textbooks/{subject}/g{grade}{semester}/pNNN.jpg */
  baseUrl: string;
}

export const TEXTBOOKS: Record<string, Record<number, TextbookItem[]>> = {
  math: {
    3: [{ id: "g3a", label: "数学 · 三年级上册", baseUrl: "/textbooks/math/g3a" }],
    4: [
      { id: "g4a", label: "数学 · 四年级上册", baseUrl: "/textbooks/math/g4a" },
      { id: "g4b", label: "数学 · 四年级下册", baseUrl: "/textbooks/math/g4b" },
    ],
    5: [
      { id: "g5a", label: "数学 · 五年级上册", baseUrl: "/textbooks/math/g5a" },
      { id: "g5b", label: "数学 · 五年级下册", baseUrl: "/textbooks/math/g5b" },
    ],
    6: [{ id: "g6a", label: "数学 · 六年级上册", baseUrl: "/textbooks/math/g6a" }],
  },
  chinese: {
    3: [{ id: "g3a", label: "语文 · 三年级上册", baseUrl: "/textbooks/chinese/g3a" }],
    4: [
      { id: "g4a", label: "语文 · 四年级上册", baseUrl: "/textbooks/chinese/g4a" },
      { id: "g4b", label: "语文 · 四年级下册", baseUrl: "/textbooks/chinese/g4b" },
    ],
    5: [
      { id: "g5a", label: "语文 · 五年级上册", baseUrl: "/textbooks/chinese/g5a" },
      { id: "g5b", label: "语文 · 五年级下册", baseUrl: "/textbooks/chinese/g5b" },
    ],
    6: [{ id: "g6a", label: "语文 · 六年级上册", baseUrl: "/textbooks/chinese/g6a" }],
  },
  english: {
    3: [{ id: "g3a", label: "英语 · 三年级上册", baseUrl: "/textbooks/english/g3a" }],
    4: [
      { id: "g4a", label: "英语 · 四年级上册", baseUrl: "/textbooks/english/g4a" },
      { id: "g4b", label: "英语 · 四年级下册", baseUrl: "/textbooks/english/g4b" },
    ],
    5: [
      { id: "g5a", label: "英语 · 五年级上册", baseUrl: "/textbooks/english/g5a" },
      { id: "g5b", label: "英语 · 五年级下册", baseUrl: "/textbooks/english/g5b" },
    ],
    6: [{ id: "g6a", label: "英语 · 六年级上册", baseUrl: "/textbooks/english/g6a" }],
  },
};

/** 取某学科某年级可用的教材 */
export function textbooksFor(subject: string, grade: number): TextbookItem[] {
  return TEXTBOOKS[subject]?.[grade] ?? [];
}