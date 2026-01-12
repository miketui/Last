#!/usr/bin/env python3
"""
Generate 6x9" Print-on-Demand PDF from EPUB source files.

This script combines all XHTML content files in spine order and renders
them to a single PDF using WeasyPrint with print.css for proper POD formatting.

Output: CurlsAndContemplation-POD-6x9.pdf
"""

import os
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

# Register EPUB namespaces
NAMESPACES = {
    'opf': 'http://www.idpf.org/2007/opf',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

def get_spine_order(opf_path: Path) -> list[str]:
    """Extract the reading order from content.opf spine."""
    tree = ET.parse(opf_path)
    root = tree.getroot()

    # Build manifest ID -> href mapping
    manifest = {}
    for item in root.findall('.//opf:manifest/opf:item', NAMESPACES):
        item_id = item.get('id')
        href = item.get('href')
        if item_id and href:
            manifest[item_id] = href

    # Get spine order
    spine_items = []
    for itemref in root.findall('.//opf:spine/opf:itemref', NAMESPACES):
        idref = itemref.get('idref')
        if idref and idref in manifest:
            spine_items.append(manifest[idref])

    return spine_items


def create_combined_html(oebps_path: Path, spine_files: list[str], output_path: Path) -> None:
    """Create a single HTML file combining all spine content in order."""

    # Read print.css content
    print_css_path = oebps_path / 'style' / 'print.css'
    style_css_path = oebps_path / 'style' / 'style.css'
    fonts_css_path = oebps_path / 'style' / 'fonts.css'

    # Build combined HTML document
    html_parts = [
        '<!DOCTYPE html>',
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">',
        '<head>',
        '<meta charset="UTF-8"/>',
        '<title>Curls &amp; Contemplation: A Freelance Hairstylist\'s Guide to Creative Excellence</title>',
    ]

    # Inline the fonts CSS
    if fonts_css_path.exists():
        fonts_css = fonts_css_path.read_text()
        # Update font paths to be absolute
        fonts_css = fonts_css.replace("url('../fonts/", f"url('{oebps_path}/fonts/")
        fonts_css = fonts_css.replace('url("../fonts/', f'url("{oebps_path}/fonts/')
        html_parts.append(f'<style>{fonts_css}</style>')

    # Inline the main style CSS
    if style_css_path.exists():
        style_css = style_css_path.read_text()
        # Update image paths to be absolute
        style_css = style_css.replace("url('../images/", f"url('{oebps_path}/images/")
        style_css = style_css.replace('url("../images/', f'url("{oebps_path}/images/')
        html_parts.append(f'<style>{style_css}</style>')

    # Inline the print CSS (this takes precedence)
    if print_css_path.exists():
        print_css = print_css_path.read_text()
        # Remove @import since we already included style.css
        print_css = print_css.replace("@import url('style.css');", "/* style.css already included */")
        # Update image paths
        print_css = print_css.replace("url('../images/", f"url('{oebps_path}/images/")
        print_css = print_css.replace('url("../images/', f'url("{oebps_path}/images/')
        # Remove crop/cross marks from print.css - POD services add their own
        print_css = print_css.replace("marks: crop cross;", "marks: none;")
        html_parts.append(f'<style>{print_css}</style>')

    html_parts.append('</head>')
    html_parts.append('<body>')

    # Process each spine file
    for i, spine_file in enumerate(spine_files):
        file_path = oebps_path / spine_file
        if not file_path.exists():
            print(f"  Warning: {spine_file} not found, skipping")
            continue

        print(f"  Processing: {spine_file}")

        content = file_path.read_text()

        # Extract body content
        body_start = content.find('<body')
        body_end = content.find('</body>')

        if body_start != -1 and body_end != -1:
            # Find the actual start of body content (after the opening tag)
            body_tag_end = content.find('>', body_start) + 1
            body_content = content[body_tag_end:body_end]

            # Fix relative image paths to absolute
            body_content = body_content.replace('src="../images/', f'src="{oebps_path}/images/')
            body_content = body_content.replace("src='../images/", f"src='{oebps_path}/images/")
            body_content = body_content.replace('href="../', f'href="{oebps_path}/')

            # Wrap in a section with page-break for each document
            html_parts.append(f'<section class="chapter-section" data-file="{spine_file}">')
            html_parts.append(body_content)
            html_parts.append('</section>')

    html_parts.append('</body>')
    html_parts.append('</html>')

    # Write combined HTML
    output_path.write_text('\n'.join(html_parts))
    print(f"  Combined HTML written to: {output_path}")


def generate_pdf(html_path: Path, pdf_path: Path) -> None:
    """Generate PDF from combined HTML using WeasyPrint."""
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration

    print(f"  Generating PDF with WeasyPrint...")

    font_config = FontConfiguration()

    # Additional CSS for proper page breaks and fix problematic floats
    # NOTE: For POD, we use exact 6x9" trim size WITHOUT crop marks
    # POD services add their own bleed/marks during production
    # 6" = 432pt, 9" = 648pt
    extra_css = CSS(string='''
        @page {
            size: 432pt 648pt !important;
            margin-top: 54pt;      /* 0.75in */
            margin-bottom: 54pt;   /* 0.75in */
            margin-left: 54pt;     /* 0.75in default */
            margin-right: 45pt;    /* 0.625in */
            marks: none !important;
        }

        @page :left {
            margin-left: 63pt;     /* 0.875in gutter */
            margin-right: 45pt;    /* 0.625in */
        }

        @page :right {
            margin-left: 45pt;     /* 0.625in */
            margin-right: 63pt;    /* 0.875in gutter */
        }

        @page :first {
            margin-top: 72pt;      /* 1in */
            marks: none !important;
        }

        @page :blank {
            marks: none !important;
        }

        section.chapter-section {
            page-break-before: always;
            break-before: page;
        }

        section.chapter-section:first-of-type {
            page-break-before: avoid;
            break-before: avoid;
        }

        /* Fix: Remove problematic float on drop caps that causes assertion error */
        .introduction-paragraph p:first-of-type strong:first-child,
        .dropcap-first-letter p:first-of-type strong:first-child,
        p.intro-text:first-of-type::first-letter {
            float: none !important;
            display: inline;
            font-size: 24pt;
            font-weight: bold;
        }

        /* Ensure images don't break PDF generation */
        img {
            max-width: 100%;
            height: auto;
        }

        /* Fix flex containers for WeasyPrint compatibility */
        .title-page-body,
        .copyright-body,
        .dedication-page,
        .chap-title,
        .part-body,
        .part-page,
        .quote-page,
        .image-quote {
            display: block;
        }
    ''', font_config=font_config)

    html = HTML(filename=str(html_path))
    html.write_pdf(str(pdf_path), stylesheets=[extra_css], font_config=font_config)

    print(f"  PDF generated: {pdf_path}")


def main():
    """Main entry point."""
    # Paths
    repo_root = Path(__file__).parent
    oebps_path = repo_root / 'pub' / 'OEBPS'
    opf_path = oebps_path / 'content.opf'

    if not opf_path.exists():
        print(f"Error: content.opf not found at {opf_path}")
        sys.exit(1)

    print("=" * 60)
    print("POD PDF Generator - 6x9\" Print-on-Demand")
    print("=" * 60)
    print()

    # Step 1: Get spine order
    print("[1/3] Reading spine order from content.opf...")
    spine_files = get_spine_order(opf_path)
    print(f"  Found {len(spine_files)} files in spine order")
    print()

    # Step 2: Create combined HTML
    print("[2/3] Combining XHTML files...")
    combined_html_path = repo_root / 'pod-combined.html'
    create_combined_html(oebps_path, spine_files, combined_html_path)
    print()

    # Step 3: Generate PDF
    print("[3/3] Generating 6x9\" POD PDF...")
    pdf_output_path = repo_root / 'CurlsAndContemplation-POD-6x9.pdf'
    generate_pdf(combined_html_path, pdf_output_path)
    print()

    # Cleanup intermediate file
    combined_html_path.unlink()
    print("  Cleaned up intermediate files")
    print()

    # Summary
    print("=" * 60)
    print("SUCCESS!")
    print("=" * 60)
    print(f"Output: {pdf_output_path}")
    print(f"Size: {pdf_output_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()
    print("PDF Specifications:")
    print("  - Trim Size: 6\" x 9\" (432pt x 648pt) - standard POD")
    print("  - Margins: 0.75\" top/bottom, 0.875\" gutter, 0.625\" outside")
    print("  - Fonts: Libre Baskerville, Cinzel Decorative, Montserrat")
    print("  - Print marks: None (POD services add their own)")
    print()
    print("Ready for upload to:")
    print("  - Amazon KDP")
    print("  - IngramSpark")
    print("  - Barnes & Noble Press")
    print("  - Lulu")
    print("  - BookBaby")
    print()


if __name__ == '__main__':
    main()
