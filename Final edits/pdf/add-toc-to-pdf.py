#!/usr/bin/env python3
"""
add-toc-to-pdf.py — Insert a static single-page Table of Contents into the PDF
==================================================================================

Replaces the existing TOC page (page 3) in the PDF with a properly formatted
static TOC that includes actual page numbers from the rendered PDF.

Requirements:
    pip install pypdf reportlab

Usage:
    python3 add-toc-to-pdf.py
    python3 add-toc-to-pdf.py --input input.pdf --output output.pdf
"""

import argparse
import io
from pathlib import Path

from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from pypdf import PdfReader, PdfWriter


# Page size matching the book trim: 6.69" x 9.61"
PAGE_W = 6.69 * inch
PAGE_H = 9.61 * inch

# Margins (matching pod-print.css for a recto/odd page)
MARGIN_TOP = 0.80 * inch
MARGIN_BOTTOM = 0.80 * inch
MARGIN_LEFT = 0.80 * inch
MARGIN_RIGHT = 0.95 * inch  # gutter side for recto

# Usable area
TEXT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT
TEXT_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM

# ── TOC Data ─────────────────────────────────────────────────────────────
# Following nav order: 7 frontmatter, 4 part breaks, 16 chapters, 17 backmatter
# Page numbers mapped from the actual rendered PDF

TOC_ENTRIES = [
    # (indent_level, label, page_number, is_part_header)
    # ── Frontmatter ──
    ("section", "Frontmatter", None),
    (1, "Dedication", 4),
    (1, "Self-Assessment Worksheet", 6),
    (1, "Affirmation Odyssey Worksheet", 8),
    (1, "Preface", 10),

    # ── Part I ──
    ("section", "Part I: Foundations of Creative Hairstyling", 14),
    (2, "I      Unveiling Your Creative Odyssey", 15),
    (2, "II     Refining Your Creative Toolkit", 43),
    (2, "III    Reigniting Your Creative Fire", 65),

    # ── Part II ──
    ("section", "Part II: Building Your Professional Practice", 80),
    (2, "IV     The Art of Networking", 82),
    (2, "V      Cultivating Creative Excellence Through Mentorship", 108),
    (2, "VI     Mastering the Business of Hairstyling", 134),
    (2, "VII    Embracing Wellness and Self-Care", 161),
    (2, "VIII   Advancing Skills Through Continuous Education", 178),

    # ── Part III ──
    ("section", "Part III: Advanced Business Strategies", 213),
    (2, "IX     Stepping Into Leadership", 215),
    (2, "X      Crafting Enduring Legacies", 245),
    (2, "XI     Advanced Digital Strategies", 273),
    (2, "XII    Financial Wisdom", 302),
    (2, "XIII   Embracing Ethics and Sustainability", 332),

    # ── Part IV ──
    ("section", "Part IV: Future-Focused Growth", 369),
    (2, "XIV    The Impact of AI on the Beauty Industry", 371),
    (2, "XV     Cultivating Resilience and Well-Being", 403),
    (2, "XVI    Tresses and Textures", 428),

    # ── Backmatter ──
    ("section", "Backmatter", None),
    (1, "Conclusion", 452),
    (1, "Quiz Answer Key", 458),
    (1, "Self-Assessment Worksheet", 459),
    (1, "Closing Affirmations", 461),
    (1, "Continued Learning Commitment", 463),
    (1, "Acknowledgments", 464),
    (1, "About the Author", 466),
    (1, "Journaling Start", 469),
    (1, "Manifesting Journal", 471),
    (1, "Journal Page", 474),
    (1, "Professional Development Worksheet", 475),
    (1, "SMART Goals Worksheet", 477),
    (1, "Self-Care Journal", 479),
    (1, "Vision Journal", 482),
    (1, "Doodle Page", 485),
    (1, "Bibliography", 486),
]


def register_fonts(fonts_dir: Path):
    """Register book fonts if available, otherwise use built-in fonts."""
    try:
        pdfmetrics.registerFont(TTFont("Montserrat", str(fonts_dir / "Montserrat-Regular.woff2")))
        pdfmetrics.registerFont(TTFont("Montserrat-Bold", str(fonts_dir / "Montserrat-Bold.woff2")))
        return "Montserrat", "Montserrat-Bold"
    except Exception:
        # Fall back to Helvetica
        return "Helvetica", "Helvetica-Bold"


