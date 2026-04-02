#!/usr/bin/env python3
"""
fix-pod-pdf.py — Fix brushstroke, remove '?' symbols, add Roman numerals,
                 and stamp visible page numbers
===================================================================================

Fixes the following issues in CurlsAndContemplation-POD-FINAL (2).pdf:

1. BRUSHSTROKE: The embedded brushstroke.png is blank (all-zero pixels).
   Draws a proper teal brushstroke shape on all 18 chapter opener pages.

2. ROMAN NUMERALS: Draws white Roman numeral text centered on the
   teal brushstroke for each chapter title page (I–XVI) and a decorative
   star (✦) for Preface and Conclusion.

3. QUESTION MARK: Removes stray '?' characters on Preface (p11) and
   Conclusion (p431) that were rendered as font-fallback artifacts.

4. PAGE NUMBERS: The existing page folios are 2.2pt and invisible.
   Stamps clear, centered page numbers at the bottom of every content page.

Requirements:
    pip install pymupdf fonttools brotli

Usage:
    python3 fix-pod-pdf.py
    python3 fix-pod-pdf.py --input "path/to/input.pdf" --output "path/to/output.pdf"
"""

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Chapter opener pages (1-indexed) → Roman numeral or symbol to display
OPENER_LABELS = {
    11:  "✦",     # Preface
    16:  "I",
    46:  "II",
    67:  "III",
    85:  "IV",
    109: "V",
    134: "VI",
    157: "VII",
    175: "VIII",
    208: "IX",
    237: "X",
    264: "XI",
    291: "XII",
    320: "XIII",
    355: "XIV",
    385: "XV",
    408: "XVI",
    431: "✦",     # Conclusion
}

# Pages where a stray '?' appears over the brushstroke area
QUESTION_MARK_PAGES = [11, 431]

# Teal colour matching brushstroke.svg  fill="#4ECDC4"
TEAL_RGB = (78 / 255, 205 / 255, 196 / 255)   # #4ECDC4
TEAL_DARK = (59 / 255, 169 / 255, 156 / 255)   # #3BA99C  (accent strokes)

# Brushstroke image identification (embedded PNG dimensions)
BRUSH_IMG_DIM = 241    # width and height in PDF image units

# Fallback brushstroke placement (when image rect not found)
BRUSH_HALF_W = 29      # half-width in points
BRUSH_Y0 = 68.5        # top of brushstroke in points
BRUSH_Y1 = 126.5       # bottom of brushstroke in points

# Roman numeral styling
ROMAN_SIZE = 18        # points (matches original 18.7pt CinzelDecorative)
ROMAN_COLOR = (1, 1, 1)  # white — sits on teal brushstroke

# Page-number styling
FOLIO_FONT = "helv"    # Helvetica (built-in)
FOLIO_SIZE = 8         # points
FOLIO_COLOR = (0, 0, 0)  # black
FOLIO_BOTTOM_MARGIN = 36  # points from page bottom


# ---------------------------------------------------------------------------
# Font loading
# ---------------------------------------------------------------------------

def load_cinzel_font(fonts_dir: Path) -> fitz.Font:
    """Load CinzelDecorative (woff2→ttf) for Roman numerals."""
    woff2 = fonts_dir / "CinzelDecorative.woff2"
    ttf_cache = Path("/tmp/CinzelDecorative.ttf")

    if not ttf_cache.exists() and woff2.exists():
        from fontTools.ttLib import TTFont
        tt = TTFont(str(woff2))
        tt.flavor = None
        tt.save(str(ttf_cache))

    if ttf_cache.exists():
        return fitz.Font(fontfile=str(ttf_cache))
    # Fallback: built-in Times-Bold
    return fitz.Font("tibo")


def load_symbol_font() -> fitz.Font:
    """Load a font that supports ✦ (U+2726)."""
    djvu = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    if djvu.exists():
        return fitz.Font(fontfile=str(djvu))
    return fitz.Font("helv")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def find_blank_pages(doc: fitz.Document) -> set:
    """Return set of 1-indexed page numbers that have no text."""
    blanks = set()
    for i in range(len(doc)):
        if not doc[i].get_text("text").strip():
            blanks.add(i + 1)
    return blanks


def quad_to_cubic(p0, ctrl, p1):
    """Convert a quadratic Bézier (SVG Q) to cubic control points."""
    c1 = fitz.Point(p0.x + 2/3*(ctrl.x - p0.x), p0.y + 2/3*(ctrl.y - p0.y))
    c2 = fitz.Point(p1.x + 2/3*(ctrl.x - p1.x), p1.y + 2/3*(ctrl.y - p1.y))
    return c1, c2


