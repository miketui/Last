#!/usr/bin/env python3
"""
Inject print page-number folios into the Table of Contents.

Reads /tmp/epub-build/page-map.json (written by build-pod-chromium.py) and adds
a <span class="toc-page-number">N</span> to each .toc-entry whose link target is
in the map. Idempotent: existing toc-page-number spans are replaced.
"""
import json
import re
from pathlib import Path

TOC = Path("Final edits/OEBPS/xhtml/3-TableOfContents.xhtml")
MAP = Path("/tmp/epub-build/page-map.json")


def main():
    page_map = json.loads(MAP.read_text())
    html = TOC.read_text(encoding="utf-8")

    # Strip any previously injected page-number spans (idempotency).
    html = re.sub(r'<span class="toc-page-number">[^<]*</span>', "", html)

    def add_folio(m):
        entry, href = m.group(0), m.group(1)
        page = page_map.get(href)
        if not page:
            return entry
        # Insert the page number just before the closing </div> of the entry.
        return entry[:-6] + f'<span class="toc-page-number">{page}</span></div>'

    # Match each TOC entry div that contains a link, capturing the href filename.
    pattern = re.compile(
        r'<div class="toc-item toc-entry"><a href="([^"]+)"[^>]*>.*?</a></div>')
    html, n = pattern.subn(add_folio, html)
    TOC.write_text(html, encoding="utf-8")
    print(f"Injected page folios into {n} TOC entries.")


if __name__ == "__main__":
    main()
