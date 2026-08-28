"""口算题生成器：按年级难度生成 fill_blank 口算题。

年级难度：
- 3年级：百以内加减、表内乘除
- 4年级：两位数乘两位数、三位数÷两位数、多位数加减
- 5年级：小数加减乘、整数四则混合
- 6年级：分数加减（同分母/异分母）、小数乘除、百分数
"""

import random
import uuid


def _q(grade: int, stem: str, answer: str, index: int = 0) -> dict:
    return {
        "id": f"oral_g{grade}_{index}",
        "subject": "math",
        "grade": grade,
        "type": "fill_blank",
        "knowledge_point_ids": [f"math_g{grade}_mental_math"],
        "stem": stem,
        "options": None,
        "answer": answer,
        "rubric": answer,
        "explanation": f"口算结果：{answer}",
        "error_type": "计算失误",
        "difficulty": 1,
    }


def generate_mental_math_all(grade: int, total: int = 900, seed: int | None = None) -> list[dict]:
    """一次性生成 total 道口算，全局去重（跨课程也不重复）。"""
    rng = random.Random(seed if seed is not None else grade * 1000)
    items: list[dict] = []
    seen: set[str] = set()
    guard = 0
    while len(items) < total and guard < total * 80:
        guard += 1
        q = _make_one(grade, rng, index=len(items))
        key = (q["stem"], q["answer"])
        if key in seen:
            continue
        seen.add(key)
        items.append(q)
    return items


# ---------- 经典应用题生成（数学，single_choice） ----------

def _app_q(grade: int, stem: str, answer: float, options: list[str], index: int = 0) -> dict:
    """answer 是正确数值，options 是含正确项的 4 选项（字符 A/B/C/D 命中）。"""
    right = str(answer)
    letters = ["A", "B", "C", "D"]
    # 确保正确项在选项里
    final_opts = list(options[:3])
    right_letter = ""
    if right not in final_opts:
        final_opts.append(right)
    else:
        # 正确项已在选项中，补足 4 个
        while len(final_opts) < 4:
            final_opts.append(str(answer + len(final_opts) + 1))
    right_letter = letters[final_opts.index(right)]
    return {
        "id": f"appq_g{grade}_{index}",
        "subject": "math",
        "grade": grade,
        "type": "single_choice",
        "knowledge_point_ids": [f"math_g{grade}_word_problem"],
        "stem": stem,
        "options": final_opts,
        "answer": right_letter,
        "rubric": f"{right}",
        "explanation": f"正确答案：{right}",
        "error_type": "概念混淆",
        "difficulty": 2,
    }


def _distractors(rng: random.Random, right: float) -> list[str]:
    cands: set[str] = set()
    while len(cands) < 3:
        delta = rng.choice([-2, -1, 1, 2, 10, 0.5, 5])
        v = round(right + delta, 2)
        if v != right and v > 0:
            cands.add(str(v))
    return list(cands)


def _make_app_one(grade: int, rng: random.Random, index: int = 0) -> dict:
    kind = rng.choice(["buy", "trip", "share", "area"])
    if kind == "buy":  # 购物总价
        price = rng.randint(2, 50)
        n = rng.randint(2, 12)
        total = price * n
        return _app_q(grade, f"小明买了 {n} 个笔记本，每个 {price} 元，一共要付多少元？", total, _distractors(rng, total), index)
    if kind == "trip":  # 行程
        speed = rng.randint(30, 120)
        hours = rng.choice([2, 3, 4, 5])
        dist = speed * hours
        return _app_q(grade, f"一辆汽车每小时行驶 {speed} 千米，行驶 {hours} 小时，共行驶多少千米？", dist, _distractors(rng, dist), index)
    if kind == "share":  # 平均分配
        total = rng.randint(24, 120)
        n = rng.choice([3, 4, 6, 8])
        per = total // n
        if per <= 0:
            return _make_app_one(grade, rng)
        return _app_q(grade, f"把 {total} 个苹果平均分给 {n} 个小朋友，每人分到几个？", per, _distractors(rng, per), index)
    # 面积（长方形）
    w = rng.randint(3, 20)
    h = rng.randint(3, 20)
    area = w * h
    return _app_q(grade, f"一块长方形菜地长 {w} 米，宽 {h} 米，面积是多少平方米？", area, _distractors(rng, area), index)