def draw_brushstroke(page: fitz.Page, rect: fitz.Rect):
    """
    Draw a teal brushstroke shape inside *rect*, matching the SVG path
    from brushstroke.svg (viewBox 0 0 150 150).
    """
    sx = rect.width / 150.0
    sy = rect.height / 150.0
    ox, oy = rect.x0, rect.y0

    def pt(x, y):
        return fitz.Point(ox + x * sx, oy + y * sy)

    shape = page.new_shape()

    # Main filled brushstroke path
    segments = [
        ((20, 75), (30, 45), (60, 35)),
        ((60, 35), (90, 30), (120, 45)),
        ((120, 45), (135, 55), (130, 75)),
        ((130, 75), (125, 95), (100, 110)),
        ((100, 110), (70, 120), (40, 105)),
        ((40, 105), (15, 85), (20, 75)),
    ]

    shape.draw_line(pt(20, 75), pt(20, 75))
    for (sx0, sy0), (cx, cy), (ex, ey) in segments:
        p0, ctrl, p1 = pt(sx0, sy0), pt(cx, cy), pt(ex, ey)
        c1, c2 = quad_to_cubic(p0, ctrl, p1)
        shape.draw_bezier(p0, c1, c2, p1)
    shape.finish(fill=TEAL_RGB, color=None, closePath=True, fill_opacity=0.9)

    # Upper accent stroke
    for (sx0, sy0), (cx, cy), (ex, ey) in [
        ((25, 70), (50, 40), (80, 38)),
        ((80, 38), (110, 42), (125, 65)),
    ]:
        p0, ctrl, p1 = pt(sx0, sy0), pt(cx, cy), pt(ex, ey)
        c1, c2 = quad_to_cubic(p0, ctrl, p1)
        shape.draw_bezier(p0, c1, c2, p1)
    shape.finish(fill=None, color=TEAL_DARK, width=2.5*sx,
                 closePath=False, stroke_opacity=0.6)

    # Lower accent stroke
    for (sx0, sy0), (cx, cy), (ex, ey) in [
        ((30, 80), (60, 85), (90, 78)),
        ((90, 78), (115, 72), (125, 80)),
    ]:
        p0, ctrl, p1 = pt(sx0, sy0), pt(cx, cy), pt(ex, ey)
        c1, c2 = quad_to_cubic(p0, ctrl, p1)
        shape.draw_bezier(p0, c1, c2, p1)
    shape.finish(fill=None, color=TEAL_DARK, width=1.8*sx,
                 closePath=False, stroke_opacity=0.4)

    shape.commit(overlay=True)


def redact_header_text(page: fitz.Page, brush_rect: fitz.Rect):
    """
    Redact ALL text within the brushstroke area (and slightly wider)
    so we can redraw cleanly.  This removes the old black/white Roman
    numerals, stray '?' characters, and white-space artifacts.
    """
    # Expand rect a bit vertically to catch text that extends above/below
    redact_rect = fitz.Rect(
        brush_rect.x0 - 20,
        brush_rect.y0 - 5,
        brush_rect.x1 + 20,
        brush_rect.y1 + 5,
    )

    blocks = page.get_text("dict")["blocks"]
    found = False
    for b in blocks:
        if b["type"] != 0:
            continue
        for line in b["lines"]:
            for span in line["spans"]:
                sbbox = fitz.Rect(span["bbox"])
                # If span center falls inside the brushstroke zone
                cx = (sbbox.x0 + sbbox.x1) / 2
                cy = (sbbox.y0 + sbbox.y1) / 2
                if redact_rect.contains(fitz.Point(cx, cy)):
                    # Redact with white fill (matching page background)
                    page.add_redact_annot(sbbox + (-1, -1, 1, 1))
                    found = True

    if found:
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)


