#!/usr/bin/env python3
"""
build-pod-pdf-royal.py — Curls & Contemplation KDP Royal POD PDF Builder
=========================================================================

Produces a KDP-ready Print-on-Demand PDF:
  - Trim: 6.69" × 9.61" (Royal)
  - Interior: Black & white, no bleed
  - Cover: full-page, no margins (page 1)
  - Font-embedded via WeasyPrint
  - Full PDF metadata/SEO injected

Usage:
    python3 build-pod-pdf-royal.py
    python3 build-pod-pdf-royal.py --output /path/to/output.pdf
"""

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Spine order — cover first, then interior in reading order
# ---------------------------------------------------------------------------
SPINE_ORDER = [
    "0-Cover.xhtml",
    "1-TitlePage.xhtml",
    "2-Copyright.xhtml",
    "3-TableOfContents.xhtml",
    "4-Dedication.xhtml",
    "5-SelfAssessment.xhtml",
    "6-AffirmationOdyssey.xhtml",
    "7-Preface.xhtml",
    "7a-preface-quote.xhtml",
    "8-Part-I-Foundations-of-Creative-Hairstyling.xhtml",
    "9-chapter-i-unveiling-your-creative-odyssey.xhtml",
    "10-chapter-ii-refining-your-creative-toolkit.xhtml",
    "11-chapter-iii-reigniting-your-creative-fire.xhtml",
    "12-Part-II-Building-Your-Professional-Practice.xhtml",
    "13-chapter-iv-the-art-of-networking-in-freelance-hairstyling.xhtml",
    "14-chapter-v-cultivating-creative-excellence-through-mentorship.xhtml",
    "15-chapter-vi-mastering-the-business-of-hairstyling.xhtml",
    "16-chapter-vii-embracing-wellness-and-self-care.xhtml",
    "17-chapter-viii-advancing-skills-through-continuous-education.xhtml",
    "18-Part-III-Advanced-Business-Strategies.xhtml",
    "19-chapter-ix-stepping-into-leadership.xhtml",
    "20-chapter-x-crafting-enduring-legacies.xhtml",
    "21-chapter-xi-advanced-digital-strategies-for-freelance-hairstylists.xhtml",
    "22-chapter-xii-financial-wisdom-building-sustainable-ventures.xhtml",
    "23-chapter-xiii-embracing-ethics-and-sustainability-in-hairstyling.xhtml",
    "24-Part-IV-Future-Focused-Growth.xhtml",
    "25-chapter-xiv-the-impact-of-ai-on-the-beauty-industry.xhtml",
    "26-chapter-xv-cultivating-resilience-and-well-being-in-hairstyling.xhtml",
    "27-chapter-xvi-tresses-and-textures-embracing-diversity-in-hairstyling.xhtml",
    "28-Conclusion.xhtml",
    "28a-conclusion-quote.xhtml",
    "29-QuizKey.xhtml",
    "30-SelfAssessment.xhtml",
    "31-affirmations-close.xhtml",
    "32-continued-learning-commitment.xhtml",
    "33-Acknowledgments.xhtml",
    "34-AbouttheAuthor.xhtml",
    "35-JournalingStart.xhtml",
    "36-ManifestingJournal.xhtml",
    "37-journal-page.xhtml",
    "38-professional-development.xhtml",
    "39-SMARTGoals.xhtml",
    "40-self-care-journal.xhtml",
    "41-VisionJournal.xhtml",
    "42-DoodlePage.xhtml",
    "43-bibliography.xhtml",
]

# ---------------------------------------------------------------------------
# CSS injected inline — Royal trim, B&W, cover full-bleed
# ---------------------------------------------------------------------------
COVER_CSS = """
/* ── Cover page: full-bleed, zero margins ─────────────────────────────── */
@page cover-page {
  size: 6.69in 9.61in;
  margin: 0;
}
body.cover-body {
  page: cover-page;
}
.cover-page {
  width: 6.69in;
  height: 9.61in;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  page-break-after: always;
}
.cover-image {
  width: 6.69in;
  height: 9.61in;
  object-fit: cover;
  display: block;
  margin: 0;
  padding: 0;
}
"""

LIGATURE_FIX = """
/* Ligature fix — ensures PDF text extraction works correctly */
* {
  font-variant-ligatures: none !important;
  font-feature-settings: "liga" 0, "clig" 0, "dlig" 0, "hlig" 0 !important;
  -webkit-font-feature-settings: "liga" 0, "clig" 0, "dlig" 0, "hlig" 0 !important;
}
"""


def resolve_paths():
    script_dir = Path(__file__).resolve().parent   # Final edits/pdf/
    final_edits = script_dir.parent                # Final edits/
    oebps = final_edits / "OEBPS"
    xhtml_dir = oebps / "xhtml"
    style_dir = oebps / "style"
    images_dir = oebps / "images"
    fonts_dir = oebps / "fonts"
    output_dir = final_edits / "output"
    output_dir.mkdir(exist_ok=True)
    return script_dir, oebps, xhtml_dir, style_dir, images_dir, fonts_dir, output_dir


