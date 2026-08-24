"""口算题生成器：按年级难度生成 fill_blank 口算题。

年级难度：
- 3年级：百以内加减、表内乘除
- 4年级：两位数乘两位数、三位数÷两位数、多位数加减
- 5年级：小数加减乘、整数四则混合
- 6年级：分数加减（同分母/异分母）、小数乘除、百分数
"""

import random
import uuid


def _q(grade: int, stem: str, answer: str) -> dict:
    return {
        "id": f"oral_{uuid.uuid4().hex[:8]}",
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


def generate_mental_math(grade: int, count: int = 75, seed: int | None = None) -> list[dict]:
    rng = random.Random(seed if seed is not None else grade * 1000 + count)
    items: list[dict] = []
    while len(items) < count:
        items.append(_make_one(grade, rng))
    return items


def _make_one(grade: int, rng: random.Random) -> dict:
    if grade == 3:
        kind = rng.choice(["a", "m", "d"])
        if kind == "a":  # 百以内加减
            b = rng.randint(2, 99)
            a = rng.randint(b, 99)
            op = rng.choice(["+", "-"])
            ans = a + b if op == "+" else a - b
            return _q(3, f"{a} {op} {b} = ____。", str(ans))
        if kind == "m":  # 表内乘法
            a, b = rng.randint(2, 9), rng.randint(2, 9)
            return _q(3, f"{a} × {b} = ____。", str(a * b))
        # 表内除法
        b = rng.randint(2, 9)
        ans = rng.randint(2, 9)
        return _q(3, f"{b * ans} ÷ {b} = ____。", str(ans))

    if grade == 4:
        kind = rng.choice(["mul", "div", "add"])
        if kind == "mul":  # 两位数乘两位数
            a, b = rng.randint(12, 99), rng.randint(12, 99)
            return _q(4, f"{a} × {b} = ____。", str(a * b))
        if kind == "div":  # 三位数÷两位数（整除）
            b = rng.randint(12, 49)
            ans = rng.randint(3, 20)
            return _q(4, f"{b * ans} ÷ {b} = ____。", str(ans))
        # 多位数加减
        a, b = rng.randint(1000, 9999), rng.randint(1000, 9999)
        return _q(4, f"{a} + {b} = ____。", str(a + b))

    if grade == 5:
        kind = rng.choice(["dec", "mul", "mix"])
        if kind == "dec":  # 小数加减
            a = rng.randint(10, 999) / 10
            b = rng.randint(10, 999) / 10
            op = rng.choice(["+", "-"])
            ans = round(a + b, 1) if op == "+" else round(a - b, 1)
            return _q(5, f"{a} {op} {b} = ____。", str(ans))
        if kind == "mul":  # 整数四则
            a, b = rng.randint(12, 99), rng.randint(3, 19)
            return _q(5, f"{a} × {b} = ____。", str(a * b))
        # 小数乘整数
        a = rng.randint(10, 999) / 10
        b = rng.randint(2, 9)
        ans = round(a * b, 1)
        return _q(5, f"{a} × {b} = ____。", str(ans))

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
        return _q(6, f"{a}/{den} + {b}/{den} = ____。", f"{num}/{_den}")
    if kind == "muldec":  # 小数乘除整数
        a = rng.randint(10, 999) / 10
        b = rng.randint(2, 9)
        ans = round(a / b, 2)
        return _q(6, f"{a} ÷ {b} = ____。", str(ans))
    # 百分数→小数
    p = rng.randint(10, 95)
    return _q(6, f"{p}% = ____（填小数）。", str(p / 100))
