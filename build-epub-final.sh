#!/bin/bash
# Package the EPUB from "Final edits/" sources: mimetype first, stored
# uncompressed (EPUB OCF requirement), then META-INF and OEBPS deflated.
set -euo pipefail
SRC="/home/user/Last/Final edits"
OUT="${1:-/tmp/epub-build/Curls-and-Contemplation-FINAL.epub}"
mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"

# Stamp dcterms:modified with the build time (EPUB 3 requirement freshness).
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
python3 - "$SRC/OEBPS/content.opf" "$NOW" <<'EOF'
import re, sys
path, now = sys.argv[1], sys.argv[2]
s = open(path, encoding="utf-8").read()
s2, n = re.subn(
    r'(<meta property="dcterms:modified">)[^<]*(</meta>)',
    r'\g<1>' + now + r'\g<2>', s)
assert n == 1, f"dcterms:modified replaced {n} times"
open(path, "w", encoding="utf-8").write(s2)
print(f"dcterms:modified -> {now}")
EOF

cd "$SRC"
zip -X0 -q "$OUT" mimetype
zip -rX9 -q "$OUT" META-INF OEBPS
echo "Packaged: $OUT ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT" | head -5