def extract_body(xhtml_path: Path, images_dir: Path) -> tuple[str, str]:
    """Return (body_attrs, inner_html) from an XHTML file."""
    text = xhtml_path.read_text(encoding="utf-8")
    body_match = re.search(r'<body([^>]*)>', text, re.DOTALL)
    if not body_match:
        print(f"  WARNING: No <body> in {xhtml_path.name}", file=sys.stderr)
        return "", ""

    body_attrs = body_match.group(1).strip()
    body_start = body_match.end()
    body_end = text.rfind('</body>')
    if body_end == -1:
        body_end = len(text)
    inner = text[body_start:body_end].strip()

    # Fix relative image paths → absolute file:// URIs
    img_uri = images_dir.as_uri()
    inner = inner.replace('../images/', img_uri + '/')
    inner = re.sub(r'src="images/([^"]+)"', f'src="{img_uri}/\\1"', inner)

    # Strip epub: namespace attributes (WeasyPrint ignores them; avoids parse noise)
    inner = re.sub(r'\s+epub:type="[^"]*"', '', inner)
    inner = re.sub(r'\s+xmlns:epub="[^"]*"', '', inner)

    # Strip leading artifact chars (single ~ or . at top of body from web export)
    inner = re.sub(r'^\s*[~\.\u00b7]\s*\n', '', inner)

    # For the TOC file: convert .xhtml hrefs → #src-{stem} fragment IDs so that
    # CSS target-counter(attr(href), page) resolves correctly in the combined PDF.
    if xhtml_path.name == '3-TableOfContents.xhtml':
        def xhtml_to_fragment(m):
            href = m.group(1)
            stem = href.replace('.xhtml', '')
            return f'href="#src-{stem}"'
        inner = re.sub(r'href="([^"#][^"]*\.xhtml)"', xhtml_to_fragment, inner)

    return body_attrs, inner


def build_font_css(fonts_dir: Path) -> str:
    base = fonts_dir.as_uri()
    return f"""
@font-face {{
  font-family: 'Libre Baskerville';
  src: url('{base}/librebaskerville-regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}}
@font-face {{
  font-family: 'Libre Baskerville';
  src: url('{base}/librebaskerville-italic.woff2') format('woff2');
  font-weight: 400; font-style: italic;
}}
@font-face {{
  font-family: 'Libre Baskerville';
  src: url('{base}/librebaskerville-bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
/* Bold-italic alias: italic file used so combined runs stay in the brand serif */
@font-face {{
  font-family: 'Libre Baskerville';
  src: url('{base}/librebaskerville-italic.woff2') format('woff2');
  font-weight: 700; font-style: italic;
}}
@font-face {{
  font-family: 'Cinzel Decorative';
  src: url('{base}/CinzelDecorative.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}}
/* Cinzel Decorative bold alias: regular file reused at 700 weight */
@font-face {{
  font-family: 'Cinzel Decorative';
  src: url('{base}/CinzelDecorative.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
@font-face {{
  font-family: 'Montserrat';
  src: url('{base}/Montserrat-Regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}}
@font-face {{
  font-family: 'Montserrat';
  src: url('{base}/Montserrat-Bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
/* Montserrat italic/oblique aliases: regular/bold reused in italic style */
@font-face {{
  font-family: 'Montserrat';
  src: url('{base}/Montserrat-Regular.woff2') format('woff2');
  font-weight: 400; font-style: italic;
}}
@font-face {{
  font-family: 'Montserrat';
  src: url('{base}/Montserrat-Bold.woff2') format('woff2');
  font-weight: 700; font-style: italic;
}}
/* Aliases for any references to Lato/Playfair Display in markup */
@font-face {{
  font-family: 'Lato';
  src: url('{base}/Montserrat-Regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}}
@font-face {{
  font-family: 'Lato';
  src: url('{base}/Montserrat-Bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
@font-face {{
  font-family: 'Playfair Display';
  src: url('{base}/librebaskerville-regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}}
@font-face {{
  font-family: 'Playfair Display';
  src: url('{base}/librebaskerville-bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
"""