def generate_app_questions_all(grade: int, total: int = 84, seed: int | None = None) -> list[dict]:
    """一次性生成 total 道应用题，全局去重（跨课程也不重复）。"""
    rng = random.Random(seed if seed is not None else grade * 777)
    items: list[dict] = []
    seen: set[str] = set()
    guard = 0
    while len(items) < total and guard < total * 80:
        guard += 1
        q = _make_app_one(grade, rng)
        key = (q["stem"], q["rubric"])
        if key in seen:
            continue
        seen.add(key)
        items.append(q)
    return items


def _make_one(grade: int, rng: random.Random, index: int = 0) -> dict:
    if grade == 3:
        kind = rng.choice(["a", "m", "d"])
        if kind == "a":  # 百以内加减
            b = rng.randint(2, 99)
            a = rng.randint(b, 99)
            op = rng.choice(["+", "-"])
            ans = a + b if op == "+" else a - b
            return _q(3, f"{a} {op} {b} = ____。", str(ans), index)
        if kind == "m":  # 表内乘法
            a, b = rng.randint(2, 9), rng.randint(2, 9)
            return _q(3, f"{a} × {b} = ____。", str(a * b), index)
        # 表内除法
        b = rng.randint(2, 9)
        ans = rng.randint(2, 9)
        return _q(3, f"{b * ans} ÷ {b} = ____。", str(ans), index)

    if grade == 4:
        kind = rng.choice(["mul", "div", "add"])
        if kind == "mul":  # 两位数乘两位数
            a, b = rng.randint(12, 99), rng.randint(12, 99)
            return _q(4, f"{a} × {b} = ____。", str(a * b), index)
        if kind == "div":  # 三位数÷两位数（整除）
            b = rng.randint(12, 49)
            ans = rng.randint(3, 20)
            return _q(4, f"{b * ans} ÷ {b} = ____。", str(ans), index)
        # 多位数加减
        a, b = rng.randint(1000, 9999), rng.randint(1000, 9999)
        return _q(4, f"{a} + {b} = ____。", str(a + b), index)

    if grade == 5:
        kind = rng.choice(["dec", "mul", "mix"])
        if kind == "dec":  # 小数加减
            a = rng.randint(10, 999) / 10
            b = rng.randint(10, 999) / 10
            op = rng.choice(["+", "-"])
            ans = round(a + b, 1) if op == "+" else round(a - b, 1)
            return _q(5, f"{a} {op} {b} = ____。", str(ans), index)
        if kind == "mul":  # 整数四则
            a, b = rng.randint(12, 99), rng.randint(3, 19)
            return _q(5, f"{a} × {b} = ____。", str(a * b), index)
        # 小数乘整数
        a = rng.randint(10, 999) / 10
        b = rng.randint(2, 9)
        ans = round(a * b, 1)
        return _q(5, f"{a} × {b} = ____。", str(ans), index)

    # 6年级：分数 + 小数乘除 + 百分数
    kind = rng.choice(["frac", "muldec", "pct"])
    if kind == "frac":  # 同分母分数加减
        den = rng.randint(3, 12)
        b = rng.randint(1, den - 1)
        a = rng.randint(1, den - 1)
        s = a + b
        if s >= den:  # 假分数也允许
            num, _den = s, den
        else:
            num, _den = s, den
        return _q(6, f"{a}/{den} + {b}/{den} = ____。", f"{num}/{_den}", index)
    if kind == "muldec":  # 小数乘除整数
        a = rng.randint(10, 999) / 10
        b = rng.randint(2, 9)
        ans = round(a / b, 2)
        return _q(6, f"{a} ÷ {b} = ____。", str(ans), index)
    # 百分数→小数
    p = rng.randint(10, 95)
    return _q(6, f"{p}% = ____（填小数）。", str(p / 100), index)