#!/usr/bin/env python3
"""
Build production PDF for "Curls & Contemplation"
Combines all XHTML chapters into a single document for WeasyPrint.
Trim: 6.35" x 9.65" | No blank pages | Drop caps | Page numbers
"""
import re
import os
from pathlib import Path

OEBPS = Path("/home/user/Last/Final edits/OEBPS")
XHTML_DIR = OEBPS / "xhtml"
STYLE_DIR = OEBPS / "style"
OUTPUT = Path("/tmp/epub-build/CurlsAndContemplation-POD-Production.pdf")

# Spine order from content.opf (excluding cover - not needed in print interior)
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

def extract_body(xhtml_path):
    """Extract content between <body> and </body> tags."""
    content = xhtml_path.read_text(encoding="utf-8")
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    if body_match:
        body_content = body_match.group(1)
        # Extract body attributes for class/epub:type
        attr_match = re.search(r'<body([^>]*)>', content)
        attrs = attr_match.group(1) if attr_match else ""
        # Remove epub: namespace attributes (not valid in combined HTML)
        attrs = re.sub(r'\s*epub:type="[^"]*"', '', attrs)
        return body_content, attrs
    return "", ""

def fix_image_paths(content):
    """Fix relative image paths to absolute paths for WeasyPrint."""
    images_dir = str(OEBPS / "images")
    content = content.replace('src="../images/', f'src="file://{images_dir}/')
    content = content.replace("src='../images/", f"src='file://{images_dir}/")
    return content

def fix_internal_links(content):
    """Fix internal href links that point to other xhtml files."""
    # Remove cross-file links (they won't work in combined PDF)
    content = re.sub(r'href="(?:\.\./xhtml/|)(\d+[^"]*\.xhtml)"', r'href="#"', content)
    return content

def fix_picture_elements(content):
    """Replace <picture> elements with plain <img> for WeasyPrint compatibility.
    WeasyPrint doesn't handle <picture>/<source> well with floats."""
    # Replace entire <picture>...<img.../>...</picture> with just the <img>
    content = re.sub(
        r'<picture>\s*<source[^>]*/>\s*(<img[^>]*/>)\s*</picture>',
        r'\1',
        content
    )
    # Also handle non-self-closing img
    content = re.sub(
        r'<picture>\s*<source[^>]*/>\s*(<img[^>]*>)\s*</picture>',
        r'\1',
        content
    )
    # Use PNG version of brushstroke instead of SVG for WeasyPrint
    content = content.replace('brushstroke.svg', 'brushstroke.png')
    return content

