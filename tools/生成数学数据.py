# -*- coding: utf-8 -*-
"""生成数学知识图谱与题库(角色 B 数据补齐,对齐 OpenAPI 契约与 SubjectMathData 校验规则)。

生成内容:
- data/knowledge_graph/math/math_g3..6.json:32 个知识点(3-6 年级,含前置依赖)
- data/question_bank/math/math_q_g3_*.json:42 诊断题 + 20 巩固题(_p) + 10 复习题(_r)
满足 tests/subject_math/test_subject_math.py 全部断言。

用法: python tools/gen_math_data.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KG_DIR = ROOT / "data" / "knowledge_graph" / "math"
QB_DIR = ROOT / "data" / "question_bank" / "math"

# ---------- 知识点:32 个,3-6 年级各 8 个 ----------
# (id, 年级, 名称, 难度, 前置依赖, 常见误区)
KPS = [
    # g3
    ("math_g3_addition_within_10000", 3, "万以内加法", 2, [], ["进位时忘记加 1", "数位没对齐"]),
    ("math_g3_subtraction_within_10000", 3, "万以内减法", 2, ["math_g3_addition_within_10000"], ["退位后忘记减 1"]),
    ("math_g3_multi_digit_times_one_digit", 3, "多位数乘一位数", 3, ["math_g3_multiples"], ["忘记进位", "末尾 0 漏乘"]),
    ("math_g3_multiples", 3, "倍的认识", 2, ["math_g3_addition_within_10000"], ["把\"几倍\"当成\"多几\""]),
    ("math_g3_word_problem_modeling", 3, "应用题建模", 3, ["math_g3_multi_digit_times_one_digit", "math_g3_addition_within_10000"], ["列式时数量关系搞反"]),
    ("math_g3_division_meaning", 3, "除法含义", 2, ["math_g3_multiples"], ["分不清平均分与包含除"]),
    ("math_g3_remainder_division", 3, "有余数除法", 3, ["math_g3_division_meaning"], ["余数比除数大"]),
    ("math_g3_fraction_initial", 3, "分数的初步认识", 3, ["math_g3_division_meaning"], ["把分母相加", "不能理解平均分"]),
    # g4
    ("math_g4_large_numbers", 4, "大数的认识", 2, ["math_g3_addition_within_10000"], ["亿级与万级混淆"]),
    ("math_g4_three_digit_times_two_digit", 4, "三位数乘两位数", 3, ["math_g3_multi_digit_times_one_digit"], ["第二个乘数十位乘出的积对错位"]),
    ("math_g4_division_by_two_digit", 4, "除数是两位数的除法", 3, ["math_g3_remainder_division"], ["试商偏差大"]),
    ("math_g4_fraction_basic", 4, "分数的意义与比较", 3, ["math_g3_fraction_initial"], ["比较大小只看分子"]),
    ("math_g4_fraction_compare", 4, "同分母分数加减", 3, ["math_g4_fraction_basic"], ["分子相加减后分母也加减"]),
    ("math_g4_decimal_initial", 4, "小数的意义与性质", 2, ["math_g4_fraction_basic"], ["小数末尾 0 的意义不清"]),
    ("math_g4_decimal_add_sub", 4, "小数加减法", 3, ["math_g4_decimal_initial"], ["小数点没对齐"]),
    ("math_g4_rectangle_area", 4, "长方形正方形面积", 3, ["math_g3_multi_digit_times_one_digit"], ["面积公式与周长公式混淆"]),
    # g5
    ("math_g5_decimal_multiply", 5, "小数乘法", 3, ["math_g4_decimal_initial", "math_g4_three_digit_times_two_digit"], ["积的小数位数数错"]),
    ("math_g5_decimal_divide", 5, "小数除法", 3, ["math_g5_decimal_multiply"], ["商的小数点位置错误"]),
    ("math_g5_equation_simple", 5, "简易方程", 3, ["math_g5_decimal_multiply"], ["移项不变号"]),
    ("math_g5_polygon_area", 5, "多边形面积", 3, ["math_g4_rectangle_area"], ["三角形面积忘记除以 2"]),
    ("math_g5_fraction_add_sub", 5, "分数加减法(异分母)", 3, ["math_g4_fraction_compare"], ["通分后分子漏乘"]),
    ("math_g5_prime_composite", 5, "因数与倍数", 2, ["math_g3_division_meaning"], ["质数与奇数混淆"]),
    ("math_g5_volume_cuboid", 5, "长方体正方体体积", 3, ["math_g5_polygon_area"], ["体积单位与面积单位混淆"]),
    ("math_g5_position_coordinates", 5, "位置与数对", 2, [], ["行与列顺序颠倒"]),
    # g6
    ("math_g6_fraction_multiply", 6, "分数乘法", 3, ["math_g5_fraction_add_sub"], ["约分时机不当"]),
    ("math_g6_fraction_divide", 6, "分数除法", 3, ["math_g6_fraction_multiply"], ["除以分数忘乘倒数"]),
    ("math_g6_ratio", 6, "比的认识", 3, ["math_g6_fraction_divide"], ["比与除法关系不清"]),
    ("math_g6_percent", 6, "百分数", 3, ["math_g6_ratio"], ["百分数大小比较出错"]),
    ("math_g6_circle", 6, "圆的认识与面积", 3, ["math_g5_polygon_area"], ["圆周率取值混乱"]),
    ("math_g6_negative_number", 6, "负数", 2, [], ["负数大小比较出错"]),
    ("math_g6_cylinder_cone", 6, "圆柱与圆锥", 4, ["math_g6_circle"], ["圆锥体积忘记乘 1/3"]),
    ("math_g6_proportion", 6, "比例", 3, ["math_g6_ratio"], ["正反比例判断混淆"]),
]

# ---------- 诊断题:每知识点 1 题 + 重点知识点第 2 题,共 42 题 ----------
# (知识点id, 题型, 题干, 选项(单选题)或None, 答案, 难度, 错因, 讲解)
EXTRA_TOPICS = {
    "math_g3_fraction_initial", "math_g4_fraction_basic", "math_g4_decimal_initial",
    "math_g4_rectangle_area", "math_g5_decimal_divide", "math_g5_equation_simple",
    "math_g5_fraction_add_sub", "math_g6_fraction_multiply", "math_g6_percent", "math_g6_circle",
}
# 重点知识点第 2 题定义
EXTRA_QUESTIONS = {
    "math_g3_fraction_initial": ("fill_blank", "把一个月饼平均分成 8 块,吃了 3 块,吃了这个月饼的______。", None, "3/8", 2, "careless", "分子表示取了几份,分母表示总份数,不要写反。"),
    "math_g4_fraction_basic": ("single_choice", "下面哪组分数中,\u201c2/5\u201d表示的意义正确?", ["2 份中的 5 份", "5 份中的 2 份", "2 个 5 相加", "5 个 2 相乘"], "5 份中的 2 份", 2, "concept_missing", "分数表示把整体平均分成若干份,取其中的几份。"),
    "math_g4_decimal_initial": ("single_choice", "0.6 与 0.60 相比,下面说法正确的是?", ["大小相等,意义不同", "大小不等", "意义相同", "0.60 更大"], "大小相等,意义不同", 2, "concept_missing", "小数的末尾添 0 或去 0,大小不变,但计数单位不同。"),
    "math_g4_rectangle_area": ("single_choice", "一块长方形菜地长 15 米、宽 8 米,面积是多少?", ["46 平方米", "120 平方米", "23 平方米", "240 平方米"], "120 平方米", 2, "unit_error", "面积 = 长 × 宽,不要与周长(长+宽)×2 混淆。"),
    "math_g5_decimal_divide": ("single_choice", "7.5 ÷ 0.5 = ?", ["1.5", "15", "150", "0.15"], "15", 3, "calculation_error", "除数是小数时,先移动小数点把除数变成整数。"),
    "math_g5_equation_simple": ("fill_blank", "解方程:x + 4.5 = 9.3, x = ______。", None, "4.8", 3, "calculation_error", "等式两边同时减去 4.5。"),
    "math_g5_fraction_add_sub": ("single_choice", "1/2 + 1/4 = ?", ["2/6", "3/4", "2/4", "1/6"], "3/4", 3, "calculation_error", "先通分:1/2 = 2/4,再相加得 3/4。"),
    "math_g6_fraction_multiply": ("single_choice", "3/4 × 2/3 = ?", ["6/7", "1/2", "9/8", "1"], "1/2", 3, "careless", "分子乘分子、分母乘分母,能约分先约分。"),
    "math_g6_percent": ("single_choice", "把 3/5 化成百分数是?", ["60%", "35%", "65%", "0.6%"], "60%", 2, "unit_error", "3/5 = 0.6 = 60%。"),
    "math_g6_circle": ("fill_blank", "一个圆的半径是 3 厘米,它的面积是______平方厘米。(π取3.14)", None, "28.26", 3, "calculation_error", "圆面积 = πr² = 3.14 × 9。"),
}

# (知识点id, 题型, 题干, 选项, 答案, 难度, 错因, 讲解) —— 与 KPS 顺序对应,每知识点 1 题
BASE_QUESTIONS = [
    # g3 诊断题 1-8
    ("math_g3_addition_within_10000", "fill_blank", "367 + 489 = ______。", None, "856", 2, "calculation_error", "相同数位对齐,从个位加起,满十进一。"),
    ("math_g3_subtraction_within_10000", "fill_blank", "803 - 456 = ______。", None, "347", 2, "calculation_error", "退位减法:个位 3 不够减,向十位借一。"),
    ("math_g3_multi_digit_times_one_digit", "single_choice", "305 × 4 = ?", ["1200", "1220", "1250", "1500"], "1220", 3, "careless", "末尾 0 也要参与进位,3×4=12 后面补两个 0。"),
    ("math_g3_multiples", "single_choice", "小红有 8 支铅笔,小明的铅笔数是小红的 3 倍,小明有几支?", ["11 支", "24 支", "5 支", "16 支"], "24 支", 2, "concept_missing", "\u201c几倍\u201d用乘法:8×3=24。"),
    ("math_g3_word_problem_modeling", "fill_blank", "果园里摘了 46 个苹果,每 2 个装一袋,可以装______袋。", None, "23", 3, "modeling_error", "平均分用除法:46÷2=23。"),
    ("math_g3_division_meaning", "single_choice", "12 个桃子平均分给 3 只小猴,每只分几个?", ["4 个", "3 个", "9 个", "15 个"], "4 个", 2, "modeling_error", "平均分用除法:12÷3=4。"),
    ("math_g3_remainder_division", "fill_blank", "20 ÷ 6 = ______余______。", None, "3余2", 3, "calculation_error", "6×3=18,20-18=2,余数 2 小于除数 6。"),
    ("math_g3_fraction_initial", "single_choice", "把一个西瓜平均切成 4 份,吃了 1 份,吃了这个西瓜的几分之几?", ["1/4", "1/3", "4/1", "3/4"], "1/4", 2, "concept_missing", "分母表示平均分的总份数,分子表示取的份数。"),
    # g4 诊断题 9-16
    ("math_g4_large_numbers", "single_choice", "读作\u201c三十万零五百\u201d的数是?", ["30500", "300500", "305000", "3000500"], "300500", 3, "careless", "每级末尾的 0 不读,其他位置的 0 要读。"),
    ("math_g4_three_digit_times_two_digit", "single_choice", "125 × 32 = ?", ["4000", "3750", "4050", "3500"], "4000", 3, "calculation_error", "第二个乘数十位上的 3 与 125 相乘,结果要对准十位。"),
    ("math_g4_division_by_two_digit", "fill_blank", "840 ÷ 28 = ______。", None, "30", 3, "calculation_error", "28×30=840,商是 30。"),
    ("math_g4_fraction_basic", "single_choice", "下面哪个分数比 1/2 大?", ["1/3", "2/5", "3/5", "2/4"], "3/5", 2, "concept_missing", "同分母分数分子大就大;异分母可化成同分母比较。"),
    ("math_g4_fraction_compare", "single_choice", "3/8 + 2/8 = ?", ["5/8", "5/16", "6/8", "5/64"], "5/8", 3, "calculation_error", "同分母分数相加,分母不变,分子相加。"),
    ("math_g4_decimal_initial", "single_choice", "0.8 里面有几个 0.1?", ["8 个", "80 个", "0.8 个", "10 个"], "8 个", 2, "concept_missing", "0.8 表示 8 个十分之一。"),
    ("math_g4_decimal_add_sub", "single_choice", "3.6 + 2.45 = ?", ["6.05", "5.85", "6.01", "5.81"], "6.05", 3, "calculation_error", "小数点对齐:3.60 + 2.45 = 6.05。"),
    ("math_g4_rectangle_area", "single_choice", "边长 9 米的正方形花坛,面积是?", ["36 平方米", "81 平方米", "18 平方米", "72 平方米"], "81 平方米", 2, "unit_error", "正方形面积 = 边长 × 边长 = 9×9。"),
    # g5 诊断题 17-24
    ("math_g5_decimal_multiply", "single_choice", "0.25 × 0.4 = ?", ["0.1", "0.01", "1", "0.100"], "0.1", 3, "calculation_error", "25×4=100,积有 3 位小数:0.100=0.1。"),
    ("math_g5_decimal_divide", "single_choice", "4.8 ÷ 0.6 = ?", ["0.8", "8", "80", "0.08"], "8", 3, "calculation_error", "除数变整数:4.8÷0.6=48÷6=8。"),
    ("math_g5_equation_simple", "single_choice", "3x = 15, x = ?", ["5", "45", "12", "18"], "5", 3, "calculation_error", "等式两边同时除以 3。"),
    ("math_g5_polygon_area", "single_choice", "三角形底 10 厘米、高 6 厘米,面积是?", ["60 平方厘米", "30 平方厘米", "16 平方厘米", "120 平方厘米"], "30 平方厘米", 3, "calculation_error", "三角形面积 = 底×高÷2 = 60÷2。"),
    ("math_g5_fraction_add_sub", "single_choice", "1/3 + 1/6 = ?", ["2/9", "1/2", "2/6", "1/9"], "1/2", 3, "calculation_error", "通分:1/3=2/6,2/6+1/6=3/6=1/2。"),
    ("math_g5_prime_composite", "single_choice", "下面哪个数是质数?", ["15", "21", "23", "27"], "23", 2, "concept_missing", "质数只有 1 和它本身两个因数。"),
    ("math_g5_volume_cuboid", "single_choice", "长方体长 5 分米、宽 4 分米、高 3 分米,体积是?", ["60 立方分米", "47 立方分米", "20 立方分米", "120 立方分米"], "60 立方分米", 3, "unit_error", "体积 = 长×宽×高 = 5×4×3。"),
    ("math_g5_position_coordinates", "single_choice", "数对 (3, 5) 表示第 3 列第 5 行,那 (5, 3) 表示?", ["第 5 列第 3 行", "第 3 列第 5 行", "第 8 列第 8 行", "位置相同"], "第 5 列第 3 行", 2, "concept_missing", "数对中第一个数表示列,第二个数表示行,顺序不能颠倒。"),
    # g6 诊断题 25-32
    ("math_g6_fraction_multiply", "single_choice", "2/5 × 15 = ?", ["6", "30/5", "6/5", "10"], "6", 3, "calculation_error", "整数与分数相乘:2×15÷5=6。"),
    ("math_g6_fraction_divide", "single_choice", "6 ÷ 2/3 = ?", ["4", "9", "12", "18/3"], "9", 3, "concept_missing", "除以一个分数等于乘它的倒数:6×3/2=9。"),
    ("math_g6_ratio", "single_choice", "化简比 12 : 16 = ?", ["3 : 4", "4 : 3", "6 : 8", "2 : 3"], "3 : 4", 2, "calculation_error", "同时除以最大公因数 4。"),
    ("math_g6_percent", "single_choice", "一件衣服原价 200 元,打八折出售,现价多少?", ["160 元", "180 元", "40 元", "120 元"], "160 元", 2, "modeling_error", "八折 = 80%,200×80%=160。"),
    ("math_g6_circle", "single_choice", "圆的直径是 10 厘米,它的周长是?(π取3.14)", ["31.4 厘米", "78.5 厘米", "314 厘米", "15.7 厘米"], "31.4 厘米", 3, "calculation_error", "周长 = πd = 3.14×10。"),
    ("math_g6_negative_number", "single_choice", "下面哪个数最大?", ["-5", "-2", "0", "-8"], "0", 2, "concept_missing", "负数都小于 0,正数大于 0。"),
    ("math_g6_cylinder_cone", "single_choice", "圆锥底面积 12 平方厘米、高 9 厘米,体积是?", ["36 立方厘米", "108 立方厘米", "54 立方厘米", "27 立方厘米"], "36 立方厘米", 4, "calculation_error", "圆锥体积 = 底面积×高÷3 = 12×9÷3。"),
    ("math_g6_proportion", "single_choice", "速度一定,路程与时间成什么比例?", ["正比例", "反比例", "不成比例", "无法判断"], "正比例", 3, "concept_missing", "路程÷时间=速度(一定),商一定成正比例。"),
]

CONCEPT_NAMES = {kp[0]: kp[2] for kp in KPS}
KP_IDS = [kp[0] for kp in KPS]


def build_knowledge_graph() -> None:
    KG_DIR.mkdir(parents=True, exist_ok=True)
    for grade in (3, 4, 5, 6):
        nodes = []
        for kid, g, name, diff, pre, mis in KPS:
            if g != grade:
                continue
            nodes.append(
                {
                    "id": kid,
                    "subject": "math",
                    "grade": g,
                    "name": name,
                    "difficulty": diff,
                    "prerequisites": pre,
                    "common_misconceptions": mis,
                }
            )
        (KG_DIR / f"math_g{grade}.json").write_text(
            json.dumps(nodes, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"知识图谱:32 个知识点写入 math_g3..6.json")


def _q(qid: str, kp: str, qtype: str, stem: str, options, answer: str, diff: int, err: str, explanation: str) -> dict:
    return {
        "id": qid,
        "subject": "math",
        "grade": int(kp.split("_")[1][1:]),
        "type": qtype,
        "knowledge_point_ids": [kp],
        "stem": stem,
        "options": options,
        "answer": answer,
        "rubric": f"考察知识点:{CONCEPT_NAMES[kp]}",
        "explanation": explanation,
        "error_type": err,
        "difficulty": diff,
    }


def build_question_bank() -> None:
    QB_DIR.mkdir(parents=True, exist_ok=True)
    diag: list[dict] = []
    seq = 0
    for kp in KP_IDS:
        seq += 1
        _, qtype, stem, opts, ans, diff, err, expl = BASE_QUESTIONS[seq - 1]
        grade = int(kp.split("_")[1][1:])
        diag.append(_q(f"math_q_g{grade}_{seq:04d}", kp, qtype, stem, opts, ans, diff, err, expl))
    # 重点知识点第 2 题
    for kp in EXTRA_TOPICS:
        qtype, stem, opts, ans, diff, err, expl = EXTRA_QUESTIONS[kp]
        grade = int(kp.split("_")[1][1:])
        seq += 1
        diag.append(_q(f"math_q_g{grade}_{seq:04d}", kp, qtype, stem, opts, ans, diff, err, expl))
    assert len(diag) == 42, f"诊断题应为 42 道,实际 {len(diag)}"

    # 巩固题:取 20 道加 _p
    practice = []
    for i, q in enumerate(diag[:20]):
        nq = dict(q)
        nq["id"] = q["id"] + "_p"
        practice.append(nq)
    # 复习题:取 10 道薄弱知识点(分数/小数/方程/圆等)加 _r
    review_kp = [
        "math_g4_fraction_basic", "math_g4_fraction_compare", "math_g4_decimal_add_sub",
        "math_g5_decimal_divide", "math_g5_equation_simple", "math_g5_fraction_add_sub",
        "math_g6_fraction_multiply", "math_g6_fraction_divide", "math_g6_percent", "math_g6_circle",
    ]
    review = []
    for kp in review_kp:
        src = next(q for q in diag if q["knowledge_point_ids"] == [kp])
        nq = dict(src)
        nq["id"] = src["id"] + "_r"
        review.append(nq)
    assert len(review) == 10, f"复习题应为 10 道,实际 {len(review)}"

    all_q = diag + practice + review
    # 按年级分组,每文件一个数组(SubjectMathData.loader 契约:json 顶层为列表)
    for grade in (3, 4, 5, 6):
        group = [q for q in all_q if q["grade"] == grade]
        (QB_DIR / f"math_q_g{grade}.json").write_text(
            json.dumps(group, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"题库:{len(diag)} 诊断 + {len(practice)} 巩固 + {len(review)} 复习 = {len(all_q)} 题,按年级写入 math_q_g3..6.json")


if __name__ == "__main__":
    build_knowledge_graph()
    build_question_bank()