def draw_roman_numeral(page: fitz.Page, brush_rect: fitz.Rect,
                       label: str, font_roman: fitz.Font,
                       font_symbol: fitz.Font):
    """
    Draw the chapter Roman numeral (or ✦ symbol) in white, centered
    on the brushstroke rect.
    """
    # Pick the right font
    if label == "✦":
        font = font_symbol
    else:
        font = font_roman

    # Measure text width at ROMAN_SIZE
    tw = font.text_length(label, fontsize=ROMAN_SIZE)
    # Ascender height for vertical centering
    asc = font.ascender * ROMAN_SIZE  # approx ascent in pts

    # Center position
    cx = (brush_rect.x0 + brush_rect.x1) / 2
    cy = (brush_rect.y0 + brush_rect.y1) / 2

    # Baseline position (text is drawn from baseline)
    x = cx - tw / 2
    y = cy + asc / 3  # nudge down slightly for visual centering

    writer = fitz.TextWriter(page.rect)
    writer.append(fitz.Point(x, y), label, font=font, fontsize=ROMAN_SIZE)
    writer.write_text(page, color=ROMAN_COLOR, overlay=True)


def stamp_page_number(page: fitz.Page, page_num: int):
    """Stamp a visible page number at the bottom center of the page."""
    pw = page.rect.width
    ph = page.rect.height
    y = ph - 36
    text = str(page_num)
    tw = fitz.get_text_length(text, fontname=FOLIO_FONT, fontsize=FOLIO_SIZE)
    x = pw / 2 - tw / 2

    page.insert_text(
        fitz.Point(x, y), text,
        fontname=FOLIO_FONT, fontsize=FOLIO_SIZE,
        color=FOLIO_COLOR, overlay=True,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Fix brushstroke, Roman numerals, '?', and page numbers"
    )
    parser.add_argument("--input", "-i", default=None, help="Input PDF path")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    outputs_dir = script_dir.parent / "outputs"

    input_path = (Path(args.input) if args.input
                  else outputs_dir / "CurlsAndContemplation-POD-FINAL (2).pdf")
    output_path = (Path(args.output) if args.output
                   else outputs_dir / "CurlsAndContemplation-POD-FINAL (2).pdf")

    if not input_path.exists():
        print(f"ERROR: Input PDF not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")

    # ── Load fonts ──
    fonts_dir = script_dir.parent / "OEBPS" / "fonts"
    font_roman = load_cinzel_font(fonts_dir)
    font_symbol = load_symbol_font()
    print(f"Fonts:  roman={font_roman.name}, symbol={font_symbol.name}")

    doc = fitz.open(str(input_path))
    total = len(doc)
    print(f"Pages:  {total}")

    # ── Step 1: Identify blank pages ──
    print("\n[1/4] Identifying blank pages...")
    blank_pages = find_blank_pages(doc)
    print(f"  Found {len(blank_pages)} blank pages")

    # ── Step 2: Fix chapter openers (brushstroke + Roman numeral) ──
    print("\n[2/4] Fixing chapter openers (redact old text → brushstroke → Roman numeral)...")
    for pn, label in OPENER_LABELS.items():
        if pn > total:
            print(f"  WARNING: page {pn} out of range, skipping")
            continue

        page = doc[pn - 1]

        # Find brushstroke image rect
        brush_rect = None
        for img in page.get_images(full=True):
            if img[2] == 241 and img[3] == 241:
                rects = page.get_image_rects(img[0])
                if rects:
                    brush_rect = rects[0]
                    break

        if not brush_rect:
            pw = page.rect.width
            brush_rect = fitz.Rect(pw/2 - 29, 68.5, pw/2 + 29, 126.5)

        # a) Redact old text in the brushstroke zone (removes ?, ✦, old numerals)
        redact_header_text(page, brush_rect)

        # b) Draw teal brushstroke
        draw_brushstroke(page, brush_rect)

        # c) Draw white Roman numeral / symbol centered on brushstroke
        draw_roman_numeral(page, brush_rect, label, font_roman, font_symbol)

        print(f"  Page {pn:>3}: '{label}' on brushstroke at {brush_rect}")

    # ── Step 3: (merged into step 2 — '?' removed via redact_header_text) ──
    print("\n[3/4] Stray '?' removal — handled in step 2 via header redaction")

    # ── Step 4: Page numbers — SKIPPED ──
    # WeasyPrint already stamps Montserrat page numbers via @bottom-center in
    # pod-print.css. Re-stamping Helvetica numbers here caused duplicate
    # overlapping folios. Removed to fix the issue.
    print("\n[4/4] Page numbers — already handled by WeasyPrint CSS @bottom-center (skipped)")
    stamped = 0

    # ── Save ──
    print(f"\nSaving to {output_path}...")
    if input_path.resolve() == output_path.resolve():
        doc.saveIncr()
    else:
        doc.save(str(output_path), garbage=3, deflate=True)
    doc.close()

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"  Output size: {size_mb:.1f} MB")
    print("Done!")


if __name__ == "__main__":
    main()
