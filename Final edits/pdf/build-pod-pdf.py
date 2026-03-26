#!/usr/bin/env python3
"""
build-pod-pdf.py — Curls & Contemplation POD PDF Builder
=========================================================

Combines all 45 XHTML chapter files from the EPUB source into a single
paged PDF sized for KDP Print-on-Demand (6.69" x 9.61", B&W, no bleed).

Requirements:
    pip install weasyprint

Usage:
    python3 build-pod-pdf.py                  # builds to Final edits/pdf/
    python3 build-pod-pdf.py --output out.pdf # custom output path

The script:
  1. Reads each XHTML file and extracts the <body> content
  2. Wraps everything in a single HTML document with the POD stylesheet
  3. Inserts page-break markers between documents
  4. Feeds the combined HTML to WeasyPrint to produce a print-ready PDF
"""

import argparse
import os
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# All XHTML files in spine order (matches content.opf)
SPINE_ORDER = [
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


def resolve_paths():
    """Return absolute paths for project directories."""
    script_dir = Path(__file__).resolve().parent          # Final edits/pdf/
    final_edits = script_dir.parent                       # Final edits/
    oebps = final_edits / "OEBPS"
    xhtml_dir = oebps / "xhtml"
    style_dir = oebps / "style"
    images_dir = oebps / "images"
    fonts_dir = oebps / "fonts"
    return script_dir, oebps, xhtml_dir, style_dir, images_dir, fonts_dir


def extract_body(xhtml_path: Path) -> str:
    """Extract content between <body ...> and </body> tags."""
    text = xhtml_path.read_text(encoding="utf-8")

    # Extract body attributes (class, etc.)
    body_match = re.search(r'<body([^>]*)>', text, re.DOTALL)
    if not body_match:
        print(f"  WARNING: No <body> found in {xhtml_path.name}", file=sys.stderr)
        return ""

    body_attrs = body_match.group(1).strip()
    # Get content between body tags
    body_start = body_match.end()
    body_end = text.rfind('</body>')
    if body_end == -1:
        body_end = len(text)

    inner = text[body_start:body_end].strip()

    # Fix relative image paths → absolute
    # ../images/foo.jpeg → file:///absolute/path/images/foo.jpeg
    images_dir = xhtml_path.parent.parent / "images"
    inner = inner.replace('../images/', images_dir.as_uri() + '/')
    # Also handle plain images/ references
    inner = inner.replace('src="images/', f'src="{images_dir.as_uri()}/')

    # Remove epub: namespace attributes (WeasyPrint doesn't understand them)
    inner = re.sub(r'\s*epub:type="[^"]*"', '', inner)
    inner = re.sub(r'\s*xmlns:epub="[^"]*"', '', inner)

    # Wrap in a div with the body class for styling
    # Add id based on filename for anchor-based page number extraction
    file_id = xhtml_path.stem  # e.g. "9-chapter-i-unveiling-your-creative-odyssey"
    if body_attrs:
        return f'<div id="src-{file_id}" {body_attrs} data-source="{xhtml_path.name}">\n{inner}\n</div>'
    else:
        return f'<div id="src-{file_id}" data-source="{xhtml_path.name}">\n{inner}\n</div>'


def build_font_css(fonts_dir: Path) -> str:
    """Generate @font-face rules with absolute file:// URLs."""
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
@font-face {{
  font-family: 'Cinzel Decorative';
  src: url('{base}/CinzelDecorative.woff2') format('woff2');
  font-weight: 400; font-style: normal;
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
/* Aliases */
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
  src: url('{base}/librebaskerville-italic.woff2') format('woff2');
  font-weight: 400; font-style: italic;
}}
@font-face {{
  font-family: 'Playfair Display';
  src: url('{base}/librebaskerville-bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}}
"""


def build_combined_html(xhtml_dir: Path, fonts_dir: Path, pod_css_path: Path) -> str:
    """Build a single HTML document from all XHTML files."""

    font_css = build_font_css(fonts_dir)
    pod_css = pod_css_path.read_text(encoding="utf-8")

    # Backmatter files that should flow together without forced page breaks
    BACKMATTER_START = "29-QuizKey.xhtml"
    backmatter_started = False

    sections = []
    for i, fname in enumerate(SPINE_ORDER):
        fpath = xhtml_dir / fname
        if not fpath.exists():
            print(f"  WARNING: {fname} not found, skipping", file=sys.stderr)
            continue

        body = extract_body(fpath)
        if not body:
            continue

        # Detect start of backmatter
        if fname == BACKMATTER_START:
            backmatter_started = True
            # Add file-break before backmatter wrapper, then open wrapper
            if i > 0:
                sections.append('<div class="file-break"></div>')
            sections.append('<!-- ===== BACKMATTER FLOW ===== -->')
            sections.append('<div class="backmatter-flow">')

        if not backmatter_started:
            # Add page-break div between documents (not before the first)
            if i > 0:
                sections.append('<div class="file-break"></div>')

        sections.append(f'<!-- ===== {fname} ===== -->')
        sections.append(f'<div class="backmatter-item">' if backmatter_started else '')
        sections.append(body)
        sections.append('</div>' if backmatter_started else '')

    # Close backmatter wrapper
    if backmatter_started:
        sections.append('</div><!-- /backmatter-flow -->')

    joined = "\n\n".join(sections)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Curls &amp; Contemplation — Print Interior</title>
<style>
{font_css}
{pod_css}
</style>
</head>
<body>
{joined}
</body>
</html>
"""
    return html


def main():
    parser = argparse.ArgumentParser(description="Build POD PDF for Curls & Contemplation")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    parser.add_argument("--html-only", action="store_true", help="Write combined HTML instead of PDF")
    args = parser.parse_args()

    script_dir, oebps, xhtml_dir, style_dir, images_dir, fonts_dir = resolve_paths()
    pod_css_path = script_dir / "pod-print.css"

    if not pod_css_path.exists():
        print(f"ERROR: {pod_css_path} not found", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output) if args.output else script_dir / "CurlsAndContemplation-Print.pdf"

    print(f"Building POD PDF...")
    print(f"  Source:  {xhtml_dir}")
    print(f"  CSS:     {pod_css_path}")
    print(f"  Fonts:   {fonts_dir}")
    print(f"  Output:  {output_path}")
    print()

    # Build combined HTML
    print("  [1/3] Combining XHTML files...")
    html = build_combined_html(xhtml_dir, fonts_dir, pod_css_path)

    # Optionally write HTML for debugging
    html_path = script_dir / "print-interior.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"  [1/3] Combined HTML written to {html_path}")

    if args.html_only:
        print("  Done (HTML only mode).")
        return

    # Generate PDF
    print("  [2/3] Generating PDF with WeasyPrint...")
    try:
        import weasyprint
        doc = weasyprint.HTML(string=html, base_url=str(oebps))
        doc.write_pdf(str(output_path))
        print(f"  [2/3] PDF written to {output_path}")
    except Exception as e:
        print(f"  ERROR generating PDF: {e}", file=sys.stderr)
        sys.exit(1)

    # Report
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"  [3/3] PDF size: {size_mb:.1f} MB")

    # Count pages using pdfinfo if available
    try:
        import subprocess
        result = subprocess.run(
            ["pdfinfo", str(output_path)],
            capture_output=True, text=True, timeout=10
        )
        for line in result.stdout.splitlines():
            if line.startswith("Pages:"):
                pages = line.split(":")[1].strip()
                print(f"  [3/3] Page count: {pages}")
                print(f"  [3/3] Spine width estimate: {float(pages) * 0.002252:.3f}\" (white paper)")
                break
    except Exception:
        print("  (pdfinfo not available — install poppler-utils for page count)")

    print()
    print("  Done! Review the PDF and update TOC page numbers after first proof.")


if __name__ == "__main__":
    main()