def build_combined_html(
    xhtml_dir: Path,
    fonts_dir: Path,
    images_dir: Path,
    pod_css_path: Path,
    include_cover: bool = True,
) -> str:
    font_css = build_font_css(fonts_dir)
    pod_css = pod_css_path.read_text(encoding="utf-8")

    spine = SPINE_ORDER if include_cover else [f for f in SPINE_ORDER if f != "0-Cover.xhtml"]
    sections = []
    for i, fname in enumerate(spine):
        fpath = xhtml_dir / fname
        if not fpath.exists():
            print(f"  WARNING: {fname} not found, skipping", file=sys.stderr)
            continue

        body_attrs, inner = extract_body(fpath, images_dir)
        if not inner:
            continue

        file_id = fpath.stem
        wrapper_attrs = f'id="src-{file_id}"'
        if body_attrs:
            wrapper_attrs += f' {body_attrs}'
        wrapper_attrs += f' data-source="{fname}"'

        sections.append(f'<!-- ===== {fname} ===== -->')
        sections.append(f'<div {wrapper_attrs}>\n{inner}\n</div>')

    body_content = "\n\n".join(sections)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Curls &amp; Contemplation: A Stylist&#x2019;s Interactive Journey</title>
<meta name="author" content="Michael David Warren Jr."/>
<meta name="description" content="Curls and Contemplation: A Stylist&#x2019;s Interactive Journey &#8212; A professional development journal for hairstylists covering creative artistry, business strategy, wellness, and legacy building. By Michael David Warren Jr."/>
<meta name="keywords" content="hairstylist journal, hair stylist professional development, curls, natural hair, beauty industry, salon business, creative hairstyling, freelance hairstylist, Michael David Warren Jr., TAYLKOMB"/>
<meta name="subject" content="Professional Development for Hairstylists"/>
<meta name="creator" content="Michael David Warren Jr."/>
<meta name="publisher" content="TAYLKOMB LLC"/>
<meta name="rights" content="Copyright 2026 Michael David Warren Jr. / TAYLKOMB LLC. All rights reserved."/>
<meta name="language" content="en-US"/>
<style>
{font_css}
{LIGATURE_FIX}
{COVER_CSS}
{pod_css}
</style>
</head>
<body>
{body_content}
</body>
</html>
"""


def main():
    parser = argparse.ArgumentParser(
        description="Build KDP Royal POD PDF for Curls & Contemplation"
    )
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    parser.add_argument(
        "--html-only", action="store_true", help="Write combined HTML only (no PDF)"
    )
    parser.add_argument(
        "--no-cover",
        action="store_true",
        help="Exclude 0-Cover.xhtml from the spine (KDP interior upload)",
    )
    args = parser.parse_args()

    script_dir, oebps, xhtml_dir, style_dir, images_dir, fonts_dir, output_dir = (
        resolve_paths()
    )
    pod_css_path = script_dir / "pod-print.css"

    if not pod_css_path.exists():
        print(f"ERROR: {pod_css_path} not found", file=sys.stderr)
        sys.exit(1)

    output_path = (
        Path(args.output)
        if args.output
        else output_dir / "CurlsAndContemplation-KDP-ROYAL-FINAL.pdf"
    )

    print("=" * 60)
    print("  Curls & Contemplation — KDP Royal POD PDF Builder")
    print("=" * 60)
    print(f"  Trim:    6.69\" × 9.61\" (Royal)")
    print(f"  Source:  {xhtml_dir}")
    print(f"  CSS:     {pod_css_path}")
    print(f"  Output:  {output_path}")
    print()

    print("  [1/3] Combining XHTML files...")
    html = build_combined_html(
        xhtml_dir,
        fonts_dir,
        images_dir,
        pod_css_path,
        include_cover=not args.no_cover,
    )

    # Write HTML for debugging
    html_path = script_dir / "print-interior-royal.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"  [1/3] Combined HTML → {html_path.name} ({len(html)//1024} KB)")

    if args.html_only:
        print("  Done (HTML-only mode).")
        return

    print("  [2/3] Generating PDF with WeasyPrint...")
    try:
        import weasyprint

        doc = weasyprint.HTML(string=html, base_url=str(oebps))
        css_extra = weasyprint.CSS(string=COVER_CSS + LIGATURE_FIX)
        doc.write_pdf(str(output_path))
        print(f"  [2/3] PDF written → {output_path.name}")
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    # Validate
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\n  [3/3] Validation")
    print(f"  File size : {size_mb:.1f} MB")

    try:
        result = subprocess.run(
            ["pdfinfo", str(output_path)],
            capture_output=True, text=True, timeout=15
        )
        for line in result.stdout.splitlines():
            if any(k in line for k in ("Pages:", "Page size:", "PDF version:", "Encrypted:")):
                print(f"  {line.strip()}")
    except FileNotFoundError:
        print("  (pdfinfo not available — install poppler-utils for validation)")
    except Exception as e:
        print(f"  pdfinfo error: {e}")

    print()
    print("  ✓ Build complete.")
    print(f"  Output: {output_path}")
    print()
    print("  Next steps for KDP submission:")
    print("  1. Open the PDF and spot-check cover, TOC, chapters, and back matter")
    print("  2. Submit the interior PDF (this file) to KDP separately from the cover")
    print("  3. Upload your cover file via KDP Cover Creator or a separate bleed cover PDF")


if __name__ == "__main__":
    main()