def draw_dot_leader(c, x_start, x_end, y, font_name, font_size):
    """Draw a dot leader line between x_start and x_end at height y."""
    dot = " ."
    dot_w = c.stringWidth(dot, font_name, font_size)
    gap = 3  # points gap from text/number
    x = x_start + gap
    x_limit = x_end - gap
    dots = ""
    while c.stringWidth(dots + dot, font_name, font_size) < (x_limit - x):
        dots += dot
    if dots:
        c.drawString(x, y, dots)


def build_toc_page() -> bytes:
    """Generate a single-page TOC as PDF bytes."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_W, PAGE_H))

    # Try to register fonts
    script_dir = Path(__file__).resolve().parent
    fonts_dir = script_dir.parent / "OEBPS" / "fonts"
    font_regular, font_bold = register_fonts(fonts_dir)

    # ── Title ──
    y = PAGE_H - MARGIN_TOP
    c.setFont(font_bold, 16)
    c.drawCentredString(PAGE_W / 2, y, "CONTENTS")
    y -= 6

    # ── Decorative line ──
    line_w = 1.5 * inch
    c.setStrokeColor(HexColor("#333333"))
    c.setLineWidth(0.5)
    c.line(PAGE_W / 2 - line_w / 2, y, PAGE_W / 2 + line_w / 2, y)
    y -= 14

    # ── Entries ──
    section_font_size = 8.5
    entry_font_size = 7.5
    chapter_font_size = 7.5
    line_spacing = 12.5  # points between lines
    section_spacing = 5  # extra space before section headers

    x_left = MARGIN_LEFT
    x_right = PAGE_W - MARGIN_RIGHT

    for entry in TOC_ENTRIES:
        if entry[0] == "section":
            # Section header (Part title or "Frontmatter"/"Backmatter")
            _, label, page_num = entry
            y -= section_spacing
            c.setFont(font_bold, section_font_size)
            c.drawString(x_left, y, label)
            if page_num is not None:
                page_str = str(page_num)
                c.drawRightString(x_right, y, page_str)
                text_end = x_left + c.stringWidth(label, font_bold, section_font_size)
                num_start = x_right - c.stringWidth(page_str, font_bold, section_font_size)
                c.setFont(font_regular, section_font_size - 1)
                draw_dot_leader(c, text_end, num_start, y, font_regular, section_font_size - 1)
            y -= line_spacing
        else:
            indent_level, label, page_num = entry
            indent = 12 if indent_level == 1 else 20  # points
            fs = chapter_font_size if indent_level == 2 else entry_font_size

            c.setFont(font_regular, fs)
            x = x_left + indent
            c.drawString(x, y, label)
            page_str = str(page_num)
            c.setFont(font_regular, fs)
            c.drawRightString(x_right, y, page_str)

            # Dot leader
            text_end = x + c.stringWidth(label, font_regular, fs)
            num_start = x_right - c.stringWidth(page_str, font_regular, fs)
            draw_dot_leader(c, text_end, num_start, y, font_regular, fs - 1)

            y -= line_spacing

    # ── Page number at bottom (iii for frontmatter) ──
    c.setFont(font_regular, 8)
    c.drawCentredString(PAGE_W / 2, MARGIN_BOTTOM - 14, "iii")

    c.save()
    return buf.getvalue()


def main():
    parser = argparse.ArgumentParser(description="Add static TOC page to PDF")
    parser.add_argument("--input", "-i", default=None, help="Input PDF path")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    default_pdf = script_dir.parent / "output" / "CurlsAndContemplation-ROYAL-BW-FINALv4.pdf"

    input_path = Path(args.input) if args.input else default_pdf
    output_path = Path(args.output) if args.output else default_pdf

    if not input_path.exists():
        print(f"ERROR: Input PDF not found: {input_path}")
        return

    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")

    # Read original PDF
    print("Reading original PDF...")
    reader = PdfReader(str(input_path))
    total_pages = len(reader.pages)
    print(f"  Original page count: {total_pages}")

    # Generate TOC page
    print("Generating TOC page...")
    toc_pdf_bytes = build_toc_page()
    toc_reader = PdfReader(io.BytesIO(toc_pdf_bytes))
    toc_page = toc_reader.pages[0]

    # Build new PDF: replace page 3 (index 2) with the new TOC page
    print("Replacing page 3 (TOC) with new static TOC...")
    writer = PdfWriter()
    for i in range(total_pages):
        if i == 2:  # page 3 (0-indexed)
            writer.add_page(toc_page)
        else:
            writer.add_page(reader.pages[i])

    # Write output
    print(f"Writing output PDF...")
    with open(str(output_path), "wb") as f:
        writer.write(f)

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"  Output size: {size_mb:.1f} MB")
    print(f"  Page count: {len(writer.pages)}")
    print("Done!")


if __name__ == "__main__":
    main()
