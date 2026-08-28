"""渲染教材 PDF 为前端可访问的页图片（JPEG）+ pages.json

用法:
  python 工具脚本/渲染教科书页.py <学科> <年级> <学期> <PDF路径>
示例:
  python 工具脚本/渲染教科书页.py math 4 a data/textbooks/数学四年级上册.pdf
  python 工具脚本/渲染教科书页.py chinese 5 b data/textbooks/语文五年级下册.pdf

输出: 应用/web/public/textbooks/{学科}/g{年级}{学期}/pNNN.jpg + pages.json
"""
import json
import os
import sys

# 确保可以导入 pymupdf
try:
    import pymupdf
except ImportError:
    print("请先安装 pymupdf: pip install pymupdf")
    sys.exit(1)


def get_output_base():
    """获取输出基础目录"""
    return os.path.join(os.path.dirname(__file__), "..", "应用", "web", "public", "textbooks")


def render_pdf(
    subject: str,
    grade: int,
    semester: str,
    pdf_path: str,
    scale: float = 1100.0,
    jpg_quality: int = 72,
) -> dict:
    """渲染 PDF 为图片

    Args:
        subject: 学科 (math/chinese/english)
        grade: 年级 (3-6)
        semester: 学期 (a=上册, b=下册)
        pdf_path: PDF 文件路径
        scale: 渲染宽度（像素）
        jpg_quality: JPEG 质量 (1-100)

    Returns:
        包含总页数和输出目录的信息
    """
    out_dir = os.path.join(
        get_output_base(), subject, f"g{grade}{semester}"
    )
    os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF 文件不存在: {pdf_path}")

    print(f"正在打开 PDF: {pdf_path}")
    doc = pymupdf.open(pdf_path)
    total = len(doc)

    # 获取第一页宽度用于计算缩放比例
    if total > 0:
        width = doc[0].rect.width
        scale_factor = scale / width if width > 0 else 1.0
    else:
        scale_factor = 1.0

    print(f"共 {total} 页，缩放比例: {scale_factor:.2f}")

    for i in range(total):
        # 渲染页面
        pix = doc[i].get_pixmap(
            matrix=pymupdf.Matrix(scale_factor, scale_factor),
            colorspace=pymupdf.csRGB,
        )

        # 输出文件
        out_file = os.path.join(out_dir, f"p{i + 1:03d}.jpg")
        pix.save(out_file, jpg_quality=jpg_quality)

        if (i + 1) % 20 == 0:
            print(f"  已渲染 {i + 1}/{total} 页")

    # 写入 pages.json
    pages_info = {
        "book": os.path.basename(pdf_path),
        "total_pages": total,
        "subject": subject,
        "grade": grade,
        "semester": "上册" if semester == "a" else "下册",
    }
    with open(
        os.path.join(out_dir, "pages.json"), "w", encoding="utf-8"
    ) as f:
        json.dump(pages_info, f, ensure_ascii=False, indent=2)

    print(f"完成！{total} 页 -> {out_dir}")
    return {"total_pages": total, "output_dir": out_dir}


def main() -> None:
    if len(sys.argv) < 5:
        print(__doc__)
        print("\n参数说明:")
        print("  <学科>    - math/chinese/english")
        print("  <年级>    - 3/4/5/6")
        print("  <学期>    - a(上册)/b(下册)")
        print("  <PDF路径> - PDF 文件完整路径")
        sys.exit(1)

    subject = sys.argv[1]
    grade = int(sys.argv[2])
    semester = sys.argv[3]
    pdf_path = sys.argv[4]

    # 验证参数
    if subject not in ("math", "chinese", "english"):
        print(f"错误: 学科必须是 math/chinese/english之一, 收到: {subject}")
        sys.exit(1)

    if grade not in (3, 4, 5, 6):
        print(f"错误: 年级必须是 3-6 之一, 收到: {grade}")
        sys.exit(1)

    if semester not in ("a", "b"):
        print(f"错误: 学期必须是 a/b 之一, 收到: {semester}")
        sys.exit(1)

    try:
        render_pdf(subject, grade, semester, pdf_path)
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()