def build_combined_html():
    """Build a single HTML document combining all chapters."""
    fonts_css = (STYLE_DIR / "fonts.css").read_text(encoding="utf-8")
    style_css = (STYLE_DIR / "style.css").read_text(encoding="utf-8")
    print_css = (STYLE_DIR / "print.css").read_text(encoding="utf-8")

    # Fix font paths in CSS to absolute
    fonts_dir = str(OEBPS / "fonts")
    fonts_css = fonts_css.replace("url('../fonts/", f"url('file://{fonts_dir}/")
    style_css = style_css.replace("url('../fonts/", f"url('file://{fonts_dir}/")

    # Fix image paths in CSS
    images_dir = str(OEBPS / "images")
    style_css = style_css.replace("url('../images/", f"url('file://{images_dir}/")

    # WEASYPRINT FIX: Strip ALL float declarations from source CSS
    # WeasyPrint crashes on floated non-replaced inline elements
    for css_name in ['fonts_css', 'style_css', 'print_css']:
        css_val = locals()[css_name]
        css_val = re.sub(r'float\s*:\s*[^;]+;', 'float: none;', css_val)
        locals()[css_name] = css_val
    fonts_css = re.sub(r'float\s*:\s*[^;]+;', 'float: none;', fonts_css)
    style_css = re.sub(r'float\s*:\s*[^;]+;', 'float: none;', style_css)
    print_css = re.sub(r'float\s*:\s*[^;]+;', 'float: none;', print_css)

    # Add page numbers to print CSS (WeasyPrint supports @bottom-center)
    page_number_css = """
/* ====================================================================
   PAGE NUMBERS — Added for PDF production
   ==================================================================== */
@page {
  @bottom-center {
    content: counter(page);
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 9pt;
    color: #666;
  }
}

/* Suppress page numbers on title, copyright, cover, and chapter openers */
@page nofolio {
  @bottom-center {
    content: none;
  }
}

/* Eliminate forced blank pages - use 'page' not 'right' for break-before */
.chap-title,
.part-page,
.part-container,
.image-quote,
.quote-page,
.worksheet-page,
.frontmatter-shell {
  break-before: page;
  break-after: auto;
  page-break-before: always;
  page-break-after: auto;
}

/* Section dividers between chapters in combined doc */
.chapter-section-divider {
  break-before: page;
  page-break-before: always;
}

/* ====================================================================
   WEASYPRINT COMPATIBILITY OVERRIDES
   WeasyPrint has issues with:
   - Floated inline elements (strong, figcaption)
   - position:absolute inside flex containers
   - Nested float+flex combinations
   ==================================================================== */

/* Kill ALL floats on non-replaced inline elements */
strong, span, em, figcaption, a, cite, b, i {
  float: none !important;
}

/* Fix chapter number figure - remove flex/absolute positioning */
.chapter-number-figure {
  display: block !important;
  position: relative !important;
  text-align: center !important;
}
.chapter-number-brush {
  position: static !important;
  display: block !important;
  margin: 0 auto !important;
  width: 1.5in !important;
  height: auto !important;
}
.chapter-number-roman {
  position: static !important;
  display: block !important;
  margin-top: -0.7in !important;
  text-align: center !important;
}

/* Fix drop cap - use ::first-letter instead of floated strong */
.introduction-paragraph p:first-of-type strong:first-child,
.dropcap-first-letter p:first-of-type strong:first-child {
  float: none !important;
  font-size: inherit !important;
  line-height: inherit !important;
  padding-right: 0 !important;
}
.drop-cap[aria-hidden="true"] {
  display: none !important;
}

/* Drop cap via ::first-letter (no float for WeasyPrint) */
.introduction-paragraph p:first-of-type::first-letter,
.dropcap-first-letter p:first-of-type::first-letter {
  font-family: 'Cinzel Decorative', Georgia, serif;
  font-size: 2.5em;
  line-height: 1;
  font-weight: 700;
  color: #1a1a1a;
}

p.intro-text:first-of-type::first-letter {
  font-family: 'Cinzel Decorative', Georgia, serif;
  font-size: 2.5em;
  line-height: 1;
}

/* Fix flex containers that cause issues */
.chap-title,
.part-body,
.part-page,
.title-page-body,
.copyright-body,
.dedication-page,
.quote-page,
.image-quote {
  display: block !important;
}

/* Fix signature section flex */
.signature-section {
  display: block !important;
}
.signature-field {
  display: inline-block !important;
  width: 45% !important;
}

/* Fix about author flex */
.about-author-section {
  display: block !important;
}

/* Fix rating circles flex */
.rating-circles {
  display: block !important;
}
.rating-circle {
  display: inline-block !important;
}

/* Fix question header flex */
.question-header {
  display: block !important;
}
.question-number {
  display: inline-block !important;
}

/* Fix toc-item flex */
.toc-item {
  display: block !important;
}

/* Fix checkbox flex */
.checkbox-item {
  display: block !important;
}
.checkbox {
  display: inline-block !important;
}
"""

    # Build the combined HTML
    sections = []
    for i, filename in enumerate(SPINE_ORDER):
        filepath = XHTML_DIR / filename
        if not filepath.exists():
            print(f"WARNING: Missing file: {filename}")
            continue

        body_content, attrs = extract_body(filepath)
        body_content = fix_image_paths(body_content)
        body_content = fix_internal_links(body_content)
        body_content = fix_picture_elements(body_content)

        # Add section divider (page break) between sections
        section_id = filename.replace('.xhtml', '')
        sections.append(f'<div class="chapter-section-divider" id="section-{section_id}"{attrs}>')
        sections.append(body_content)
        sections.append('</div>')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Curls &amp; Contemplation: A Stylist&#x2019;s Interactive Journey</title>
<style>
{fonts_css}
{style_css}
{print_css}
{page_number_css}
</style>
</head>
<body>
{''.join(sections)}
</body>
</html>"""

    return html

def main():
    print("Building combined HTML for PDF...")
    html = build_combined_html()

    # Write combined HTML
    combined_path = Path("/tmp/epub-build/combined-print.html")
    combined_path.write_text(html, encoding="utf-8")
    print(f"Combined HTML written: {combined_path} ({len(html)} chars)")

    # Generate PDF with WeasyPrint
    print("Generating PDF with WeasyPrint (this may take a few minutes)...")
    from weasyprint import HTML
    doc = HTML(filename=str(combined_path), base_url=str(OEBPS))
    doc.write_pdf(str(OUTPUT))

    size = OUTPUT.stat().st_size
    print(f"PDF generated: {OUTPUT} ({size:,} bytes / {size/1024/1024:.1f} MB)")

if __name__ == "__main__":
    main()
