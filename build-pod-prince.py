#!/usr/bin/env python3
"""
Build the POD print-interior PDF for "Curls & Contemplation" with PrinceXML.

PrinceXML is the canonical-quality engine for print.css (it supports @page
margin boxes / folios, target-counter, etc.). Trim: 6.69in x 9.61in (KDP Royal).

Usage: python3 build-pod-prince.py [output.pdf]
"""
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

OEBPS = Path(__file__).resolve().parent / "Final edits" / "OEBPS"
OPF = OEBPS / "content.opf"
NS = {"opf": "http://www.idpf.org/2007/opf"}

# Excluded from the print interior: the cover (printed separately by POD) and
# the web-only worksheet-download fallback page.
EXCLUDE = {"0-Cover.xhtml", "worksheet-download-fallback.xhtml"}


def spine_files():
    root = ET.parse(OPF).getroot()
    manifest = {i.get("id"): i.get("href")
                for i in root.findall(".//opf:manifest/opf:item", NS)}
    files = []
    for ref in root.findall(".//opf:spine/opf:itemref", NS):
        href = manifest.get(ref.get("idref"))
        if not href:
            continue
        name = Path(href).name
        if name in EXCLUDE:
            continue
        files.append(str(OEBPS / href))
    return files


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/epub-build/CurlsAndContemplation-POD-Prince.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)
    files = spine_files()
    print(f"Building POD PDF from {len(files)} spine files -> {out}")
    cmd = [
        "prince",
        "--media=print",
        "--no-warn-css",
        *files,
        "-o", str(out),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    sys.stderr.write(res.stderr)
    if res.returncode != 0:
        sys.exit(res.returncode)
    size = out.stat().st_size
    print(f"PDF generated: {out} ({size/1024/1024:.1f} MB)")


if __name__ == "__main__":
    main()
