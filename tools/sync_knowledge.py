#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识库同步脚本（角色 E）
=========================
把 ai-study/data 下的知识库原始数据聚合为前端可加载的 public/knowledge/：

  1. data/knowledge_graph/  +  data/question_bank/  (3-6 年级)
     -> apps/web/public/knowledge/{subject}/g{grade}.json
  2. 从教材 PDF 目录页提取 1-2 年级知识点框架（语文统编版 / 数学北师大版）
     -> 同上结构（questions 为空，前端提示"教材章节导航"）
  3. 汇总清单 public/knowledge/index.json

重复运行安全（幂等），知识库更新后重新执行即可。
"""
import json
import os
import re
import sys

try:
    from pypdf import PdfReader
except ImportError:
    print("缺少 pypdf：pip install pypdf")
    sys.exit(1)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, "data")
PUB = os.path.join(REPO, "apps", "web", "public", "knowledge")
TEXTBOOKS = os.path.join(DATA, "textbooks")

SUBJECTS = ["chinese", "english", "math"]
GRADES = [1, 2, 3, 4, 5, 6]


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def as_list(data):
    """兼容：单对象 / 数组"""
    return data if isinstance(data, list) else [data]


def load_questions(subject):
    """读取题库目录，返回 [(grade, question), ...]"""
    d = os.path.join(DATA, "question_bank", subject)
    out = []
    if not os.path.isdir(d):
        return out
    for fname in sorted(os.listdir(d)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(d, fname)
        try:
            for q in as_list(load_json(path)):
                g = q.get("grade")
                if isinstance(g, int) and 1 <= g <= 6:
                    out.append((g, q))
        except Exception as e:
            print(f"  [warn] {path}: {e}")
    return out


def load_knowledge_points(subject):
    """读取知识图谱目录，返回 [(grade, kp), ...]"""
    d = os.path.join(DATA, "knowledge_graph", subject)
    out = []
    if not os.path.isdir(d):
        return out
    for fname in sorted(os.listdir(d)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(d, fname)
        try:
            for kp in as_list(load_json(path)):
                g = kp.get("grade")
                if isinstance(g, int) and 1 <= g <= 6:
                    out.append((g, kp))
        except Exception as e:
            print(f"  [warn] {path}: {e}")
    return out


# ---------- 教材 PDF 目录提取（1-2 年级） ----------

# 目录行：  "1 天地人 6"  /  "1 小蝌蚪找妈妈 .................1"  / "◎ 语文园地一 15"
LINE_RE = re.compile(r"^\s*[◎]?\s*(\d{1,2})?\s*([^.\d\s][\u4e00-\u9fffA-Za-z··（）()，,、：“”]{0,23}?)\s*[.·]*\s*(\d{1,3})\s*$")
GROUP_WORDS = ("识字", "汉语拼音", "课文", "口语交际", "语文园地", "快乐读书吧",
               "单元", "数与代数", "图形与几何", "统计与概率", "综合与实践", "总复习")
# 附录类行（识字表/写字表/词语表 等，不视为课目）
APPENDIX_WORDS = ("识字表", "写字表", "词语表", "生字表")


def extract_toc_textbook(pdf_path, grade, subject, max_pages=10):
    """从教材 PDF 前几页提取目录，返回知识点列表。
    启发式：页内先出现"目录"关键字，其后带页码的行视为条目。"""
    if not os.path.exists(pdf_path):
        print(f"  [skip] 教材缺失: {os.path.basename(pdf_path)}")
        return []
    reader = PdfReader(pdf_path)
    names, group = [], ""
    for page in reader.pages[:max_pages]:
        text = page.extract_text() or ""
        if "目录" in text[:60]:
            for raw in text.splitlines():
                line = raw.strip()
                if not line:
                    continue
                # 组标题（如"识字""汉语拼音"）
                if line in GROUP_WORDS or any(line.startswith(w) for w in GROUP_WORDS):
                    group = re.sub(r"\d+$", "", line).strip()
                    continue
                m = LINE_RE.match(line)
                if m and m.group(2) and m.group(3):
                    name = m.group(2).strip()
                    if (1 <= len(name) <= 24 and not name.isdigit()
                            and not any(name.startswith(w) for w in APPENDIX_WORDS)):
                        names.append(f"{group}·{name}" if group else name)
        if names:
            break
    # 去重保序，生成知识点
    seen, kps = set(), []
    for i, name in enumerate(names, 1):
        if name in seen:
            continue
        seen.add(name)
        kps.append({
            "id": f"{subject}_g{grade}_toc{i:02d}",
            "subject": subject,
            "grade": grade,
            "name": name,
            "difficulty": 1,
            "prerequisites": [],
            "common_misconceptions": [],
            "source": "textbook_toc",
        })
    return kps


# 语文统编版：一年级上/下、二年级上/下
CHINESE_G12_PDFS = {
    (1, 1): os.path.join(TEXTBOOKS, "chinese", "义务教育教科书·语文一年级上册.pdf"),
    (1, 2): os.path.join(TEXTBOOKS, "chinese", "义务教育教科书·语文一年级下册.pdf"),
    (2, 1): os.path.join(TEXTBOOKS, "chinese", "义务教育教科书·语文二年级上册.pdf"),
    (2, 2): os.path.join(TEXTBOOKS, "chinese", "义务教育教科书·语文二年级下册.pdf"),
}
# 数学北师大版：一年级上/下、二年级上/下
MATH_G12_PDFS = {
    (1, 1): os.path.join(TEXTBOOKS, "math", "义务教育教科书·数学一年级上册.pdf"),
    (1, 2): os.path.join(TEXTBOOKS, "math", "义务教育教科书·数学一年级下册.pdf"),
    (2, 1): os.path.join(TEXTBOOKS, "math", "义务教育教科书·数学二年级上册.pdf"),
    (2, 2): os.path.join(TEXTBOOKS, "math", "义务教育教科书·数学二年级下册.pdf"),
}


# 数学北师大版 1-2 年级为扫描版 PDF（无文本层），知识点框架按教材章节手写维护
MATH_G12_MANUAL = {
    (1, 1): [
        "生活中的数（1-10 的认识）", "比较（大小、多少、长短、高矮）", "加与减（一）（10 以内加减法）",
        "分类", "位置与顺序", "认识图形（立体图形）", "加与减（二）（20 以内进位加法）",
    ],
    (1, 2): [
        "加与减（三）（20 以内退位减法）", "观察物体", "生活中的数（100 以内数的认识）",
        "加与减（一）（整十数加减）", "加与减（二）（两位数加减）", "有趣的图形（平面图形）",
        "整理与复习", "数学好玩",
    ],
    (2, 1): [
        "加与减（100 以内笔算加减）", "购物（认识人民币）", "数一数与乘法（乘法的初步认识）",
        "图形的变化", "2-5 的乘法口诀", "测量（厘米和米）", "6-9 的乘法口诀", "乘法口诀表",
    ],
    (2, 2): [
        "除法（表内除法）", "方向与位置", "生活中的大数（万以内数的认识）",
        "测量（分米、毫米、千米）", "认识图形（角与四边形）", "时、分、秒",
        "调查与记录（数据收集整理）",
    ],
}


def manual_kps(subject, grade):
    kps = []
    for (g, sem), names in MATH_G12_MANUAL.items():
        if g != grade:
            continue
        for i, name in enumerate(names, 1):
            kps.append({
                "id": f"{subject}_g{grade}_unit{sem}_{i:02d}",
                "subject": subject,
                "grade": grade,
                "name": name,
                "difficulty": 1,
                "prerequisites": [],
                "common_misconceptions": [],
                "source": "textbook_framework",
            })
    return kps


def build():
    os.makedirs(PUB, exist_ok=True)
    summary = {}
    print("== 聚合知识库 ==")

    for subject in SUBJECTS:
        questions = load_questions(subject)
        kps = load_knowledge_points(subject)
        print(f"  {subject}: 题库 {len(questions)} 题 / 知识点 {len(kps)} 条")

        for grade in GRADES:
            g_questions = [q for g, q in questions if g == grade]
            g_kps = [kp for g, kp in kps if g == grade]

            # 1-2 年级：无 JSON 数据时从教材补充知识点框架
            if grade <= 2 and not g_kps:
                if subject == "chinese":
                    g_kps = extract_toc_textbook(CHINESE_G12_PDFS[(grade, 1)], grade, subject)
                    g_kps += extract_toc_textbook(CHINESE_G12_PDFS[(grade, 2)], grade, subject)
                    src = "教材 PDF 目录"
                elif subject == "math":
                    # 扫描版教材无文本层，使用手写章节框架
                    g_kps = manual_kps(subject, grade)
                    src = "北师大版教材章节框架"
                # english：PEP 为三年级起点，1-2 年级无教材，保持空
                if g_kps:
                    print(f"    g{grade}: 补充 {len(g_kps)} 个知识点（{src}）")

            payload = {
                "grade": grade,
                "subject": subject,
                "knowledge_points": g_kps,
                "questions": g_questions,
            }
            dest = os.path.join(PUB, subject, f"g{grade}.json")
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=1)
            summary.setdefault(subject, {})[str(grade)] = {
                "knowledge_points": len(g_kps),
                "questions": len(g_questions),
            }

    index = {"subjects": summary, "generated_at": __import__("datetime").date.today().isoformat()}
    with open(os.path.join(PUB, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)

    total_q = sum(v["questions"] for s in summary.values() for v in s.values())
    total_kp = sum(v["knowledge_points"] for s in summary.values() for v in s.values())
    print(f"\n== 完成: {total_q} 题 / {total_kp} 知识点 -> {PUB}")


if __name__ == "__main__":
    build()
