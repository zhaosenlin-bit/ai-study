/**
 * 教材清单配置：列出已克隆渲染到 apps/web/public/textbooks/ 的教材
 * （由 tools/render_textbook_pages.py 生成页图片 + pages.json）。
 * 课堂教材区下拉从这里取选项；未列出的学科/年级自动降级（不显示教材）。
 */

export interface TextbookItem {
  id: string;
  label: string;
  /** 页图片目录，约定 /textbooks/{subject}/g{grade}{semester}/pNNN.jpg */
  baseUrl: string;
}

export const TEXTBOOKS: Record<string, Record<number, TextbookItem[]>> = {
  math: {
    4: [{ id: "g4a", label: "数学 · 四年级上册", baseUrl: "/textbooks/math/g4a" }],
    5: [
      { id: "g5a", label: "数学 · 五年级上册", baseUrl: "/textbooks/math/g5a" },
      { id: "g5b", label: "数学 · 五年级下册", baseUrl: "/textbooks/math/g5b" },
    ],
  },
  chinese: {
    5: [
      { id: "g5a", label: "语文 · 五年级上册", baseUrl: "/textbooks/chinese/g5a" },
      { id: "g5b", label: "语文 · 五年级下册", baseUrl: "/textbooks/chinese/g5b" },
    ],
  },
  english: {
    5: [
      { id: "g5a", label: "英语 · 五年级上册", baseUrl: "/textbooks/english/g5a" },
      { id: "g5b", label: "英语 · 五年级下册", baseUrl: "/textbooks/english/g5b" },
    ],
  },
};

/** 取某学科某年级可用的教材（克隆渲染好的） */
export function textbooksFor(subject: string, grade: number): TextbookItem[] {
  return TEXTBOOKS[subject]?.[grade] ?? [];
}
