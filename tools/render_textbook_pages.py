"""渲染教材 PDF 为前端可访问的页图片（JPEG）+ pages.json

用法:
  python render_textbook_pages.py <subject> <grade> <semester> <pdf路径>
示例:
  python render_textbook_pages.py math 4 a data/textbooks/math/义务教育教科书·数学四年级上册.pdf

输出: apps/web/public/textbooks/{subject}/g{grade}{semester}/pNNN.jpg + pages.json
"""
import json
import os
import sys

import pymupdf

OUT_BASE = os.path.join(os.path.dirname(__file__), "..", "apps", "web", "public", "textbooks")


def main() -> None:
    subject, grade, semester, pdf_path = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    out_dir = os.path.join(OUT_BASE, subject, f"g{grade}{semester}")
    os.makedirs(out_dir, exist_ok=True)

    doc = pymupdf.open(pdf_path)
    total = len(doc)
    width = doc[0].rect.width
    scale = 1100 / width  # 渲染宽度 ~1100px，控制体积
    for i in range(total):
        pix = doc[i].get_pixmap(matrix=pymupdf.Matrix(scale, scale), colorspace=pymupdf.csRGB)
        out = os.path.join(out_dir, f"p{i + 1:03d}.jpg")
        pix.save(out, jpg_quality=72)
        if (i + 1) % 20 == 0:
            print(f"  rendered {i + 1}/{total}")
    with open(os.path.join(out_dir, "pages.json"), "w", encoding="utf-8") as f:
        json.dump({"book": os.path.basename(pdf_path), "total_pages": total}, f, ensure_ascii=False, indent=2)
    print(f"done: {total} pages -> {out_dir}")


if __name__ == "__main__":
    main()
