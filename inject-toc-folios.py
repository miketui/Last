#!/usr/bin/env python3
"""
Inject print page-number folios into the Table of Contents.

Reads /tmp/epub-build/page-map.json (written by build-pod-chromium.py) and adds
a <span class="toc-page-number">N</span> to each .toc-entry whose link target is
in the map. Idempotent: existing toc-page-number spans are replaced.
"""
import argparse
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOC = HERE / "Final edits" / "OEBPS" / "xhtml" / "3-TableOfContents.xhtml"
# build-pod-chromium.py writes page-map.json next to its output PDF: the CWD when
# called as `build-pod-chromium.py out.pdf`, or /tmp/epub-build for the default
# output. Search both (CWD first) so the common workflows just work; override
# with --map for other build directories / CI.
DEFAULT_MAP_CANDIDATES = [Path("page-map.json"), Path("/tmp/epub-build/page-map.json")]


def resolve_map(explicit):
    if explicit is not None:
        return explicit
    for cand in DEFAULT_MAP_CANDIDATES:
        if cand.exists():
            return cand
    return DEFAULT_MAP_CANDIDATES[-1]  # report the canonical default in the error


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--map", type=Path, default=None,
                        help="page-map.json produced by build-pod-chromium.py "
                             "(default: ./page-map.json, then /tmp/epub-build/)")
    parser.add_argument("--toc", type=Path, default=TOC,
                        help="Table-of-Contents XHTML to update")
    args = parser.parse_args()
    args.map = resolve_map(args.map)

    if not args.map.exists():
        raise FileNotFoundError(
            f"page-map.json not found (looked in {', '.join(str(c) for c in DEFAULT_MAP_CANDIDATES)}). "
            f"Run build-pod-chromium.py first; it writes the map next to the output PDF.")

    page_map = json.loads(args.map.read_text())
    html = args.toc.read_text(encoding="utf-8")

    # Strip any previously injected page-number spans (idempotency).
    html = re.sub(r'<span class="toc-page-number">[^<]*</span>', "", html)

    def add_folio(m):
        entry, href = m.group(0), m.group(1)
        page = page_map.get(href)
        if not page:
            return entry
        # Insert the page number just before the closing </div> of the entry.
        assert entry.endswith("</div>"), f"Unexpected TOC entry ending: {entry[-20:]!r}"
        return entry[:-len("</div>")] + f'<span class="toc-page-number">{page}</span></div>'

    # Match each TOC entry div that contains a link, capturing the href filename.
    pattern = re.compile(
        r'<div class="toc-item toc-entry"><a href="([^"]+)"[^>]*>.*?</a></div>')
    html, n = pattern.subn(add_folio, html)
    args.toc.write_text(html, encoding="utf-8")
    print(f"Injected page folios into {n} TOC entries.")


if __name__ == "__main__":
    main()
