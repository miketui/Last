#!/usr/bin/env python3
"""
Final POD print-interior build for "Curls & Contemplation" (KDP Royal
6.69in x 9.61in), Chromium/Skia render — derived from build-pod-chromium.py
with the audit-mandated layout fixes:

  M4  every Part and Chapter opener (and the Title page and Conclusion)
      starts recto (odd physical page) — blank verso pages are inserted
      where needed;
  m4  Half-title (p.1 recto) -> blank -> Title (p.3 recto) -> Copyright
      (p.4 verso), the conventional front-matter imposition;
  m21 ONE folio rule: a printed folio appears on every page EXCEPT
      (a) inserted blanks, (b) the front-matter display files, (c) the
      standalone image-quote pages, and (d) the first page of each spine
      file (every section-opening page is folio-free, uniformly).

Folio numbers are physical page numbers (blanks consume a number but print
nothing). Margins are unchanged from the audited May-29 build.

Usage: python3 build-pod-final.py [output.pdf]
"""
import sys
import io
import json
import subprocess
import tempfile
import glob
import xml.etree.ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

_FOLIO_FONT = "MontserratFolio"
_FONT_PATH = Path(__file__).resolve().parent / "pdf" / "latex" / "fonts" / "Montserrat-Regular.ttf"
pdfmetrics.registerFont(TTFont(_FOLIO_FONT, str(_FONT_PATH)))

OEBPS = Path(__file__).resolve().parent / "Final edits" / "OEBPS"
OPF = OEBPS / "content.opf"
NS = {"opf": "http://www.idpf.org/2007/opf"}

PAGE_W = 6.69 * 72
PAGE_H = 9.61 * 72

EXCLUDE = {"0-Cover.xhtml", "worksheet-download-fallback.xhtml"}

# Front-matter display files: never carry a folio on any page.
NO_FOLIO_FILES = {
    "0a-HalfTitle.xhtml", "1-TitlePage.xhtml", "2-Copyright.xhtml",
    "3-TableOfContents.xhtml", "4-Dedication.xhtml",
}
# Standalone full-page image-quote files: never carry a folio.
QUOTE_FILES = {"7a-preface-quote.xhtml", "28a-conclusion-quote.xhtml"}

KEEP_BLANKS_FILES = {"42-DoodlePage.xhtml"}
BLANK_INK_THRESHOLD = 0.0025

# Files whose first printed page must fall recto (odd physical page).
def _is_recto_file(name: str) -> bool:
    return (
        name == "1-TitlePage.xhtml"
        or name == "28-Conclusion.xhtml"
        or name.startswith(("8-", "12-", "18-", "24-"))   # Part openers
        or "chapter-" in name                              # 16 chapter openers
    )


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
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.emulate_media(media="print")
        for name in names:
            url = (OEBPS / "xhtml" / name).as_uri()
            page.goto(url, wait_until="networkidle")
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


def blank_page():
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_W, PAGE_H))
    c.showPage()
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def ink_fractions(pdf_path, dpi=36):
    d = tempfile.mkdtemp()
    subprocess.run(["pdftoppm", "-gray", "-r", str(dpi), "-png",
                    str(pdf_path), d + "/p"], capture_output=True)
    fracs = []
    for f in sorted(glob.glob(d + "/p-*.png")):
        im = Image.open(f).convert("L")
        px = list(im.getdata())
        fracs.append(sum(1 for v in px if v < 160) / len(px))
    return fracs


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "/tmp/epub-build/CurlsAndContemplation-POD-FINAL.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)

    names = spine_files()
    print(f"Rendering {len(names)} spine files with Chromium...")
    rendered = render_files(names)

    # Pass 1: collect pages + metadata.
    pages, meta = [], []
    for name, pdf in rendered:
        reader = PdfReader(io.BytesIO(pdf))
        file_no_folio = name in NO_FOLIO_FILES or name in QUOTE_FILES
        for pg in reader.pages:
            pages.append(pg)
            meta.append({"name": name, "file_no_folio": file_no_folio,
                         "keep_blank": name in KEEP_BLANKS_FILES})

    # Detect manufactured blanks on the merged (pre-folio) document.
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    w0 = PdfWriter()
    for pg in pages:
        w0.add_page(pg)
    w0.write(tmp.name)
    fracs = ink_fractions(tmp.name)

    # Pass 2: drop manufactured blanks, pad recto openers, stamp folios.
    writer = PdfWriter()
    folio = 0
    dropped = 0
    padded = 0
    seen_file = None
    page_map = {}
    for pg, m, fr in zip(pages, meta, fracs, strict=True):
        if fr < BLANK_INK_THRESHOLD and not m["keep_blank"]:
            dropped += 1
            continue
        first_kept = m["name"] != seen_file
        # Recto imposition: pad a blank verso so the opener lands on an
        # odd physical page. Blanks consume a folio number, print nothing.
        if first_kept and _is_recto_file(m["name"]) and folio % 2 == 1:
            folio += 1
            writer.add_page(blank_page())
            padded += 1
        folio += 1
        seen_file = m["name"]
        if first_kept:
            page_map[m["name"]] = folio
        # ONE folio rule (m21): no folio on display files, quote pages, or
        # the first page of any spine file.
        suppress = m["file_no_folio"] or first_kept
        if not suppress:
            pg.merge_page(folio_overlay(folio))
        writer.add_page(pg)

    with open(out, "wb") as fh:
        writer.write(fh)
    (out.parent / "page-map.json").write_text(json.dumps(page_map, indent=2))

    openers = {k: v for k, v in page_map.items() if _is_recto_file(k)}
    bad = {k: v for k, v in openers.items() if v % 2 == 0}
    print(f"PDF generated: {out} ({out.stat().st_size/1024/1024:.1f} MB, "
          f"{folio} pages; dropped {dropped} manufactured blanks; "
          f"inserted {padded} recto-padding blanks)")
    print("Opener pages:", json.dumps(openers, indent=2))
    if bad:
        print("ERROR: verso openers remain:", bad)
        sys.exit(1)
    print("All recto-required openers land on odd pages.")


if __name__ == "__main__":
    main()
