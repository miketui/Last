#!/usr/bin/env python3
"""
Build the POD print-interior PDF for "Curls & Contemplation" with Chromium
(the canonical engine: Skia/PDF). Trim: 6.69in x 9.61in (KDP Royal).

Strategy
--------
Each spine file is rendered separately by Chromium so that every per-file
`body.<class>` rule in style.css / print.css applies exactly as authored
(front matter, TOC, dedication, etc. depend on these). The per-file PDFs are
then merged, and continuous page-number folios are stamped as an overlay so
numbering is correct across the whole book. Folios are suppressed on cover /
front-matter display pages and on standalone full-page image-quote pages.

Usage: python3 build-pod-chromium.py [output.pdf]
"""
import sys
import io
import glob
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

# Embed Montserrat (the book's sans face) for the folio so the exported PDF
# contains NO non-embedded fonts — KDP rejects any unembedded font.
_FOLIO_FONT = "MontserratFolio"
_FONT_PATH = Path(__file__).resolve().parent / "pdf" / "latex" / "fonts" / "Montserrat-Regular.ttf"
pdfmetrics.registerFont(TTFont(_FOLIO_FONT, str(_FONT_PATH)))

OEBPS = Path(__file__).resolve().parent / "Final edits" / "OEBPS"
OPF = OEBPS / "content.opf"
NS = {"opf": "http://www.idpf.org/2007/opf"}

# Royal trim in points (1in = 72pt)
PAGE_W = 6.69 * 72
PAGE_H = 9.61 * 72

# Excluded from the print interior.
EXCLUDE = {"0-Cover.xhtml", "worksheet-download-fallback.xhtml"}

# Files whose pages never carry a printed folio (display front matter).
NO_FOLIO_FILES = {
    "0a-HalfTitle.xhtml", "1-TitlePage.xhtml", "2-Copyright.xhtml",
    "3-TableOfContents.xhtml", "4-Dedication.xhtml",
}
# Standalone full-page image-quote files (no folio).
QUOTE_FILES = {"7a-preface-quote.xhtml", "28a-conclusion-quote.xhtml"}

# Files whose (near-)empty pages are INTENTIONAL and must never be dropped.
KEEP_BLANKS_FILES = {"42-DoodlePage.xhtml"}

# A page with less than this fraction of inked pixels is treated as a
# manufactured blank (recto/verso padding or section overflow) and dropped,
# honoring the "flow continuously / no blank pages" layout decision.
BLANK_INK_THRESHOLD = 0.0025


def spine_files():
    root = ET.parse(OPF).getroot()
    manifest = {i.get("id"): i.get("href")
                for i in root.findall(".//opf:manifest/opf:item", NS)}
    out = []
    for ref in root.findall(".//opf:spine/opf:itemref", NS):
        href = manifest.get(ref.get("idref"))
        if href and Path(href).name not in EXCLUDE:
            out.append(Path(href).name)
    return out


def render_files(names):
    """Render each xhtml to a single-file PDF; return list of (name, pdf_bytes)."""
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.emulate_media(media="print")
        for name in names:
            url = (OEBPS / "xhtml" / name).as_uri()
            page.goto(url, wait_until="networkidle")
            # Margins: 0.75in left/right satisfies KDP's gutter minimum for a
            # 301-500pp interior (uniform, since Chromium can't alternate
            # recto/verso). Top/bottom trimmed to 0.6in to raise text density;
            # the page-number folio sits inside the bottom margin.
            pdf = page.pdf(
                width=f"{6.69}in",
                height=f"{9.61}in",
                print_background=True,
                prefer_css_page_size=False,
                margin={"top": "0.6in", "bottom": "0.6in",
                        "left": "0.75in", "right": "0.75in"},
            )
            results.append((name, pdf))
            print(f"  rendered {name}: {len(PdfReader(io.BytesIO(pdf)).pages)} pp")
        browser.close()
    return results


def folio_overlay(number):
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_W, PAGE_H))
    c.setFont(_FOLIO_FONT, 9)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawCentredString(PAGE_W / 2, 0.45 * 72, str(number))
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def ink_fractions(pdf_path, dpi=36):
    """Rasterize a PDF and return per-page inked-pixel fractions."""
    d = tempfile.mkdtemp()
    subprocess.run(["pdftoppm", "-gray", "-r", str(dpi), "-png",
                    str(pdf_path), d + "/p"], capture_output=True)
    fracs = []
    for f in sorted(glob.glob(d + "/p-*.png")):
        im = Image.open(f).convert("L")
        px = list(im.get_flattened_data())
        fracs.append(sum(1 for v in px if v < 160) / len(px))
    return fracs


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "/tmp/epub-build/CurlsAndContemplation-POD-Chromium.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)

    names = spine_files()
    print(f"Rendering {len(names)} spine files with Chromium...")
    rendered = render_files(names)

    # First pass: merge all pages, recording per-page metadata.
    pages, meta = [], []
    for name, pdf in rendered:
        reader = PdfReader(io.BytesIO(pdf))
        # Whole-file no-folio: front-matter display pages and standalone quotes.
        file_no_folio = name in NO_FOLIO_FILES or name in QUOTE_FILES
        # Opener files: the first PRINTED page (chapter/part title page) carries
        # no folio. Resolved against the first kept page in the second pass.
        opener_file = name.startswith(("8-", "12-", "18-", "24-")) or "chapter-" in name
        for idx, pg in enumerate(reader.pages):
            pages.append(pg)
            meta.append({"name": name, "file_no_folio": file_no_folio,
                         "opener_file": opener_file,
                         "keep_blank": name in KEEP_BLANKS_FILES})

    # Detect blank pages on the merged (pre-folio) document.
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    w0 = PdfWriter()
    for pg in pages:
        w0.add_page(pg)
    w0.write(tmp.name)
    fracs = ink_fractions(tmp.name)

    # Second pass: drop manufactured blanks, stamp continuous folios.
    writer = PdfWriter()
    folio = 0
    dropped = 0
    seen_file = None
    for pg, m, fr in zip(pages, meta, fracs):
        if fr < BLANK_INK_THRESHOLD and not m["keep_blank"]:
            dropped += 1
            continue
        folio += 1
        first_kept = m["name"] != seen_file
        seen_file = m["name"]
        # No folio on front-matter display pages, standalone quotes, and the
        # first printed page of each chapter/part (the title opener).
        suppress = m["file_no_folio"] or (m["opener_file"] and first_kept)
        if not suppress:
            pg.merge_page(folio_overlay(folio))
        writer.add_page(pg)

    with open(out, "wb") as fh:
        writer.write(fh)
    print(f"PDF generated: {out} ({out.stat().st_size/1024/1024:.1f} MB, "
          f"{folio} pages; dropped {dropped} blank pages)")


if __name__ == "__main__":
    main()
